import { z } from "zod";

const optionalPhone = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\+?[0-9 -]{7,15}$/, "Use 7–15 digits, spaces, or dashes"),
  ])
  .nullable()
  .optional()
  .transform((value) =>
    value === undefined ? undefined : value === "" ? null : value
  );

const optionalStudentId = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]{2,20}$/, "Use 2–20 letters, numbers, or dashes"),
  ])
  .nullable()
  .optional()
  .transform((value) =>
    value === undefined ? undefined : value === "" ? null : value
  );

const optionalDepartment = z
  .string()
  .trim()
  .max(80, "Use at most 80 characters")
  .nullable()
  .optional()
  .transform((value) =>
    value === undefined ? undefined : value === "" ? null : value
  );

const optionalYear = z.coerce
  .number()
  .int()
  .min(1, "Choose a year between 1 and 5")
  .max(5, "Choose a year between 1 and 5")
  .nullable()
  .optional();

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(80, "Use at most 80 characters")
    .optional(),
  phone: optionalPhone,
  studentId: optionalStudentId,
  department: optionalDepartment,
  year: optionalYear,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
