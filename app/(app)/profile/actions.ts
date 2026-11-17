"use server";

import { revalidatePath } from "next/cache";

import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/guards";
import { updateProfile } from "@/lib/services/users";
import { fieldErrors } from "@/lib/validators/common";
import { profileUpdateSchema } from "@/lib/validators/profile";

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function updateProfileAction(
  values: unknown
): Promise<ProfileActionResult> {
  const user = await requireUser();

  const parsed = profileUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    await updateProfile(user, parsed.data);
    revalidatePath("/profile");
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) {
      return { ok: false, message: error.message, fieldErrors: error.details };
    }
    return { ok: false, message: "Could not save your profile. Try again." };
  }
}
