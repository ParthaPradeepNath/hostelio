import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-6 h-72 w-full rounded-lg" />
    </div>
  );
}
