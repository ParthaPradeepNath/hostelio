import { UserButton } from "@clerk/nextjs";
import { RoleBadge } from "@/components/layout/role-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Theme } from "@/lib/theme";

const userButtonAppearance = {
  variables: {
    colorPrimary: "var(--accent)",
    colorBackground: "var(--surface)",
    colorText: "var(--text)",
    colorTextSecondary: "var(--text-secondary)",
    colorInputBackground: "var(--surface-2)",
    colorInputText: "var(--text)",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans)",
  },
};

export function Topbar({ role, theme }: { role: "STUDENT" | "ADMIN"; theme: Theme }) {
  return (
    <header className="chrome sticky top-0 z-30 flex h-14 items-center justify-between gap-4 pl-3 pr-5 lg:pl-4 lg:pr-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="size-9 text-ink-secondary" />
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink lg:hidden">
          Hostelio
        </span>
        <p className="hidden text-[12px] text-ink-tertiary lg:block">Hostel operations</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle initialTheme={theme} />
        <RoleBadge role={role} />
        <UserButton appearance={userButtonAppearance} />
      </div>
    </header>
  );
}
