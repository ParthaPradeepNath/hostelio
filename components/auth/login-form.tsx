"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiClientError, apiRequest, errorMessage } from "@/lib/client/api";
import { useAppForm } from "@/lib/client/use-app-form";
import { loginSchema } from "@/lib/validators/auth";

type LoginValues = z.infer<typeof loginSchema>;

function destination(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm(loginSchema, { email: "", password: "" });

  async function onSubmit(values: LoginValues) {
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Signed in");
      router.replace(destination(next));
      router.refresh();
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "VALIDATION_ERROR" &&
        error.details
      ) {
        for (const [field, message] of Object.entries(error.details)) {
          if (field === "email" || field === "password")
            setError(field, { message });
        }
        return;
      }
      toast.error(errorMessage(error));
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Field
          label="Email"
          htmlFor="login-email"
          error={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="login-password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            {...register("password")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-1 w-full"
        >
          {isSubmitting ? (
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : (
            <LogIn aria-hidden />
          )}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-ink-secondary mt-5 text-center text-[13px]">
        New to Hostelio?{" "}
        <Link
          href="/sign-up"
          className="text-accent font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
