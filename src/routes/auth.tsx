import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Enter a valid email address." }).max(255);
const nameSchema = z.string().trim().min(1, { message: "Name is required." }).max(80);
const passwordSchema = z.string().min(6, { message: "At least 6 characters." }).max(120);

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ephemera" },
      {
        name: "description",
        content: "Sign in or create your Ephemera account to save AI trip journals.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useSession();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const emailR = emailSchema.safeParse(email);
      if (!emailR.success) throw new Error(emailR.error.issues[0].message);
      const passR = passwordSchema.safeParse(password);
      if (!passR.success) throw new Error(passR.error.issues[0].message);
      let derivedName: string | undefined;
      if (mode === "signup") {
        const nameR = nameSchema.safeParse(name);
        if (!nameR.success) throw new Error(nameR.error.issues[0].message);
        derivedName = nameR.data;
      }
      signIn(emailR.data, derivedName);
      toast.success(mode === "signup" ? "Welcome to Ephemera." : "Welcome back.");
      navigate({ to: "/planner" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full px-8 py-12 grid md:grid-cols-2 gap-10 items-stretch">
      <section className="hidden md:flex flex-col justify-between bg-foreground text-background rounded-3xl p-10 animate-reveal">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
            Passport // 001
          </div>
          <h1 className="mt-6 font-serif italic text-5xl leading-[0.95]">
            Every journey is a<br />
            written story.
          </h1>
          <p className="mt-6 opacity-70 max-w-[36ch]">
            Sign in to save your AI-authored itineraries, revisit past journeys, and sync your
            travel log.
          </p>
        </div>
        <ul className="space-y-3 text-sm opacity-80">
          {[
            "Save unlimited journals",
            "Personalized to your fare class",
            "One tap to regenerate",
          ].map((s) => (
            <li key={s} className="flex gap-3">
              <span className="text-accent font-mono">→</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card ring-1 ring-border rounded-3xl p-10 animate-reveal [animation-delay:100ms]">
        <h2 className="mt-3 font-serif italic text-4xl">
          {mode === "signin" ? "Welcome back." : "Begin your archive."}
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {mode === "signup" && (
            <Field label="Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-serif text-lg italic placeholder:text-muted-foreground/60"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-mono text-sm placeholder:text-muted-foreground/60"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent font-mono text-sm placeholder:text-muted-foreground/60"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background py-4 rounded-xl font-mono uppercase tracking-widest hover:bg-accent transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Signing in…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-xs">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-mono uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
          >
            {mode === "signin" ? "Create account" : "Have an account? Sign in"}
          </button>
          <Link
            to="/"
            className="font-mono uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
