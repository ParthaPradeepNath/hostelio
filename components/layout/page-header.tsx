import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="type-page text-ink break-words">{title}</h1>
        {description ? (
          <p className="text-ink-secondary mt-1.5 max-w-2xl text-[14px] leading-relaxed break-words">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
