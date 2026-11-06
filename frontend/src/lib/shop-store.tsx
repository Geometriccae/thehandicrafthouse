import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, fetchStoreProducts, type Product } from "@/data/products";
import {
  getApiBaseUrl,
  getCustomerToken,
  setCustomerToken,
  getCachedCustomer,
  setCachedCustomer,
  getCustomerAuthHeaders,
  type AuthCustomer,
} from "./api";

export type CartLine = { productId: string; quantity: number };

// Re-export AuthCustomer as User for consumer compatibility
export type User = AuthCustomer;

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
  setUserSession: (user: User, token: string) => void;
};

const ShopContext = createContext<ShopState | null>(null);

const LOCAL_CART_KEY = "thh_guest_cart";
const LOCAL_WISHLIST_KEY = "thh_guest_wishlist";

function getLocalCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCart(cart: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  } catch {}
}

function getLocalWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalWishlist(wishlist: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
  } catch {}
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCachedCustomer());
  const [loadingSession, setLoadingSession] = useState(true);
  const [cart, setCart] = useState<CartLine[]>(() => {
    const cached = getCachedCustomer();
    if (cached?.cart && cached.cart.length > 0) return cached.cart;
    return getLocalCart();
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const cached = getCachedCustomer();
    if (cached?.wishlistProductIds && cached.wishlistProductIds.length > 0) return cached.wishlistProductIds;
    return getLocalWishlist();
  });
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

  // Verify JWT session on mount with MongoDB Atlas backend
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      const token = getCustomerToken();
      if (!token) {
        if (isMounted) setLoadingSession(false);
        return;
      }

      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            if (isMounted) {
              setUser(data.user);
              setCachedCustomer(data.user);
              if (Array.isArray(data.user.cart)) {
                setCart(data.user.cart);
              }
              if (Array.isArray(data.user.wishlistProductIds)) {
                setWishlist(data.user.wishlistProductIds);
              }
            }
          } else {
            // Token rejected
            setCustomerToken(null);
            setCachedCustomer(null);
            if (isMounted) setUser(null);
          }
        } else {
          setCustomerToken(null);
          setCachedCustomer(null);
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.warn("[Shop] Session verification failed (offline or network):", err);
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }

    void verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync cart helper to MongoDB backend (customer ID is securely derived from JWT on server)
  const syncCartToBackend = useCallback(async (newCart: CartLine[]) => {
    const token = getCustomerToken();
    if (!token) return;
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/customers/cart`, {
        method: "POST",
        headers: getCustomerAuthHeaders(),
        body: JSON.stringify({ cart: newCart }),
      });
    } catch (err) {
      console.warn("[Shop] Failed to sync cart to MongoDB Atlas:", err);
    }
  }, []);

  // Sync wishlist helper to MongoDB backend (customer ID is securely derived from JWT on server)
  const syncWishlistToBackend = useCallback(async (newWishlist: string[]) => {
    const token = getCustomerToken();
    if (!token) return;
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/customers/wishlist`, {
        method: "POST",
        headers: getCustomerAuthHeaders(),
        body: JSON.stringify({ wishlistProductIds: newWishlist }),
      });
    } catch (err) {
      console.warn("[Shop] Failed to sync wishlist to MongoDB Atlas:", err);
    }
  }, []);

  const setUserSession = useCallback(
    (newUser: User, token: string) => {
      setCustomerToken(token);
      setCachedCustomer(newUser);
      setUser(newUser);

      // Merge guest cart with user cart from backend
      const guestCart = getLocalCart();
      let mergedCart = Array.isArray(newUser.cart) ? [...newUser.cart] : [];
      if (guestCart.length > 0) {
        guestCart.forEach((item) => {
          const existing = mergedCart.find((l) => l.productId === item.productId);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            mergedCart.push(item);
          }
        });
        localStorage.removeItem(LOCAL_CART_KEY);
      }
      setCart(mergedCart);
      void syncCartToBackend(mergedCart);

      // Merge guest wishlist with user wishlist
      const guestWishlist = getLocalWishlist();
      let mergedWishlist = Array.isArray(newUser.wishlistProductIds) ? [...newUser.wishlistProductIds] : [];
      if (guestWishlist.length > 0) {
        guestWishlist.forEach((id) => {
          if (!mergedWishlist.includes(id)) {
            mergedWishlist.push(id);
          }
        });
        localStorage.removeItem(LOCAL_WISHLIST_KEY);
      }
      setWishlist(mergedWishlist);
      void syncWishlistToBackend(mergedWishlist);
    },
    [syncCartToBackend, syncWishlistToBackend]
  );

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      const existing = cart.find((l) => l.productId === productId);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      const nextCart = existing
        ? cart.map((l) => (l.productId === productId ? { ...l, quantity: nextQuantity } : l))
        : [...cart, { productId, quantity }];

      setCart(nextCart);
      setCartOpen(true);

      if (user) {
        await syncCartToBackend(nextCart);
      } else {
        setLocalCart(nextCart);
      }
      return true;
    },
    [user, cart, syncCartToBackend]
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      let nextCart: CartLine[];
      if (quantity < 1) {
        nextCart = cart.filter((l) => l.productId !== productId);
      } else {
        nextCart = cart.map((l) => (l.productId === productId ? { ...l, quantity } : l));
      }

      setCart(nextCart);
      if (user) {
        await syncCartToBackend(nextCart);
      } else {
        setLocalCart(nextCart);
      }
    },
    [user, cart, syncCartToBackend]
  );

  const removeFromCart = useCallback(
    async (productId: string) => setQuantity(productId, 0),
    [setQuantity]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      let nextWishlist: string[];
      if (wishlist.includes(productId)) {
        nextWishlist = wishlist.filter((id) => id !== productId);
      } else {
        nextWishlist = [...wishlist, productId];
      }

      setWishlist(nextWishlist);
      if (user) {
        await syncWishlistToBackend(nextWishlist);
      } else {
        setLocalWishlist(nextWishlist);
      }
      return true;
    },
    [user, wishlist, syncWishlistToBackend]
  );

  const signOut = useCallback(async () => {
    setCustomerToken(null);
    setCachedCustomer(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem(LOCAL_CART_KEY);
    localStorage.removeItem(LOCAL_WISHLIST_KEY);
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
      setUserSession,
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
    setUserSession,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
