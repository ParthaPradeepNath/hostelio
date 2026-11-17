import { AccountMenu } from "@/components/auth/account-menu";
import { RoleBadge } from "@/components/layout/role-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Theme } from "@/lib/theme";

type TopbarProps = {
  user: { name: string; email: string; role: "STUDENT" | "ADMIN" };
  theme: Theme;
};

export function Topbar({ user, theme }: TopbarProps) {
  return (
    <header className="chrome sticky top-0 z-30 flex h-14 items-center justify-between gap-4 pr-5 pl-3 lg:pr-10 lg:pl-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-ink-secondary size-9" />
        <span className="text-ink text-[13px] font-semibold tracking-[-0.01em] lg:hidden">
          Hostelio
        </span>
        <p className="text-ink-tertiary hidden text-[12px] lg:block">
          Hostel operations
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle initialTheme={theme} />
        <RoleBadge role={user.role} />
        <AccountMenu {...user} />
      </div>
    </header>
  );
}
