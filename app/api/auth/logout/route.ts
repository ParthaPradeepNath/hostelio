import { ok } from "@/lib/api/responses";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const response = ok({ signedOut: true });
  clearSessionCookie(response);
  return response;
}
