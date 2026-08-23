import { JobGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-surface-container-high" />
      <div className="mb-6 h-12 w-full animate-pulse rounded-lg bg-surface-container-high" />
      <JobGridSkeleton count={4} />
    </div>
  );
}
