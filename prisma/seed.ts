import { PrismaClient, RoomType } from "@prisma/client";

const prisma = new PrismaClient();

const BLOCKS = ["A", "B", "C"] as const;
const FLOORS = [1, 2, 3] as const;
const ROOMS_PER_FLOOR = 6;

const ROOM_TYPES: Record<number, { type: RoomType; capacity: number }> = {
  1: { type: "SINGLE", capacity: 1 },
  2: { type: "SINGLE", capacity: 1 },
  3: { type: "DOUBLE", capacity: 2 },
  4: { type: "DOUBLE", capacity: 2 },
  5: { type: "TRIPLE", capacity: 3 },
  6: { type: "TRIPLE", capacity: 3 },
};

const AMENITIES: Record<RoomType, string[]> = {
  SINGLE: ["Wi-Fi", "Study table", "Wardrobe", "Fan", "Attached bathroom"],
  DOUBLE: ["Wi-Fi", "Study table", "Wardrobe", "Fan", "Balcony"],
  TRIPLE: ["Wi-Fi", "Study table", "Wardrobe", "Fan", "Common bathroom"],
  QUAD: ["Wi-Fi", "Study table", "Wardrobe", "Fan"],
};

const RENT_BY_TYPE: Record<RoomType, string> = {
  SINGLE: "6500.00",
  DOUBLE: "4500.00",
  TRIPLE: "3600.00",
  QUAD: "3000.00",
};

function roomNumber(block: string, floor: number, index: number) {
  return `${block}-${floor}0${index}`;
}

async function seedRooms() {
  let created = 0;
  let updated = 0;

  for (const block of BLOCKS) {
    for (const floor of FLOORS) {
      for (let index = 1; index <= ROOMS_PER_FLOOR; index += 1) {
        const number = roomNumber(block, floor, index);
        const { type, capacity } = ROOM_TYPES[index];
        const monthlyRent = RENT_BY_TYPE[type];

        const existing = await prisma.room.findUnique({ where: { roomNumber: number } });

        await prisma.room.upsert({
          where: { roomNumber: number },
          create: {
            roomNumber: number,
            block,
            floor,
            type,
            capacity,
            monthlyRent,
            status: "AVAILABLE",
            amenities: AMENITIES[type],
            notes: index === ROOMS_PER_FLOOR ? "Corner room with extra daylight." : null,
          },
          update: {
            block,
            floor,
            type,
            capacity,
            monthlyRent,
            amenities: AMENITIES[type],
          },
        });

        if (existing) updated += 1;
        else created += 1;
      }
    }
  }

  return { created, updated };
}

async function seedNotices() {
  const adminClerkId = process.env.SEED_ADMIN_CLERK_ID?.trim();
  if (!adminClerkId) return { skipped: true as const, created: 0, reason: "SEED_ADMIN_CLERK_ID not set" };

  const admin = await prisma.user.findUnique({ where: { clerkUserId: adminClerkId } });
  if (!admin) return { skipped: true as const, created: 0, reason: "admin account not found" };

  const notices = [
    {
      title: "Water supply interruption in Block A",
      content:
        "Block A will have no water supply from 10:00 to 14:00 on Saturday while the overhead tank is cleaned.\n\nPlease store enough water for the afternoon. The supply will resume by 15:00.",
      isPinned: true,
    },
    {
      title: "Quiet hours during mid-semester exams",
      content:
        "Quiet hours are extended to 22:00–07:00 for the next two weeks.\n\nCommon rooms on every floor remain open for group study. Please keep corridor conversations low after 22:00.",
      isPinned: true,
    },
    {
      title: "Hostel office hours this week",
      content:
        "The hostel office will be open from 09:30 to 16:30, Monday to Friday. Allocations and room changes are handled at the counter.",
      isPinned: false,
    },
  ];

  let created = 0;
  for (const notice of notices) {
    const existing = await prisma.notice.findFirst({ where: { title: notice.title } });
    if (existing) continue;
    await prisma.notice.create({
      data: { ...notice, authorId: admin.id },
    });
    created += 1;
  }

  return { skipped: false as const, created, reason: null };
}

