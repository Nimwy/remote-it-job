export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-surface-container-high" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-surface-container-high" />
          <div className="h-3 w-1/3 rounded bg-surface-container-high" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-surface-container-high" />
        <div className="h-5 w-20 rounded-full bg-surface-container-high" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-2/3 rounded bg-surface-container-high" />
        <div className="h-3 w-1/2 rounded bg-surface-container-high" />
      </div>
      <div className="mt-4 flex gap-2 border-t border-outline-variant/30 pt-4">
        <div className="h-5 w-14 rounded bg-surface-container-high" />
        <div className="h-5 w-14 rounded bg-surface-container-high" />
        <div className="h-5 w-14 rounded bg-surface-container-high" />
      </div>
    </div>
  );
}

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
