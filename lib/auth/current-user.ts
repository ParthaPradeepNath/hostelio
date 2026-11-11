import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function readRole(metadata: unknown): Role {
  if (
    metadata &&
    typeof metadata === "object" &&
    "role" in metadata &&
    (metadata as { role?: unknown }).role === "admin"
  ) {
    return "ADMIN";
  }
  return "STUDENT";
}

/**
 * Verifies the Clerk session and keeps the Postgres user row in sync with Clerk.
 * The DB role always mirrors `publicMetadata.role`, with STUDENT as the default.
 */
export async function ensureUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${userId}@hostelio.local`;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email.split("@")[0];

  const role = readRole(clerkUser.publicMetadata);

  return prisma.user.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId, email, name, role },
    update: { email, name, role },
  });
}

export async function getCurrentUser(): Promise<User | null> {
  return ensureUser();
}
