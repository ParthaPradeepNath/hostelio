import type { NextRequest } from "next/server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { AppError } from "@/lib/api/errors";
import { publicErrorResponse, readJsonBody } from "@/lib/api/public-handler";
import { ok } from "@/lib/api/responses";
import { toSessionUser } from "@/lib/auth/dto";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators/auth";
import { fieldErrors } from "@/lib/validators/common";

export async function POST(req: NextRequest) {
  try {
    const parsed = signupSchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Invalid input",
        fieldErrors(parsed.error)
      );
    }

    const { name, email, password, role, adminCode } = parsed.data;
    const requiredCode = process.env.ADMIN_SIGNUP_CODE?.trim();

    // When configured, an admin code is required to self-assign the ADMIN role.
    if (role === "ADMIN" && requiredCode && adminCode !== requiredCode) {
      throw new AppError("VALIDATION_ERROR", "Invalid administrator code", {
        adminCode: "That code is not correct",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await prisma.user.create({
        data: { name, email, role, passwordHash },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "CONFLICT",
          "An account with this email already exists",
          {
            email: "This email is already registered",
          }
        );
      }
      throw error;
    }

    const response = ok({ ...toSessionUser(user), isNew: true });
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
