import { z } from "zod";

import {
  paginationSchema,
  trimmedNullableString,
} from "@/lib/validators/common";

export const COMPLAINT_CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "CLEANING",
  "INTERNET",
  "FURNITURE",
  "FOOD",
  "SECURITY",
  "OTHER",
] as const;

export const COMPLAINT_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
] as const;
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const complaintCategoryEnum = z.enum(COMPLAINT_CATEGORIES);
export const complaintStatusEnum = z.enum(COMPLAINT_STATUSES);
export const priorityEnum = z.enum(PRIORITIES);

const title = z
  .string()
  .trim()
  .min(5, "Use at least 5 characters")
  .max(120, "Use at most 120 characters");
const description = z
  .string()
  .trim()
  .min(20, "Describe the issue in at least 20 characters")
  .max(2000, "Keep the description under 2,000 characters");

export const complaintCreateSchema = z.object({
  title,
  description,
  roomId: z.string().trim().min(1).optional(),
  category: complaintCategoryEnum.optional(),
});

export const complaintStudentUpdateSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    category: complaintCategoryEnum.optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Change at least one field",
    path: ["form"],
  });

export const complaintAdminUpdateSchema = z
  .object({
    status: complaintStatusEnum.optional(),
    priority: priorityEnum.optional(),
    category: complaintCategoryEnum.optional(),
    adminResponse: trimmedNullableString(2000),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Change at least one field",
    path: ["form"],
  });

export const complaintQuerySchema = paginationSchema.extend({
  status: complaintStatusEnum.optional(),
  category: complaintCategoryEnum.optional(),
  priority: priorityEnum.optional(),
  q: z.string().trim().max(80).optional(),
});

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: ["IN_PROGRESS"],
  REJECTED: [],
};

export type ComplaintCreateInput = z.infer<typeof complaintCreateSchema>;
export type ComplaintStudentUpdateInput = z.infer<
  typeof complaintStudentUpdateSchema
>;
export type ComplaintAdminUpdateInput = z.infer<
  typeof complaintAdminUpdateSchema
>;
export type ComplaintQuery = z.infer<typeof complaintQuerySchema>;
