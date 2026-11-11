import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AllocateDialog } from "@/components/allocations/allocate-dialog";
import { AllocationRowActions } from "@/components/allocations/allocation-actions";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationNav } from "@/components/layout/pagination-nav";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  listAllocatableRooms,
  listAllocations,
  listUnallocatedStudents,
} from "@/lib/services/allocations";
import { formatDate, formatRent, pluralize } from "@/lib/utils";
import { allocationQuerySchema } from "@/lib/validators/allocation";

export const metadata: Metadata = { title: "Allocations" };

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  TRIPLE: "Triple",
  QUAD: "Quad",
};

export default async function AllocationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const raw = await searchParams;
  const parsed = allocationQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : allocationQuerySchema.parse({});

  const isAdmin = user.role === "ADMIN";
  const status = query.status ?? "ACTIVE";

  const [result, students, rooms] = await Promise.all([
    listAllocations(user, { ...query, status: isAdmin ? status : query.status }),
    isAdmin ? listUnallocatedStudents() : Promise.resolve([]),
    isAdmin ? listAllocatableRooms() : Promise.resolve([]),
  ]);

  const tabs = [
    { key: "ACTIVE" as const, label: "Active" },
    { key: "VACATED" as const, label: "Vacated history" },
  ];

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Allocations" : "My allocation"}
        description={
          isAdmin
            ? "Allocate students to rooms, move them between rooms, and keep vacancy history."
            : "Your current room and past hostel allocations. The hostel office handles changes."
        }
      >
        {isAdmin ? <AllocateDialog students={students} rooms={rooms} /> : null}
      </PageHeader>

      {isAdmin ? (
        <div
          role="tablist"
          aria-label="Allocation status"
          className="mb-5 inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 p-1"
        >
          {tabs.map((tab) => {
            const active = status === tab.key;
            return (
              <Link
                key={tab.key}
                role="tab"
                aria-selected={active}
                href={`/allocations?status=${tab.key}`}
                className={
                  active
                    ? "inline-flex h-8 items-center rounded-sm bg-surface px-3 text-[13px] font-medium text-ink shadow-card"
                    : "inline-flex h-8 items-center rounded-sm px-3 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {result.data.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={
            isAdmin
              ? status === "ACTIVE"
                ? "No active allocations"
                : "No vacated allocations yet"
              : "No room allocated yet"
          }
          description={
            isAdmin
              ? status === "ACTIVE"
                ? "Allocate a student to a room with free beds to get started."
                : "Vacated allocations will appear here once students move out."
              : "Allocation is performed by the hostel office. Once you receive a room, it will show up here."
          }
          action={
            !isAdmin ? (
              <Link
                href="/rooms"
                className="text-[13px] font-medium text-accent hover:underline"
              >
                Browse rooms
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin ? (
                  <>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start</TableHead>
                    {status === "VACATED" ? <TableHead>End</TableHead> : null}
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Actions</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Room</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((allocation) => {
                const active = allocation.status === "ACTIVE";
                return (
                  <TableRow
                    key={allocation.id}
                    className={active ? undefined : "text-ink-secondary"}
                  >
                    {isAdmin ? (
                      <>
                        <TableCell>
                          <p className="font-medium text-ink">{allocation.student.name}</p>
                          <p className="text-[12px] text-ink-tertiary">
                            {allocation.student.studentId ?? allocation.student.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/rooms/${allocation.room.id}`}
                            className="font-medium text-ink hover:text-accent"
                          >
                            {allocation.room.roomNumber}
                          </Link>
                          <p className="text-[12px] text-ink-tertiary">
                            Block {allocation.room.block} · Floor {allocation.room.floor}
                          </p>
                        </TableCell>
                        <TableCell className="text-ink-secondary">
                          {TYPE_LABELS[allocation.room.type]}
                        </TableCell>
                        <TableCell className="tabular text-ink-secondary">
                          {formatDate(allocation.startDate)}
                        </TableCell>
                        {status === "VACATED" ? (
                          <TableCell className="tabular text-ink-secondary">
                            {formatDate(allocation.endDate)}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <StatusBadge value={allocation.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {active ? (
                            <AllocationRowActions
                              allocationId={allocation.id}
                              studentName={allocation.student.name}
                              roomId={allocation.room.id}
                              rooms={rooms}
                            />
                          ) : (
                            <span className="text-[12px] text-ink-tertiary">—</span>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Link
                            href={`/rooms/${allocation.room.id}`}
                            className="font-medium text-ink hover:text-accent"
                          >
                            {allocation.room.roomNumber}
                          </Link>
                          <p className="text-[12px] text-ink-tertiary">
                            {TYPE_LABELS[allocation.room.type]} ·{" "}
                            {pluralize(allocation.room.capacity, "bed")}
                          </p>
                        </TableCell>
                        <TableCell className="text-ink-secondary">
                          Block {allocation.room.block}, floor {allocation.room.floor}
                        </TableCell>
                        <TableCell className="tabular text-ink-secondary">
                          {formatDate(allocation.startDate)}
                        </TableCell>
                        <TableCell className="tabular text-ink-secondary">
                          {formatDate(allocation.endDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={allocation.status} />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isAdmin ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-tertiary">
          <p>
            {result.meta.total} {result.meta.total === 1 ? "allocation" : "allocations"} on record
          </p>
          {(() => {
            const active = result.data.find((allocation) => allocation.status === "ACTIVE");
            if (!active) return null;
            return <p>Current room rent: {formatRent(active.room.monthlyRent)} per month</p>;
          })()}
        </div>
      ) : null}

      <PaginationNav
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        basePath="/allocations"
        searchParams={{ status: isAdmin ? status : undefined }}
      />
    </div>
  );
}
