export class ApiClientError extends Error {
  code?: string;
  details?: Record<string, string>;
  status?: number;

  constructor(message: string, options?: { code?: string; details?: Record<string, string>; status?: number }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.details = options?.details;
    this.status = options?.status;
  }
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Try again.";
    let code: string | undefined;
    let details: Record<string, string> | undefined;
    try {
      const payload = (await response.json()) as {
        error?: { code?: string; message?: string; details?: Record<string, string> };
      };
      message = payload.error?.message ?? message;
      code = payload.error?.code;
      details = payload.error?.details;
    } catch {
      // Keep the generic message when the body is not JSON.
    }
    throw new ApiClientError(message, { code, details, status: response.status });
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Try again.";
}

export function fieldError(error: unknown, field: string) {
  if (error instanceof ApiClientError) return error.details?.[field];
  return undefined;
}
