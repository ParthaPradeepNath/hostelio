import type { User } from "@prisma/client";

/** Fields safe to return to the browser after login or sign-up. */
export function toSessionUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    studentId: user.studentId,
    department: user.department,
    year: user.year,
  };
}
