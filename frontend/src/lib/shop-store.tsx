import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { products, fetchStoreProducts, type Product } from "@/data/products";

export type CartLine = { productId: string; quantity: number };

type ShopState = {
  user: User | null;
  loadingSession: boolean;
  products: Product[];
  refreshProducts: () => Promise<Product[]>;
  getProduct: (id: string) => Product | undefined;
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  authOpen: boolean;
  cartOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  signOut: () => Promise<void>;
};

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>(() => products);

  const refreshProducts = useCallback(async () => {
    const list = await fetchStoreProducts();
    setLiveProducts([...list]);
    return list;
  }, []);

  useEffect(() => {
    void refreshProducts();

    const onFocus = () => void refreshProducts();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshProducts();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const interval = setInterval(() => {
      void refreshProducts();
    }, 8000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [refreshProducts]);

  const getProductItem = useCallback(
    (id: string) => liveProducts.find((p) => p.id === id) || products.find((p) => p.id === id),
    [liveProducts]
  );

  useEffect(() => {
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoadingSession(false);
      });
      supabase.auth
        .getSession()
        .then(({ data }) => {
          setUser(data?.session?.user ?? null);
          setLoadingSession(false);
        })
        .catch(() => {
          setLoadingSession(false);
        });
      return () => sub?.subscription?.unsubscribe();
    } catch {
      setLoadingSession(false);
      return undefined;
    }
  }, []);

  const refresh = useCallback(async (uid: string) => {
    try {
      const [c, w] = await Promise.all([
        supabase.from("cart_items").select("product_id, quantity").eq("user_id", uid),
        supabase.from("wishlist_items").select("product_id").eq("user_id", uid),
      ]);
      setCart((c?.data ?? []).map((r) => ({ productId: r.product_id, quantity: r.quantity })));
      setWishlist((w?.data ?? []).map((r) => r.product_id));
    } catch (err) {
      console.warn("[Shop] Could not sync remote cart:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setCart([]);
      setWishlist([]);
      return;
    }
    void refresh(user.id);
  }, [user, refresh]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) {
        setAuthOpen(true);
        return false;
      }
      const existing = cart.find((l) => l.productId === productId);
      const next = (existing?.quantity ?? 0) + quantity;
      setCart((prev) =>
        existing
          ? prev.map((l) => (l.productId === productId ? { ...l, quantity: next } : l))
          : [...prev, { productId, quantity }],
      );
      await supabase
        .from("cart_items")
        .upsert(
          { user_id: user.id, product_id: productId, quantity: next, updated_at: new Date().toISOString() },
          { onConflict: "user_id,product_id" },
        );
      setCartOpen(true);
      return true;
    },
    [user, cart],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!user) return;
      if (quantity < 1) {
        setCart((prev) => prev.filter((l) => l.productId !== productId));
        await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
        return;
      }
      setCart((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
      await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("product_id", productId);
    },
    [user],
  );

  const removeFromCart = useCallback(
    async (productId: string) => setQuantity(productId, 0),
    [setQuantity],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) {
        setAuthOpen(true);
        return false;
      }
      if (wishlist.includes(productId)) {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        setWishlist((prev) => [...prev, productId]);
        await supabase
          .from("wishlist_items")
          .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" });
      }
      return true;
    },
    [user, wishlist],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCart([]);
    setWishlist([]);
  }, []);

  const value = useMemo<ShopState>(() => {
    const cartTotal = cart.reduce((sum, line) => {
      const p = liveProducts.find((x) => x.id === line.productId) || products.find((x) => x.id === line.productId);
      return sum + (p ? p.price * line.quantity : 0);
    }, 0);
    return {
      user,
      loadingSession,
      products: liveProducts,
      refreshProducts,
      getProduct: getProductItem,
      cart,
      wishlist,
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      cartTotal,
      authOpen,
      cartOpen,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addToCart,
      setQuantity,
      removeFromCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      signOut,
    };
  }, [
    user,
    loadingSession,
    liveProducts,
    refreshProducts,
    getProductItem,
    cart,
    wishlist,
    authOpen,
    cartOpen,
    addToCart,
    setQuantity,
    removeFromCart,
    toggleWishlist,
    signOut,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
