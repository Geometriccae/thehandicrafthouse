import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import hero from "@/assets/bamboo-hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — The Handicraft House" },
      {
        name: "description",
        content:
          "How The Handicraft House began: one workshop in Assam, a stubborn belief in slow making, and a material that grows back.",
      },
      { property: "og:title", content: "Our Story — The Handicraft House" },
      { property: "og:description", content: "A studio built on slow making and a material that grows back." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 md:px-8">
      <Reveal>
        <p className="eyebrow">Our story</p>
        <h1 className="mt-2 font-display text-5xl leading-tight md:text-6xl">
          We started with one lamp and a lot of patience.
        </h1>
      </Reveal>

      <Reveal delay={100} className="zoom-frame mt-12 overflow-hidden rounded-[2rem]">
        <img src={hero} alt="Bamboo workshop interior" loading="lazy" width={1600} height={1000} className="w-full object-cover" />
      </Reveal>

      <Reveal delay={140} className="mt-12 space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          In 1974 a single workshop in Assam began selling coiled bamboo shades to neighbours. Fifty
          years later that workshop still makes our Hoshi lamp — the same pattern, the same nine hours.
        </p>
        <p>
          The Handicraft House exists to give those workshops a shopfront that matches the quality of their
          work. We buy directly, we pay the asking price, and we never ask a maker to work faster.
        </p>
        <p>
          What you get is a piece with small irregularities: a knot that sits slightly off centre, a
          weave that tightens where the hand tired. Those are the marks of a person, not a defect.
        </p>
      </Reveal>

      <Reveal delay={180} className="mt-12 flex flex-wrap gap-3">
        <Link to="/shop" className="btn-pill btn-solid">Shop the collection</Link>
        <Link to="/artisans" className="btn-pill btn-ghost">Meet the artisans</Link>
      </Reveal>
    </div>
  );
}
