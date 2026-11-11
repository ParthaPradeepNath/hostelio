import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  DoorOpen,
  MessageSquareWarning,
  Plus,
  UserPlus,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PublishNoticeDialog } from "@/components/notices/publish-notice-dialog";
import { RoomFormDialog } from "@/components/rooms/room-form-dialog";
import { AiSummaryCard, AiSummarySkeleton } from "@/components/dashboard/ai-summary-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAdminDashboardStats } from "@/lib/services/dashboard";
import { enumLabel, formatCount, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard/student");

  const { stats, byBlock, recentComplaints, recentNotices } = await getAdminDashboardStats();

  return (
    <div>
      <PageHeader
        title="Hostel overview"
        description="Live occupancy, complaint workload, and announcements for the whole hostel."
      >
        <RoomFormDialog
          mode="create"
          trigger={
            <Button variant="secondary" size="sm">
              <Plus aria-hidden />
              Add room
            </Button>
          }
        />
        <Button variant="secondary" size="sm" asChild>
          <Link href="/allocations">
            <UserPlus aria-hidden />
            Allocate student
          </Link>
        </Button>
        <PublishNoticeDialog />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total rooms" value={formatCount(stats.totalRooms)} icon={DoorOpen} />
        <StatCard label="Total beds" value={formatCount(stats.totalBeds)} icon={BedDouble} />
        <StatCard
          label="Occupied beds"
          value={formatCount(stats.occupiedBeds)}
          hint={
            stats.totalBeds > 0
              ? `${Math.round((stats.occupiedBeds / stats.totalBeds) * 100)}% occupancy`
              : "No beds configured"
          }
          icon={Building2}
        />
        <StatCard
          label="Available beds"
          value={formatCount(stats.availableBeds)}
          hint="Ready to allocate"
          icon={DoorOpen}
          emphasis
        />
        <StatCard label="Open complaints" value={formatCount(stats.openComplaints)} icon={MessageSquareWarning} />
        <StatCard
          label="In progress"
          value={formatCount(stats.inProgressComplaints)}
          icon={Wrench}
        />
        <StatCard
          label="Resolved this month"
          value={formatCount(stats.resolvedThisMonth)}
          icon={CheckCircle2}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Occupancy by block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead className="text-right">Rooms</TableHead>
                  <TableHead className="text-right">Beds</TableHead>
                  <TableHead className="text-right">Occupied</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="w-40">Fill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byBlock.map((block) => {
                  const percent = block.beds > 0 ? (block.occupied / block.beds) * 100 : 0;
                  return (
                    <TableRow key={block.block}>
                      <TableCell className="font-medium text-ink">Block {block.block}</TableCell>
                      <TableCell className="tabular text-right text-ink-secondary">{block.rooms}</TableCell>
                      <TableCell className="tabular text-right text-ink-secondary">{block.beds}</TableCell>
                      <TableCell className="tabular text-right text-ink">{block.occupied}</TableCell>
                      <TableCell className="tabular text-right text-ink-secondary">
                        {block.available}
                      </TableCell>
                      <TableCell>
                        <Progress
                          value={percent}
                          aria-label={`Block ${block.block}: ${Math.round(percent)}% occupied`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>

            <ul className="flex flex-col gap-4 md:hidden">
              {byBlock.map((block) => {
                const percent = block.beds > 0 ? (block.occupied / block.beds) * 100 : 0;
                return (
                  <li key={block.block}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium text-ink">Block {block.block}</p>
                      <p className="tabular text-[12px] text-ink-secondary">
                        {block.available} of {block.beds} beds free
                      </p>
                    </div>
                    <Progress
                      value={percent}
                      className="mt-2"
                      aria-label={`Block ${block.block}: ${Math.round(percent)}% occupied`}
                    />
                    <p className="mt-1.5 text-[12px] text-ink-tertiary">
                      {block.rooms} rooms · {block.occupied} occupied
                    </p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Suspense fallback={<AiSummarySkeleton />}>
          <AiSummaryCard />
        </Suspense>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Recent complaints</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/complaints">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <p className="text-[13px] text-ink-secondary">No complaints have been raised yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {recentComplaints.map((complaint) => (
                  <li
                    key={complaint.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/complaints/${complaint.id}`}
                        className="block truncate text-[14px] font-medium text-ink hover:text-accent"
                        title={complaint.title}
                      >
                        {complaint.title}
                      </Link>
                      <p className="text-[12px] text-ink-secondary">
                        {complaint.student.name}
                        {complaint.room ? ` · Room ${complaint.room.roomNumber}` : ""} ·{" "}
                        {enumLabel(complaint.aiCategory ?? complaint.category)}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Recent notices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notices">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <p className="text-[13px] text-ink-secondary">No notices published yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {recentNotices.map((notice) => (
                  <li key={notice.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-[13px] font-medium leading-snug text-ink">{notice.title}</p>
                    <p className="mt-1 text-[11px] text-ink-tertiary">
                      {notice.author.name} · {formatDate(notice.publishedAt)}
                      {notice.isPinned ? " · Pinned" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
