"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MessageSquareWarning, RotateCcw, Search } from "lucide-react";

import { NewComplaintDialog } from "@/components/complaints/new-complaint-dialog";
import { QuickStatus } from "@/components/complaints/quick-status";
import type {
  ActiveRoomOption,
  ComplaintFilters,
  ComplaintListItem,
} from "@/components/complaints/types";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationNav } from "@/components/layout/pagination-nav";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta } from "@/lib/api/responses";
import { enumLabel, formatAge, formatDate } from "@/lib/utils";
import { COMPLAINT_CATEGORIES, PRIORITIES } from "@/lib/validators/complaint";

export function ComplaintsView({
  complaints,
  meta,
  filters,
  role,
  activeRoom,
}: {
  complaints: ComplaintListItem[];
  meta: PaginationMeta;
  filters: ComplaintFilters;
  role: "STUDENT" | "ADMIN";
  activeRoom: ActiveRoomOption;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.q ?? "");
  const isAdmin = role === "ADMIN";
  const hasPending = complaints.some(
    (complaint) => complaint.aiStatus === "PENDING"
  );

  useEffect(() => {
    setQuery(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    if (!hasPending) return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt > 60_000) {
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, 5_000);
    return () => clearInterval(timer);
  }, [hasPending, router]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const suffix = params.toString();
    router.push(suffix ? `${pathname}?${suffix}` : pathname);
  }

  useEffect(() => {
    const current = filters.q ?? "";
    if (query === current) return;
    const timer = setTimeout(() => updateParam("q", query), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = Boolean(
    filters.q || filters.status || filters.category || filters.priority
  );

  function resetFilters() {
    router.push(pathname);
    setQuery("");
  }

  const searchParamsForPagination = {
    status: filters.status,
    category: filters.category,
    priority: isAdmin ? filters.priority : undefined,
    q: filters.q,
  };

  return (
    <div>
      <PageHeader
        title="Complaints"
        description={
          isAdmin
            ? "Triage complaints from across the hostel, update priorities, and record resolutions."
            : "Raise maintenance and service complaints, then follow their progress."
        }
      >
        {!isAdmin ? <NewComplaintDialog activeRoom={activeRoom} /> : null}
      </PageHeader>

      <div className="border-line bg-surface shadow-card mb-5 flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-ink-tertiary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search complaints"
            aria-label="Search complaints"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) => updateParam("status", value)}
          >
            <SelectTrigger aria-label="Filter by status" className="md:w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category ?? "all"}
            onValueChange={(value) => updateParam("category", value)}
          >
            <SelectTrigger aria-label="Filter by category" className="md:w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {COMPLAINT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {enumLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin ? (
            <Select
              value={filters.priority ?? "all"}
              onValueChange={(value) => updateParam("priority", value)}
            >
              <SelectTrigger
                aria-label="Filter by priority"
                className="md:w-32"
              >
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {enumLabel(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="col-span-2 justify-self-start md:col-span-1"
            >
              <RotateCcw aria-hidden />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-ink-tertiary mb-3 text-[12px]">
        {meta.total} {meta.total === 1 ? "complaint" : "complaints"}
        {hasPending ? " · analyzing new complaints" : ""}
      </p>

      {complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title={
            isAdmin ? "No complaints match these filters" : "No complaints yet"
          }
          description={
            isAdmin
              ? "Try a different status, category, or search term."
              : "Raise a complaint when something in your room or block needs attention."
          }
          action={
            isAdmin ? (
              <Button variant="secondary" onClick={resetFilters}>
                Reset filters
              </Button>
            ) : (
              <NewComplaintDialog activeRoom={activeRoom} />
            )
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
                      <TableHead>Complaint</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI</TableHead>
                      <TableHead className="text-right">Age</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    {isAdmin ? (
                      <>
                        <TableCell>
                          <div className="max-w-56">
                            <p
                              className="text-ink truncate font-medium"
                              title={complaint.student.name}
                            >
                              {complaint.student.name}
                            </p>
                            <p
                              className="text-ink-tertiary truncate text-[12px]"
                              title={complaint.student.studentId ?? undefined}
                            >
                              {complaint.student.studentId ?? "No student ID"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-72">
                          <Link
                            href={`/complaints/${complaint.id}`}
                            className="text-ink hover:text-accent block truncate font-medium"
                            title={complaint.title}
                          >
                            {complaint.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-ink-secondary">
                          {complaint.room ? complaint.room.roomNumber : "—"}
                        </TableCell>
                        <TableCell className="text-ink-secondary">
                          {enumLabel(complaint.category)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={complaint.priority} dot={false} />
                        </TableCell>
                        <TableCell>
                          <QuickStatus
                            complaintId={complaint.id}
                            status={complaint.status}
                            title={complaint.title}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={complaint.aiStatus} dot={false} />
                        </TableCell>
                        <TableCell className="tabular text-ink-tertiary text-right text-[12px]">
                          {formatAge(complaint.createdAt)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="max-w-72">
                          <Link
                            href={`/complaints/${complaint.id}`}
                            className="text-ink hover:text-accent block truncate font-medium"
                            title={complaint.title}
                          >
                            {complaint.title}
                          </Link>
                          <p className="text-ink-tertiary text-[12px]">
                            {complaint.room
                              ? `Room ${complaint.room.roomNumber}`
                              : "No room"}
                          </p>
                        </TableCell>
                        <TableCell className="text-ink-secondary">
                          {enumLabel(complaint.category)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={complaint.priority} dot={false} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={complaint.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={complaint.aiStatus} dot={false} />
                        </TableCell>
                        <TableCell className="tabular text-ink-tertiary text-right text-[12px]">
                          {formatDate(complaint.createdAt)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border-line bg-surface shadow-card rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/complaints/${complaint.id}`}
                    className="text-ink min-w-0 text-[14px] leading-snug font-medium"
                  >
                    {complaint.title}
                  </Link>
                  <StatusBadge value={complaint.status} />
                </div>
                {isAdmin ? (
                  <p className="text-ink-secondary mt-1 text-[12px]">
                    {complaint.student.name}
                    {complaint.room
                      ? ` · Room ${complaint.room.roomNumber}`
                      : ""}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <StatusBadge value={complaint.priority} dot={false} />
                  <Badge tone="neutral">{enumLabel(complaint.category)}</Badge>
                  <Badge tone="outline">
                    AI{" "}
                    {complaint.aiStatus === "DONE"
                      ? "categorized"
                      : complaint.aiStatus.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-ink-tertiary mt-2 text-[11px]">
                  {formatAge(complaint.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <PaginationNav
        page={meta.page}
        totalPages={meta.totalPages}
        basePath="/complaints"
        searchParams={searchParamsForPagination}
      />
    </div>
  );
}
