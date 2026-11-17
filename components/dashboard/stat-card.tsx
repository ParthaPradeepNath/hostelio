import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 md:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-ink-secondary text-[12px] font-medium">{label}</p>
        {Icon ? (
          <Icon
            className="text-ink-tertiary size-4"
            strokeWidth={1.8}
            aria-hidden
          />
        ) : null}
      </div>
      <p
        className={cn(
          "tabular mt-2 text-[26px] leading-none font-semibold",
          emphasis ? "text-accent" : "text-ink"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-ink-tertiary mt-1.5 text-[11px]">{hint}</p>
      ) : null}
    </Card>
  );
}
