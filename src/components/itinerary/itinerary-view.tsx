import type { Itinerary } from "@/lib/itinerary.functions";
import { ActivityCard } from "./activity-card";

interface ItineraryViewProps {
  itinerary: Itinerary;
}

/**
 * Renders the full generated itinerary: destination header, day-by-day journal
 * cards, and the field-notes tips block.
 *
 * Each `<ActivityCard>` manages its own image loading state independently via
 * `<Suspense>` — so images load in parallel and failed ones degrade gracefully
 * without affecting adjacent cards.
 */
export function ItineraryView({ itinerary }: ItineraryViewProps) {
  return (
    <section className="space-y-6 animate-reveal" aria-label="Generated itinerary">
      {/* ── Destination header ─────────────────────────────────────── */}
      <div className="flex justify-between items-end border-b-2 border-dashed border-border pb-4">
        <div className="font-serif italic text-2xl md:text-3xl">{itinerary.destination}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {itinerary.days.length} {itinerary.days.length === 1 ? "day" : "days"} ·{" "}
          {itinerary.travelers} {itinerary.travelers === 1 ? "traveler" : "travelers"} ·{" "}
          {itinerary.tier}
        </div>
      </div>

      {/* ── Day cards ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {itinerary.days.map((d) => (
          <article
            key={d.day}
            className="bg-card p-4 sm:p-6 rounded-xl ring-1 ring-border"
            aria-label={`Day ${d.day}: ${d.title}`}
          >
            <div className="flex gap-3 sm:gap-6">
              {/* Day number */}
              <div className="font-mono text-accent shrink-0 w-12 sm:w-16 select-none">
                <div className="text-2xl sm:text-3xl font-bold leading-none">
                  {String(d.day).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-tighter opacity-60 mt-1">Day</div>
              </div>

              <div className="flex-1 min-w-0 space-y-5">
                {/* Day title + summary */}
                <div>
                  <h3 className="font-serif text-2xl leading-snug">{d.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{d.summary}</p>
                </div>

                {/* Activity list — each item is independently async */}
                <ul
                  className="space-y-5 border-l border-dashed border-border pl-3 sm:pl-5"
                  aria-label={`Activities for day ${d.day}`}
                >
                  {d.activities.map((a, i) => (
                    <ActivityCard
                      key={`${d.day}-${i}`}
                      activity={a}
                      destination={itinerary.destination}
                      index={i}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── Field notes (tips) ─────────────────────────────────────── */}
      {itinerary.tips.length > 0 && (
        <aside className="bg-foreground text-background rounded-xl p-6 sm:p-8" aria-label="Travel tips">
          <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">
            Field notes
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {itinerary.tips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-accent font-mono shrink-0" aria-hidden="true">
                  →
                </span>
                <span className="opacity-90">{tip}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </section>
  );
}
