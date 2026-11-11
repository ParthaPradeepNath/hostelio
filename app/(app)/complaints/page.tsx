import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ComplaintsView } from "@/components/complaints/complaints-view";
import type { ActiveRoomOption, ComplaintListItem } from "@/components/complaints/types";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStudentActiveAllocation } from "@/lib/services/allocations";
import { listComplaints } from "@/lib/services/complaints";
import { complaintQuerySchema } from "@/lib/validators/complaint";

export const metadata: Metadata = { title: "Complaints" };

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const raw = await searchParams;
  const parsed = complaintQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : complaintQuerySchema.parse({});

  const [result, activeAllocation] = await Promise.all([
    listComplaints(user, query),
    user.role === "STUDENT" ? getStudentActiveAllocation(user.id) : Promise.resolve(null),
  ]);

  const complaints: ComplaintListItem[] = result.data.map((complaint) => ({
    id: complaint.id,
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    aiStatus: complaint.aiStatus,
    aiCategory: complaint.aiCategory,
    aiPriority: complaint.aiPriority,
    createdAt: complaint.createdAt.toISOString(),
    student: {
      name: complaint.student.name,
      studentId: complaint.student.studentId,
    },
    room: complaint.room
      ? { roomNumber: complaint.room.roomNumber, block: complaint.room.block }
      : null,
  }));

  const activeRoom: ActiveRoomOption = activeAllocation
    ? {
        id: activeAllocation.room.id,
        roomNumber: activeAllocation.room.roomNumber,
        block: activeAllocation.room.block,
      }
    : null;

  return (
    <ComplaintsView
      complaints={complaints}
      meta={result.meta}
      filters={{
        status: query.status,
        category: query.category,
        priority: query.priority,
        q: query.q,
        page: query.page,
        pageSize: query.pageSize,
      }}
      role={user.role}
      activeRoom={activeRoom}
    />
  );
}
