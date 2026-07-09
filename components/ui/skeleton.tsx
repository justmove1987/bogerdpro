import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-[var(--radius-sm)]", className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-3">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-5 flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}
