import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ADMIN_SEED } from "./seed";
import { uid } from "./format";
import { setGlobalProducts, fetchStoreProducts } from "@/data/products";
import type {
  AdminCustomer,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminSettings,
  AdminState,
  OrderStatus,
} from "./types";

const STORAGE_KEY = "thh-admin-data-v2";

type AdminStoreContextValue = {
  ready: boolean;
  state: AdminState;
  resetSeed: () => void;
  upsertProduct: (product: AdminProduct) => void;
  softDeleteProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  hardDeleteProduct: (id: string) => void;
  updateStock: (id: string, stock: number, lowStockThreshold?: number) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  softDeleteOrder: (id: string) => void;
  restoreOrder: (id: string) => void;
  hardDeleteOrder: (id: string) => void;
  updateSettings: (settings: AdminSettings) => void;
  upsertCustomer: (customer: AdminCustomer) => void;
  deleteCustomer: (id: string) => void;
  getCustomerStats: (customerId: string) => { orders: number; spent: number };
};

const AdminAuthHeaders: HeadersInit = {
  "Content-Type": "application/json",
  "x-admin-auth": "true",
};

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

function loadState(): AdminState {
  if (typeof window === "undefined") return structuredClone(ADMIN_SEED);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(ADMIN_SEED);
    return { ...structuredClone(ADMIN_SEED), ...JSON.parse(raw) } as AdminState;
  } catch {
    return structuredClone(ADMIN_SEED);
  }
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AdminState>(() => structuredClone(ADMIN_SEED));

  // Sync products from MongoDB backend on initial load and periodically
  const syncFromBackend = useCallback(async () => {
    try {
      const res = await fetch("/api/products?status=all&limit=1000", {
        headers: AdminAuthHeaders,
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const serverProducts: AdminProduct[] = json.data.map((p: any) => ({
          _id: p._id || p.id,
          name: p.name || "",
          tagline: p.tagline || "",
          description: p.description || "",
          categoryId: p.categoryId || "lighting",
          collectionIds: Array.isArray(p.collectionIds) ? p.collectionIds : [],
          price: Number(p.price) || 0,
          discountPrice: p.discountPrice !== undefined ? Number(p.discountPrice) : undefined,
          sku: p.sku || "",
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
          stock: Number(p.stock) || 0,
          lowStockThreshold: p.lowStockThreshold ?? 5,
          material: p.material || "Natural Bamboo",
          dimensions: p.dimensions || "",
          weight: p.weight || "",
          color: p.color || "Natural",
          ecoFriendly: p.ecoFriendly ?? true,
          craftType: p.craftType || "handwoven",
          careInstructions: p.careInstructions || "",
          status: p.status || "active",
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));

        setState((prev) => ({
          ...prev,
          products: serverProducts,
        }));
        setGlobalProducts(json.data);
      }
    } catch (err) {
      console.warn("[AdminStore] Could not load products from server:", err);
    }
  }, []);

  useEffect(() => {
    setState(loadState());
    setReady(true);
    void syncFromBackend();

    const onFocus = () => void syncFromBackend();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void syncFromBackend();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const interval = setInterval(() => {
      void syncFromBackend();
    }, 8000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [syncFromBackend]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const resetSeed = useCallback(() => {
    const next = structuredClone(ADMIN_SEED);
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    void syncFromBackend();
  }, [syncFromBackend]);

  const upsertProduct = useCallback((product: AdminProduct) => {
    // 1. Optimistic update in local state
    setState((prev) => {
      const exists = prev.products.some((p) => p._id === product._id || (p.sku && p.sku === product.sku));
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) =>
              p._id === product._id || (p.sku && p.sku === product.sku) ? product : p
            )
          : [product, ...prev.products],
      };
    });

    // 2. Persist to MongoDB backend (accessible by all devices)
    fetch("/api/products", {
      method: "POST",
      headers: AdminAuthHeaders,
      body: JSON.stringify(product),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const saved = data.data;
          setState((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.sku === product.sku || p._id === product._id ? { ...product, _id: saved._id } : p
            ),
          }));
          void fetchStoreProducts();
          void syncFromBackend();
        }
      })
      .catch((err) => console.error("[AdminStore] Error saving product to backend:", err));
  }, [syncFromBackend]);

  const softDeleteProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === id ? { ...p, status: "deleted", updatedAt: new Date().toISOString() } : p
      ),
    }));
    fetch(`/api/products/${id}/soft-delete`, {
      method: "PATCH",
      headers: AdminAuthHeaders,
    })
      .then(() => {
        void fetchStoreProducts();
        void syncFromBackend();
      })
      .catch((err) => console.error("[AdminStore] Error soft-deleting:", err));
  }, [syncFromBackend]);

  const restoreProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === id ? { ...p, status: "active", updatedAt: new Date().toISOString() } : p
      ),
    }));
    fetch(`/api/products/${id}/restore`, {
      method: "PATCH",
      headers: AdminAuthHeaders,
    })
      .then(() => {
        void fetchStoreProducts();
        void syncFromBackend();
      })
      .catch((err) => console.error("[AdminStore] Error restoring:", err));
  }, [syncFromBackend]);

  const hardDeleteProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p._id !== id),
    }));
    fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: AdminAuthHeaders,
    })
      .then(() => {
        void fetchStoreProducts();
        void syncFromBackend();
      })
      .catch((err) => console.error("[AdminStore] Error hard-deleting:", err));
  }, [syncFromBackend]);

  const updateStock = useCallback((id: string, stock: number, lowStockThreshold?: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === id
          ? {
              ...p,
              stock,
              lowStockThreshold: lowStockThreshold ?? p.lowStockThreshold,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    fetch(`/api/products/${id}/stock`, {
      method: "PATCH",
      headers: AdminAuthHeaders,
      body: JSON.stringify({ stock, lowStockThreshold }),
    })
      .then(() => {
        void fetchStoreProducts();
        void syncFromBackend();
      })
      .catch((err) => console.error("[AdminStore] Error updating stock:", err));
  }, [syncFromBackend]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o._id !== id) return o;
        const now = new Date().toISOString();
        const timeline = o.timeline.map((t) => {
          const labels: Record<string, string[]> = {
            new: ["Order placed"],
            processing: ["Order placed", "Payment received", "Processing"],
            shipped: ["Order placed", "Payment received", "Processing", "Shipped"],
            delivered: ["Order placed", "Payment received", "Processing", "Shipped", "Delivered"],
            cancelled: ["Order placed", "Cancelled"],
            deleted: o.timeline.map((x) => x.label),
          };
          const doneLabels = labels[status] ?? [];
          return {
            ...t,
            done: doneLabels.includes(t.label) || (status === "deleted" && t.done),
            at: doneLabels.includes(t.label) && !t.at ? now : t.at,
          };
        });
        return { ...o, orderStatus: status, timeline, updatedAt: now };
      }),
    }));
  }, []);

  const softDeleteOrder = useCallback((id: string) => {
    updateOrderStatus(id, "deleted");
  }, [updateOrderStatus]);

  const restoreOrder = useCallback((id: string) => {
    updateOrderStatus(id, "processing");
  }, [updateOrderStatus]);

  const hardDeleteOrder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o._id !== id),
      payments: prev.payments.filter((p) => p.orderId !== id),
    }));
  }, []);

  const updateSettings = useCallback((settings: AdminSettings) => {
    setState((prev) => ({ ...prev, settings }));
  }, []);

  const upsertCustomer = useCallback((customer: AdminCustomer) => {
    setState((prev) => {
      const exists = prev.customers.some((c) => c._id === customer._id);
      return {
        ...prev,
        customers: exists
          ? prev.customers.map((c) => (c._id === customer._id ? customer : c))
          : [customer, ...prev.customers],
      };
    });
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c._id !== id),
    }));
  }, []);

  const getCustomerStats = useCallback(
    (customerId: string) => {
      const orders = state.orders.filter(
        (o) => o.customerId === customerId && o.orderStatus !== "deleted" && o.orderStatus !== "cancelled"
      );
      return {
        orders: orders.length,
        spent: orders.reduce((sum, o) => sum + o.total, 0),
      };
    },
    [state.orders]
  );

  const value = useMemo(
    () => ({
      ready,
      state,
      resetSeed,
      upsertProduct,
      softDeleteProduct,
      restoreProduct,
      hardDeleteProduct,
      updateStock,
      updateOrderStatus,
      softDeleteOrder,
      restoreOrder,
      hardDeleteOrder,
      updateSettings,
      upsertCustomer,
      deleteCustomer,
      getCustomerStats,
    }),
    [
      ready,
      state,
      resetSeed,
      upsertProduct,
      softDeleteProduct,
      restoreProduct,
      hardDeleteProduct,
      updateStock,
      updateOrderStatus,
      softDeleteOrder,
      restoreOrder,
      hardDeleteOrder,
      updateSettings,
      upsertCustomer,
      deleteCustomer,
      getCustomerStats,
    ]
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}

export function createEmptyProduct(partial?: Partial<AdminProduct>): AdminProduct {
  const now = new Date().toISOString();
  return {
    _id: uid("prod"),
    name: "",
    tagline: "",
    description: "",
    categoryId: "cat_decor",
    collectionIds: [],
    price: 0,
    sku: `BH-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    images: [],
    stock: 0,
    lowStockThreshold: 5,
    material: "Natural Bamboo",
    dimensions: "",
    weight: "",
    color: "",
    ecoFriendly: true,
    craftType: "handmade",
    careInstructions: "",
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export type { AdminProduct, AdminOrder, AdminCustomer, AdminPayment, AdminSettings };
