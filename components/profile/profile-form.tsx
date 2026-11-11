"use client";

import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppForm } from "@/lib/client/use-app-form";
import { profileUpdateSchema } from "@/lib/validators/profile";

type ProfileUser = {
  role: "STUDENT" | "ADMIN";
  name: string;
  phone: string | null;
  studentId: string | null;
  department: string | null;
  year: number | null;
};

const YEARS = [1, 2, 3, 4, 5];

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const isStudent = user.role === "STUDENT";

  const form = useAppForm(profileUpdateSchema, {
    name: user.name,
    phone: user.phone,
    studentId: user.studentId,
    department: user.department,
    year: user.year,
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: {
    name?: string;
    phone?: string | null;
    studentId?: string | null;
    department?: string | null;
    year?: number | null;
  }) {
    const result = await updateProfileAction(values);

    if (result.ok) {
      toast.success("Profile updated");
      router.refresh();
      return;
    }

    toast.error(result.message);
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        if (field === "name" || field === "phone" || field === "studentId" || field === "department" || field === "year") {
          setError(field, { message });
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {isStudent ? (
        <fieldset className="flex min-w-0 flex-col gap-3 border-0 p-0">
          <legend className="type-label mb-1 text-ink">Identity</legend>
          <Field
            label="Full name"
            htmlFor="profile-name"
            error={errors.name?.message}
            hint="This also updates your Clerk account name."
          >
            <Input
              id="profile-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "profile-name-error" : "profile-name-hint"}
              {...register("name")}
            />
          </Field>
        </fieldset>
      ) : null}

      <fieldset className="flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend className="type-label mb-1 text-ink">Contact</legend>
        <Field label="Phone" htmlFor="profile-phone" error={errors.phone?.message} hint="Optional">
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "profile-phone-error" : "profile-phone-hint"}
            {...register("phone")}
          />
        </Field>
      </fieldset>

      {isStudent ? (
        <fieldset className="flex min-w-0 flex-col gap-3 border-0 p-0">
          <legend className="type-label mb-1 text-ink">Academic</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Student ID"
              htmlFor="profile-student-id"
              error={errors.studentId?.message}
              hint="As printed on your college ID"
            >
              <Input
                id="profile-student-id"
                autoComplete="off"
                placeholder="2026CS1042"
                aria-invalid={Boolean(errors.studentId)}
                aria-describedby={
                  errors.studentId ? "profile-student-id-error" : "profile-student-id-hint"
                }
                {...register("studentId")}
              />
            </Field>

            <Field label="Year" htmlFor="profile-year" error={errors.year?.message}>
              <Controller
                control={control}
                name="year"
                render={({ field }) => (
                  <Select
                    value={field.value === null || field.value === undefined ? "none" : String(field.value)}
                    onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                  >
                    <SelectTrigger id="profile-year" aria-describedby={errors.year ? "profile-year-error" : undefined}>
                      <SelectValue placeholder="Not set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field label="Department" htmlFor="profile-department" error={errors.department?.message}>
            <Input
              id="profile-department"
              autoComplete="off"
              placeholder="Computer Science"
              aria-invalid={Boolean(errors.department)}
              aria-describedby={errors.department ? "profile-department-error" : undefined}
              {...register("department")}
            />
          </Field>
        </fieldset>
      ) : null}

      <div className="mt-1 flex justify-end border-t border-line pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          Save profile
        </Button>
      </div>
    </form>
  );
}
