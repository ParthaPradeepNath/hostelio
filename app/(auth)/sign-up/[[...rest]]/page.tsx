import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { normalizeTheme, THEME_COOKIE } from "@/lib/theme";

export const metadata: Metadata = { title: "Create account" };

const appearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorPrimaryForeground: "#ffffff",
  },
  elements: {
    rootBox: "w-full",
    card: "w-full border border-line bg-surface shadow-card rounded-lg",
    headerTitle: "type-section text-ink",
    headerSubtitle: "text-ink-secondary text-[13px]",
    formButtonPrimary: "aceternity-blue-btn",
    footerActionLink: "text-accent",
    formFieldInput: "bg-surface border-line-strong text-ink",
  },
};

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="fixed right-3 top-3 sm:right-6 sm:top-6">
        <ThemeToggle initialTheme={theme} />
      </div>
      <div className="mb-8 flex flex-col items-center gap-2">
        <Brand />
        <p className="text-[13px] text-ink-secondary">Create your hostel account</p>
      </div>
      <div className="w-full max-w-md">
        <SignUp appearance={appearance} />
      </div>
    </main>
  );
}
