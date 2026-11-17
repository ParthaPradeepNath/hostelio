-- Replace Clerk identities with locally hashed passwords.
-- Existing rows get a blank hash; re-run the seed to set demo credentials.
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_clerkUserId_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerkUserId";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP DEFAULT;
