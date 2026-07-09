import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-12 w-full max-w-xl" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}
