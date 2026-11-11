import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <div role="status" aria-label="Loading rooms">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <Skeleton className="mb-5 h-[4.25rem] w-full rounded-lg" />
      <Skeleton className="h-[26rem] w-full rounded-lg" />
      <span className="sr-only">Loading rooms</span>
    </div>
  );
}
