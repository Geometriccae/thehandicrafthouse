import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact The Handicraft House — Call, WhatsApp or Email" },
      {
        name: "description",
        content:
          "Talk to The Handicraft House studio: phone, WhatsApp, email, or send us a message. We reply within one working day.",
      },
      { property: "og:title", content: "Contact The Handicraft House" },
      { property: "og:description", content: "Call, WhatsApp or email the studio — we reply within a day." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <Reveal>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 font-display text-5xl leading-tight md:text-6xl">Talk to the studio</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Commission a piece, ask about a size, or check on an order. A real person replies.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal className="space-y-4">
          <a
            href="tel:+919876543210"
            className="card-lift flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Phone className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-ui text-sm">Call us</span>
              <span className="block text-muted-foreground">+91 98765 43210</span>
            </span>
          </a>

          <a
            href="https://wa.me/919876543210?text=Hi%20The%20Handicraft%20House"
            target="_blank"
            rel="noreferrer"
            className="card-lift flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[oklch(0.65_0.16_150)] text-white">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-ui text-sm">WhatsApp</span>
              <span className="block text-muted-foreground">Chat with the studio</span>
            </span>
          </a>

          <a
            href="mailto:hello@bamboocraft.com"
            className="card-lift flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <Mail className="h-5 w-5 text-primary" />
            </span>
            <span>
              <span className="block font-ui text-sm">Email</span>
              <span className="block text-muted-foreground">hello@bamboocraft.com</span>
            </span>
          </a>

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              Studio 14, Green Mile, Guwahati, Assam 781001
            </p>
            <p className="mt-3 flex items-start gap-3 text-muted-foreground">
              <Clock className="mt-0.5 h-5 w-5 text-primary" />
              Mon–Sat, 9:00–18:00 IST
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-[2rem] border border-border bg-card p-8"
          >
            <h2 className="font-display text-2xl">Send a message</h2>
            <input required placeholder="Your name" className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <input required type="email" placeholder="Email address" className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <input placeholder="Phone (optional)" className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <textarea required rows={5} placeholder="How can we help?" className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <button className="btn-pill btn-solid w-full">Send message</button>
            {sent && (
              <p className="text-sm text-primary">
                Thank you — we've got it and will reply within one working day.
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </div>
  );
}
