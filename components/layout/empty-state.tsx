import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "empty-in border-line bg-surface-2/60 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <Icon
          className="text-ink-tertiary mb-3 size-8"
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
      <p className="text-ink text-[15px] font-medium">{title}</p>
      {description ? (
        <p className="text-ink-secondary mt-1 max-w-md text-[13px] leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
