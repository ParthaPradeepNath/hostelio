"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiClientError, apiRequest, errorMessage } from "@/lib/client/api";
import { useAppForm } from "@/lib/client/use-app-form";
import { signupSchema } from "@/lib/validators/auth";
import { cn } from "@/lib/utils";

type SignupValues = z.infer<typeof signupSchema>;

const ROLES = [
  { value: "STUDENT", label: "Student", hint: "Rooms, complaints, notices" },
  { value: "ADMIN", label: "Warden", hint: "Manage the whole hostel" },
] as const;

export function SignupForm({ requiresAdminCode }: { requiresAdminCode: boolean }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm(signupSchema, {
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    adminCode: "",
  });

  const role = watch("role");

  async function onSubmit(values: SignupValues) {
    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Account created");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && error.code === "VALIDATION_ERROR" && error.details) {
        for (const [field, message] of Object.entries(error.details)) {
          if (field === "name" || field === "email" || field === "password" || field === "adminCode") {
            setError(field as keyof SignupValues, { message });
          }
        }
        return;
      }
      if (error instanceof ApiClientError && error.status === 409) {
        setError("email", { message: error.message });
        return;
      }
      toast.error(errorMessage(error));
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Full name" htmlFor="signup-name" error={errors.name?.message}>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
            {...register("name")}
          />
        </Field>

        <Field label="Email" htmlFor="signup-email" error={errors.email?.message}>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="signup-password"
          error={errors.password?.message}
          hint="At least 8 characters"
        >
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            placeholder="Create a password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "signup-password-error" : "signup-password-hint"}
            {...register("password")}
          />
        </Field>

        <fieldset className="flex flex-col gap-1.5 border-0 p-0">
          <legend className="type-label text-ink">Account type</legend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
                {ROLES.map((option) => {
                  const selected = field.value === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-colors focus-within:ring-3 focus-within:ring-accent/40",
                        selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-surface-hover",
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={selected}
                        onChange={() => field.onChange(option.value)}
                        onBlur={field.onBlur}
                        className="sr-only"
                      />
                      <span className="text-[13px] font-medium text-ink">{option.label}</span>
                      <span className="text-[11px] leading-snug text-ink-secondary">{option.hint}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
          {errors.role?.message ? (
            <p role="alert" className="text-[12px] text-danger">
              {errors.role.message}
            </p>
          ) : null}
        </fieldset>

        {role === "ADMIN" && requiresAdminCode ? (
          <Field
            label="Administrator code"
            htmlFor="signup-admin-code"
            error={errors.adminCode?.message}
            hint="Required to register as a warden"
          >
            <Input
              id="signup-admin-code"
              autoComplete="off"
              placeholder="Enter your code"
              aria-invalid={Boolean(errors.adminCode)}
              aria-describedby={
                errors.adminCode ? "signup-admin-code-error" : "signup-admin-code-hint"
              }
              {...register("adminCode")}
            />
          </Field>
        ) : null}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? (
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <UserPlus aria-hidden />
          )}
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
