import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchPlaceImage } from "@/lib/itinerary.functions";

// ─── Query key factory ────────────────────────────────────────────────────────

export const placeImageKeys = {
  all: ["place-image"] as const,
  detail: (placeName: string, destination: string) =>
    [...placeImageKeys.all, placeName, destination] as const,
};

// ─── Image Preloader ───────────────────────────────────────────────────────────
/**
 * Preloads an image URL so the browser fully decodes pixel data before we
 * render `<img>`. This eliminates layout shift — the component commits with
 * an already-ready image rather than momentarily showing a broken src.
 */
function preloadImage(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(url);
    img.onerror = () =>
      reject(new Error(`[use-place-image] Preload failed: ${url}`));
    img.src = url;
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches and preloads a place photo from Google Places API for an itinerary activity.
 *
 * Uses `useSuspenseQuery` (TanStack Query v5) — the component suspends while
 * the photo loads. Pair with `<Suspense>` + error boundary in the parent:
 *  - Loading  → `<ActivityImageSkeleton>` (shimmer)
 *  - Success  → `<img>` committed with zero layout shift
 *  - Error    → `<ImagePlaceholder>` (MapPin icon) via `<ImageErrorBoundary>`
 *
 * Cache policy:
 *  - `staleTime: Infinity` → never re-fetches the same place within a session
 *  - `gcTime: 30 min`      → keeps URL in memory between page navigations
 *  - `retry: 1`            → one graceful retry before surfacing to error boundary
 *
 * @example
 * ```tsx
 * // Must be inside a <Suspense> boundary:
 * const { data: imageUrl } = usePlaceImage("Fushimi Inari", "Kyoto");
 * ```
 */
export function usePlaceImage(placeName: string, destination: string) {
  const fetchImage = useServerFn(fetchPlaceImage);

  return useSuspenseQuery({
    queryKey: placeImageKeys.detail(placeName, destination),
    queryFn: async () => {
      const imageUrl = await fetchImage({ placeName, destination });
      if (!imageUrl) {
        throw new Error(
          `[use-place-image] No image found for: "${placeName}" in "${destination}"`
        );
      }
      return preloadImage(imageUrl);
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
