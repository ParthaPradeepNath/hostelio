import { z } from "zod";
import { paginationSchema } from "@/lib/validators/common";

export const noticeCreateSchema = z.object({
  title: z.string().trim().min(5, "Use at least 5 characters").max(140, "Use at most 140 characters"),
  content: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters")
    .max(5000, "Keep the notice under 5,000 characters"),
  isPinned: z.boolean().default(false),
});

export const noticeQuerySchema = paginationSchema.extend({
  pinned: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>;
export type NoticeQuery = z.infer<typeof noticeQuerySchema>;
