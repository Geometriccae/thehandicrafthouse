import { MessageCircle, Phone } from "lucide-react";

const PHONE = "+919876543210";
const WHATSAPP = "919876543210";

export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/${WHATSAPP}?text=Hi%20The%20Handicraft%20House%2C%20I%27d%20love%20to%20know%20more%20about%20your%20pieces.`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="card-lift flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.65_0.16_150)] text-white shadow-lift"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a
        href={`tel:${PHONE}`}
        aria-label="Call us"
        className="card-lift flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
