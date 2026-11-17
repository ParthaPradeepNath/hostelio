import { z } from "zod";

import { geminiConfigured, generateWithGemini } from "@/lib/ai/gemini";
import { generateWithGroq, groqConfigured } from "@/lib/ai/groq";
import { logAi } from "@/lib/api/logger";

export type AiProvider = "gemini" | "groq";

export interface AiJsonRequest {
  system: string;
  user: string;
  schema: z.ZodTypeAny;
  jsonSchema?: Record<string, unknown>;
  maxOutputTokens?: number;
  temperature?: number;
  operation?: "categorize" | "summarize";
  complaintId?: string;
}

export interface AiJsonResult<T> {
  data: T;
  provider: AiProvider;
  model: string;
  latencyMs: number;
}

export class AiUnavailableError extends Error {
  constructor(message = "AI is unavailable") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

type ProviderCall = (
  request: AiJsonRequest,
  signal: AbortSignal
) => Promise<string>;

const PROVIDERS: Record<
  AiProvider,
  { configured: () => boolean; model: () => string; call: ProviderCall }
> = {
  gemini: {
    configured: geminiConfigured,
    model: () => process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    call: generateWithGemini,
  },
  groq: {
    configured: groqConfigured,
    model: () => process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b",
    call: generateWithGroq,
  },
};

function providerOrder(): AiProvider[] {
  if (!process.env.AI_PROVIDER?.trim()) return [];
  const primary: AiProvider =
    process.env.AI_PROVIDER === "groq" ? "groq" : "gemini";
  const secondary: AiProvider = primary === "gemini" ? "groq" : "gemini";
  return [primary, secondary].filter((provider) =>
    PROVIDERS[provider].configured()
  );
}

export function isAiConfigured() {
  return providerOrder().length > 0;
}

export function aiProviderLabel() {
  const order = providerOrder();
  return order.length > 0 ? order[0] : null;
}

function timeoutMs() {
  const parsed = Number(process.env.AI_TIMEOUT_MS ?? 8000);
  return Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 1000), 30000)
    : 8000;
}

function maxRetries() {
  const parsed = Number(process.env.AI_MAX_RETRIES ?? 1);
  return Number.isFinite(parsed)
    ? Math.min(Math.max(Math.trunc(parsed), 0), 2)
    : 1;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function statusOf(error: unknown): number | undefined {
  if (error && typeof error === "object") {
    const candidate = error as {
      status?: unknown;
      statusCode?: unknown;
      response?: { status?: unknown };
    };
    const status =
      candidate.status ?? candidate.statusCode ?? candidate.response?.status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function errorSummary(error: unknown) {
  if (error instanceof Error)
    return `${error.name}: ${error.message}`.slice(0, 240);
  return String(error).slice(0, 240);
}

async function callProviderWithTimeout(
  provider: AiProvider,
  request: AiJsonRequest,
  budgetMs: number
): Promise<string> {
  const controller = new AbortController();
  let rejectTimeout: (error: Error) => void = () => {};
  const timeoutPromise = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timer = setTimeout(() => {
    controller.abort();
    rejectTimeout(new Error(`AI request timed out after ${budgetMs}ms`));
  }, budgetMs);

  try {
    return await Promise.race([
      PROVIDERS[provider].call(request, controller.signal),
      timeoutPromise,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateJson<T>(
  request: AiJsonRequest
): Promise<AiJsonResult<T>> {
  const order = providerOrder();
  if (order.length === 0) {
    throw new AiUnavailableError("No AI provider is configured");
  }

  const retries = maxRetries();
  const budget = timeoutMs();
  let lastError: unknown = new AiUnavailableError("All AI providers failed");

  for (const provider of order) {
    const model = PROVIDERS[provider].model();

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const started = Date.now();
      try {
        const raw = await callProviderWithTimeout(provider, request, budget);
        const parsedJson: unknown = JSON.parse(raw);
        const data = request.schema.parse(parsedJson) as T;
        const latencyMs = Date.now() - started;

        logAi({
          provider,
          model,
          latencyMs,
          outcome: "success",
          operation: request.operation ?? "categorize",
          complaintId: request.complaintId,
        });
        return { data, provider, model, latencyMs };
      } catch (error) {
        const latencyMs = Date.now() - started;
        lastError = error;
        logAi({
          provider,
          model,
          latencyMs,
          outcome: "failure",
          operation: request.operation ?? "categorize",
          complaintId: request.complaintId,
          error: errorSummary(error),
        });

        const status = statusOf(error);
        const nonRetryable =
          status !== undefined &&
          status >= 400 &&
          status < 500 &&
          status !== 429;
        if (nonRetryable) break;
        if (attempt < retries) await sleep(400);
      }
    }
  }

  throw new AiUnavailableError(
    lastError instanceof Error
      ? `AI providers failed: ${lastError.message}`
      : "All AI providers failed"
  );
}
