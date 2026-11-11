import { GoogleGenAI } from "@google/genai";
import type { AiJsonRequest } from "@/lib/ai/client";

let client: GoogleGenAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateWithGemini(request: AiJsonRequest, signal: AbortSignal): Promise<string> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

  const response = await ai.models.generateContent({
    model,
    contents: request.user,
    config: {
      systemInstruction: request.system,
      responseMimeType: "application/json",
      ...(request.jsonSchema ? { responseJsonSchema: request.jsonSchema } : {}),
      maxOutputTokens: request.maxOutputTokens ?? 900,
      temperature: request.temperature ?? 0.2,
      abortSignal: signal,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}
