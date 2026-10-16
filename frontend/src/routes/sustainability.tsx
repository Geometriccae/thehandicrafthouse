import { createFileRoute } from "@tanstack/react-router";
import { Recycle, Sprout, TreePine, Wind } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability & Impact — The Handicraft House" },
      {
        name: "description",
        content:
          "Why bamboo: 5-year maturity, 35% more CO₂ absorbed, zero replanting, plastic-free packaging and carbon-neutral delivery.",
      },
      { property: "og:title", content: "Sustainability & Impact — The Handicraft House" },
      { property: "og:description", content: "Our impact numbers, in plain language." },
    ],
  }),
  component: Sustainability,
});

const stats = [
  { icon: Sprout, n: "5 years", l: "to full maturity", d: "Hardwood takes 40 to 60." },
  { icon: Wind, n: "+35%", l: "CO₂ absorbed", d: "versus an equivalent stand of trees." },
  { icon: TreePine, n: "0", l: "replanting needed", d: "Bamboo regrows from its own roots." },
  { icon: Recycle, n: "100%", l: "plastic-free packaging", d: "Paper tape, bamboo pulp wrap." },
];

function Sustainability() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-20 md:px-8">
      <Reveal>
        <p className="eyebrow">Impact</p>
        <h1 className="mt-2 font-display text-5xl leading-tight md:text-6xl">
          The most honest material we could find.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          We harvest only mature culms, cut by hand, from managed groves within 40 km of each
          workshop. Nothing is clear-felled and nothing is shipped green.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 80}>
            <div className="card-lift h-full rounded-3xl border border-border bg-card p-8">
              <s.icon className="h-6 w-6 text-primary" />
              <p className="mt-5 font-display text-4xl">{s.n}</p>
              <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">{s.l}</p>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="grad-bamboo mt-14 rounded-[2rem] p-10 text-center">
        <h2 className="font-display text-3xl text-primary-foreground md:text-4xl">
          Ten-year repair promise
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[oklch(0.95_0.02_120)]">
          If a frame or weave fails within ten years of normal use, we repair it and pay the
          shipping both ways. Keeping a piece in use beats recycling it.
        </p>
      </Reveal>
    </div>
  );
}
