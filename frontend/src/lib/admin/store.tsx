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
import type {
  AdminCustomer,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminSettings,
  AdminState,
  OrderStatus,
} from "./types";

const STORAGE_KEY = "thh-admin-data-v1";

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

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const resetSeed = useCallback(() => {
    const next = structuredClone(ADMIN_SEED);
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const upsertProduct = useCallback((product: AdminProduct) => {
    setState((prev) => {
      const exists = prev.products.some((p) => p._id === product._id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p._id === product._id ? product : p))
          : [product, ...prev.products],
      };
    });
  }, []);

  const softDeleteProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === id ? { ...p, status: "deleted", updatedAt: new Date().toISOString() } : p,
      ),
    }));
  }, []);

  const restoreProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === id ? { ...p, status: "active", updatedAt: new Date().toISOString() } : p,
      ),
    }));
  }, []);

  const hardDeleteProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p._id !== id),
    }));
  }, []);

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
          : p,
      ),
    }));
  }, []);

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
        (o) => o.customerId === customerId && o.orderStatus !== "deleted" && o.orderStatus !== "cancelled",
      );
      return {
        orders: orders.length,
        spent: orders.reduce((sum, o) => sum + o.total, 0),
      };
    },
    [state.orders],
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
    ],
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
