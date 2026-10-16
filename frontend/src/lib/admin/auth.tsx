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

export const ADMIN_AUTH_KEY = "thh-admin-auth-v2";

export type AdminSession = {
  email: string;
  name: string;
  loggedInAt: string;
};

type AdminAuthContextValue = {
  ready: boolean;
  session: AdminSession | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    // Drop legacy sessions from older auth keys
    localStorage.removeItem("thh-admin-auth-v1");

    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.email || parsed.email.toLowerCase() !== DEMO_ADMIN.email.toLowerCase()) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => readAdminSession());
  const [ready, setReady] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    setSession(readAdminSession());
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (
      email.trim().toLowerCase() === DEMO_ADMIN.email.toLowerCase() &&
      password === DEMO_ADMIN.password
    ) {
      const next: AdminSession = {
        email: DEMO_ADMIN.email,
        name: "Store Admin",
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password" };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setSession(null);
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
