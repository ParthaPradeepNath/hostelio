import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailsLoading() {
  return (
    <div role="status" aria-label="Loading room details">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-lg lg:col-span-2" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <span className="sr-only">Loading room details</span>
    </div>
  );
}
