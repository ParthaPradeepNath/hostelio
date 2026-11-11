import type { Prisma } from "@prisma/client";
import { paginationMeta } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";
import type { NoticeCreateInput, NoticeQuery } from "@/lib/validators/notice";

export const noticeInclude = {
  author: { select: { id: true, name: true } },
} satisfies Prisma.NoticeInclude;

export async function listNotices(query: NoticeQuery) {
  const where: Prisma.NoticeWhereInput =
    query.pinned === undefined ? {} : { isPinned: query.pinned };

  const [total, notices] = await Promise.all([
    prisma.notice.count({ where }),
    prisma.notice.findMany({
      where,
      include: noticeInclude,
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    data: notices,
    meta: paginationMeta(query.page, query.pageSize, total),
  };
}

export async function listDashboardNotices() {
  const [pinned, latest] = await Promise.all([
    prisma.notice.findMany({
      where: { isPinned: true },
      include: noticeInclude,
      orderBy: { publishedAt: "desc" },
      take: 2,
    }),
    prisma.notice.findMany({
      include: noticeInclude,
      orderBy: { publishedAt: "desc" },
      take: 2,
    }),
  ]);

  const seen = new Set<string>();
  return [...pinned, ...latest].filter((notice) => {
    if (seen.has(notice.id)) return false;
    seen.add(notice.id);
    return true;
  });
}

export async function createNotice(authorId: string, input: NoticeCreateInput) {
  return prisma.notice.create({
    data: {
      title: input.title,
      content: input.content,
      isPinned: input.isPinned,
      authorId,
    },
    include: noticeInclude,
  });
}
