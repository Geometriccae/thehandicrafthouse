import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_ADMIN } from "./format";
import { getApiBaseUrl, getAdminToken, setAdminToken } from "@/lib/api";

export const ADMIN_AUTH_KEY = "thh-admin-auth-v2";

export type AdminSession = {
  id?: string;
  email: string;
  name: string;
  loggedInAt: string;
};

type AdminAuthContextValue = {
  ready: boolean;
  session: AdminSession | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    localStorage.removeItem("thh-admin-auth-v1");

    const token = getAdminToken();
    if (!token) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      return null;
    }

    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.email) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      setAdminToken(null);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAdminToken(null);
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => readAdminSession());
  const [ready, setReady] = useState(() => typeof window !== "undefined");

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAdminToken(null);
    setSession(null);
  }, []);

  // Validate admin JWT session on mount
  useEffect(() => {
    let isMounted = true;
    async function verifyAdminSession() {
      const token = getAdminToken();
      if (!token) {
        if (isMounted) {
          setSession(null);
          setReady(true);
        }
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
          if (data.success && data.user && data.user.role === "admin") {
            const nextSession: AdminSession = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || "Store Admin",
              loggedInAt: new Date().toISOString(),
            };
            if (isMounted) {
              localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(nextSession));
              setSession(nextSession);
            }
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch {
        // Network offline, keep cached session if valid token exists
        const cached = readAdminSession();
        if (isMounted) setSession(cached);
      } finally {
        if (isMounted) setReady(true);
      }
    }

    void verifyAdminSession();
    return () => {
      isMounted = false;
    };
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token && data.admin) {
        setAdminToken(data.token);
        const next: AdminSession = {
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name || "Store Admin",
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
        setSession(next);
        return { ok: true };
      }
      return { ok: false, error: data.message || "Invalid email or password" };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Network error. Unable to connect to server." };
    }
  }, []);

  const value = useMemo(
    () => ({ ready, session, login, logout }),
    [ready, session, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
