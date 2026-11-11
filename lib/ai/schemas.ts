import { z } from "zod";
import { COMPLAINT_CATEGORIES, PRIORITIES } from "@/lib/validators/complaint";

export const categorizationSchema = z.object({
  category: z.enum(COMPLAINT_CATEGORIES),
  priority: z.enum(PRIORITIES),
  confidence: z.number().min(0).max(1),
  reason: z.string().max(300).optional(),
});

export type CategorizationResult = z.infer<typeof categorizationSchema>;

export const summarySchema = z.object({
  summary: z.string().min(20).max(1200),
  topIssues: z
    .array(
      z.object({
        category: z.enum(COMPLAINT_CATEGORIES),
        count: z.number().int().min(0),
        note: z.string().max(300).optional(),
      }),
    )
    .max(6),
  recommendedActions: z.array(z.string().min(3).max(300)).max(5),
  safetyConcerns: z.number().int().min(0),
});

export type SummaryResult = z.infer<typeof summarySchema>;

export const categorizationJsonSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    category: { type: "string", enum: [...COMPLAINT_CATEGORIES] },
    priority: { type: "string", enum: [...PRIORITIES] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    reason: { type: "string", maxLength: 300 },
  },
  required: ["category", "priority", "confidence"],
  additionalProperties: false,
};

export const summaryJsonSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    summary: { type: "string" },
    topIssues: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: [...COMPLAINT_CATEGORIES] },
          count: { type: "integer", minimum: 0 },
          note: { type: "string", maxLength: 300 },
        },
        required: ["category", "count"],
        additionalProperties: false,
      },
    },
    recommendedActions: {
      type: "array",
      maxItems: 5,
      items: { type: "string", maxLength: 300 },
    },
    safetyConcerns: { type: "integer", minimum: 0 },
  },
  required: ["summary", "topIssues", "recommendedActions", "safetyConcerns"],
  additionalProperties: false,
};
