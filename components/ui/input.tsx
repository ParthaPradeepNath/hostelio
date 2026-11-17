import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "border-line-strong bg-surface text-ink placeholder:text-ink-tertiary focus-visible:border-accent aria-[invalid=true]:border-danger h-11 w-full rounded-sm border px-3 text-[16px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-[15px]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "border-line-strong bg-surface text-ink placeholder:text-ink-tertiary focus-visible:border-accent aria-[invalid=true]:border-danger min-h-24 w-full rounded-sm border px-3 py-2.5 text-[16px] leading-relaxed transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
