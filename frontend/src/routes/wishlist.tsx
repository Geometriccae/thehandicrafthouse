import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — The Handicraft House" },
      { name: "description", content: "The handcrafted bamboo pieces you've saved for later." },
      { property: "og:title", content: "Your Wishlist — The Handicraft House" },
      { property: "og:description", content: "Bamboo pieces saved for later." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist, user, openAuth } = useShop();
  const items = wishlist.map(getProduct).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <Reveal>
        <p className="eyebrow">Saved</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl">Your wishlist</h1>
      </Reveal>

      {!user ? (
        <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Sign in to see the pieces you've saved.</p>
          <button onClick={openAuth} className="btn-pill btn-solid mt-6">Sign in</button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Nothing saved yet.</p>
          <Link to="/shop" className="btn-pill btn-solid mt-6">Browse the shop</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p!.id} delay={i * 60}>
              <ProductCard product={p!} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
