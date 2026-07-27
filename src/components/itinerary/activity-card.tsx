import type { ItineraryActivity } from "@/lib/itinerary.functions";
import { ActivityImage } from "./activity-image";

export interface ActivityCardProps {
  activity: ItineraryActivity;
  /** Overall trip destination — used for accurate real-place image lookup */
  destination: string;
  /** Zero-based position within the day's activity list — drives staggered reveal delay */
  index: number;
}

/**
 * Renders a single itinerary activity row: time · photo · title + description.
 *
 * Layout anatomy (desktop):
 * ┌──────────┬──────────────────────────────────────────────┐
 * │  TIME    │  [80×80 photo]  Title           [CATEGORY]   │
 * │  mono    │                 Description text...           │
 * └──────────┴──────────────────────────────────────────────┘
 *
 * The staggered animation delay gives a cascade effect when the day card first
 * renders — each activity reveals itself 80 ms after the previous one.
 */
export function ActivityCard({ activity, destination, index }: ActivityCardProps) {
  return (
    <li
      className="flex gap-4 items-start animate-reveal opacity-0"
      style={{
        // Cascade stagger: each card starts its reveal 80 ms after the last
        animationDelay: `${index * 80}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* ── Time column ──────────────────────────────────────────────── */}
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground pt-2 w-20 shrink-0 leading-tight">
        {activity.time}
      </div>

      {/* ── Photo + text block ───────────────────────────────────────── */}
      <div className="flex gap-3 flex-1 min-w-0">
        {/* Real location photo — uses the actual place name for an accurate match */}
        <ActivityImage
          searchQuery={activity.imageSearchQuery || activity.title}
          destination={destination}
        />

        <div className="flex-1 min-w-0 pt-0.5">
          {/* Title + category badge */}
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-serif text-lg leading-snug">{activity.title}</span>
            <span className="mt-1 px-2 py-0.5 bg-background text-[9px] font-mono uppercase tracking-wider rounded text-accent border border-border shrink-0">
              {activity.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {activity.description}
          </p>
        </div>
      </div>
    </li>
  );
}
