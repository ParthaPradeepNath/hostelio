"use client";

import * as React from "react";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer rounded-pill bg-line-strong data-[state=checked]:bg-accent relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center border border-transparent transition-colors duration-200 ease-[var(--ease-out)] after:absolute after:-inset-2.5 after:content-[''] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="rounded-pill bg-surface shadow-card pointer-events-none block size-5 transition-transform duration-200 ease-[var(--ease-out)] data-[state=checked]:translate-x-4 motion-reduce:transition-none" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
