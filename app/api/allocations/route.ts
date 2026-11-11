import { parseQuery, withAuth } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/responses";
import { createAllocation, listAllocations } from "@/lib/services/allocations";
import { allocationCreateSchema, allocationQuerySchema } from "@/lib/validators/allocation";

export const GET = withAuth({}, async ({ req, user }) => {
  const query = parseQuery(allocationQuerySchema, req.nextUrl.searchParams);
  const result = await listAllocations(user, query);
  return ok(result.data, result.meta);
});

export const POST = withAuth({ role: "ADMIN", schema: allocationCreateSchema }, async ({ body }) => {
  return created(await createAllocation(body));
});
