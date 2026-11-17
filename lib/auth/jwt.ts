import type { Role } from "@prisma/client";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { z } from "zod";

export const SESSION_COOKIE = "hostelio_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

const sessionClaims = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["STUDENT", "ADMIN"]),
});

const DEV_SECRET = "hostelio-local-development-secret-change-me-before-deploying";

function secretKey(): Uint8Array {
  const configured = process.env.JWT_SECRET?.trim();

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    return new TextEncoder().encode(DEV_SECRET);
  }

  if (configured.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return new TextEncoder().encode(configured);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({
    email: session.email,
    name: session.name,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const claims = sessionClaims.safeParse(payload);
    if (!claims.success) return null;

    return {
      userId: claims.data.sub,
      email: claims.data.email,
      name: claims.data.name,
      role: claims.data.role,
    };
  } catch {
    return null;
  }
}
