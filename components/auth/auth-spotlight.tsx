"use client";

import { usePathname } from "next/navigation";
import { Spotlight } from "@/components/ui/spotlight-new";

/** Decorative spotlight behind the top of the login page. */
export function AuthSpotlight() {
  if (usePathname() !== "/login") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Spotlight />
    </div>
  );
}
