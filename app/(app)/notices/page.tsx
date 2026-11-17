import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Megaphone, Pin } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationNav } from "@/components/layout/pagination-nav";
import { PublishNoticeDialog } from "@/components/notices/publish-notice-dialog";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listNotices } from "@/lib/services/notices";
import { formatDate, pluralize } from "@/lib/utils";
import { noticeQuerySchema } from "@/lib/validators/notice";

export const metadata: Metadata = { title: "Notices" };

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const raw = await searchParams;
  const parsed = noticeQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : noticeQuerySchema.parse({});

  const result = await listNotices(query);

  return (
    <div>
      <PageHeader
        title="Notices"
        description="Announcements from the hostel office. Pinned notices stay at the top."
      >
        {user.role === "ADMIN" ? <PublishNoticeDialog /> : null}
      </PageHeader>

      {result.data.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices published yet"
          description={
            user.role === "ADMIN"
              ? "Publish an announcement to keep students informed about maintenance, quiet hours, and office hours."
              : "The hostel office has not published any notices yet. Check back later."
          }
          action={user.role === "ADMIN" ? <PublishNoticeDialog /> : undefined}
        />
      ) : (
        <>
          <p className="text-ink-tertiary mb-3 text-[12px]">
            {pluralize(result.meta.total, "notice")}
          </p>
          <ul className="flex flex-col gap-4">
            {result.data.map((notice) => (
              <li key={notice.id}>
                <article className="border-line bg-surface shadow-card rounded-lg border p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-ink flex items-start gap-2 text-[16px] leading-snug font-semibold">
                        {notice.isPinned ? (
                          <Pin
                            className="text-accent mt-1 size-4 shrink-0"
                            aria-hidden
                          />
                        ) : null}
                        <span>{notice.title}</span>
                      </h2>
                      <p className="text-ink-secondary mt-1 text-[12px]">
                        {notice.author.name} · {formatDate(notice.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="type-reading text-ink mt-4 text-[14px]">
                    {notice.content}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}

      <PaginationNav
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        basePath="/notices"
      />
    </div>
  );
}
