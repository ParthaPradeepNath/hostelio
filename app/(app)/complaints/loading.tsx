import { Skeleton } from "@/components/ui/skeleton";

export default function ComplaintsLoading() {
  return (
    <div role="status" aria-label="Loading complaints">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <Skeleton className="mb-5 h-[4.25rem] w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading complaints</span>
    </div>
  );
}
