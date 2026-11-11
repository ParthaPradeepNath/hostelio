import { z } from "zod";
import { isoDate, paginationSchema, startDateSchema } from "@/lib/validators/common";

export const allocationStatusEnum = z.enum(["ACTIVE", "VACATED"]);

const id = z.string().trim().min(1);

export const allocationCreateSchema = z.object({
  studentId: id,
  roomId: id,
  startDate: startDateSchema.optional(),
});

export const allocationUpdateSchema = z
  .object({
    status: z.literal("VACATED").optional(),
    endDate: isoDate.optional(),
    roomId: id.optional(),
    studentId: id.optional(),
  })
  .superRefine((value, ctx) => {
    const operations = [
      value.status === "VACATED",
      Boolean(value.roomId),
      Boolean(value.studentId),
    ].filter(Boolean).length;

    if (operations !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["form"],
        message: "Choose exactly one action: vacate, move room, or reassign student",
      });
    }
    if (value.status === "VACATED" && value.roomId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["form"],
        message: "Room changes and vacating cannot be combined",
      });
    }
    if (value.endDate && value.status !== "VACATED") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "An end date only applies when vacating",
      });
    }
  });

export const allocationQuerySchema = paginationSchema.extend({
  status: allocationStatusEnum.optional(),
  roomId: z.string().trim().min(1).optional(),
  studentId: z.string().trim().min(1).optional(),
});

export type AllocationCreateInput = z.infer<typeof allocationCreateSchema>;
export type AllocationUpdateInput = z.infer<typeof allocationUpdateSchema>;
export type AllocationQuery = z.infer<typeof allocationQuerySchema>;
