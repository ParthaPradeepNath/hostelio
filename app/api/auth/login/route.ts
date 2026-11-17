import type { NextRequest } from "next/server";

import bcrypt from "bcryptjs";

import { AppError } from "@/lib/api/errors";
import { publicErrorResponse, readJsonBody } from "@/lib/api/public-handler";
import { ok } from "@/lib/api/responses";
import { toSessionUser } from "@/lib/auth/dto";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { fieldErrors } from "@/lib/validators/common";

export async function POST(req: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Invalid input",
        fieldErrors(parsed.error)
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Compare against a dummy hash when the account does not exist so the
    // response time does not reveal whether an email is registered.
    const passwordHash = user?.passwordHash ?? "$2a$12$AAAAAAAAAAAAAAAAAAAAAA";
    const matches = await bcrypt.compare(password, passwordHash);
    if (!user || !matches) {
      throw new AppError("UNAUTHENTICATED", "Email or password is incorrect");
    }

    const isNew = Date.now() - user.createdAt.getTime() < 1000;
    const response = ok({ ...toSessionUser(user), isNew });
    await setSessionCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return response;
  } catch (error) {
    return publicErrorResponse(error);
  }
}
