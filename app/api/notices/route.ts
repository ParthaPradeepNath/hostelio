import { parseQuery, withAuth } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/responses";
import { createNotice, listNotices } from "@/lib/services/notices";
import { noticeCreateSchema, noticeQuerySchema } from "@/lib/validators/notice";

export const GET = withAuth({}, async ({ req }) => {
  const query = parseQuery(noticeQuerySchema, req.nextUrl.searchParams);
  const result = await listNotices(query);
  return ok(result.data, result.meta);
});

export const POST = withAuth({ role: "ADMIN", schema: noticeCreateSchema }, async ({ body, user }) => {
  return created(await createNotice(user.id, body));
});
