import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/", "/login", "/sign-up"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // API handlers return JSON errors so clients can handle them in place.
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.svg|.*\\..*).*)",
  ],
};
