"use client";

import type { ReactNode } from "react";

/**
 * Animates content when a tab-like control swaps it (e.g. Active / Vacated).
 * Not for search or filter updates — those keep `value` the same and stay still.
 */
export function TabTransition({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <div key={value} className="tab-in">
      {children}
    </div>
  );
}
