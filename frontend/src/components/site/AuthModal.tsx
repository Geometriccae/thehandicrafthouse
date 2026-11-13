import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useShop } from "@/lib/shop-store";
import { getApiBaseUrl } from "@/lib/api";

export function AuthModal() {
  const { authOpen, closeAuth, setUserSession } = useShop();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!authOpen) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const baseUrl = getApiBaseUrl();

    try {
      if (mode === "signup") {
        const res = await fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to create account. Please check your details.");
          setBusy(false);
          return;
        }

        // Account created & auto-logged in with JWT
        if (data.token && data.user) {
          setUserSession(data.user, data.token);
          closeAuth();
        } else {
          setMessage("Account created successfully. Please sign in.");
          setMode("signin");
        }
      } else {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Invalid email or password");
          setBusy(false);
          return;
        }

        if (data.token && data.user) {
          setUserSession(data.user, data.token);
          closeAuth();
        } else {
          setError("Failed to initialize session. Please try again.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Please check your internet connection.");
    } finally {
      setBusy(false);
    }
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

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <input
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={phone}
                type="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </>
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
            placeholder="Password (minimum 6 characters)"
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
