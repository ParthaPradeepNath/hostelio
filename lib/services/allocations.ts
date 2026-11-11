import { Prisma, type AllocationStatus, type Role, type User } from "@prisma/client";
import { AppError, conflict, notFound } from "@/lib/api/errors";
import { paginationMeta } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";
import type { AllocationCreateInput, AllocationQuery, AllocationUpdateInput } from "@/lib/validators/allocation";
import { recomputeRoomStatus } from "@/lib/services/rooms";

export const allocationInclude = {
  student: { select: { id: true, name: true, studentId: true, email: true } },
  room: { select: { id: true, roomNumber: true, block: true, floor: true, capacity: true } },
} satisfies Prisma.AllocationInclude;

export async function listAllocations(user: Pick<User, "id" | "role">, query: AllocationQuery) {
  const where: Prisma.AllocationWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.roomId ? { roomId: query.roomId } : {}),
    ...(user.role === "ADMIN" && query.studentId
      ? { studentId: query.studentId }
      : { studentId: user.id }),
  };

  const [total, allocations] = await Promise.all([
    prisma.allocation.count({ where }),
    prisma.allocation.findMany({
      where,
      include: allocationInclude,
      orderBy: [{ status: "asc" }, { startDate: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    data: allocations,
    meta: paginationMeta(query.page, query.pageSize, total),
  };
}

export async function getStudentActiveAllocation(studentId: string) {
  return prisma.allocation.findFirst({
    where: { studentId, status: "ACTIVE" },
    include: allocationInclude,
  });
}

export async function listUnallocatedStudents() {
  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      allocations: { none: { status: "ACTIVE" } },
    },
    select: { id: true, name: true, email: true, studentId: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

export async function listAllocatableRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: { not: "MAINTENANCE" } },
    select: {
      id: true,
      roomNumber: true,
      block: true,
      floor: true,
      type: true,
      capacity: true,
      status: true,
      _count: { select: { allocations: { where: { status: "ACTIVE" } } } },
    },
    orderBy: [{ block: "asc" }, { floor: "asc" }, { roomNumber: "asc" }],
  });

  return rooms
    .map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      status: room.status,
      occupancy: room._count.allocations,
      availableBeds: Math.max(room.capacity - room._count.allocations, 0),
    }))
    .filter((room) => room.availableBeds > 0);
}

async function lockRoom(tx: Prisma.TransactionClient, roomId: string) {
  await tx.$queryRaw`SELECT id FROM "rooms" WHERE id = ${roomId} FOR UPDATE`;
}

async function lockAllocation(tx: Prisma.TransactionClient, allocationId: string) {
  await tx.$queryRaw`SELECT id FROM "allocations" WHERE id = ${allocationId} FOR UPDATE`;
}

async function findActiveForStudent(
  tx: Prisma.TransactionClient,
  studentId: string,
  exceptAllocationId?: string,
) {
  return tx.allocation.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
      ...(exceptAllocationId ? { NOT: { id: exceptAllocationId } } : {}),
    },
  });
}

async function assertRoomCanTakeStudent(tx: Prisma.TransactionClient, roomId: string) {
  const room = await tx.room.findUnique({ where: { id: roomId } });
  if (!room) throw notFound("Room not found");
  if (room.status === "MAINTENANCE") {
    throw conflict("ROOM_UNDER_MAINTENANCE", "This room is under maintenance");
  }
  const occupancy = await tx.allocation.count({ where: { roomId, status: "ACTIVE" } });
  if (occupancy >= room.capacity) {
    throw conflict("ROOM_FULL", "This room has no available beds");
  }
  return room;
}

function mapUniqueAllocationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw conflict("STUDENT_ALREADY_ALLOCATED", "This student already has an active allocation");
  }
  throw error;
}

export async function createAllocation(input: AllocationCreateInput) {
  const student = await prisma.user.findUnique({ where: { id: input.studentId }, select: { id: true, role: true } });
  if (!student) throw notFound("Student not found");
  if (student.role !== "STUDENT") {
    throw new AppError("VALIDATION_ERROR", "Allocations can only be made for students", {
      studentId: "This account is not a student",
    });
  }

  const room = await prisma.room.findUnique({ where: { id: input.roomId }, select: { id: true } });
  if (!room) throw notFound("Room not found");

  try {
    return await prisma.$transaction(async (tx) => {
      await lockRoom(tx, input.roomId);

      const existing = await findActiveForStudent(tx, input.studentId);
      if (existing) {
        throw conflict("STUDENT_ALREADY_ALLOCATED", "This student already has an active allocation");
      }

      const lockedRoom = await assertRoomCanTakeStudent(tx, input.roomId);

      const allocation = await tx.allocation.create({
        data: {
          studentId: input.studentId,
          roomId: input.roomId,
          status: "ACTIVE",
          startDate: input.startDate ?? new Date(),
        },
        include: allocationInclude,
      });

      await recomputeRoomStatus(tx, lockedRoom.id);
      return allocation;
    });
  } catch (error) {
    return mapUniqueAllocationError(error);
  }
}

