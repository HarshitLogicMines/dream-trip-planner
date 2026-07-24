import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, MapPin, ScrollText, Compass, BookOpen, Wallet, Feather, Quote } from "lucide-react";
import heroJournal from "@/assets/hero-journal.jpg";
import kyotoBamboo from "@/assets/kyoto-bamboo.jpg";
import kyotoPath from "@/assets/kyoto-path.jpg";
import kyotoTorii from "@/assets/kyoto-torii.jpg";
import postcards from "@/assets/postcards.jpg";

const DAY_IMAGES = [kyotoBamboo, kyotoPath, kyotoTorii];


const SAMPLE_DAYS = [
  {
    n: "01",
    day: "Monday",
    title: "Morning Mist at Arashiyama",
    body: "Begin at the Bamboo Grove before the crowds. AI suggests Ouka Coffee for a seasonal hand-brew.",
    tags: ["CULTURE", "NATURE"],
    active: true,
  },
  {
    n: "02",
    day: "Tuesday",
    title: "Philosopher's Path & Tea",
    body: "A contemplative walk through Higashiyama. Evening: local jazz haunt 'Yamatoya'.",
    tags: ["HERITAGE", "MUSIC"],
    active: false,
  },
  {
    n: "03",
    day: "Wednesday",
    title: "Fushimi Inari at Dawn",
    body: "Ten thousand torii gates in silence. Return via a family-run udon shop tucked in the hillside.",
    tags: ["ATTRACTION", "FOOD"],
    active: false,
  },
];

