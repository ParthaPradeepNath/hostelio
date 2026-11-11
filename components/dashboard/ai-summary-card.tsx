import { Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { summarizeCommonIssues } from "@/lib/ai/summarize-complaints";
import { enumLabel, formatDateTime } from "@/lib/utils";

export async function AiSummaryCard() {
  const summary = await summarizeCommonIssues();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden />
            Common issues this month
          </CardTitle>
          <Badge tone={summary.mode === "ai" ? "accent" : "neutral"} dot>
            {summary.mode === "ai" ? "AI summary" : "Stats summary"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="type-reading text-[14px] text-ink">{summary.summary}</p>

        {summary.topIssues.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {summary.topIssues.map((issue) => (
              <li
                key={issue.category}
                className="rounded-pill border border-line bg-surface-2 px-2.5 py-1 text-[12px] text-ink-secondary"
              >
                {enumLabel(issue.category)} · {issue.count}
              </li>
            ))}
          </ul>
        ) : null}

        {summary.recommendedActions.length > 0 ? (
          <div className="mt-4">
            <p className="type-label text-ink">Recommended actions</p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {summary.recommendedActions.map((action) => (
                <li key={action} className="flex gap-2 text-[13px] leading-relaxed text-ink-secondary">
                  <span className="mt-2 size-1 shrink-0 rounded-pill bg-ink-tertiary" aria-hidden />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {summary.safetyConcerns > 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2.5 text-[12px] leading-relaxed text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              {summary.safetyConcerns} urgent {summary.safetyConcerns === 1 ? "complaint" : "complaints"}{" "}
              flagged in this period need same-day attention.
            </p>
          </div>
        ) : null}

        <p className="mt-4 break-words border-t border-line pt-3 text-[11px] text-ink-tertiary">
          {summary.mode === "ai" && summary.provider
            ? `${summary.provider} · ${summary.model}`
            : "AI unavailable — showing a deterministic summary from complaint counts."}{" "}
          · Generated {formatDateTime(summary.generatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

export function AiSummarySkeleton() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden />
            Common issues this month
          </CardTitle>
          <Badge tone="neutral" dot>
            Analyzing
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-11/12" />
          <div className="skeleton h-3.5 w-3/4" />
        </div>
        <p className="mt-4 text-[12px] text-ink-tertiary">
          Summarizing recent complaints. This does not block the rest of the page.
        </p>
      </CardContent>
    </Card>
  );
}
