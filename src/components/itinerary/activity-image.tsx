import {
  Component,
  Suspense,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { MapPin } from "lucide-react";

import { usePlaceImage } from "@/hooks/use-place-image";
import { ActivityImageSkeleton } from "./activity-image-skeleton";

// ─── Error Boundary ───────────────────────────────────────────────────────────
// A class component is still required for error boundaries in React 19.
// This one is intentionally minimal — it catches preload failures and swaps
// the image slot for a tasteful MapPin placeholder instead of crashing the card.

interface ErrorBoundaryState {
  hasError: boolean;
}

class ImageErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in dev console without crashing the app
    if (import.meta.env.DEV) {
      console.warn("[ActivityImage] Image load failed:", error.message, info.componentStack);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── Inner (suspending) component ────────────────────────────────────────────
// This component uses `usePlaceImage` which internally calls `useSuspenseQuery`.
// React suspends rendering of this subtree until the image is preloaded, then
// commits in one atomic paint — no skeleton-to-image flash / layout shift.

interface ActivityImageInnerProps {
  searchQuery: string;
}

function ActivityImageInner({ searchQuery }: ActivityImageInnerProps) {
  // `data` is guaranteed non-null here — useSuspenseQuery narrows the type.
  const { data: imageUrl } = usePlaceImage(searchQuery);

  return (
    <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden ring-1 ring-border group">
      <img
        src={imageUrl}
        alt={`Photo from: ${searchQuery}`}
        width={80}
        height={80}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

// ─── Fallback placeholder ─────────────────────────────────────────────────────
// Shown when the network request fails or the image 404s.
// Matches the skeleton dimensions exactly to prevent layout shift.

function ImagePlaceholder() {
  return (
    <div
      aria-label="Image unavailable"
      className="shrink-0 w-20 h-20 rounded-lg bg-muted ring-1 ring-border flex items-center justify-center"
    >
      <MapPin className="size-5 text-muted-foreground/40" />
    </div>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ActivityImageProps {
  /** Search query from Gemini (2-4 words, Unsplash-optimized) */
  searchQuery: string;
}

/**
 * Renders a 80×80 location photo for an itinerary activity.
 *
 * Lifecycle:
 *  1. Mounts → `<Suspense>` shows `<ActivityImageSkeleton>` immediately
 *  2. Image preloads via `usePlaceImage` (TanStack Query + Unsplash)
 *  3. On success → `<ActivityImageInner>` commits with hover zoom
 *  4. On error   → `<ImageErrorBoundary>` swaps in `<ImagePlaceholder>`
 *
 * This component is self-contained — drop it anywhere without extra providers
 * (QueryClientProvider is already mounted at the router root).
 */
export function ActivityImage({ placeName, destination }: ActivityImageProps) {
  return (
    <ImageErrorBoundary fallback={<ImagePlaceholder />}>
      <Suspense fallback={<ActivityImageSkeleton />}>
        <ActivityImageInner placeName={placeName} destination={destination} />
      </Suspense>
    </ImageErrorBoundary>
  );
}