const TIERS = [
  {
    code: "CLASS_01",
    name: "Budget-Friendly",
    price: "$",
    tag: "budget",
    body: "Hidden gems, local transit, and street-food narratives.",
    items: ["AI Transit Maps", "Hostel Curations", "Free Walking Tours"],
  },
  {
    code: "CLASS_02",
    name: "Mid-Range",
    price: "$$",
    tag: "mid",
    body: "Boutique stays, rhythmic dining, and local heritage sites.",
    items: ["Ryokan Bookings", "Workshop Entry", "Curated Dining"],
    featured: true,
  },
  {
    code: "CLASS_03",
    name: "Premium",
    price: "$$$",
    tag: "premium",
    body: "Luxury escapes, private guides, and sensory indulgence.",
    items: ["Chauffeur Service", "5-Star Logs", "VIP Site Access"],
  },
  {
    code: "CLASS_XX",
    name: "Custom",
    price: "?",
    tag: "custom",
    body: "Tell the AI your weirdest dreams and we'll map them.",
    items: ["Anything You Want"],
    dark: true,
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ephemera — AI Trip Journals & Itineraries" },
      {
        name: "description",
        content:
          "AI-crafted travel itineraries that feel like hand-annotated journals. Plan your next unfolding story.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="w-full px-8 py-12 space-y-24">
      {/* Hero + live preview */}
      <section className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-8 animate-reveal">
          <h1 className="text-5xl md:text-7xl font-serif italic text-balance leading-[0.9]">
            Plan your next
            <br />
            unfolding story.
          </h1>
          <p className="max-w-[38ch] text-muted-foreground text-lg">
            AI-crafted itineraries that feel like hand-annotated journals. Attractions, culture, local events,
            and fun — one uniquely-plotted day at a time.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-foreground text-background py-3 px-6 rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-accent transition-all active:scale-95"
            >
              Start planning <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 border border-border py-3 px-6 rounded-xl font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
            <Feature icon={<Sparkles className="size-4" />} label="AI-authored" />
            <Feature icon={<MapPin className="size-4" />} label="Any destination" />
            <Feature icon={<ScrollText className="size-4" />} label="Day-by-day" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6 animate-reveal [animation-delay:150ms]">
          <div className="relative rounded-2xl overflow-hidden ring-1 ring-border">
            <img
              src={heroJournal}
              alt="Open travel journal with pressed flowers, compass, and Kyoto postcards"
              width={1024}
              height={1024}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/80 bg-background/70 backdrop-blur px-2 py-1 rounded">
                LOG_KYOTO · SPRING '26
              </span>
              <span className="font-serif italic text-lg text-foreground/90">Vol. 03</span>
            </div>
          </div>

          <div className="flex justify-between items-end border-b-2 border-dashed border-border pb-4">
            <div className="font-serif italic text-2xl">Kyoto: The Zen Path</div>
          </div>

          <div className="space-y-4">
            {SAMPLE_DAYS.map((d, i) => (
              <div
                key={d.n}
                className={`bg-card p-6 rounded-xl ring-1 ring-border flex gap-6 transition-all ${
                  d.active ? "hover:ring-accent/30" : "opacity-60"
                }`}
              >
                <img
                  src={DAY_IMAGES[i]}
                  alt={d.title}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="hidden sm:block size-20 rounded-lg object-cover shrink-0 ring-1 ring-border"
                />
                <div className={`font-mono shrink-0 ${d.active ? "text-accent" : "text-muted-foreground"}`}>
                  <div className="text-2xl font-bold">{d.n}</div>
                  <div className="text-[10px] uppercase tracking-tighter opacity-60">{d.day}</div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-serif text-xl">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
                  <div className="flex gap-2 flex-wrap">
                    {d.tags.map((t) => (
                      <span key={t} className="px-2 py-1 bg-background text-[10px] font-mono rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="space-y-12 animate-reveal">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl italic">Select your fare class</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            Curated depth levels for every traveler
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((t) => (
            <Link
              key={t.code}
              to="/planner"
              search={{ tier: t.tag } as never}
              className={`ticket-cutout p-8 rounded-lg space-y-6 hover:-translate-y-2 transition-transform relative block ${
                t.dark
                  ? "bg-foreground text-background"
                  : t.featured
                  ? "bg-card border-2 border-accent"
                  : "bg-card border border-border"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[9px] font-mono px-3 py-1 rounded-full uppercase tracking-widest">
                  Recommended
                </span>
              )}
              <div className="flex justify-between items-start">
                <div className={`font-mono text-xs ${t.dark ? "opacity-60" : "text-muted-foreground"}`}>
                  {t.code}
                </div>
                <div className="text-accent font-bold text-xl">{t.price}</div>
              </div>
              <div>
                <h4 className="font-serif text-2xl">{t.name}</h4>
                <p className={`text-xs mt-2 ${t.dark ? "opacity-60" : "text-muted-foreground"}`}>{t.body}</p>
              </div>
              <div
                className={`pt-4 border-t border-dashed ${
                  t.dark ? "border-background/20" : "border-border"
                }`}
              >
                <div
                  className={`text-[10px] font-mono uppercase ${
                    t.dark ? "opacity-60" : "text-muted-foreground"
                  }`}
                >
                  Included:
                </div>
                <ul className="text-[11px] space-y-1 mt-2 font-medium opacity-80 uppercase tracking-tight">
                  {t.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-12 animate-reveal">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 border-dashed border-border pb-6">
          <div>
            <h2 className="font-serif italic text-4xl md:text-5xl mt-2">Everything the journal remembers.</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ephemera stitches together the details other planners forget — culture, cadence, and quiet corners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Sparkles className="size-5" />,
              tag: "FEAT_01",
              title: "AI-authored day plans",
              body: "Each day is composed with a narrative arc — morning light, midday depth, evening rest.",
            },
            {
              icon: <Compass className="size-5" />,
              tag: "FEAT_02",
              title: "Attractions & hidden corners",
              body: "Iconic sites paired with the family-run tea house tucked three streets away.",
            },
            {
              icon: <BookOpen className="size-5" />,
              tag: "FEAT_03",
              title: "Culture & heritage lens",
              body: "Context on temples, rituals, and neighborhoods so you arrive already listening.",
            },
            {
              icon: <MapPin className="size-5" />,
              tag: "FEAT_04",
              title: "Local events, in season",
              body: "Festivals, night markets, and gallery openings surfaced for your dates.",
            },
            {
              icon: <Wallet className="size-5" />,
              tag: "FEAT_05",
              title: "Fare-class tiers",
              body: "Budget, mid-range, premium, or a custom blend — the itinerary reshapes to fit.",
            },
            {
              icon: <Feather className="size-5" />,
              tag: "FEAT_06",
              title: "Save & revisit journals",
              body: "Every generated log lands in your archive, ready to reread or refine.",
            },
          ].map((f) => (
            <div
              key={f.tag}
              className="bg-card p-6 rounded-xl ring-1 ring-border hover:ring-accent/40 hover:-translate-y-1 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-accent">{f.icon}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{f.tag}</span>
              </div>
              <h3 className="font-serif text-xl">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — step-by-step */}
      <section id="how-it-works" className="space-y-12 animate-reveal">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 border-dashed border-border pb-6">
          <div>
            <h2 className="font-serif italic text-4xl md:text-5xl mt-2">From prompt to plotted days.</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Five small steps between an empty page and a hand-annotated route through your next city.
          </p>
        </div>

        <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { n: "01", title: "Describe your journey", body: "Destination, days, travelers, and any wishes." },
            { n: "02", title: "Choose a fare class", body: "Budget, mid-range, premium, or fully custom." },
            { n: "03", title: "Confirm your ticket", body: "Purchase the plan to unlock generation." },
            { n: "04", title: "AI drafts the log", body: "Culture, attractions, food, and events, day by day." },
            { n: "05", title: "Save & wander", body: "Archive to your profile and adjust anytime." },
          ].map((s, i) => (
            <li key={s.n} className="relative p-6 border-t border-border">
              <div className="font-mono text-xs text-accent">STEP_{s.n}</div>
              <h3 className="font-serif text-xl mt-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.body}</p>
              {i < 4 && (
                <ArrowRight className="hidden lg:block size-4 text-muted-foreground absolute -right-3 top-8" />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Stories */}
      <section id="stories" className="space-y-12 animate-reveal">
        <div className="relative rounded-3xl overflow-hidden ring-1 ring-border">
          <img
            src={postcards}
            alt="Vintage postcards, stamps, and pressed leaves"
            width={1024}
            height={1024}
            loading="lazy"
            className="w-full h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Section 05 · Field notes
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl mt-2 max-w-xl">
              Postcards from past travelers.
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-3">
              Journals shared back after the trip — unedited, in their words.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Amara O.",
              trip: "Lisbon, 6 days // Mid-Range",
              stamp: "LOG_047",
              quote:
                "The Alfama walk on day two led us to a fado bar we'd never have found. It felt like the AI had actually been there.",
            },
            {
              name: "Ravi & Meera",
              trip: "Kyoto, 8 days // Premium",
              stamp: "LOG_063",
              quote:
                "Every morning had a rhythm — temple, tea, wander. The pacing alone was worth the fare class.",
            },
            {
              name: "Sofia L.",
              trip: "Oaxaca, 5 days // Budget",
              stamp: "LOG_071",
              quote:
                "Street food routes, mercado hours, a mezcal tasting under $12. Best trip I've booked solo, honestly.",
            },
            {
              name: "Jonas K.",
              trip: "Reykjavík, 4 days // Custom",
              stamp: "LOG_082",
              quote:
                "I asked for 'quiet, cold, and geothermal.' It delivered a whole day I still think about.",
            },
            {
              name: "Priya S.",
              trip: "Istanbul, 7 days // Mid-Range",
              stamp: "LOG_089",
              quote:
                "The heritage notes on each mosque made the visits mean something. Not a checklist — a story.",
            },
            {
              name: "Marco D.",
              trip: "Buenos Aires, 6 days // Premium",
              stamp: "LOG_094",
              quote:
                "Milonga on Wednesday, parrilla on Friday, siesta built in. My kind of itinerary.",
            },
          ].map((s) => (
            <figure
              key={s.stamp}
              className="bg-card p-6 rounded-xl ring-1 ring-border space-y-4 hover:ring-accent/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <Quote className="size-5 text-accent" />
                <span className="font-mono text-[10px] text-muted-foreground">{s.stamp}</span>
              </div>
              <blockquote className="font-serif italic text-lg leading-snug">&ldquo;{s.quote}&rdquo;</blockquote>
              <figcaption className="pt-4 border-t border-dashed border-border">
                <div className="font-serif text-base">{s.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {s.trip}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="bg-foreground text-background rounded-3xl overflow-hidden animate-reveal">
        <div className="p-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-serif italic">Save your wandering thoughts.</h2>
            <p className="opacity-70 max-w-[36ch]">
              Create an account to save generated journals, revisit past trips, and sync with your logbook.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground py-4 px-8 rounded-lg font-mono uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
            >
              Draft an itinerary <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-tight text-muted-foreground">
      <span className="text-accent">{icon}</span>
      {label}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-start gap-8">
      <div className="space-y-2">
        <span className="font-serif italic text-2xl">Ephemera.</span>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-tighter">
          © 2026 Digital Artifacts Co.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-16">
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Navigation</div>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link to="/planner" className="hover:text-accent transition-colors">
                Planner
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-accent transition-colors">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-accent transition-colors">
                Settings
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Account</div>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link to="/auth" className="hover:text-accent transition-colors">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
