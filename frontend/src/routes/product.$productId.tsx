import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, RotateCw, Star, Truck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { formatPrice, getProduct, products } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — The Handicraft House" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — The Handicraft House` },
        { name: "description", content: p.tagline },
        { property: "og:title", content: `${p.name} — The Handicraft House` },
        { property: "og:description", content: p.tagline },
      ],
    };
  },
  component: ProductPage,
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="font-display text-3xl">This product didn't load</h1>
      <Link to="/shop" className="btn-pill btn-solid mt-6">Back to shop</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="font-display text-3xl">We can't find that piece</h1>
      <Link to="/shop" className="btn-pill btn-solid mt-6">Back to shop</Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [qty, setQty] = useState(1);
  const [spin, setSpin] = useState(0);
  const saved = isWishlisted(product.id);
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <nav className="font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> ·{" "}
        <Link to="/shop" className="hover:text-foreground">Shop</Link> · {product.name}
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              width={900}
              height={1100}
              style={{ transform: `rotate(${spin}deg)` }}
              className="h-full w-full object-cover transition-transform duration-700"
            />
          </div>
          <button
            onClick={() => setSpin((s) => s + 90)}
            className="btn-pill btn-ghost mt-4 w-full"
          >
            <RotateCw className="h-4 w-4" /> Rotate view
          </button>
        </Reveal>

        <Reveal delay={100}>
          <p className="eyebrow">{product.origin}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 font-ui text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {product.rating} · {product.reviews} reviews · by {product.artisan}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="font-ui text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.tagline}</p>
          <p className="mt-3 leading-relaxed text-muted-foreground">{product.story}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-border px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-ui text-sm">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => void addToCart(product.id, qty)} className="btn-pill btn-solid flex-1 min-w-48">
              Add to cart
            </button>
            <button
              onClick={() => void toggleWishlist(product.id)}
              className="btn-pill btn-ghost"
              aria-label="Save to wishlist"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 font-ui text-xs text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" /> Free carbon-neutral delivery · {product.stock} in stock
          </p>

          <dl className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
            <div>
              <dt className="eyebrow">Details</dt>
              <dd className="mt-2 space-y-1 text-muted-foreground">
                {product.details.map((d: string) => (
                  <p key={d}>· {d}</p>
                ))}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Dimensions</dt>
              <dd className="mt-1 text-muted-foreground">{product.dimensions}</dd>
            </div>
            <div>
              <dt className="eyebrow">Care</dt>
              <dd className="mt-1 text-muted-foreground">{product.care}</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <section className="mt-24">
        <h2 className="font-display text-3xl">You may also like</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
