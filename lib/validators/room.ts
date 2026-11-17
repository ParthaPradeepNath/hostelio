import { z } from "zod";

import {
  paginationSchema,
  trimmedNullableString,
} from "@/lib/validators/common";

export const ROOM_TYPES = ["SINGLE", "DOUBLE", "TRIPLE", "QUAD"] as const;
export const ROOM_STATUSES = ["AVAILABLE", "FULL", "MAINTENANCE"] as const;

export const roomTypeEnum = z.enum(ROOM_TYPES);
export const roomStatusEnum = z.enum(ROOM_STATUSES);

export const BEDS_BY_TYPE: Record<(typeof ROOM_TYPES)[number], number> = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  QUAD: 4,
};

const roomNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z0-9][A-Z0-9-]{1,11}$/,
    "Use 2–12 uppercase letters, numbers, or dashes"
  );

const block = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{1,8}$/, "Use 1–8 uppercase letters or numbers");

const floor = z.number().int().min(0).max(20);

const capacity = z.number().int().min(1).max(6);

const monthlyRent = z
  .number()
  .min(0)
  .max(99_999_999)
  .refine(
    (value) => Math.round(value * 100) === value * 100,
    "Use at most 2 decimal places"
  )
  .nullable()
  .optional();

const amenities = z
  .array(z.string().trim().min(1).max(40))
  .max(12, "Add no more than 12 amenities")
  .transform((items) => [...new Set(items.map((item) => item.trim()))]);

const notes = trimmedNullableString(500);

export const roomCreateSchema = z
  .object({
    roomNumber,
    block,
    floor,
    type: roomTypeEnum,
    capacity,
    monthlyRent,
    status: z.enum(["AVAILABLE", "MAINTENANCE"]).default("AVAILABLE"),
    amenities: amenities.default([]),
    notes,
  })
  .superRefine((value, ctx) => {
    if (BEDS_BY_TYPE[value.type] !== value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity"],
        message: `A ${value.type.toLowerCase()} room must have ${BEDS_BY_TYPE[value.type]} bed${
          BEDS_BY_TYPE[value.type] === 1 ? "" : "s"
        }`,
      });
    }
  });

export const roomUpdateSchema = z
  .object({
    roomNumber: roomNumber.optional(),
    block: block.optional(),
    floor: floor.optional(),
    type: roomTypeEnum.optional(),
    capacity: capacity.optional(),
    monthlyRent,
    status: roomStatusEnum.optional(),
    amenities: amenities.optional(),
    notes,
  })
  .superRefine((value, ctx) => {
    if (
      value.type &&
      value.capacity !== undefined &&
      BEDS_BY_TYPE[value.type] !== value.capacity
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity"],
        message: `A ${value.type.toLowerCase()} room must have ${BEDS_BY_TYPE[value.type]} bed${
          BEDS_BY_TYPE[value.type] === 1 ? "" : "s"
        }`,
      });
    }
    if (Object.values(value).every((item) => item === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["form"],
        message: "Change at least one field",
      });
    }
  });

export const roomQuerySchema = paginationSchema.extend({
  block: z.string().trim().toUpperCase().max(8).optional(),
  floor: z.coerce.number().int().min(0).max(20).optional(),
  type: roomTypeEnum.optional(),
  status: roomStatusEnum.optional(),
  q: z.string().trim().max(40).optional(),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
export type RoomQuery = z.infer<typeof roomQuerySchema>;
