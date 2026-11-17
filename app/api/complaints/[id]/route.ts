import { withAuth } from "@/lib/api/handler";
import { ok } from "@/lib/api/responses";
import { updateComplaint } from "@/lib/services/complaints";
import {
  complaintAdminUpdateSchema,
  complaintStudentUpdateSchema,
} from "@/lib/validators/complaint";

export const PUT = withAuth({}, async ({ params, body, user }) => {
  const input =
    user.role === "STUDENT"
      ? complaintStudentUpdateSchema.parse(body)
      : complaintAdminUpdateSchema.parse(body);

  return ok(await updateComplaint(user, params.id, input));
});
