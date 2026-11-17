import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  BedDouble,
  Building2,
  DoorOpen,
  KeyRound,
  Megaphone,
  MessageSquareWarning,
  Pin,
  UserRound,
} from "lucide-react";

import { NewComplaintDialog } from "@/components/complaints/new-complaint-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStudentDashboard } from "@/lib/services/dashboard";
import { enumLabel, formatDate, formatRent, pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Student dashboard" };

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  TRIPLE: "Triple",
  QUAD: "Quad",
};

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/dashboard/admin");

  const { allocation, complaints, notices } = await getStudentDashboard(
    user.id
  );
  const firstName = user.name.split(/\s+/)[0] || user.name;
  const profileIncomplete = !user.phone || !user.studentId;

  const activeRoom = allocation
    ? {
        id: allocation.room.id,
        roomNumber: allocation.room.roomNumber,
        block: allocation.room.block,
      }
    : null;

  const statusItems = [
    { key: "OPEN", label: "Open", value: complaints.counts.OPEN ?? 0 },
    {
      key: "IN_PROGRESS",
      label: "In progress",
      value: complaints.counts.IN_PROGRESS ?? 0,
    },
    {
      key: "RESOLVED",
      label: "Resolved",
      value: complaints.counts.RESOLVED ?? 0,
    },
    {
      key: "REJECTED",
      label: "Rejected",
      value: complaints.counts.REJECTED ?? 0,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Your room, complaints, and the latest from the hostel office."
        className="lg:mb-5"
      >
        <NewComplaintDialog activeRoom={activeRoom} />
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-4">
        <div className="flex flex-col gap-5 lg:col-span-2 lg:gap-4">
          <Card className="lg:p-5">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>My room</CardTitle>
                {allocation ? (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/rooms/${allocation.room.id}`}>
                      View room
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {allocation ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-ink text-[24px] leading-none font-semibold">
                        {allocation.room.roomNumber}
                      </p>
                      <p className="text-ink-secondary mt-1.5 text-[13px]">
                        Block {allocation.room.block} · Floor{" "}
                        {allocation.room.floor} ·{" "}
                        {TYPE_LABELS[allocation.room.type]} ·{" "}
                        {pluralize(allocation.room.capacity, "bed")}
                      </p>
                    </div>
                    <StatusBadge value="ACTIVE" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4 lg:mt-4">
                    <div>
                      <p className="text-ink-tertiary">Monthly rent</p>
                      <p className="tabular text-ink mt-0.5 font-medium">
                        {formatRent(allocation.room.monthlyRent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-tertiary">Allocated since</p>
                      <p className="text-ink mt-0.5">
                        {formatDate(allocation.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-tertiary">Room type</p>
                      <p className="text-ink mt-0.5 flex items-center gap-1.5">
                        <BedDouble
                          className="text-ink-tertiary size-3.5"
                          aria-hidden
                        />
                        {TYPE_LABELS[allocation.room.type]}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-tertiary">Block</p>
                      <p className="text-ink mt-0.5 flex items-center gap-1.5">
                        <Building2
                          className="text-ink-tertiary size-3.5"
                          aria-hidden
                        />
                        {allocation.room.block}
                      </p>
                    </div>
                  </div>

                  {allocation.room.amenities.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-1.5 lg:mt-3">
                      {allocation.room.amenities.map((amenity) => (
                        <li
                          key={amenity}
                          className="rounded-pill border-line bg-surface-2 text-ink-secondary border px-2.5 py-1 text-[11px]"
                        >
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  icon={KeyRound}
                  title="No room allocated yet"
                  description="The hostel office handles all allocations. Once you receive a room, its details appear here."
                  action={
                    <Button variant="secondary" asChild>
                      <Link href="/rooms">Browse rooms</Link>
                    </Button>
                  }
                  className="border-0 bg-transparent px-0 py-6"
                />
              )}
            </CardContent>
          </Card>

          <Card className="lg:p-5">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>My complaints</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/complaints">
                    View all
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {statusItems.map((item) => (
                  <div key={item.key}>
                    <p className="tabular text-ink text-[18px] leading-none font-semibold">
                      {item.value}
                    </p>
                    <p className="text-ink-secondary mt-1 text-[11px]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 lg:mt-3">
                {complaints.recent.length === 0 ? (
                  <EmptyState
                    icon={MessageSquareWarning}
                    title="No complaints yet"
                    description="Raise a complaint when something in your room or block needs attention."
                    action={<NewComplaintDialog activeRoom={activeRoom} />}
                    className="border-0 bg-transparent px-0 py-6"
                  />
                ) : (
                  <ul className="divide-line flex flex-col divide-y">
                    {complaints.recent.map((complaint) => (
                      <li
                        key={complaint.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0 lg:py-2.5"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/complaints/${complaint.id}`}
                            className="text-ink hover:text-accent block truncate text-[14px] font-medium"
                            title={complaint.title}
                          >
                            {complaint.title}
                          </Link>
                          <p className="text-ink-secondary text-[12px]">
                            {enumLabel(
                              complaint.aiCategory ?? complaint.category
                            )}{" "}
                            · {formatDate(complaint.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge value={complaint.priority} dot={false} />
                          <StatusBadge value={complaint.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5 lg:gap-4">
          {profileIncomplete ? (
            <Card className="lg:p-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="text-accent size-4" aria-hidden />
                  Complete your profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-secondary text-[13px] leading-relaxed">
                  Add your {!user.phone ? "phone number" : "student ID"} so the
                  hostel office can reach you and match you to your records.
                </p>
                <div className="mt-3">
                  <Button size="sm" asChild>
                    <Link href="/profile">Update profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="lg:p-5">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Notices</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/notices">
                    View all
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notices.length === 0 ? (
                <p className="text-ink-secondary text-[13px]">
                  No notices have been published yet.
                </p>
              ) : (
                <ul className="divide-line flex flex-col divide-y">
                  {notices.map((notice) => (
                    <li
                      key={notice.id}
                      className="py-3 first:pt-0 last:pb-0 lg:py-2.5"
                    >
                      <p className="text-ink flex items-start gap-1.5 text-[13px] leading-snug font-medium">
                        {notice.isPinned ? (
                          <Pin
                            className="text-accent mt-0.5 size-3.5 shrink-0"
                            aria-hidden
                          />
                        ) : null}
                        {notice.title}
                      </p>
                      <p className="text-ink-tertiary mt-1 text-[11px]">
                        {formatDate(notice.publishedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="lg:hidden">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <NewComplaintDialog activeRoom={activeRoom} />
                <Button variant="secondary" asChild>
                  <Link href="/rooms">
                    <DoorOpen aria-hidden />
                    View rooms
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/profile">
                    <UserRound aria-hidden />
                    View profile
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/notices">
                    <Megaphone aria-hidden />
                    All notices
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
