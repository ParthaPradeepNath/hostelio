"use client";

import { type DefaultValues, type Resolver, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/**
 * Thin wrapper so form input and parsed output types stay aligned with the
 * shared Zod schemas (defaults and transforms included).
 */
export function useAppForm<S extends z.ZodTypeAny>(
  schema: S,
  defaultValues: DefaultValues<z.input<S>>
) {
  return useForm<z.input<S>, unknown, z.output<S>>({
    resolver: zodResolver(schema) as Resolver<z.input<S>, unknown, z.output<S>>,
    defaultValues,
    mode: "onBlur",
  });
}
