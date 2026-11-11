import { Prisma, type User } from "@prisma/client";
import { AppError, conflict, forbidden, notFound } from "@/lib/api/errors";
import { paginationMeta } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";
import type { ComplaintCreateInput, ComplaintQuery, ComplaintStudentUpdateInput, ComplaintAdminUpdateInput } from "@/lib/validators/complaint";
import { ALLOWED_TRANSITIONS } from "@/lib/validators/complaint";

export const complaintInclude = {
  student: { select: { id: true, name: true, studentId: true } },
  room: { select: { id: true, roomNumber: true, block: true } },
} satisfies Prisma.ComplaintInclude;

export async function listComplaints(user: Pick<User, "id" | "role">, query: ComplaintQuery) {
  const where: Prisma.ComplaintWhereInput = {
    ...(user.role === "STUDENT" ? { studentId: user.id } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      include: complaintInclude,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    data: complaints,
    meta: paginationMeta(query.page, query.pageSize, total),
  };
}

export async function getComplaintForUser(user: Pick<User, "id" | "role">, id: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: complaintInclude,
  });

  if (!complaint) throw notFound("Complaint not found");
  if (user.role === "STUDENT" && complaint.studentId !== user.id) {
    throw notFound("Complaint not found");
  }

  return complaint;
}

export async function createComplaint(user: User, input: ComplaintCreateInput) {
  const active = await prisma.allocation.findFirst({
    where: { studentId: user.id, status: "ACTIVE" },
    select: { roomId: true },
  });

  if (input.roomId && input.roomId !== active?.roomId) {
    throw forbidden("You can only raise complaints for your active room");
  }

  const roomId = input.roomId ?? active?.roomId ?? null;

  if (roomId) {
    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { id: true } });
    if (!room) throw notFound("Room not found");
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.complaint.count({
    where: { studentId: user.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 5) {
    throw new AppError("RATE_LIMITED", "You can raise up to 5 complaints per hour. Try again later.");
  }

  const complaint = await prisma.complaint.create({
    data: {
      studentId: user.id,
      roomId,
      title: input.title,
      description: input.description,
      category: input.category ?? "OTHER",
      priority: "MEDIUM",
      status: "OPEN",
      aiStatus: "PENDING",
    },
    include: complaintInclude,
  });

  return complaint;
}

export async function updateComplaint(
  user: User,
  id: string,
  input: ComplaintStudentUpdateInput | ComplaintAdminUpdateInput,
) {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) throw notFound("Complaint not found");

  if (user.role === "STUDENT") {
    if (existing.studentId !== user.id) throw notFound("Complaint not found");
    if (existing.status !== "OPEN") {
      throw conflict("COMPLAINT_LOCKED", "This complaint can no longer be edited");
    }

    const studentInput = input as ComplaintStudentUpdateInput;
    return prisma.complaint.update({
      where: { id },
      data: {
        ...(studentInput.title !== undefined ? { title: studentInput.title } : {}),
        ...(studentInput.description !== undefined ? { description: studentInput.description } : {}),
        ...(studentInput.category !== undefined ? { category: studentInput.category } : {}),
      },
      include: complaintInclude,
    });
  }

  const adminInput = input as ComplaintAdminUpdateInput;

  if (adminInput.status && adminInput.status !== existing.status) {
    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(adminInput.status)) {
      throw new AppError(
        "INVALID_TRANSITION",
        `A complaint cannot move from ${existing.status} to ${adminInput.status}`,
      );
    }
  }

  return prisma.complaint.update({
    where: { id },
    data: {
      ...(adminInput.status !== undefined
        ? {
            status: adminInput.status,
            resolvedAt:
              adminInput.status === "RESOLVED"
                ? new Date()
                : existing.status === "RESOLVED"
                  ? null
                  : existing.resolvedAt,
          }
        : {}),
      ...(adminInput.priority !== undefined ? { priority: adminInput.priority } : {}),
      ...(adminInput.category !== undefined ? { category: adminInput.category } : {}),
      ...(adminInput.adminResponse !== undefined ? { adminResponse: adminInput.adminResponse } : {}),
    },
    include: complaintInclude,
  });
}

export async function getStudentComplaintSummary(studentId: string) {
  const [grouped, recent] = await Promise.all([
    prisma.complaint.groupBy({
      by: ["status"],
      where: { studentId },
      _count: { _all: true },
    }),
    prisma.complaint.findMany({
      where: { studentId },
      include: complaintInclude,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const counts: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0 };
  for (const group of grouped) counts[group.status] = group._count._all;
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return { counts, total, recent };
}
