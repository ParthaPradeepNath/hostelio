import type { NextRequest } from "next/server";

import { AppError } from "@/lib/api/errors";
import { fail } from "@/lib/api/responses";

/** JSON body reader for unauthenticated routes (login/sign-up). */
export async function readJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError("BAD_REQUEST", "Request body must be valid JSON");
  }
}

export function publicErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.status, error.details);
  }
  return fail("INTERNAL", "Something went wrong on our side. Try again.", 500);
}
