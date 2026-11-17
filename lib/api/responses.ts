import { NextResponse } from "next/server";

import type { ErrorCode } from "@/lib/api/errors";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function ok<T>(data: T, meta?: PaginationMeta) {
  return NextResponse.json(meta ? { data, meta } : { data });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, string>
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

export function paginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
