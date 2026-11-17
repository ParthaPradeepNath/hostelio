import { prisma } from "@/lib/prisma";
import { getStudentComplaintSummary } from "@/lib/services/complaints";
import { listDashboardNotices } from "@/lib/services/notices";

export async function getAdminDashboardStats() {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const [
    rooms,
    occupiedBeds,
    openComplaints,
    inProgressComplaints,
    resolvedThisMonth,
    recentComplaints,
    recentNotices,
  ] = await Promise.all([
    prisma.room.findMany({
      select: {
        block: true,
        capacity: true,
        _count: { select: { allocations: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.allocation.count({ where: { status: "ACTIVE" } }),
    prisma.complaint.count({ where: { status: "OPEN" } }),
    prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
    prisma.complaint.count({
      where: { status: "RESOLVED", resolvedAt: { gte: monthStart } },
    }),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        aiCategory: true,
        aiStatus: true,
        createdAt: true,
        student: { select: { name: true } },
        room: { select: { roomNumber: true } },
      },
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 3,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const totalBeds = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalRooms = rooms.length;

  const blockMap = new Map<
    string,
    { block: string; rooms: number; beds: number; occupied: number }
  >();
  for (const room of rooms) {
    const entry = blockMap.get(room.block) ?? {
      block: room.block,
      rooms: 0,
      beds: 0,
      occupied: 0,
    };
    entry.rooms += 1;
    entry.beds += room.capacity;
    entry.occupied += room._count.allocations;
    blockMap.set(room.block, entry);
  }

  const byBlock = [...blockMap.values()]
    .map((entry) => ({
      ...entry,
      available: Math.max(entry.beds - entry.occupied, 0),
    }))
    .sort((a, b) => a.block.localeCompare(b.block));

  return {
    stats: {
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds: Math.max(totalBeds - occupiedBeds, 0),
      openComplaints,
      inProgressComplaints,
      resolvedThisMonth,
    },
    byBlock,
    recentComplaints,
    recentNotices,
  };
}

export async function getStudentDashboard(studentId: string) {
  const [allocation, complaints, notices] = await Promise.all([
    prisma.allocation.findFirst({
      where: { studentId, status: "ACTIVE" },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            block: true,
            floor: true,
            type: true,
            monthlyRent: true,
            capacity: true,
            amenities: true,
          },
        },
      },
    }),
    getStudentComplaintSummary(studentId),
    listDashboardNotices(),
  ]);

  return { allocation, complaints, notices };
}
