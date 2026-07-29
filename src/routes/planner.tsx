import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, MapPin, Users, Calendar, Check } from "lucide-react";

import { generateItinerary, type Itinerary } from "@/lib/itinerary.functions";
import { useSession } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { ItineraryView } from "@/components/itinerary/itinerary-view";

const TIERS = [
  { id: "budget", name: "Budget-Friendly", price: "$", body: "Hostels, transit, street food." },
  { id: "mid", name: "Mid-Range", price: "$$", body: "Boutique stays, curated dining." },
  { id: "premium", name: "Premium", price: "$$$", body: "Luxury, private guides, VIP." },
  { id: "custom", name: "Custom", price: "?", body: "Blend your own experience." },
] as const;

const searchSchema = z.object({
  tier: z.enum(["budget", "mid", "premium", "custom"]).optional(),
});

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Trip Planner — Ephemera" },
      {
        name: "description",
        content:
          "Enter your destination, duration, and travelers. Choose a fare class and Ephemera drafts your AI itinerary.",
      },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: Planner,
});

function Planner() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();
  const generate = useServerFn(generateItinerary);

  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(1);
  const [tier, setTier] = useState<(typeof TIERS)[number]["id"]>(() => {
    if (search.tier) return search.tier;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ephemera.prefs");
        if (raw) {
          const saved = JSON.parse(raw) as { defaultTier?: string };
          const valid = ["budget", "mid", "premium", "custom"] as const;
          if (saved.defaultTier && (valid as readonly string[]).includes(saved.defaultTier)) {
            return saved.defaultTier as (typeof TIERS)[number]["id"];
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return "mid";
  });
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [purchased, setPurchased] = useState(false);

  // Restore draft state on mount
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem("ephemera.draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.days) setDays(parsed.days);
        if (parsed.travelers) setTravelers(parsed.travelers);
        if (parsed.prompt) setPrompt(parsed.prompt);
        sessionStorage.removeItem("ephemera.draft"); // clear once loaded
      }
    } catch {
      // Ignore sessionStorage reading errors
    }
  }, []);

  const canGenerate = destination.trim().length > 0 && days > 0 && travelers > 0;

  async function handleBuy() {
    if (!user) {
      toast.info("Sign in to purchase and generate your itinerary.");
      // Save draft state
      try {
        sessionStorage.setItem(
          "ephemera.draft",
          JSON.stringify({ destination, days, travelers, prompt }),
        );
      } catch {
        // Ignore sessionStorage saving errors
      }
      navigate({ to: "/auth" });
      return;
    }
    if (!canGenerate) {
      toast.error("Please enter a destination.");
      return;
    }
    setPurchased(true);
    setLoading(true);
    try {
      const result = await generate({
        data: {
          destination: destination.trim(),
          days,
          travelers,
          tier,
          prompt: prompt.trim() || undefined,
        },
      });
      setItinerary(result);
      toast.success("Your journal is ready.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      setPurchased(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-16">
      <header className="space-y-4 animate-reveal">
        <h1 className="text-4xl md:text-6xl font-serif italic leading-[0.95]">
          Draft your itinerary.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Tell us where you're going, for how long, and who's coming. Pick your fare class — we'll
          write the journal.
        </p>
      </header>

      <section className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <div className="lg:col-span-5 space-y-6 animate-reveal">
          <div className="p-8 bg-card ring-1 ring-border rounded-2xl shadow-sm space-y-6">
            <Field label="Destination" icon={<MapPin className="size-3.5" />}>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, India"
                className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-serif text-xl italic placeholder:text-muted-foreground/60"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration (days)" icon={<Calendar className="size-3.5" />}>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                  className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-sans"
                />
              </Field>
              <Field label="Travelers" icon={<Users className="size-3.5" />}>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={travelers}
                  onChange={(e) =>
                    setTravelers(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                  }
                  className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-sans"
                />
              </Field>
            </div>

            <Field label="Notes for the AI (optional)" icon={<Sparkles className="size-3.5" />}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Vegetarian, love live music, avoid crowded beaches..."
                className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-sans text-sm resize-none placeholder:text-muted-foreground/60"
              />
            </Field>
          </div>
        </div>

        {/* Tiers */}
        <div className="lg:col-span-7 space-y-4 animate-reveal [animation-delay:150ms]">
          {/* <div className="flex justify-between items-end border-b-2 border-dashed border-border pb-4">
            <div className="font-serif italic text-xl">Choose your class</div>
          </div> */}

          <div className="grid sm:grid-cols-2 gap-4">
            {TIERS.map((t) => {
              const active = tier === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`ticket-cutout text-left p-6 rounded-lg border transition-all ${
                    active
                      ? "border-accent bg-card ring-2 ring-accent"
                      : "border-border bg-card hover:-translate-y-1"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t.id}
                    </div>
                    <div className="text-accent font-bold text-lg">{t.price}</div>
                  </div>
                  <h4 className="font-serif text-xl mt-3">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.body}</p>
                  {active && (
                    <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono uppercase text-accent">
                      <Check className="size-3" /> Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleBuy}
            disabled={loading || !canGenerate}
            className="w-full bg-foreground text-background py-4 rounded-xl font-mono uppercase tracking-widest hover:bg-accent transition-all active:scale-[0.98] shadow-lg shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Drafting your journal…
              </>
            ) : purchased ? (
              <>Regenerate itinerary</>
            ) : (
              <>Buy plan & generate itinerary</>
            )}
          </button>
          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              You'll be asked to{" "}
              <Link to="/auth" className="text-accent underline underline-offset-2">
                sign in
              </Link>{" "}
              before purchase.
            </p>
          )}
        </div>
      </section>

      {/* Result */}
      {itinerary && <ItineraryView itinerary={itinerary} />}
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

// ItineraryView has been extracted to @/components/itinerary/itinerary-view.tsx
