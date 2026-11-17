"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

/**
 * Route enter transition. The key forces a remount when the pathname changes,
 * which re-runs the `page-in` enter transition (defined in globals.css) on the
 * page's root element. Search-param changes (filters, pagination) keep the same
 * pathname, so they update without replaying the animation — and because the
 * transition is attached to the page root, it also plays when a route resolves
 * after its loading skeleton.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-in">
      {children}
    </div>
  );
}
