import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — The Handicraft House" },
      { name: "description", content: "Manage your Handicraft House account, cart and saved pieces." },
      { property: "og:title", content: "Your Account — The Handicraft House" },
      { property: "og:description", content: "Manage your Handicraft House account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, loadingSession, cartCount, wishlist, signOut, openAuth } = useShop();

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 md:px-8">
      <Reveal>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl">
          {user ? "Welcome back" : "Your account"}
        </h1>
      </Reveal>

      {loadingSession ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : !user ? (
        <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Sign in to see your cart and saved pieces.</p>
          <button onClick={openAuth} className="btn-pill btn-solid mt-6">Sign in</button>
        </div>
      ) : (
        <div className="mt-12 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="eyebrow">Signed in as</p>
            <p className="mt-2 font-display text-2xl">{user.email}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Link to="/cart" className="card-lift rounded-3xl border border-border bg-card p-8">
              <p className="font-display text-4xl text-primary">{cartCount}</p>
              <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">items in cart</p>
            </Link>
            <Link to="/wishlist" className="card-lift rounded-3xl border border-border bg-card p-8">
              <p className="font-display text-4xl text-primary">{wishlist.length}</p>
              <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">saved pieces</p>
            </Link>
          </div>
          <button onClick={() => void signOut()} className="btn-pill btn-ghost">Sign out</button>
        </div>
      )}
    </div>
  );
}
