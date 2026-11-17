import { withAuth } from "@/lib/api/handler";
import { noContent, ok } from "@/lib/api/responses";
import { deleteAllocation, updateAllocation } from "@/lib/services/allocations";
import { allocationUpdateSchema } from "@/lib/validators/allocation";

export const PUT = withAuth(
  { role: "ADMIN", schema: allocationUpdateSchema },
  async ({ params, body }) => {
    return ok(await updateAllocation(params.id, body));
  }
);

export const DELETE = withAuth({ role: "ADMIN" }, async ({ params }) => {
  await deleteAllocation(params.id);
  return noContent();
});
