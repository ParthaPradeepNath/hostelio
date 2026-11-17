"use client";

import { usePathname } from "next/navigation";

import { Spotlight } from "@/components/ui/spotlight-new";

const PAGES_WITH_SPOTLIGHT = ["/login", "/sign-up"];

/** Decorative spotlight behind the top of the auth pages. */
export function AuthSpotlight() {
  if (!PAGES_WITH_SPOTLIGHT.includes(usePathname())) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Spotlight />
    </div>
  );
}
