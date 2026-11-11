import type { User } from "@prisma/client";
import { AppError } from "@/lib/api/errors";
import { ensureUser } from "@/lib/auth/current-user";

export async function requireUser(): Promise<User> {
  const user = await ensureUser();
  if (!user) {
    throw new AppError("UNAUTHENTICATED", "Sign in to continue");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new AppError("FORBIDDEN", "Administrator access is required");
  }
  return user;
}

export async function requireStudent(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "STUDENT") {
    throw new AppError("FORBIDDEN", "Student access is required");
  }
  return user;
}
