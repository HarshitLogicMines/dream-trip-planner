import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type Prefs = {
  emailUpdates: boolean;
  darkMode: boolean;
  defaultTier: "budget" | "mid" | "premium" | "custom";
  units: "metric" | "imperial";
};

const DEFAULTS: Prefs = {
  emailUpdates: true,
  darkMode: false,
  defaultTier: "mid",
  units: "metric",
};

const KEY = "ephemera.prefs";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — Ephemera" }, { name: "robots", content: "noindex" }],
  }),
  component: Settings,
});

function Settings() {
  const { user, signOut } = useSession();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      // Ignore parsing errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(prefs));
    document.documentElement.classList.toggle("dark", prefs.darkMode);
  }, [prefs, hydrated]);

  return (
    <main className="w-full px-8 py-12 space-y-12">
      <header className="animate-reveal">
        <h1 className="text-4xl md:text-5xl font-serif italic mt-4">Tune your journal.</h1>
      </header>

      <section className="animate-reveal">
        <SectionTitle>Account</SectionTitle>
        <div className="bg-card ring-1 ring-border rounded-xl divide-y divide-border">
          <Row label="Email">
            <span className="font-mono text-sm">{user?.email ?? "Not signed in"}</span>
          </Row>
          <Row label="Display name">
            <span className="font-serif text-lg italic">{user?.name ?? "—"}</span>
          </Row>
          <Row label="Session">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  toast.success("Signed out.");
                }}
                className="font-mono text-[10px] uppercase tracking-widest text-accent hover:opacity-80"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="font-mono text-[10px] uppercase tracking-widest text-accent hover:opacity-80"
              >
                Sign in
              </Link>
            )}
          </Row>
        </div>
      </section>

      <section className="animate-reveal">
        <SectionTitle>Preferences</SectionTitle>
        <div className="bg-card ring-1 ring-border rounded-xl divide-y divide-border">
          <Row label="Dark mode" description="Switch the journal to an evening palette.">
            <Switch
              checked={prefs.darkMode}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, darkMode: v }))}
            />
          </Row>
          <Row label="Email updates" description="Trip inspiration and product news.">
            <Switch
              checked={prefs.emailUpdates}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, emailUpdates: v }))}
            />
          </Row>
          <Row label="Default fare class" description="Pre-select this tier on the planner.">
            <select
              value={prefs.defaultTier}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, defaultTier: e.target.value as Prefs["defaultTier"] }))
              }
              className="bg-background border border-border rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest"
            >
              <option value="budget">Budget</option>
              <option value="mid">Mid-Range</option>
              <option value="premium">Premium</option>
              <option value="custom">Custom</option>
            </select>
          </Row>
          <Row label="Units">
            <select
              value={prefs.units}
              onChange={(e) => setPrefs((p) => ({ ...p, units: e.target.value as Prefs["units"] }))}
              className="bg-background border border-border rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </Row>
        </div>
      </section>

      <section className="animate-reveal">
        <SectionTitle>Danger zone</SectionTitle>
        <div className="bg-card ring-1 ring-destructive/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-serif text-lg">Reset preferences</div>
            <p className="text-sm text-muted-foreground">Restore defaults for this device.</p>
          </div>
          <button
            onClick={() => {
              setPrefs(DEFAULTS);
              toast.success("Preferences reset.");
            }}
            className="font-mono text-[10px] uppercase tracking-widest bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:opacity-90"
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-end border-b-2 border-dashed border-border pb-3 mb-4">
      <h2 className="font-serif italic text-2xl">{children}</h2>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 flex items-center justify-between gap-6">
      <div>
        <div className="font-serif text-base">{label}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
