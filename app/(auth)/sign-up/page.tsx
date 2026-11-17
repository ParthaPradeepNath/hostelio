import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>One account for everything hostel.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm
          requiresAdminCode={Boolean(process.env.ADMIN_SIGNUP_CODE?.trim())}
        />
      </CardContent>
    </Card>
  );
}
