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
import { getApiBaseUrl, AdminAuthHeaders } from "@/lib/api";
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

export type UpsertProductResult = {
  success: boolean;
  error?: string;
  data?: AdminProduct;
};

type AdminStoreContextValue = {
  ready: boolean;
  state: AdminState;
  resetSeed: () => void;
  upsertProduct: (product: AdminProduct) => Promise<UpsertProductResult>;
  softDeleteProduct: (id: string) => Promise<boolean>;
  restoreProduct: (id: string) => Promise<boolean>;
  hardDeleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, stock: number, lowStockThreshold?: number) => Promise<boolean>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  softDeleteOrder: (id: string) => void;
  restoreOrder: (id: string) => void;
  hardDeleteOrder: (id: string) => void;
  updateSettings: (settings: AdminSettings) => void;
  upsertCustomer: (customer: AdminCustomer) => void;
  deleteCustomer: (id: string) => void;
  getCustomerStats: (customerId: string) => { orders: number; spent: number };
};

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

function loadState(): AdminState {
  if (typeof window === "undefined") return structuredClone(ADMIN_SEED);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(ADMIN_SEED);
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    // Products must strictly come from MongoDB backend.
    // Strip any lingering client-side temporary products (prod_...) from local storage
    const verifiedProducts = Array.isArray(parsed.products)
      ? parsed.products.filter((p) => p && typeof p._id === "string" && !p._id.startsWith("prod_"))
      : [];
    return {
      ...structuredClone(ADMIN_SEED),
      ...parsed,
      products: verifiedProducts,
    } as AdminState;
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
      const res = await fetch(`${getApiBaseUrl()}/products?status=all&limit=1000`, {
        headers: AdminAuthHeaders,
      });
      if (!res.ok) {
        console.warn("[AdminStore] Could not load products from server, HTTP status:", res.status);
        return;
      }
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
    // Strip temporary client-side IDs to prevent corrupted offline products in localStorage
    const cleanState = {
      ...state,
      products: state.products.filter((p) => p && !p._id.startsWith("prod_")),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
  }, [state, ready]);

  const resetSeed = useCallback(() => {
    const next = structuredClone(ADMIN_SEED);
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    void syncFromBackend();
  }, [syncFromBackend]);

  const upsertProduct = useCallback(
    async (product: AdminProduct): Promise<UpsertProductResult> => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/products`, {
          method: "POST",
          headers: AdminAuthHeaders,
          body: JSON.stringify(product),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data || !data.success || !data.data) {
          const errMsg = data?.message || `Server returned error (${res.status})`;
          console.error("[AdminStore] Failed to save product to MongoDB:", errMsg);
          return { success: false, error: errMsg };
        }

        const saved = data.data;
        const formattedSaved: AdminProduct = {
          _id: saved._id || saved.id,
          name: saved.name || product.name,
          tagline: saved.tagline || product.tagline,
          description: saved.description || product.description,
          categoryId: saved.categoryId || product.categoryId,
          collectionIds: Array.isArray(saved.collectionIds) ? saved.collectionIds : product.collectionIds,
          price: Number(saved.price) || product.price,
          discountPrice: saved.discountPrice !== undefined ? Number(saved.discountPrice) : product.discountPrice,
          sku: saved.sku || product.sku,
          images: Array.isArray(saved.images) && saved.images.length > 0 ? saved.images : product.images,
          stock: Number(saved.stock) || product.stock,
          lowStockThreshold: saved.lowStockThreshold ?? product.lowStockThreshold,
          material: saved.material || product.material,
          dimensions: saved.dimensions || product.dimensions,
          weight: saved.weight || product.weight,
          color: saved.color || product.color,
          ecoFriendly: saved.ecoFriendly ?? product.ecoFriendly,
          craftType: saved.craftType || product.craftType,
          careInstructions: saved.careInstructions || product.careInstructions,
          status: saved.status || product.status,
          createdAt: saved.createdAt || product.createdAt,
          updatedAt: saved.updatedAt || new Date().toISOString(),
        };

        // Only update state with the verified MongoDB product
        setState((prev) => {
          const exists = prev.products.some(
            (p) =>
              p._id === formattedSaved._id ||
              (p.sku && p.sku === formattedSaved.sku) ||
              p._id === product._id
          );
          return {
            ...prev,
            products: exists
              ? prev.products.map((p) =>
                  p._id === formattedSaved._id ||
                  (p.sku && p.sku === formattedSaved.sku) ||
                  p._id === product._id
                    ? formattedSaved
                    : p
                )
              : [formattedSaved, ...prev.products],
          };
        });

        await fetchStoreProducts();
        await syncFromBackend();

        return { success: true, data: formattedSaved };
      } catch (err: any) {
        console.error("[AdminStore] Error saving product to backend:", err);
        return {
          success: false,
          error: err.message || "Network error. Could not connect to backend server.",
        };
      }
    },
    [syncFromBackend]
  );

  const softDeleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/products/${id}/soft-delete`, {
          method: "PATCH",
          headers: AdminAuthHeaders,
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          setState((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p._id === id ? { ...p, status: "deleted", updatedAt: new Date().toISOString() } : p
            ),
          }));
          await fetchStoreProducts();
          await syncFromBackend();
          return true;
        }
        return false;
      } catch (err) {
        console.error("[AdminStore] Error soft-deleting:", err);
        return false;
      }
    },
    [syncFromBackend]
  );

  const restoreProduct = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/products/${id}/restore`, {
          method: "PATCH",
          headers: AdminAuthHeaders,
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          setState((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p._id === id ? { ...p, status: "active", updatedAt: new Date().toISOString() } : p
            ),
          }));
          await fetchStoreProducts();
          await syncFromBackend();
          return true;
        }
        return false;
      } catch (err) {
        console.error("[AdminStore] Error restoring:", err);
        return false;
      }
    },
    [syncFromBackend]
  );

  const hardDeleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
          method: "DELETE",
          headers: AdminAuthHeaders,
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          setState((prev) => ({
            ...prev,
            products: prev.products.filter((p) => p._id !== id),
          }));
          await fetchStoreProducts();
          await syncFromBackend();
          return true;
        }
        return false;
      } catch (err) {
        console.error("[AdminStore] Error hard-deleting:", err);
        return false;
      }
    },
    [syncFromBackend]
  );

  const updateStock = useCallback(
    async (id: string, stock: number, lowStockThreshold?: number): Promise<boolean> => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/products/${id}/stock`, {
          method: "PATCH",
          headers: AdminAuthHeaders,
          body: JSON.stringify({ stock, lowStockThreshold }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
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
          await fetchStoreProducts();
          await syncFromBackend();
          return true;
        }
        return false;
      } catch (err) {
        console.error("[AdminStore] Error updating stock:", err);
        return false;
      }
    },
    [syncFromBackend]
  );

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
