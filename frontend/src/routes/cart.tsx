import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { formatPrice, getProduct } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — The Handicraft House" },
      { name: "description", content: "Review your handcrafted bamboo pieces and check out." },
      { property: "og:title", content: "Your Cart — The Handicraft House" },
      { property: "og:description", content: "Review your bamboo pieces and check out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { cart, cartTotal, setQuantity, removeFromCart, user, openAuth } = useShop();
  const [placed, setPlaced] = useState(false);
  const shipping = cartTotal > 250 || cartTotal === 0 ? 0 : 18;

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <Reveal>
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl">Your cart</h1>
      </Reveal>

      {!user ? (
        <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Sign in to view your cart.</p>
          <button onClick={openAuth} className="btn-pill btn-solid mt-6">Sign in</button>
        </div>
      ) : cart.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Your cart is quietly empty.</p>
          <Link to="/shop" className="btn-pill btn-solid mt-6">Browse the shop</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            {cart.map((line) => {
              const p = getProduct(line.productId);
              if (!p) return null;
              return (
                <div key={line.productId} className="flex gap-5 rounded-3xl border border-border bg-card p-5">
                  <img src={p.image} alt={p.name} loading="lazy" width={900} height={1100} className="h-32 w-24 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <Link to="/product/$productId" params={{ productId: p.id }} className="font-display text-xl link-underline">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{p.origin} · {p.artisan}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={() => void setQuantity(p.id, line.quantity - 1)} className="rounded-full border border-border p-1.5" aria-label="Decrease">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-ui text-sm">{line.quantity}</span>
                      <button onClick={() => void setQuantity(p.id, line.quantity + 1)} className="rounded-full border border-border p-1.5" aria-label="Increase">
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="ml-auto font-ui">{formatPrice(p.price * line.quantity)}</span>
                      <button onClick={() => void removeFromCart(p.id)} className="rounded-full p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-3xl border border-border bg-card p-7 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">Summary</h2>
            <dl className="mt-5 space-y-3 font-ui text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base"><dt>Total</dt><dd>{formatPrice(cartTotal + shipping)}</dd></div>
            </dl>
            <button onClick={() => setPlaced(true)} className="btn-pill btn-solid mt-6 w-full">
              Place order
            </button>
            {placed && (
              <p className="mt-4 text-sm text-primary">
                Order noted. Our studio will confirm by email and WhatsApp shortly.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Free carbon-neutral delivery on orders over $250.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
