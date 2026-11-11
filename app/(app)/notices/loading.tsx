import { Skeleton } from "@/components/ui/skeleton";

export default function NoticesLoading() {
  return (
    <div role="status" aria-label="Loading notices">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-line bg-surface p-5 shadow-card md:p-6">
            <Skeleton className="h-5 w-2/3 max-w-md" />
            <Skeleton className="mt-2 h-3 w-48" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading notices</span>
    </div>
  );
}
