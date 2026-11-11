import { ok } from "@/lib/api/responses";
import { withAuth } from "@/lib/api/handler";

export const POST = withAuth({ parseBody: false }, async ({ user }) => {
  const isNew = Math.abs(user.updatedAt.getTime() - user.createdAt.getTime()) < 1000;
  return ok({
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    studentId: user.studentId,
    department: user.department,
    year: user.year,
    isNew,
  });
});
