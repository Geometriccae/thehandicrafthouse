import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { useShop } from "@/lib/shop-store";
import { categories, formatPrice, normalizeCategoryId, products, type CategoryId } from "@/data/products";

type Search = { category?: CategoryId | "all"; sort?: "featured" | "low" | "high" | "rating" };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: (search['category'] as Search['category']) || "all",
    sort: (search['sort'] as Search['sort']) || "featured",
  }),
  head: () => ({
    meta: [
      { title: "Shop Bamboo Lamps, Furniture & Décor — The Handicraft House" },
      {
        name: "description",
        content:
          "Browse handcrafted bamboo lighting, kitchenware, storage, furniture and gifts. Filter by room and price.",
      },
      { property: "og:title", content: "Shop Handcrafted Bamboo — The Handicraft House" },
      {
        property: "og:description",
        content: "Handmade bamboo lighting, furniture, storage and gifts from independent artisans.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category = "all", sort = "featured" } = Route.useSearch();
  const { products: liveProducts } = useShop();
  const allProducts = liveProducts && liveProducts.length > 0 ? liveProducts : products;

  // Calculate highest price dynamically across catalogue so no product is hidden by default
  const maxAvailablePrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 5000;
    const max = Math.max(...allProducts.map((p) => p.price || 0));
    return Math.max(max, 5000);
  }, [allProducts]);

  // Track user-adjusted price ceiling; null means show all products without restriction
  const [userMaxPrice, setUserMaxPrice] = useState<number | null>(null);
  const currentMaxPrice = userMaxPrice !== null ? userMaxPrice : maxAvailablePrice;

  const list = useMemo(() => {
    let out = allProducts;
    if (userMaxPrice !== null) {
      out = out.filter((p) => p.price <= userMaxPrice);
    }
    if (category !== "all") {
      const target = normalizeCategoryId(category);
      out = out.filter((p) => normalizeCategoryId(p.category) === target);
    }
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "rating") out = [...out].sort((a, b) => b.rating - a.rating);
    return out;
  }, [allProducts, category, sort, userMaxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <Reveal>
        <p className="eyebrow">The shop</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl">Every piece, made by hand</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {list.length} pieces available. Each one signed by its maker.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div>
            <h2 className="eyebrow">Category</h2>
            <div className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              <Link
                to="/shop"
                search={{ category: "all", sort }}
                className={`rounded-full px-4 py-2 font-ui text-sm transition-colors ${
                  category === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                All products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ category: c.id, sort }}
                  className={`rounded-full px-4 py-2 font-ui text-sm transition-colors ${
                    category === c.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="eyebrow">Max price</h2>
            <input
              type="range"
              min={0}
              max={maxAvailablePrice}
              step={maxAvailablePrice > 5000 ? 100 : 50}
              value={currentMaxPrice}
              onChange={(e) => setUserMaxPrice(Number(e.target.value))}
              className="mt-4 w-full accent-primary"
            />
            <p className="mt-1 font-ui text-sm text-muted-foreground">up to {formatPrice(currentMaxPrice)}</p>
          </div>

          <div>
            <h2 className="eyebrow">Sort</h2>
            <div className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {([
                ["featured", "Featured"],
                ["low", "Price: low to high"],
                ["high", "Price: high to low"],
                ["rating", "Top rated"],
              ] as const).map(([key, label]) => (
                <Link
                  key={key}
                  to="/shop"
                  search={{ category, sort: key }}
                  className={`rounded-full px-4 py-2 font-ui text-sm transition-colors ${
                    sort === key ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {list.length === 0 ? (
            <p className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
              Nothing matches those filters yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
