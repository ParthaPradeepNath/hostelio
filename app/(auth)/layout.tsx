import { cookies } from "next/headers";
import Link from "next/link";

import { AuthSpotlight } from "@/components/auth/auth-spotlight";
import { Brand } from "@/components/layout/brand";
import Grass from "@/components/layout/grass";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { normalizeTheme, THEME_COOKIE } from "@/lib/theme";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <main className="page-surface relative isolate flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <AuthSpotlight />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
        <Grass />
      </div>
      <div className="fixed top-3 right-3 sm:top-6 sm:right-6">
        <ThemeToggle initialTheme={theme} />
      </div>
      <div className="relative z-10 mb-7 flex flex-col items-center gap-2">
        <Brand />
        <p className="text-ink-secondary text-[13px]">
          Hostel management, made simple.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
      <Link
        href="/"
        className="text-ink-tertiary hover:text-accent relative z-10 mt-6 text-[12px] transition-colors"
      >
        Back to home
      </Link>
    </main>
  );
}
