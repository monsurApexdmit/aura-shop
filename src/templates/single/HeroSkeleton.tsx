import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder in the shape of the landing hero while the product loads. */
export function HeroSkeleton() {
  return (
    <div className="container grid gap-6 pb-10 pt-4 md:grid-cols-2 md:items-center md:gap-10 md:pt-10" aria-busy="true" aria-label="Loading product">
      <div className="md:order-last">
        <Skeleton className="aspect-square w-full rounded-[2rem]" />
        <div className="mt-3 flex gap-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="size-16 rounded-2xl sm:size-20" />)}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-28 rounded-pill" />
        <Skeleton className="h-10 w-full rounded-xl sm:h-14" />
        <Skeleton className="h-10 w-2/3 rounded-xl sm:h-14" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-14 w-full rounded-pill sm:w-80" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
