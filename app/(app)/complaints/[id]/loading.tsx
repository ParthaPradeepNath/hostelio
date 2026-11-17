import { Skeleton } from "@/components/ui/skeleton";

export default function ComplaintDetailsLoading() {
  return (
    <div role="status" aria-label="Loading complaint details">
      <Skeleton className="mb-4 h-4 w-28" />
      <div className="mb-6 flex flex-col gap-3 md:mb-8">
        <Skeleton className="h-8 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <div className="flex gap-2">
          <Skeleton className="rounded-pill h-6 w-20" />
          <Skeleton className="rounded-pill h-6 w-16" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-lg lg:col-span-2" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
      <span className="sr-only">Loading complaint details</span>
    </div>
  );
}
