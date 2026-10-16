import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, getProduct } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export function CartDrawer() {
  const { cartOpen, closeCart, cart, cartTotal, setQuantity, removeFromCart } = useShop();
  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button aria-label="Close cart" onClick={closeCart} className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-lift">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-2xl">Your cart</h2>
          <button onClick={closeCart} aria-label="Close" className="rounded-full p-2 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is quietly empty.</p>
            <Link to="/shop" onClick={closeCart} className="btn-pill btn-solid">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {cart.map((line) => {
                const p = getProduct(line.productId);
                if (!p) return null;
                return (
                  <div key={line.productId} className="flex gap-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={900}
                      height={1100}
                      className="h-24 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-display text-base leading-snug">{p.name}</p>
                      <p className="font-ui text-sm text-muted-foreground">{formatPrice(p.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => void setQuantity(line.productId, line.quantity - 1)}
                          className="rounded-full border border-border p-1.5 hover:bg-secondary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-ui text-sm">{line.quantity}</span>
                        <button
                          onClick={() => void setQuantity(line.productId, line.quantity + 1)}
                          className="rounded-full border border-border p-1.5 hover:bg-secondary"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => void removeFromCart(line.productId)}
                          className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between font-ui text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base">{formatPrice(cartTotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <Link to="/cart" onClick={closeCart} className="btn-pill btn-solid mt-4 w-full">
                View cart & checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
