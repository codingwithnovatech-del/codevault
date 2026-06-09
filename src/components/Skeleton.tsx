export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="h-32 bg-gray-700 rounded-lg" />
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
  );
}
