export function SkeletonCard() {
  return (
    <div className="bg-surface-container/40 border border-outline-variant/30 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-surface-container-highest rounded w-3/4" />
      <div className="h-3 bg-surface-container-highest rounded w-1/2" />
      <div className="h-3 bg-surface-container-highest rounded w-full" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
