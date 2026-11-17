import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center bg-clip-padding font-medium whitespace-nowrap outline-none select-none transition-[color,box-shadow] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:border before:border-transparent before:transition-[scale,background-color,border-color,box-shadow] before:duration-150 before:ease-[var(--ease-out)] focus-visible:ring-3 focus-visible:ring-accent/40 motion-reduce:before:transition-none active:not-aria-[haspopup]:before:scale-[0.99] motion-reduce:active:before:scale-100 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-inverse transition-[color,box-shadow,transform] before:border-[var(--btn-primary-border)] before:[background-image:var(--btn-primary-bg)] before:[box-shadow:var(--btn-primary-shadow)] hover:-translate-y-px hover:before:[background-image:var(--btn-primary-bg-hover)] hover:before:[box-shadow:var(--btn-primary-shadow-hover)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        outline:
          "text-ink before:border-line-strong before:bg-surface hover:before:bg-surface-hover",
        secondary:
          "text-ink before:border-line before:bg-surface-2 hover:before:bg-surface-hover",
        ghost: "text-ink before:bg-transparent hover:before:bg-surface-hover",
        destructive:
          "text-danger before:bg-danger-soft hover:before:bg-danger/15",
        link: "text-accent underline-offset-4 hover:underline focus-visible:ring-0",
      },
      size: {
        default: "h-10 gap-1.5 rounded-[10px] px-3.5 text-[13px] max-sm:h-11",
        xs: "h-8 gap-1 rounded-[8px] px-2.5 text-[12px] max-sm:h-11 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1 rounded-[10px] px-3 text-[13px] max-sm:h-11",
        lg: "h-11 gap-1.5 rounded-[10px] px-4 text-[13px]",
        icon: "size-10 rounded-[10px] max-sm:size-11",
        "icon-xs":
          "size-8 rounded-[8px] max-sm:size-11 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-[10px] max-sm:size-11",
        "icon-lg": "size-11 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
