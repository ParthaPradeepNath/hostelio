import { after } from "next/server";
import { parseQuery, withAuth } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/responses";
import { categorizeComplaint } from "@/lib/ai/categorize-complaint";
import { createComplaint, listComplaints } from "@/lib/services/complaints";
import { complaintCreateSchema, complaintQuerySchema } from "@/lib/validators/complaint";

export const GET = withAuth({}, async ({ req, user }) => {
  const query = parseQuery(complaintQuerySchema, req.nextUrl.searchParams);
  const result = await listComplaints(user, query);
  return ok(result.data, result.meta);
});

export const POST = withAuth({ role: "STUDENT", schema: complaintCreateSchema }, async ({ body, user }) => {
  const complaint = await createComplaint(user, body);
  const applyCategory = !body.category;

  after(async () => {
    await categorizeComplaint(complaint.id, { applyCategory }).catch(() => undefined);
  });

  return created(complaint);
});