export async function updateAllocation(id: string, input: AllocationUpdateInput) {
  const existing = await prisma.allocation.findUnique({
    where: { id },
    include: { room: true },
  });
  if (!existing) throw notFound("Allocation not found");

  if (input.status === "VACATED") {
    return vacateAllocation(existing, input.endDate);
  }

  if (input.roomId) {
    return moveAllocation(existing, input.roomId);
  }

  if (input.studentId) {
    return reassignAllocation(existing, input.studentId);
  }

  throw new AppError("VALIDATION_ERROR", "Choose an allocation action", { form: "No action provided" });
}

async function vacateAllocation(
  existing: { id: string; roomId: string; status: AllocationStatus; startDate: Date },
  endDate?: Date,
) {
  const resolvedEndDate = endDate ?? new Date();
  if (resolvedEndDate.getTime() < existing.startDate.getTime()) {
    throw new AppError("VALIDATION_ERROR", "End date cannot be before the allocation start", {
      endDate: "Choose a date on or after the start date",
    });
  }

  return prisma.$transaction(async (tx) => {
    await lockAllocation(tx, existing.id);
    const current = await tx.allocation.findUnique({ where: { id: existing.id } });
    if (!current) throw notFound("Allocation not found");
    if (current.status !== "ACTIVE") {
      throw conflict("CONFLICT", "This allocation has already been vacated");
    }

    const allocation = await tx.allocation.update({
      where: { id: existing.id },
      data: { status: "VACATED", endDate: resolvedEndDate },
      include: allocationInclude,
    });

    await recomputeRoomStatus(tx, existing.roomId);
    return { allocation, previous: null };
  });
}

async function moveAllocation(
  existing: { id: string; roomId: string; studentId: string; status: AllocationStatus },
  targetRoomId: string,
) {
  if (existing.status !== "ACTIVE") {
    throw conflict("CONFLICT", "Only an active allocation can be moved");
  }
  if (existing.roomId === targetRoomId) {
    throw conflict("STUDENT_ALREADY_ALLOCATED", "The student is already allocated to this room");
  }

  const target = await prisma.room.findUnique({ where: { id: targetRoomId }, select: { id: true } });
  if (!target) throw notFound("Room not found");

  return prisma.$transaction(async (tx) => {
    await lockAllocation(tx, existing.id);
    const roomIds = [existing.roomId, targetRoomId].sort();
    for (const roomId of roomIds) {
      await lockRoom(tx, roomId);
    }

    const current = await tx.allocation.findUnique({ where: { id: existing.id } });
    if (!current || current.status !== "ACTIVE") {
      throw conflict("CONFLICT", "This allocation is no longer active");
    }

    const lockedTarget = await assertRoomCanTakeStudent(tx, targetRoomId);

    const previous = await tx.allocation.update({
      where: { id: existing.id },
      data: { status: "VACATED", endDate: new Date() },
      include: allocationInclude,
    });

    const allocation = await tx.allocation.create({
      data: {
        studentId: existing.studentId,
        roomId: lockedTarget.id,
        status: "ACTIVE",
        startDate: new Date(),
      },
      include: allocationInclude,
    });

    await recomputeRoomStatus(tx, existing.roomId);
    await recomputeRoomStatus(tx, targetRoomId);

    return { allocation, previous };
  });
}

async function reassignAllocation(
  existing: { id: string; studentId: string; roomId: string; status: AllocationStatus },
  targetStudentId: string,
) {
  if (existing.status !== "ACTIVE") {
    throw conflict("CONFLICT", "Only an active allocation can be reassigned");
  }
  if (existing.studentId === targetStudentId) {
    throw conflict("STUDENT_ALREADY_ALLOCATED", "This student already holds this allocation");
  }

  const target = await prisma.user.findUnique({ where: { id: targetStudentId }, select: { id: true, role: true } });
  if (!target) throw notFound("Student not found");
  if (target.role !== "STUDENT") {
    throw new AppError("VALIDATION_ERROR", "Allocations can only be assigned to students", {
      studentId: "This account is not a student",
    });
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await lockAllocation(tx, existing.id);
      const current = await tx.allocation.findUnique({ where: { id: existing.id } });
      if (!current || current.status !== "ACTIVE") {
        throw conflict("CONFLICT", "This allocation is no longer active");
      }

      const alreadyActive = await findActiveForStudent(tx, targetStudentId, existing.id);
      if (alreadyActive) {
        throw conflict("STUDENT_ALREADY_ALLOCATED", "This student already has an active allocation");
      }

      const allocation = await tx.allocation.update({
        where: { id: existing.id },
        data: { studentId: targetStudentId },
        include: allocationInclude,
      });

      return { allocation, previous: null };
    });
  } catch (error) {
    return mapUniqueAllocationError(error);
  }
}

export async function deleteAllocation(id: string) {
  const existing = await prisma.allocation.findUnique({ where: { id }, select: { id: true, roomId: true } });
  if (!existing) throw notFound("Allocation not found");

  await prisma.$transaction(async (tx) => {
    await lockAllocation(tx, existing.id);
    await tx.allocation.delete({ where: { id: existing.id } });
    await recomputeRoomStatus(tx, existing.roomId);
  });
}

export function canManageAllocations(role: Role) {
  return role === "ADMIN";
}
