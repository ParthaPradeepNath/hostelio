import { Prisma, type Room } from "@prisma/client";
import { AppError, conflict, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/api/responses";
import { BEDS_BY_TYPE, type RoomCreateInput, type RoomQuery, type RoomUpdateInput } from "@/lib/validators/room";

export const roomOccupancyInclude = {
  _count: { select: { allocations: { where: { status: "ACTIVE" as const } } } },
} satisfies Prisma.RoomInclude;

type RoomWithOccupancy = Room & { _count: { allocations: number } };

export type RoomDto = Omit<Room, "monthlyRent"> & {
  monthlyRent: number | null;
  occupancy: number;
  availableBeds: number;
};

export function toRoomDto(room: RoomWithOccupancy): RoomDto {
  const { _count, ...rest } = room;
  return {
    ...rest,
    monthlyRent: room.monthlyRent === null ? null : Number(room.monthlyRent),
    occupancy: _count.allocations,
    availableBeds: Math.max(room.capacity - _count.allocations, 0),
  };
}

export async function listRooms(query: RoomQuery) {
  const where: Prisma.RoomWhereInput = {
    ...(query.block ? { block: query.block } : {}),
    ...(query.floor !== undefined ? { floor: query.floor } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? { roomNumber: { contains: query.q.toUpperCase(), mode: "insensitive" as const } }
      : {}),
  };

  const [total, rooms] = await Promise.all([
    prisma.room.count({ where }),
    prisma.room.findMany({
      where,
      include: roomOccupancyInclude,
      orderBy: [{ block: "asc" }, { floor: "asc" }, { roomNumber: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    data: rooms.map(toRoomDto),
    meta: paginationMeta(query.page, query.pageSize, total),
  };
}

export async function getRoomSummary(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: roomOccupancyInclude,
  });
  if (!room) throw notFound("Room not found");
  return toRoomDto(room);
}

export type RoomOccupant = {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  startDate: Date;
  allocationId: string;
};

export async function getRoomDetails(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      ...roomOccupancyInclude,
      allocations: {
        where: { status: "ACTIVE" },
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          startDate: true,
          student: { select: { id: true, name: true, email: true, studentId: true } },
        },
      },
      complaints: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          student: { select: { name: true } },
        },
      },
    },
  });

  if (!room) throw notFound("Room not found");

  const occupants: RoomOccupant[] = room.allocations.map((allocation) => ({
    allocationId: allocation.id,
    startDate: allocation.startDate,
    ...allocation.student,
  }));

  return {
    room: toRoomDto(room),
    occupants,
    complaints: room.complaints,
  };
}

async function assertRoomNumberAvailable(roomNumber: string, exceptId?: string) {
  const duplicate = await prisma.room.findFirst({
    where: {
      roomNumber: { equals: roomNumber, mode: "insensitive" },
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
    select: { id: true },
  });
  if (duplicate) {
    throw conflict("DUPLICATE_ROOM_NUMBER", `Room ${roomNumber} already exists`);
  }
}

export async function createRoom(input: RoomCreateInput) {
  await assertRoomNumberAvailable(input.roomNumber);

  const room = await prisma.room.create({
    data: {
      roomNumber: input.roomNumber,
      block: input.block,
      floor: input.floor,
      type: input.type,
      capacity: input.capacity,
      monthlyRent: input.monthlyRent === null || input.monthlyRent === undefined ? null : input.monthlyRent,
      status: input.status,
      amenities: input.amenities,
      notes: input.notes ?? null,
    },
    include: roomOccupancyInclude,
  });

  return toRoomDto(room);
}

export async function updateRoom(id: string, input: RoomUpdateInput) {
  const existing = await prisma.room.findUnique({
    where: { id },
    include: roomOccupancyInclude,
  });
  if (!existing) throw notFound("Room not found");

  const occupancy = existing._count.allocations;
  const nextCapacity = input.capacity ?? existing.capacity;
  const nextType = input.type ?? existing.type;

  if (nextCapacity < occupancy) {
    throw conflict(
      "ROOM_CAPACITY_BELOW_OCCUPANCY",
      `Capacity cannot be lower than the ${occupancy} active occupant${occupancy === 1 ? "" : "s"}`,
    );
  }

  if (BEDS_BY_TYPE[nextType] !== nextCapacity) {
    throw new AppError(
      "VALIDATION_ERROR",
      `A ${nextType.toLowerCase()} room must have ${BEDS_BY_TYPE[nextType]} bed${
        BEDS_BY_TYPE[nextType] === 1 ? "" : "s"
      }`,
      { capacity: "Capacity must match the room type" },
    );
  }

  if (input.status === "MAINTENANCE" && occupancy > 0) {
    throw conflict("ROOM_OCCUPIED", "Move occupants out before putting this room under maintenance");
  }

  if (input.status === "FULL" && occupancy !== nextCapacity) {
    throw conflict("ROOM_STATUS_INVALID", "A room is full only when every bed is occupied");
  }

  if (input.roomNumber && input.roomNumber !== existing.roomNumber) {
    await assertRoomNumberAvailable(input.roomNumber, id);
  }

  const status =
    input.status === "MAINTENANCE"
      ? "MAINTENANCE"
      : occupancy >= nextCapacity
        ? "FULL"
        : "AVAILABLE";

  const room = await prisma.room.update({
    where: { id },
    data: {
      ...(input.roomNumber ? { roomNumber: input.roomNumber } : {}),
      ...(input.block ? { block: input.block } : {}),
      ...(input.floor !== undefined ? { floor: input.floor } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      ...(input.monthlyRent !== undefined
        ? { monthlyRent: input.monthlyRent === null ? null : input.monthlyRent }
        : {}),
      ...(input.amenities !== undefined ? { amenities: input.amenities } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      status,
    },
    include: roomOccupancyInclude,
  });

  return toRoomDto(room);
}

export async function recomputeRoomStatus(tx: Prisma.TransactionClient, roomId: string) {
  const room = await tx.room.findUnique({
    where: { id: roomId },
    select: { capacity: true, status: true },
  });
  if (!room || room.status === "MAINTENANCE") return;

  const occupancy = await tx.allocation.count({
    where: { roomId, status: "ACTIVE" },
  });

  const nextStatus = occupancy >= room.capacity ? "FULL" : "AVAILABLE";
  if (nextStatus !== room.status) {
    await tx.room.update({ where: { id: roomId }, data: { status: nextStatus } });
  }
}

export async function listBlockOptions() {
  const rooms = await prisma.room.findMany({
    select: { block: true },
    distinct: ["block"],
    orderBy: { block: "asc" },
  });
  return rooms.map((room) => room.block);
}

export async function listRoomFacets() {
  const rooms = await prisma.room.findMany({
    select: { block: true, floor: true },
    distinct: ["block", "floor"],
    orderBy: [{ block: "asc" }, { floor: "asc" }],
  });

  return {
    blocks: [...new Set(rooms.map((room) => room.block))].sort((a, b) => a.localeCompare(b)),
    floors: [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b),
  };
}
