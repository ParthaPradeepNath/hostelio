import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const isoDate = z
  .union([z.string(), z.date()])
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "Enter a valid date"
  )
  .transform((value) => new Date(value));

export const startDateSchema = isoDate.refine((date) => {
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() + 1);
  return date.getTime() <= limit.getTime();
}, "Start date cannot be more than one year in the future");

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const output: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!output[key]) output[key] = issue.message;
  }
  return output;
}

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown
): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new z.ZodError(result.error.issues);
  }
  return result.data;
}

export function searchParamsObject(
  searchParams: URLSearchParams
): Record<string, string> {
  const output: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (value !== "") output[key] = value;
  }
  return output;
}

export const trimmedNullableString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "" ? null : value
    );
