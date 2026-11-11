import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div role="status" aria-label="Loading profile">
      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <Skeleton className="h-[28rem] rounded-lg lg:col-span-2" />
      </div>
      <span className="sr-only">Loading profile</span>
    </div>
  );
}
