import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import { enumLabel } from "@/lib/utils";

type Tone = NonNullable<BadgeProps["tone"]>;

const TONES: Record<string, Tone> = {
  OPEN: "accent",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  REJECTED: "danger",
  AVAILABLE: "success",
  FULL: "warning",
  MAINTENANCE: "neutral",
  ACTIVE: "success",
  VACATED: "neutral",
  LOW: "neutral",
  MEDIUM: "neutral",
  HIGH: "warning",
  URGENT: "danger",
  PENDING: "warning",
  DONE: "accent",
  FAILED: "danger",
  SKIPPED: "neutral",
};

const LABELS: Record<string, string> = {
  IN_PROGRESS: "In progress",
  OPEN: "Open",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  AVAILABLE: "Available",
  FULL: "Full",
  MAINTENANCE: "Maintenance",
  ACTIVE: "Active",
  VACATED: "Vacated",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
  PENDING: "Analyzing",
  DONE: "AI done",
  FAILED: "AI failed",
  SKIPPED: "AI skipped",
};

export function StatusBadge({
  value,
  dot = true,
  className,
}: {
  value: string | null | undefined;
  dot?: boolean;
  className?: string;
}) {
  if (!value) return null;
  const tone = TONES[value] ?? "neutral";
  const label = LABELS[value] ?? enumLabel(value);
  return (
    <Badge tone={tone} dot={dot} className={className}>
      {label}
    </Badge>
  );
}
