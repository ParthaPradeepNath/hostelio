"use client";

import Link from "next/link";
import {
  CircleUserRound,
  DoorOpen,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
} from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "@/components/layout/sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const ICONS = {
  dashboard: LayoutDashboard,
  rooms: DoorOpen,
  allocations: KeyRound,
  complaints: MessageSquareWarning,
  notices: Megaphone,
  profile: CircleUserRound,
} as const;

type NavItem = {
  key: keyof typeof ICONS;
  href: string;
  label: string;
};

function navItems(role: "STUDENT" | "ADMIN"): SidebarNavItem[] {
  const items: NavItem[] = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard" },
    { key: "rooms", href: "/rooms", label: "Rooms" },
    { key: "allocations", href: "/allocations", label: role === "ADMIN" ? "Allocations" : "My allocation" },
    { key: "complaints", href: "/complaints", label: "Complaints" },
    { key: "notices", href: "/notices", label: "Notices" },
    { key: "profile", href: "/profile", label: "Profile" },
  ];

  return items.map((item) => ({ ...item, icon: ICONS[item.key] }));
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-3.5">
        <path
          fill="currentColor"
          d="M10.51 2.23c.97-.31 2.01-.31 2.98 0 .61.19 1.14.52 1.68.96.53.43 1.13 1 1.88 1.7l2.72 2.57c.65.62 1.11 1.05 1.44 1.57.29.45.51.96.64 1.48.15.6.15 1.23.15 2.13v2c0 1.08 0 1.96-.06 2.67-.06.73-.18 1.37-.48 1.96-.48.94-1.25 1.7-2.19 2.18-.56.29-1.15.41-1.83.48q-.63.06-1.44.06V16c0-2.21-1.79-4-4-4s-4 1.79-4 4v5.99q-.81 0-1.44-.06c-.68-.07-1.27-.19-1.83-.48-.94-.48-1.71-1.24-2.18-2.18-.31-.59-.43-1.23-.49-1.96C2 16.6 2 15.72 2 14.64v-2c0-.9 0-1.53.15-2.13.13-.52.35-1.03.64-1.48.33-.52.79-.95 1.44-1.57l2.72-2.57c.75-.7 1.35-1.27 1.88-1.7.54-.44 1.07-.77 1.68-.96"
          opacity=".45"
        />
        <path fill="currentColor" d="M14 22h-4v-6c0-1.1.9-2 2-2s2 .9 2 2z" />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
          d="M20.88 10.76c-.1-.43-.28-.83-.51-1.2-.27-.41-.63-.76-1.37-1.46l-2.6-2.45c-1.55-1.46-2.32-2.19-3.21-2.47-.77-.24-1.6-.24-2.38 0-.88.28-1.66 1.01-3.2 2.47L5.01 8.1c-.74.7-1.11 1.05-1.38 1.46q-.345.555-.51 1.2"
        />
      </svg>
    </span>
  );
}

function BrandButton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip="Hostelio" asChild>
          <Link href="/dashboard">
            <BrandMark className="size-8 rounded-lg [&>svg]:size-4" />
            <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:sr-only">
              <span className="truncate text-sm font-semibold tracking-[-0.01em]">Hostelio</span>
              <span className="truncate text-xs text-sidebar-foreground/70">Hostel operations</span>
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ role }: { role: "STUDENT" | "ADMIN" }) {
  return (
    <Sidebar collapsible="icon" className="border-r border-line">
      <SidebarHeader className="px-2 py-3">
        <BrandButton />
      </SidebarHeader>

      <SidebarContent role="navigation" aria-label="Main">
        <SidebarNav items={navItems(role)} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
