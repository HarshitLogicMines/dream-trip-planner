import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchUnsplashImage } from "@/lib/itinerary.functions";

// ─── Query key factory ────────────────────────────────────────────────────────

export const placeImageKeys = {
  all: ["place-image"] as const,
  detail: (query: string, destination: string) =>
    [...placeImageKeys.all, query, destination] as const,
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
 * Fetches and preloads the REAL photo of a place from Wikipedia/Wikimedia.
 * No extra API key needed — the AI (Gemini) provides the exact place name,
 * and we resolve its actual photo (not a generic stock image).
 *
 * Uses `useSuspenseQuery` (TanStack Query v5) — the component suspends while
 * the photo loads. Pair with `<Suspense>` + error boundary in the parent:
 *  - Loading  → `<ActivityImageSkeleton>` (shimmer)
 *  - Success  → `<img>` committed with zero layout shift
 *  - Error    → `<ImagePlaceholder>` (MapPin icon) via `<ImageErrorBoundary>`
 *
 * Cache policy:
 *  - `staleTime: Infinity` → never re-fetches the same query within a session
 *  - `gcTime: 30 min`      → keeps URL in memory between page navigations
 *  - `retry: 1`            → one graceful retry before surfacing to error boundary
 *
 * @example
 * ```tsx
 * // Must be inside a <Suspense> boundary:
 * const { data: imageUrl } = usePlaceImage("Fushimi Inari Shrine", "Kyoto");
 * ```
 */
export function usePlaceImage(searchQuery: string, destination: string) {
  const fetchImage = useServerFn(fetchUnsplashImage);

  return useSuspenseQuery({
    queryKey: placeImageKeys.detail(searchQuery, destination),
    queryFn: async () => {
      const imageUrl = await fetchImage({ data: { query: searchQuery, destination } });
      if (!imageUrl) {
        throw new Error(
          `[use-place-image] No image found for: "${searchQuery}"`
        );
      }
      return preloadImage(imageUrl);
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
