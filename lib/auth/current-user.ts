import type { User } from "@prisma/client";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the signed session cookie to the current database user.
 * The database role is the source of truth; the JWT only identifies the user.
 */
export async function ensureUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function getCurrentUser(): Promise<User | null> {
  return ensureUser();
}
