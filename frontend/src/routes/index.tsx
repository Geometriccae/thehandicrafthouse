import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf as LeafIcon, Recycle, ShieldCheck, Sprout, Star, Truck } from "lucide-react";
import hero from "@/assets/bamboo-hero.jpg";
import artisanImg from "@/assets/artisan-bamboo.jpg";
import { Reveal } from "@/components/site/Reveal";
import { Leaf } from "@/components/site/Leaf";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Handicraft House — Premium Handcrafted Bamboo Living" },
      {
        name: "description",
        content:
          "Luxury bamboo lamps, furniture, kitchenware and décor, handwoven by independent artisans. Sustainable, plastic-free, made to last.",
      },
      { property: "og:title", content: "The Handicraft House — Premium Handcrafted Bamboo Living" },
      {
        property: "og:description",
        content:
          "Luxury bamboo lamps, furniture, kitchenware and décor, handwoven by independent artisans.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const bestsellers = products.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Handwoven bamboo interior bathed in warm light"
            width={1600}
            height={1000}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/45 to-transparent" />
        </div>
        <Leaf className="right-8 top-24 hidden h-40 w-28 text-primary-foreground md:block" />
        <Leaf className="bottom-16 right-40 hidden h-28 w-20 text-primary-foreground lg:block" delay={3} />

        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-center px-5 py-24 md:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow !text-[oklch(0.88_0.05_120)]">Handwoven since 1974</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-[oklch(0.98_0.014_85)] md:text-7xl">
              Bamboo, shaped slowly<br />into things you keep.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[oklch(0.92_0.02_90)]">
              Every lamp, basket and chair is cut, cured and woven by hand in small artisan
              workshops. Fast growing, plastic-free, and quietly beautiful.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-pill btn-solid">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="btn-pill border border-[oklch(0.98_0.014_85_/_0.5)] text-[oklch(0.98_0.014_85)] hover:bg-[oklch(0.98_0.014_85_/_0.12)]"
              >
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-2 md:grid-cols-4 md:px-8">
          {[
            { icon: Sprout, label: "Grown in 5 years", sub: "not 50, like hardwood" },
            { icon: Recycle, label: "Plastic-free", sub: "packaging, always" },
            { icon: Truck, label: "Carbon-neutral", sub: "delivery worldwide" },
            { icon: ShieldCheck, label: "10-year care", sub: "free repairs on frames" },
          ].map((f, i) => (
            <Reveal key={f.label} delay={i * 80} className="flex items-center gap-3">
              <f.icon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-ui text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">Shop by room, not by trend</h2>
          </div>
          <Link to="/collections" className="link-underline font-ui text-sm uppercase tracking-[0.14em]">
            All collections
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link
                to="/shop"
                search={{ category: c.id }}
                className="zoom-frame card-lift group relative block aspect-4/3 overflow-hidden rounded-3xl"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl text-[oklch(0.98_0.014_85)]">{c.name}</h3>
                  <p className="mt-1 text-sm text-[oklch(0.9_0.02_90)]">{c.blurb}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="grad-warm border-y border-border">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <Reveal className="text-center">
            <p className="eyebrow">Loved most</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">This season's favourites</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Link to="/shop" className="btn-pill btn-ghost">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Artisan story */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 md:grid-cols-2 md:px-8">
        <Reveal className="zoom-frame overflow-hidden rounded-[2rem]">
          <img
            src={artisanImg}
            alt="Artisan weaving bamboo strips in a sunlit workshop"
            loading="lazy"
            width={1200}
            height={1200}
            className="h-full w-full object-cover"
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow">The makers</p>
          <h2 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
            Nine hours of weaving for a single shade.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            We work with 42 artisan families across Assam, Bali, Kyoto and Hue. Every maker sets
            their own price, signs their own work, and keeps their own pattern. Nothing here is
            mass produced — and the small differences are the point.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              { n: "42", l: "artisan families" },
              { n: "5 yrs", l: "bamboo maturity" },
              { n: "0", l: "plastic in packaging" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl text-primary">{s.n}</p>
                <p className="mt-1 font-ui text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
          <Link to="/artisans" className="btn-pill btn-solid mt-9">
            Meet the artisans
          </Link>
        </Reveal>
      </section>

      {/* Sustainability band */}
      <section className="grad-bamboo relative overflow-hidden">
        <Leaf className="-left-6 top-6 h-48 w-32 text-primary-foreground" />
        <Leaf className="-right-4 bottom-0 h-56 w-36 text-primary-foreground" delay={4} />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center md:px-8">
          <Reveal>
            <LeafIcon className="mx-auto h-6 w-6 text-primary-foreground" />
            <h2 className="mt-5 font-display text-4xl text-primary-foreground md:text-5xl">
              A material that grows back before you finish the room.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[oklch(0.95_0.02_120)]">
              Bamboo regenerates from its own root system, absorbs up to 35% more CO₂ than an
              equivalent stand of trees, and needs no replanting. We harvest only mature culms.
            </p>
            <Link
              to="/sustainability"
              className="btn-pill mt-9 bg-[oklch(0.98_0.014_85)] text-primary hover:opacity-95"
            >
              Read our impact report
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">Kind words</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">From homes like yours</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              q: "The pendant lamp changed the whole feeling of our living room. The shadows it casts are unreal.",
              n: "Ilse V.",
              c: "Rotterdam",
            },
            {
              q: "You can feel the hours in it. Third piece I've bought and every one arrived perfectly wrapped.",
              n: "Marcus O.",
              c: "Melbourne",
            },
            {
              q: "I ordered the gift box for my mother and she called me twice about the note card.",
              n: "Priya S.",
              c: "Bengaluru",
            },
          ].map((r, i) => (
            <Reveal key={r.n} delay={i * 80}>
              <figure className="card-lift h-full rounded-3xl border border-border bg-card p-7">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="mt-4 font-display text-xl leading-snug">"{r.q}"</blockquote>
                <figcaption className="mt-5 font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {r.n} · {r.c}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
