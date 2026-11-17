type RequestLog = {
  requestId: string;
  userId: string | null;
  role: string | null;
  route: string;
  method: string;
  latencyMs: number;
  status: number;
  errorCode?: string;
};

export function logRequest(entry: RequestLog) {
  console.log(JSON.stringify({ level: "info", type: "request", ...entry }));
}

type AiLog = {
  provider: string;
  model: string;
  latencyMs: number;
  outcome: "success" | "failure" | "skipped";
  operation: "categorize" | "summarize";
  complaintId?: string;
  error?: string;
};

export function logAi(entry: AiLog) {
  console.log(
    JSON.stringify({
      level: entry.outcome === "failure" ? "warn" : "info",
      type: "ai",
      ...entry,
    })
  );
}

export function logServerError(entry: {
  requestId: string;
  route: string;
  error: unknown;
}) {
  const message =
    entry.error instanceof Error ? entry.error.message : String(entry.error);
  const stack = entry.error instanceof Error ? entry.error.stack : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      type: "server_error",
      requestId: entry.requestId,
      route: entry.route,
      message,
      stack,
    })
  );
}
