import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type Session,
} from "@/lib/auth/jwt";

const secureCookies = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: secureCookies,
  path: "/",
};

/** Reads and verifies the session cookie for server components and server actions. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(response: NextResponse, session: Session): Promise<void> {
  const token = await signSession(session);
  response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
