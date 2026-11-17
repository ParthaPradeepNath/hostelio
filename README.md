# Hostelio

Hostel management for students and wardens, built with Next.js, Prisma, and Postgres.

## Getting started

```bash
bun install
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, and JWT_SECRET in .env.local
bun run db:migrate
bun run db:seed
bun run dev
```

The seed creates rooms, notices, and two demo accounts:

| Role | Email | Password |
|---|---|---|
| Warden (admin) | `admin@hostelio.local` | `Admin123!` |
| Student | `student@hostelio.local` | `Student123!` |

Override these with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` and
`SEED_STUDENT_EMAIL` / `SEED_STUDENT_PASSWORD`.

## Authentication

Authentication is handled in-app with JSON Web Tokens; there is no external auth provider.

- Users sign in at `/login` or create an account at `/sign-up`.
- Passwords are hashed with bcrypt (cost 12) and stored in `users.passwordHash`.
- A signed HS256 JWT is returned in an **httpOnly, SameSite=Lax cookie** (`hostelio_session`) that
  expires after 7 days. The browser never reads the token.
- `middleware.ts` verifies the token for page routes; API routes return JSON `401`s instead.
- Server components and route handlers resolve the current user from the cookie in
  `lib/auth/current-user.ts`. The database role is the source of truth for authorization.
- Sign-up lets people choose **Student** or **Warden**. Set `ADMIN_SIGNUP_CODE` to require a code
  before anyone can register as a warden. If it is empty, admin sign-up is open — only leave it
  empty in a trusted local environment.
- Sign out from the account menu in the top bar.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Pooled Postgres connection string |
| `DIRECT_URL` | yes | Direct Postgres connection for migrations |
| `JWT_SECRET` | production yes | Random string of at least 32 characters; a local-only fallback is used when unset |
| `ADMIN_SIGNUP_CODE` | no | If set, required to register an admin account |
| `AI_PROVIDER`, `GEMINI_API_KEY`, `GROQ_API_KEY`, … | for AI features | See `.env.example` |
| `SEED_*` | no | Overrides for the demo accounts created by the seed |

## Scripts

| Script | Purpose |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Generate Prisma client and build for production |
| `bun run typecheck` | Run TypeScript checks |
| `bun run lint` | Run ESLint |
| `bun run db:migrate` | Apply migrations |
| `bun run db:seed` | Seed rooms, notices, and demo accounts |
| `bun run db:studio` | Open Prisma Studio |

## Auth migration note

The original product spec used Clerk. Clerk has been removed: `clerkUserId` was replaced by
`passwordHash`, Clerk-hosted login screens were replaced with `/login` and `/sign-up`, and sessions
are now JWT cookies. See the note at the top of `PRD.md`.
