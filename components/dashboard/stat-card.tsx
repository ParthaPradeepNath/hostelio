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
        <p className="text-[12px] font-medium text-ink-secondary">{label}</p>
        {Icon ? <Icon className="size-4 text-ink-tertiary" strokeWidth={1.8} aria-hidden /> : null}
      </div>
      <p
        className={cn(
          "tabular mt-2 text-[26px] font-semibold leading-none",
          emphasis ? "text-accent" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] text-ink-tertiary">{hint}</p> : null}
    </Card>
  );
}
