import { NextResponse, type NextRequest } from "next/server";
import { Prisma, type Role, type User } from "@prisma/client";
import { z } from "zod";
import { AppError } from "@/lib/api/errors";
import { fail } from "@/lib/api/responses";
import { logRequest, logServerError } from "@/lib/api/logger";
import { requireUser } from "@/lib/auth/guards";
import { fieldErrors } from "@/lib/validators/common";

type AuthRole = Role | Role[];

type HandlerArgs<TBody> = {
  req: NextRequest;
  user: User;
  params: Record<string, string>;
  body: TBody;
};

type AuthOptions<S extends z.ZodTypeAny> = {
  role?: AuthRole;
  schema?: S;
  parseBody?: boolean;
};

type RouteContext<TParams extends Record<string, string>> = {
  params?: Promise<TParams>;
};

export function withAuth<S extends z.ZodTypeAny = z.ZodType<unknown>, TParams extends Record<string, string> = Record<string, string>>(
  options: AuthOptions<S>,
  handler: (args: HandlerArgs<z.infer<S>>) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context?: RouteContext<TParams>): Promise<NextResponse> => {
    const startedAt = Date.now();
    const requestId = crypto.randomUUID();
    const route = new URL(req.url).pathname;
    let user: User | null = null;
    let status = 500;
    let errorCode: string | undefined;

    try {
      user = await requireUser();

      if (options.role) {
        const roles = Array.isArray(options.role) ? options.role : [options.role];
        if (!roles.includes(user.role)) {
          throw new AppError("FORBIDDEN", "You do not have access to this action");
        }
      }

      const params = context?.params ? await context.params : {};

      let body = undefined as z.infer<S>;
      const shouldParse = options.parseBody ?? !["GET", "DELETE"].includes(req.method);

      if (shouldParse) {
        let json: unknown;
        try {
          json = await req.json();
        } catch {
          throw new AppError("BAD_REQUEST", "Request body must be valid JSON");
        }

        if (options.schema) {
          const parsed = options.schema.safeParse(json);
          if (!parsed.success) {
            throw new AppError("VALIDATION_ERROR", "Invalid input", fieldErrors(parsed.error));
          }
          body = parsed.data as z.infer<S>;
        } else {
          body = json as z.infer<S>;
        }
      }

      const response = await handler({ req, user, params, body });
      status = response.status;
      logRequest({
        requestId,
        userId: user.id,
        role: user.role,
        route,
        method: req.method,
        latencyMs: Date.now() - startedAt,
        status,
      });
      return response;
    } catch (error) {
      const response = errorResponse(error);
      status = response.status;
      errorCode = response.headers.get("x-error-code") ?? undefined;
      logRequest({
        requestId,
        userId: user?.id ?? null,
        role: user?.role ?? null,
        route,
        method: req.method,
        latencyMs: Date.now() - startedAt,
        status,
        errorCode,
      });
      if (status >= 500) logServerError({ requestId, route, error });
      return response;
    }
  };
}

function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    const response = fail(error.code, error.message, error.status, error.details);
    response.headers.set("x-error-code", error.code);
    return response;
  }

  if (error instanceof z.ZodError) {
    const response = fail("VALIDATION_ERROR", "Invalid input", 422, fieldErrors(error));
    response.headers.set("x-error-code", "VALIDATION_ERROR");
    return response;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? (error.meta?.target as string[]).join(", ") : "value";
      const response = fail("CONFLICT", `A record with this ${target} already exists`, 409);
      response.headers.set("x-error-code", "CONFLICT");
      return response;
    }
    if (error.code === "P2025") {
      const response = fail("NOT_FOUND", "Resource not found", 404);
      response.headers.set("x-error-code", "NOT_FOUND");
      return response;
    }
  }

  return fail("INTERNAL", "Something went wrong on our side. Try again.", 500);
}

export function parseQuery<S extends z.ZodTypeAny>(schema: S, searchParams: URLSearchParams): z.infer<S> {
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (value !== "") raw[key] = value;
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", "Invalid query parameters", fieldErrors(parsed.error));
  }
  return parsed.data as z.infer<S>;
}
