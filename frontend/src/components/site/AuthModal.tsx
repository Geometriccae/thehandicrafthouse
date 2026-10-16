import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useShop } from "@/lib/shop-store";

export function AuthModal() {
  const { authOpen, closeAuth } = useShop();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!authOpen) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name },
        },
      });
      if (err) setError(err.message);
      else if (!data.session) setMessage("Check your inbox to confirm your email, then sign in.");
      else closeAuth();
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else closeAuth();
    }
    setBusy(false);
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    closeAuth();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={closeAuth}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lift">
        <button
          onClick={closeAuth}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="eyebrow">The Handicraft House account</p>
        <h2 className="mt-2 font-display text-3xl">
          {mode === "signin" ? "Welcome back" : "Join the studio"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to save pieces to your cart and wishlist.
        </p>

        <button onClick={() => void google()} className="btn-pill btn-ghost mt-6 w-full">
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.6Z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-primary">{message}</p>}
          <button disabled={busy} className="btn-pill btn-solid w-full disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to The Handicraft House?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
            className="link-underline text-foreground"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
