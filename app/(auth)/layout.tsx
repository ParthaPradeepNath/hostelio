import Link from "next/link";
import { cookies } from "next/headers";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { normalizeTheme, THEME_COOKIE } from "@/lib/theme";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="fixed right-3 top-3 sm:right-6 sm:top-6">
        <ThemeToggle initialTheme={theme} />
      </div>
      <div className="mb-7 flex flex-col items-center gap-2">
        <Brand />
        <p className="text-[13px] text-ink-secondary">Hostel management, made simple.</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <Link
        href="/"
        className="mt-6 text-[12px] text-ink-tertiary transition-colors hover:text-accent"
      >
        Back to home
      </Link>
    </main>
  );
}
