export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "STUDENT_ALREADY_ALLOCATED"
  | "ROOM_FULL"
  | "ROOM_UNDER_MAINTENANCE"
  | "ROOM_OCCUPIED"
  | "ROOM_CAPACITY_BELOW_OCCUPANCY"
  | "ROOM_STATUS_INVALID"
  | "COMPLAINT_LOCKED"
  | "INVALID_TRANSITION"
  | "DUPLICATE_ROOM_NUMBER";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  STUDENT_ALREADY_ALLOCATED: 409,
  ROOM_FULL: 409,
  ROOM_UNDER_MAINTENANCE: 409,
  ROOM_OCCUPIED: 409,
  ROOM_CAPACITY_BELOW_OCCUPANCY: 409,
  ROOM_STATUS_INVALID: 409,
  COMPLAINT_LOCKED: 409,
  INVALID_TRANSITION: 422,
  DUPLICATE_ROOM_NUMBER: 409,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(code: ErrorCode, message: string, details?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function notFound(message = "Resource not found") {
  return new AppError("NOT_FOUND", message);
}

export function forbidden(message = "You do not have access to this resource") {
  return new AppError("FORBIDDEN", message);
}

export function conflict(code: ErrorCode, message: string) {
  return new AppError(code, message);
}
