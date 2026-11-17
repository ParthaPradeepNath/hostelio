import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { Topbar } from "@/components/layout/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeTheme, THEME_COOKIE } from "@/lib/theme";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="bg-surface text-ink shadow-popover sr-only rounded-md px-4 py-2 text-[13px] font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <SidebarProvider defaultOpen={defaultOpen} className="min-h-dvh">
        <AppSidebar role={user.role} />
        <SidebarInset>
          <Topbar
            user={{ name: user.name, email: user.email, role: user.role }}
            theme={theme}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="max-w-page mx-auto w-full px-5 py-8 md:px-8 lg:px-10 lg:py-10"
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
