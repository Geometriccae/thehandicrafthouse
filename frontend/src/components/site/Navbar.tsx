import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag, User2, X } from "lucide-react";
import { useShop } from "@/lib/shop-store";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/artisans", label: "Artisans" },
  { to: "/sustainability", label: "Sustainability" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { cartCount, wishlist, user, openCart, openAuth } = useShop();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-xl shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grad-bamboo flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 3v18M15 3v18M9 8h6M9 14h6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-brand text-[1.35rem] leading-none tracking-tight md:text-[1.5rem]">
            The Handicraft <span className="text-primary not-italic">House</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="link-underline font-ui text-[0.8rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2.5 transition-colors hover:bg-secondary"
          >
            <Heart className="h-[1.15rem] w-[1.15rem]" />
            {wishlist.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-ui text-[0.6rem] text-primary-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative rounded-full p-2.5 transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-ui text-[0.6rem] text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
          {user ? (
            <Link
              to="/account"
              aria-label="Account"
              className="rounded-full p-2.5 transition-colors hover:bg-secondary"
            >
              <User2 className="h-[1.15rem] w-[1.15rem]" />
            </Link>
          ) : (
            <button
              onClick={openAuth}
              className="btn-pill btn-solid ml-1 hidden !px-5 !py-2.5 sm:inline-flex"
            >
              Sign in
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="rounded-full p-2.5 transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/97 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-5 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-xl px-3 py-3 font-ui text-sm uppercase tracking-[0.14em] text-muted-foreground hover:bg-secondary data-[status=active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <button onClick={openAuth} className="btn-pill btn-solid mt-2">
                Sign in
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
