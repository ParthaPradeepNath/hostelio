"use client";

import * as React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group border-line-strong bg-surface text-ink data-[placeholder]:text-ink-tertiary flex h-11 w-full items-center justify-between gap-2 rounded-sm border px-3 text-left text-[16px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-[14px] [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown
        className="text-ink-tertiary transition-transform duration-200 ease-[var(--ease-out)] group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        aria-hidden
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={6}
      className={cn(
        "popover-content border-line bg-surface shadow-popover z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border p-1",
        className
      )}
      style={{
        transformOrigin: "var(--radix-select-content-transform-origin)",
      }}
      {...props}
    >
      <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "text-ink data-[highlighted]:bg-surface-hover relative flex min-h-11 cursor-default items-center rounded-sm py-2 pr-2 pl-8 text-[13px] transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 md:min-h-0",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 inline-flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="item-indicator-in text-accent size-4" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
