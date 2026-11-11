"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUserRound,
  DoorOpen,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  rooms: DoorOpen,
  allocations: KeyRound,
  complaints: MessageSquareWarning,
  notices: Megaphone,
  profile: CircleUserRound,
} as const;

export type NavItem = {
  key: keyof typeof ICONS;
  href: string;
  label: string;
};

export function navItems(role: "STUDENT" | "ADMIN"): NavItem[] {
  return [
    { key: "dashboard", href: "/dashboard", label: "Dashboard" },
    { key: "rooms", href: "/rooms", label: "Rooms" },
    { key: "allocations", href: "/allocations", label: role === "ADMIN" ? "Allocations" : "My allocation" },
    { key: "complaints", href: "/complaints", label: "Complaints" },
    { key: "notices", href: "/notices", label: "Notices" },
    { key: "profile", href: "/profile", label: "Profile" },
  ];
}

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: "STUDENT" | "ADMIN";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {navItems(role).map((item) => {
        const Icon = ICONS[item.key];
        const active =
          item.href === "/dashboard"
            ? pathname.startsWith("/dashboard")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-ink-secondary hover:bg-surface-hover hover:text-ink",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