async function seedDemoRecords() {
  const studentClerkId = process.env.SEED_STUDENT_CLERK_ID?.trim();
  if (!studentClerkId)
    return { skipped: true as const, allocation: false, complaints: 0, reason: "SEED_STUDENT_CLERK_ID not set" };

  const student = await prisma.user.findUnique({ where: { clerkUserId: studentClerkId } });
  if (!student) return { skipped: true as const, allocation: false, complaints: 0, reason: "student account not found" };

  const active = await prisma.allocation.findFirst({
    where: { studentId: student.id, status: "ACTIVE" },
  });

  let allocation = false;
  if (!active) {
    const room = await prisma.room.findFirst({
      where: { status: "AVAILABLE" },
      orderBy: { roomNumber: "asc" },
    });
    if (room) {
      const occupancy = await prisma.allocation.count({
        where: { roomId: room.id, status: "ACTIVE" },
      });
      if (occupancy < room.capacity) {
        await prisma.allocation.create({
          data: { studentId: student.id, roomId: room.id, status: "ACTIVE" },
        });
        if (occupancy + 1 >= room.capacity) {
          await prisma.room.update({ where: { id: room.id }, data: { status: "FULL" } });
        }
        allocation = true;
      }
    }
  }

  const existingComplaints = await prisma.complaint.count({ where: { studentId: student.id } });
  let complaints = 0;
  if (existingComplaints === 0) {
    const room = await prisma.allocation.findFirst({
      where: { studentId: student.id, status: "ACTIVE" },
      include: { room: true },
    });
    const samples = [
      {
        title: "Ceiling fan sparks when switched on",
        description:
          "The fan in my room sparks when switched on. It happened twice today and I have stopped using it. Please send someone to check the wiring.",
        category: "ELECTRICAL" as const,
        priority: "HIGH" as const,
        aiStatus: "DONE" as const,
        aiCategory: "ELECTRICAL" as const,
        aiPriority: "HIGH" as const,
        aiConfidence: 0.94,
      },
      {
        title: "Slow internet on the first floor",
        description:
          "The Wi-Fi signal is very weak near the stairwell and drops constantly in the evening. Video calls for classes are not usable.",
        category: "INTERNET" as const,
        priority: "MEDIUM" as const,
        aiStatus: "DONE" as const,
        aiCategory: "INTERNET" as const,
        aiPriority: "MEDIUM" as const,
        aiConfidence: 0.86,
      },
      {
        title: "Corridor light near room 102 is out",
        description:
          "The corridor light outside room 102 has been out for three days. It is difficult to see at night when returning from the library.",
        category: "ELECTRICAL" as const,
        priority: "LOW" as const,
        aiStatus: "DONE" as const,
        aiCategory: "ELECTRICAL" as const,
        aiPriority: "LOW" as const,
        aiConfidence: 0.71,
      },
    ];

    for (const sample of samples) {
      await prisma.complaint.create({
        data: {
          ...sample,
          studentId: student.id,
          roomId: room?.roomId ?? null,
          status: "OPEN",
          aiProvider: "seed",
          aiModel: "seed",
          aiProcessedAt: new Date(),
        },
      });
      complaints += 1;
    }
  }

  return { skipped: false as const, allocation, complaints, reason: null };
}

async function main() {
  const rooms = await seedRooms();
  const notices = await seedNotices();
  const demo = await seedDemoRecords();

  console.log(
    [
      "Hostelio seed complete.",
      `Rooms: ${rooms.created} created, ${rooms.updated} updated.`,
      notices.skipped
        ? `Notices: skipped (${notices.reason}).`
        : `Notices: ${notices.created} created.`,
      demo.skipped
        ? `Demo records: skipped (${demo.reason}).`
        : `Demo records: allocation ${demo.allocation ? "created" : "already present"}, ${demo.complaints} complaints created.`,
    ].join("\n"),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
