import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "skeleton animate-pulse motion-reduce:animate-none",
        className
      )}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };
