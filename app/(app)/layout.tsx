import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-surface px-4 py-2 text-[13px] font-medium text-ink shadow-popover focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <AppSidebar role={user.role} />
      <div className="lg:pl-60">
        <Topbar role={user.role} />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-page px-5 py-8 md:px-8 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
