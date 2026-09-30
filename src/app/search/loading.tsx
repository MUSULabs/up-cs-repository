import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-12 w-full" />
      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <Skeleton className="hidden h-[32rem] w-full md:block" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
