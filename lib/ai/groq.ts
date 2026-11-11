import Groq from "groq-sdk";
import type { AiJsonRequest } from "@/lib/ai/client";

let client: Groq | null = null;

function getClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
  client ??= new Groq({ apiKey });
  return client;
}

export function groqConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export async function generateWithGroq(request: AiJsonRequest, signal: AbortSignal): Promise<string> {
  const groq = getClient();
  const model = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

  const completion = await groq.chat.completions.create(
    {
      model,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
      response_format: request.jsonSchema
        ? {
            type: "json_schema",
            json_schema: {
              name: request.operation === "summarize" ? "hostel_summary" : "complaint_categorization",
              schema: request.jsonSchema,
              strict: true,
            },
          }
        : { type: "json_object" },
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxOutputTokens ?? 900,
    },
    { signal },
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response");
  return content;
}
