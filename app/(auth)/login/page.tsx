import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getSession()) redirect("/dashboard");

  const { next } = await searchParams;

  return (
    <Card className="border-0 bg-transparent p-0 shadow-none md:p-0">
      <CardHeader className="text-center">
        <CardTitle className="text-[22px] tracking-[-0.02em]">
          Welcome back
        </CardTitle>
        <CardDescription>Sign in to manage your hostel stay.</CardDescription>
      </CardHeader>
      <CardContent className="mt-6">
        <LoginForm next={next} />
      </CardContent>
    </Card>
  );
}
