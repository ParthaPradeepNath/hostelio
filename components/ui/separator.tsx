import { cn } from "@/lib/utils";

function Separator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cn("bg-line h-px w-full", className)}
      {...props}
    />
  );
}

export { Separator };
