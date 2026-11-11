import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Bot, CheckCircle2, Clock, Sparkles, UserRound } from "lucide-react";
import { AdminTriage } from "@/components/complaints/admin-triage";
import { StudentComplaintEdit } from "@/components/complaints/student-complaint-edit";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isAppError } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getComplaintForUser } from "@/lib/services/complaints";
import { enumLabel, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Complaint" };

export default async function ComplaintDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let complaint: Awaited<ReturnType<typeof getComplaintForUser>>;
  try {
    complaint = await getComplaintForUser(user, id);
  } catch (error) {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  const isAdmin = user.role === "ADMIN";
  const predictionApplied =
    complaint.aiCategory === complaint.category && complaint.aiPriority === complaint.priority;

  const timeline = [
    {
      key: "created",
      label: "Submitted",
      date: complaint.createdAt,
      icon: Clock,
    },
    ...(complaint.aiProcessedAt
      ? [
          {
            key: "ai",
            label:
              complaint.aiStatus === "DONE"
                ? "AI categorised"
                : complaint.aiStatus === "FAILED"
                  ? "AI analysis failed"
                  : "AI analysis skipped",
            date: complaint.aiProcessedAt,
            icon: Bot,
          },
        ]
      : []),
    ...(complaint.resolvedAt
      ? [
          {
            key: "resolved",
            label: "Resolved",
            date: complaint.resolvedAt,
            icon: CheckCircle2,
          },
        ]
      : []),
  ];

  return (
    <div>
      <Link
        href="/complaints"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        All complaints
      </Link>

      <PageHeader
        title={complaint.title}
        description={`Raised ${formatDateTime(complaint.createdAt)}${
          complaint.room ? ` · Room ${complaint.room.roomNumber}, Block ${complaint.room.block}` : ""
        }`}
      >
        <StatusBadge value={complaint.status} />
        <StatusBadge value={complaint.priority} dot={false} />
        {!isAdmin && complaint.status === "OPEN" ? (
          <StudentComplaintEdit
            complaint={{
              id: complaint.id,
              title: complaint.title,
              description: complaint.description,
              category: complaint.category,
            }}
          />
        ) : null}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="type-reading text-[14px] text-ink">{complaint.description}</p>
            </CardContent>
          </Card>

          {complaint.adminResponse ? (
            <Card>
              <CardHeader>
                <CardTitle>Hostel office response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="type-reading text-[14px] text-ink">{complaint.adminResponse}</p>
              </CardContent>
            </Card>
          ) : null}

          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Triage</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminTriage
                  complaint={{
                    id: complaint.id,
                    status: complaint.status,
                    priority: complaint.priority,
                    category: complaint.category,
                    adminResponse: complaint.adminResponse,
                  }}
                />
              </CardContent>
            </Card>
          ) : null}

          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="size-4 text-ink-tertiary" aria-hidden />
                  AI suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {complaint.aiStatus === "PENDING" ? (
                  <p className="flex items-center gap-2 text-[13px] text-ink-secondary">
                    <Clock className="size-4 text-ink-tertiary" aria-hidden />
                    Analyzing this complaint. This usually takes a few seconds.
                  </p>
                ) : complaint.aiStatus === "FAILED" ? (
                  <p className="text-[13px] leading-relaxed text-ink-secondary">
                    AI analysis failed. Triage this complaint manually — no automatic category or
                    priority was applied.
                  </p>
                ) : complaint.aiStatus === "SKIPPED" ? (
                  <p className="text-[13px] leading-relaxed text-ink-secondary">
                    AI was unavailable, so this complaint was not categorized automatically.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <p className="text-ink-tertiary">Predicted category</p>
                        <p className="mt-0.5 text-ink">
                          {complaint.aiCategory ? enumLabel(complaint.aiCategory) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-ink-tertiary">Predicted priority</p>
                        <p className="mt-0.5 text-ink">
                          {complaint.aiPriority ? enumLabel(complaint.aiPriority) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-ink-tertiary">Confidence</p>
                        <p className="tabular mt-0.5 text-ink">
                          {complaint.aiConfidence === null
                            ? "—"
                            : `${Math.round(complaint.aiConfidence * 100)}%`}
                        </p>
                      </div>
                      <div>
                        <p className="text-ink-tertiary">Applied</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-ink">
                          {predictionApplied ? (
                            <>
                              <Sparkles className="size-3.5 text-accent" aria-hidden />
                              Applied
                            </>
                          ) : (
                            "Not applied — admin values kept"
                          )}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <p className="text-[12px] text-ink-tertiary">
                      {complaint.aiProvider ?? "Unknown provider"} · {complaint.aiModel ?? "Unknown model"} ·{" "}
                      {formatDateTime(complaint.aiProcessedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-tertiary">Category</dt>
                  <dd className="text-ink">{enumLabel(complaint.category)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-tertiary">Priority</dt>
                  <dd>
                    <StatusBadge value={complaint.priority} dot={false} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-tertiary">Status</dt>
                  <dd>
                    <StatusBadge value={complaint.status} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-tertiary">Room</dt>
                  <dd className="text-ink">
                    {complaint.room ? (
                      <Link href={`/rooms/${complaint.room.id}`} className="hover:text-accent">
                        {complaint.room.roomNumber} · Block {complaint.room.block}
                      </Link>
                    ) : (
                      "Not specified"
                    )}
                  </dd>
                </div>
                {isAdmin ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-tertiary">Student</dt>
                    <dd className="flex items-center gap-1.5 text-ink">
                      <UserRound className="size-3.5 text-ink-tertiary" aria-hidden />
                      {complaint.student.name}
                      {complaint.student.studentId ? ` (${complaint.student.studentId})` : ""}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-4">
                {timeline.map((entry, index) => {
                  const Icon = entry.icon;
                  return (
                    <li key={entry.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-surface-2 text-ink-secondary">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        {index < timeline.length - 1 ? (
                          <span className="mt-1 w-px flex-1 bg-line" aria-hidden />
                        ) : null}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-[13px] font-medium text-ink">{entry.label}</p>
                        <p className="text-[12px] text-ink-secondary">{formatDateTime(entry.date)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <p className="px-1 text-[12px] text-ink-tertiary">
            Raised on {formatDate(complaint.createdAt)}
            {complaint.resolvedAt ? ` · Resolved on ${formatDate(complaint.resolvedAt)}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
