import { Skeleton } from "@/components/ui/skeleton";

export default function AllocationsLoading() {
  return (
    <div role="status" aria-label="Loading allocations">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <Skeleton className="mb-5 h-11 w-52 rounded-md" />
      <Skeleton className="h-[24rem] w-full rounded-lg" />
      <span className="sr-only">Loading allocations</span>
    </div>
  );
}
