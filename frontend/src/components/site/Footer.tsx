import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="grad-bamboo flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 3v18M15 3v18M9 8h6M9 14h6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-brand text-[1.35rem] leading-none tracking-tight">
              The Handicraft <span className="text-primary not-italic">House</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Handcrafted bamboo pieces made by independent artisans, built to outlive trends.
          </p>
        </div>

        <div>
          <h4 className="eyebrow">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/shop" className="link-underline hover:text-foreground">All products</Link></li>
            <li><Link to="/collections" className="link-underline hover:text-foreground">Collections</Link></li>
            <li><Link to="/wishlist" className="link-underline hover:text-foreground">Wishlist</Link></li>
            <li><Link to="/cart" className="link-underline hover:text-foreground">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="link-underline hover:text-foreground">Our story</Link></li>
            <li><Link to="/artisans" className="link-underline hover:text-foreground">Artisans</Link></li>
            <li><Link to="/sustainability" className="link-underline hover:text-foreground">Sustainability</Link></li>
            <li><Link to="/contact" className="link-underline hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Reach us</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-primary" />
              <a href="tel:+919876543210" className="hover:text-foreground">+91 98765 43210</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:hello@bamboocraft.com" className="hover:text-foreground">hello@bamboocraft.com</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Instagram className="h-4 w-4 text-primary" />
              <span>@bamboocraft.studio</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span>Studio 14, Green Mile, Guwahati</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 font-ui text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} The Handicraft House. Grown, cut and woven by hand.</p>
          <p>Plastic-free packaging · Carbon-neutral delivery</p>
        </div>
      </div>
    </footer>
  );
}
