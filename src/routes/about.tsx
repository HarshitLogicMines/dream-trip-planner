import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, BookOpen, Feather, MapPin, Sparkles, Heart, Wallet, Users } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import aboutMission from "@/assets/about-mission.jpg";
import aboutServices from "@/assets/about-services.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ephemera" },
      {
        name: "description",
        content:
          "Ephemera is an AI travel journal that helps you plan dream trips with day-by-day itineraries, curated tiers, and stories worth keeping.",
      },
      { property: "og:title", content: "About Ephemera — AI Trip Journals" },
      {
        property: "og:description",
        content:
          "Learn how Ephemera turns a destination into a hand-annotated travel journal — services, tiers, and the philosophy behind our AI planner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="w-full px-4 sm:px-6 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20 border-b border-border">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Log_001 — About the journal
            </div>
            <h1 className="mt-6 font-serif italic text-4xl sm:text-5xl md:text-7xl leading-tight md:leading-none">
              Trips worth <br /> remembering.
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Ephemera is a slow-travel companion dressed as a paper journal. We turn a scribbled
              dream — "ten days in Kyoto," "a weekend along the Amalfi coast" — into a day-by-day
              itinerary written the way a friend who's been there would write it.
            </p>
            <div className="mt-10 flex gap-3">
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-md hover:bg-accent transition-colors"
              >
                <Feather className="size-4" /> Plan a trip
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-border font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-md hover:bg-muted transition-colors"
              >
                Explore features
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={aboutHero}
              alt="An open travel journal, vintage camera, and folded maps on a wooden desk"
              width={1024}
              height={1024}
              className="w-full h-auto rounded-sm shadow-2xl border border-border"
            />
            <div className="absolute -bottom-4 -left-4 bg-background border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground rotate-[-2deg]">
              Est. 2026 · Wanderer's Press
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-14 md:py-24 border-b border-border">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <img
            src={aboutMission}
            alt="Traveler writing in a notebook at sunrise over the mountains"
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full h-auto rounded-sm border border-border"
          />
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Our mission
            </div>
            <h2 className="mt-4 font-serif italic text-4xl md:text-5xl">
              Planning shouldn't feel like a spreadsheet.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Most planners hand you a checklist. We hand you a story. Ephemera reads your
              destination, duration, travelers, and taste — then drafts a journal that balances the
              postcard-famous with the corner-cafe quiet. Every day has a shape: a morning arc, a
              slow lunch, an afternoon curiosity, an evening you'll write home about.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <Stat value="180+" label="Destinations drafted" />
              <Stat value="4.9★" label="Traveler rating" />
              <Stat value="12,400" label="Days planned" />
              <Stat value="99%" label="Would travel again" />
            </div>
          </div>
        </div>
      </section>

      {/* How we help */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-14 md:py-24 border-b border-border">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            How we help you plan
          </div>
          <h2 className="mt-4 font-serif italic text-4xl md:text-5xl">
            From daydream to departure, in five gentle steps.
          </h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <HelpCard
            icon={<Sparkles className="size-5" />}
            title="A prompt, not a form."
            body="Tell us the place, the days, the mood. 'Slow week in Lisbon for two' is enough — our AI does the heavy lifting."
          />
          <HelpCard
            icon={<Compass className="size-5" />}
            title="A day with a shape."
            body="Each day is an arc: an anchor site, a local meal, a curiosity, an evening. Never a to-do list."
          />
          <HelpCard
            icon={<Heart className="size-5" />}
            title="Local, not touristic."
            body="Hidden trattorias, artisan streets, seasonal events — the stops a friend who lives there would send you to."
          />
          <HelpCard
            icon={<Wallet className="size-5" />}
            title="Tiers that fit real budgets."
            body="Budget-friendly, mid-range, premium, or fully custom. Every tier is a real itinerary — not a stripped one."
          />
          <HelpCard
            icon={<BookOpen className="size-5" />}
            title="A keepsake, not a PDF."
            body="Your plan lives as an editorial journal — photographs, captions, and margin notes you'll actually re-read."
          />
          <HelpCard
            icon={<MapPin className="size-5" />}
            title="Yours to revisit."
            body="Save trips to your logs, revise them, and stamp them 'traveled' when the story is complete."
          />
        </div>
      </section>

      {/* Services */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-14 md:py-24 border-b border-border">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="md:sticky md:top-24">
            <img
              src={aboutServices}
              alt="A flat lay of vintage tickets, polaroids, pressed flowers, and handwritten notes"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-auto rounded-sm border border-border"
            />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Services we provide
            </div>
            <h2 className="mt-4 font-serif italic text-4xl md:text-5xl">
              Everything a good travel companion offers.
            </h2>
            <div className="mt-10 space-y-8">
              <Service
                title="AI-authored itineraries"
                body="Day-by-day plans generated for any destination, duration, and group size — powered by Gemini and grounded in real places."
              />
              <Service
                title="Curated tier packages"
                body="Choose Budget-Friendly ($), Mid-Range ($$), Premium ($$$), or design a fully Custom trip — each package tuned to pace, comfort, and cost."
              />
              <Service
                title="Cultural & heritage lens"
                body="Every day includes cultural context, seasonal events, and heritage sites — not just attractions, but the reasons behind them."
              />
              <Service
                title="Local eats & fun activities"
                body="From street food routes to hidden bars, workshops, and neighborhood walks — the parts most planners forget."
              />
              <Service
                title="Save, revise, and revisit"
                body="Your logs live under your profile. Edit any day, swap a stop, or stamp a trip as traveled once you're home."
              />
              <Service
                title="Preferences that follow you"
                body="Set default fare class, update cadence, and theme once — and every new journal opens the way you like it."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-14 md:py-24 border-b border-border">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Who Ephemera is for
          </div>
          <h2 className="mt-4 font-serif italic text-4xl md:text-5xl">
            Made for travelers who want the story, not the checklist.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Persona
            icon={<Feather className="size-5" />}
            title="The slow traveler"
            body="You'd rather sit at one cafe for an hour than see three museums in one."
          />
          <Persona
            icon={<Users className="size-5" />}
            title="The group organizer"
            body="You're planning for family or friends and need one plan everyone will actually like."
          />
          <Persona
            icon={<Sparkles className="size-5" />}
            title="The first-timer"
            body="You've never been, don't know where to start, and want a trusted first draft to build from."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-14 md:py-24 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Ready when you are
        </div>
        <h2 className="mt-6 font-serif italic text-4xl sm:text-5xl md:text-6xl">
          Your next journal is one prompt away.
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Tell us where you're going. We'll draft the days, the meals, and the margin notes.
        </p>
        <div className="mt-10">
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-md hover:bg-accent transition-colors"
          >
            <Feather className="size-4" /> Start planning
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-border pl-4">
      <div className="font-serif italic text-3xl">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function HelpCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-border rounded-sm p-6 bg-background hover:bg-muted/40 transition-colors">
      <div className="size-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-5 font-serif italic text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Service({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-border pt-6">
      <h3 className="font-serif italic text-2xl">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Persona({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-border rounded-sm p-6">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-serif italic text-xl">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
