import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star } from "lucide-react";
import { formatPrice, type Product } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const saved = isWishlisted(product.id);

  return (
    <article className="card-lift group relative overflow-hidden rounded-3xl border border-border bg-card">
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        className="zoom-frame block aspect-4/5 overflow-hidden bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={1100}
          className="h-full w-full object-cover"
        />
      </Link>

      {product.badge && (
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 font-ui text-[0.62rem] uppercase tracking-[0.16em] text-foreground backdrop-blur">
          {product.badge}
        </span>
      )}

      <button
        onClick={() => void toggleWishlist(product.id)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-transform hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
      </button>

      <div className="p-5">
        <div className="flex items-center gap-1.5 font-ui text-[0.7rem] text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {product.rating} · {product.reviews} reviews
        </div>
        <h3 className="mt-2 font-display text-lg leading-snug">
          <Link to="/product/$productId" params={{ productId: product.id }}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-ui text-base">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="font-ui text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
          <button
            onClick={() => void addToCart(product.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
