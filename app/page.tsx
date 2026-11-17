import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRight } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { normalizeTheme, THEME_COOKIE } from "@/lib/theme";

export default async function HomePage() {
  if (await getSession()) redirect("/dashboard");

  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <main className="page-surface relative flex min-h-dvh flex-col">
      <div className="fixed top-3 right-3 sm:top-6 sm:right-6">
        <ThemeToggle initialTheme={theme} />
      </div>

      <header className="px-5 py-6 md:px-10">
        <Brand />
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-12">
        <div className="max-w-2xl text-center">
          <h1 className="text-ink text-[clamp(2.25rem,7vw,4rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
            Hostel life, organized.
          </h1>
          <p className="text-ink-secondary mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-pretty md:text-[17px]">
            Rooms, complaints, and notices in one calm place — built for
            students and the wardens who look after them.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Sign in
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/sign-up">Create account</Link>
            </Button>
          </div>
          <p className="text-ink-tertiary mt-5 text-[12px]">
            Students and wardens each get a dashboard tailored to their role.
          </p>
        </div>
      </div>

      <footer className="text-ink-tertiary px-5 py-6 text-center text-[12px]">
        Hostelio · A quieter way to run a hostel.
      </footer>
    </main>
  );
}
