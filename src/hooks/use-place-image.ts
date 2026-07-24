import { useSuspenseQuery } from "@tanstack/react-query";

// ─── Wikipedia REST API ───────────────────────────────────────────────────────

interface WikiSummary {
  thumbnail?: {
    source: string; // e.g. "https://upload.wikimedia.org/wikipedia/.../80px-Fushimi.jpg"
    width: number;
    height: number;
  };
}

/**
 * Fetches the lead photo for a place from the Wikipedia REST v1 Summary API.
 *
 * Why Wikipedia?
 *  - CORS-enabled, no API key, completely free
 *  - Returns the curated main image for the exact place (Wikimedia Commons)
 *  - Deterministic: same query → same article → same photo
 *
 * Query fallback chain (tries each until a thumbnail is found):
 *  1. `placeName`                  → most specific, e.g. "Fushimi Inari"
 *  2. `placeName destination`      → adds geo-context for disambiguation
 *
 * The Wikimedia URL encodes size as `/80px-` in the path — we upscale it
 * to `/400px-` by substitution, which is supported by the image CDN.
 */
async function fetchWikipediaPhotoUrl(
  placeName: string,
  destination: string,
): Promise<string> {
  const candidates = [placeName, `${placeName} ${destination}`];

  for (const term of candidates) {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term.trim())}`;

    try {
      const res = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) continue; // 404 = article not found, try next candidate

      const data = (await res.json()) as WikiSummary;

      if (data.thumbnail?.source) {
        // Upscale: replace the width token in the Wikimedia CDN URL
        return data.thumbnail.source.replace(/\/\d+px-/, "/400px-");
      }
    } catch {
      // Network error for this candidate — fall through to next
    }
  }

  // All candidates exhausted — let the error boundary render the MapPin fallback
  throw new Error(`[use-place-image] No Wikipedia photo found for: "${placeName}"`);
}

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

// ─── Query key factory ────────────────────────────────────────────────────────

export const placeImageKeys = {
  all: ["place-image"] as const,
  detail: (placeName: string, destination: string) =>
    [...placeImageKeys.all, placeName, destination] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches and preloads a Wikipedia photo for an itinerary activity location.
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
  return useSuspenseQuery({
    queryKey: placeImageKeys.detail(placeName, destination),
    queryFn: async () => {
      const url = await fetchWikipediaPhotoUrl(placeName, destination);
      return preloadImage(url);
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
