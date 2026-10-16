import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import artisanImg from "@/assets/artisan-bamboo.jpg";

const makers = [
  {
    name: "Meera Devi",
    craft: "Coiled lighting",
    place: "Assam, India",
    years: 27,
    bio: "Learned to coil from her grandmother at nine. Her shades take nine hours each and never repeat exactly.",
  },
  {
    name: "Kenji Aoki",
    craft: "Steam-bent furniture",
    place: "Kyoto, Japan",
    years: 34,
    bio: "Bends structural bamboo without a single screw. Releases only nine chairs a month.",
  },
  {
    name: "Sri Wahyuni",
    craft: "Twill basketry",
    place: "Bali, Indonesia",
    years: 19,
    bio: "Leads a cooperative of eleven weavers whose pattern has passed through four generations.",
  },
  {
    name: "Thanh Pham",
    craft: "Cold-pressed boards",
    place: "Hue, Vietnam",
    years: 22,
    bio: "Obsessive about culm age — he will reject a whole harvest if the fibre density is off.",
  },
];

export const Route = createFileRoute("/artisans")({
  head: () => ({
    meta: [
      { title: "Meet the Artisans — The Handicraft House" },
      {
        name: "description",
        content:
          "The 42 artisan families behind The Handicraft House: weavers, benders and carvers across India, Japan, Indonesia and Vietnam.",
      },
      { property: "og:title", content: "Meet the Artisans — The Handicraft House" },
      { property: "og:description", content: "The makers behind every Handicraft House piece." },
    ],
  }),
  component: Artisans,
});

function Artisans() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src={artisanImg}
          alt="Artisan weaving bamboo"
          width={1200}
          height={1200}
          className="h-[46vh] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/80 to-transparent">
          <div className="mx-auto w-full max-w-7xl px-5 pb-12 md:px-8">
            <p className="eyebrow !text-[oklch(0.88_0.05_120)]">The makers</p>
            <h1 className="mt-2 font-display text-5xl text-[oklch(0.98_0.014_85)] md:text-6xl">
              42 families. One material.
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            We don't run a factory. We work directly with independent workshops, pay their asking
            price, and put their name on every label. Here are four of them.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {makers.map((m, i) => (
            <Reveal key={m.name} delay={i * 80}>
              <article className="card-lift h-full rounded-3xl border border-border bg-card p-8">
                <p className="eyebrow">{m.craft}</p>
                <h2 className="mt-2 font-display text-3xl">{m.name}</h2>
                <p className="mt-1 font-ui text-sm text-muted-foreground">
                  {m.place} · {m.years} years at the bench
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">{m.bio}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
