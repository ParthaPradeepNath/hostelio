import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { KeyRound } from "lucide-react";

import { AllocateDialog } from "@/components/allocations/allocate-dialog";
import { AllocationRowActions } from "@/components/allocations/allocation-actions";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationNav } from "@/components/layout/pagination-nav";
import { TabTransition } from "@/components/layout/tab-transition";
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
    listAllocations(user, {
      ...query,
      status: isAdmin ? status : query.status,
    }),
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
        <nav
          aria-label="Allocation status"
          className="border-line bg-surface-2 mb-5 inline-flex items-center gap-1 rounded-md border p-1"
        >
          {tabs.map((tab) => {
            const active = status === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/allocations?status=${tab.key}`}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "bg-surface text-ink shadow-card inline-flex h-11 items-center rounded-sm px-3 text-[13px] font-medium sm:h-8"
                    : "text-ink-secondary hover:text-ink inline-flex h-11 items-center rounded-sm px-3 text-[13px] font-medium transition-colors sm:h-8"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <TabTransition value={status}>
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
                  className="text-accent text-[13px] font-medium hover:underline"
                >
                  Browse rooms
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="border-line bg-surface shadow-card hidden overflow-hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin ? (
                      <>
                        <TableHead>Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Start</TableHead>
                        {status === "VACATED" ? (
                          <TableHead>End</TableHead>
                        ) : null}
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12 text-right">
                          Actions
                        </TableHead>
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
                              <div className="max-w-56">
                                <p
                                  className="text-ink truncate font-medium"
                                  title={allocation.student.name}
                                >
                                  {allocation.student.name}
                                </p>
                                <p
                                  className="text-ink-tertiary truncate text-[12px]"
                                  title={
                                    allocation.student.studentId ??
                                    allocation.student.email
                                  }
                                >
                                  {allocation.student.studentId ??
                                    allocation.student.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/rooms/${allocation.room.id}`}
                                className="text-ink hover:text-accent font-medium"
                              >
                                {allocation.room.roomNumber}
                              </Link>
                              <p className="text-ink-tertiary text-[12px]">
                                Block {allocation.room.block} · Floor{" "}
                                {allocation.room.floor}
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
                                <span className="text-ink-tertiary text-[12px]">
                                  —
                                </span>
                              )}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              <Link
                                href={`/rooms/${allocation.room.id}`}
                                className="text-ink hover:text-accent font-medium"
                              >
                                {allocation.room.roomNumber}
                              </Link>
                              <p className="text-ink-tertiary text-[12px]">
                                {TYPE_LABELS[allocation.room.type]} ·{" "}
                                {pluralize(allocation.room.capacity, "bed")}
                              </p>
                            </TableCell>
                            <TableCell className="text-ink-secondary">
                              Block {allocation.room.block}, floor{" "}
                              {allocation.room.floor}
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

            <div className="flex flex-col gap-3 md:hidden">
              {result.data.map((allocation) => {
                const active = allocation.status === "ACTIVE";
                return (
                  <article
                    key={allocation.id}
                    className="border-line bg-surface shadow-card rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/rooms/${allocation.room.id}`}
                          className="text-ink hover:text-accent text-[15px] font-medium"
                        >
                          Room {allocation.room.roomNumber}
                        </Link>
                        <p className="text-ink-secondary mt-0.5 text-[12px]">
                          Block {allocation.room.block} · Floor{" "}
                          {allocation.room.floor} ·{" "}
                          {TYPE_LABELS[allocation.room.type]}
                        </p>
                      </div>
                      <StatusBadge value={allocation.status} />
                    </div>

                    {isAdmin ? (
                      <div className="mt-3 min-w-0">
                        <p
                          className="text-ink truncate text-[13px] font-medium"
                          title={allocation.student.name}
                        >
                          {allocation.student.name}
                        </p>
                        <p
                          className="text-ink-secondary truncate text-[12px]"
                          title={
                            allocation.student.studentId ??
                            allocation.student.email
                          }
                        >
                          {allocation.student.studentId ??
                            allocation.student.email}
                        </p>
                      </div>
                    ) : (
                      <p className="text-ink-secondary mt-3 text-[12px]">
                        {pluralize(allocation.room.capacity, "bed")} ·{" "}
                        {formatRent(allocation.room.monthlyRent)}
                      </p>
                    )}

                    <div className="text-ink-secondary mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                      <span>Start {formatDate(allocation.startDate)}</span>
                      {allocation.endDate ? (
                        <span>End {formatDate(allocation.endDate)}</span>
                      ) : null}
                    </div>

                    {isAdmin && active ? (
                      <div className="border-line mt-3 border-t pt-3">
                        <AllocationRowActions
                          allocationId={allocation.id}
                          studentName={allocation.student.name}
                          roomId={allocation.room.id}
                          rooms={rooms}
                          compact
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </TabTransition>

      {!isAdmin ? (
        <div className="text-ink-tertiary mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
          <p>
            {result.meta.total}{" "}
            {result.meta.total === 1 ? "allocation" : "allocations"} on record
          </p>
          {(() => {
            const active = result.data.find(
              (allocation) => allocation.status === "ACTIVE"
            );
            if (!active) return null;
            return (
              <p>
                Current room rent: {formatRent(active.room.monthlyRent)} per
                month
              </p>
            );
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
