import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Brand } from "@/components/layout/brand";

export const metadata: Metadata = { title: "Sign in" };

const appearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full border border-line bg-surface shadow-card rounded-lg",
    headerTitle: "type-section text-ink",
    headerSubtitle: "text-ink-secondary text-[13px]",
    socialButtonsBlockButton: "border border-line bg-surface-2 text-ink",
    formButtonPrimary: "bg-accent text-inverse",
    footerActionLink: "text-accent",
    formFieldInput: "bg-surface border-line-strong text-ink",
  },
};

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Brand />
        <p className="text-[13px] text-ink-secondary">Sign in to manage your hostel stay</p>
      </div>
      <div className="w-full max-w-md">
        <SignIn appearance={appearance} />
      </div>
    </main>
  );
}
