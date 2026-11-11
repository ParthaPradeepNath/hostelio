import { UserButton } from "@clerk/nextjs";
import { Brand } from "@/components/layout/brand";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RoleBadge } from "@/components/layout/role-badge";

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

export function Topbar({ role }: { role: "STUDENT" | "ADMIN" }) {
  return (
    <header className="chrome sticky top-0 z-30 flex h-14 items-center justify-between gap-4 px-5 lg:px-10">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav role={role} />
        <Brand />
      </div>
      <p className="hidden text-[12px] text-ink-tertiary lg:block">Hostel operations</p>
      <div className="flex items-center gap-3">
        <RoleBadge role={role} />
        <UserButton appearance={userButtonAppearance} />
      </div>
    </header>
  );
}
