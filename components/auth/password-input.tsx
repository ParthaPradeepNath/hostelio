"use client";

import * as React from "react";

import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="text-ink-tertiary hover:text-ink focus-visible:ring-accent/40 absolute top-1/2 right-0.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-3"
      >
        {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </button>
    </div>
  );
});
