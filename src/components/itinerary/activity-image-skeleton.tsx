/**
 * Skeleton placeholder shown while the location photo is loading.
 * Uses a CSS shimmer animation layered over a muted background to give a
 * "content incoming" affordance consistent with the journal aesthetic.
 */
export function ActivityImageSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted ring-1 ring-border relative"
    >
      {/* shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
