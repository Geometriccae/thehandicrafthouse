import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { categories, products } from "@/data/products";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Bamboo Collections by Room — The Handicraft House" },
      {
        name: "description",
        content:
          "Explore The Handicraft House collections: lighting, kitchen and dining, storage, furniture, office, décor and gifting.",
      },
      { property: "og:title", content: "Bamboo Collections by Room — The Handicraft House" },
      { property: "og:description", content: "Seven handcrafted bamboo collections, one for every room." },
    ],
  }),
  component: Collections,
});

function Collections() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <Reveal>
        <p className="eyebrow">Collections</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl">Seven ways to live with bamboo</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Each collection is built around one room and one rhythm of use.
        </p>
      </Reveal>

      <div className="mt-14 space-y-6">
        {categories.map((c, i) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <Reveal key={c.id} delay={i * 60}>
              <Link
                to="/shop"
                search={{ category: c.id, sort: "featured" }}
                className="card-lift zoom-frame group grid overflow-hidden rounded-[2rem] border border-border bg-card md:grid-cols-[1fr_1.4fr]"
              >
                <div className="aspect-4/3 overflow-hidden md:aspect-auto">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    width={900}
                    height={1100}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <p className="eyebrow">{count} piece{count === 1 ? "" : "s"}</p>
                  <h2 className="mt-2 font-display text-3xl md:text-4xl">{c.name}</h2>
                  <p className="mt-3 text-muted-foreground">{c.blurb}</p>
                  <span className="link-underline mt-6 w-fit font-ui text-sm uppercase tracking-[0.14em]">
                    Explore collection
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
