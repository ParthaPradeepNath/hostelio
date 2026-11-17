"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

type PillBox = { x: number; y: number; w: number; h: number };

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar navigation with a selection indicator that slides between items
 * instead of cross-fading two backgrounds. The pill is measured from the
 * active button, so it tracks the real item box in both expanded and
 * icon-collapsed layouts.
 */
export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement | null>(null);
  const [pill, setPill] = useState<PillBox | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const list = listRef.current;
    const button = list?.querySelector<HTMLElement>(
      '[data-slot="sidebar-menu-button"][data-active="true"]'
    );
    if (!list || !button) {
      setPill(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const next = {
      x: buttonRect.left - listRect.left,
      y: buttonRect.top - listRect.top,
      w: buttonRect.width,
      h: buttonRect.height,
    };
    setPill((prev) =>
      prev &&
      prev.x === next.x &&
      prev.y === next.y &&
      prev.w === next.w &&
      prev.h === next.h
        ? prev
        : next
    );
  }, []);

  // Measure after paint so the pill never animates in from the top of the list.
  useEffect(() => {
    measure();
    const button = listRef.current?.querySelector<HTMLElement>(
      '[data-slot="sidebar-menu-button"][data-active="true"]'
    );
    const observer = button ? new ResizeObserver(measure) : null;
    if (button) observer?.observe(button);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, pathname]);

  // Position changes between items should animate; the first placement should not.
  useEffect(() => {
    if (!pill || ready) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pill, ready]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu ref={listRef} className="relative gap-0.5">
          <span
            aria-hidden="true"
            className={cn(
              "bg-accent-soft pointer-events-none absolute top-0 left-0 z-0 rounded-md",
              ready &&
                "transition-[transform,width,height,opacity] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none"
            )}
            style={{
              width: pill?.w ?? 0,
              height: pill?.h ?? 0,
              transform: `translate(${pill?.x ?? 0}px, ${pill?.y ?? 0}px)`,
              opacity: pill ? 1 : 0,
            }}
          />
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <SidebarMenuItem key={item.key} className="relative z-10">
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className="data-[active=true]:text-accent! h-9 text-[13px] font-medium data-[active=true]:bg-transparent! data-[active=true]:hover:bg-transparent!"
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon strokeWidth={1.8} aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
