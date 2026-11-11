import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PaginationNav({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
      <p className="text-[12px] text-ink-tertiary">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <span
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "opacity-50")}
            aria-disabled="true"
          >
            <ChevronLeft aria-hidden />
            Previous
          </span>
        ) : (
          <Link href={href(page - 1)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <ChevronLeft aria-hidden />
            Previous
          </Link>
        )}
        {page >= totalPages ? (
          <span
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "opacity-50")}
            aria-disabled="true"
          >
            Next
            <ChevronRight aria-hidden />
          </span>
        ) : (
          <Link href={href(page + 1)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Next
            <ChevronRight aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  );
}
