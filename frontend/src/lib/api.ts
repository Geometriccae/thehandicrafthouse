/**
 * Centralized API configuration and client utilities for The Handicraft House
 * Ensures all devices (mobile, desktop, tablet) resolve the correct API base URL.
 */

// Production API URL configured as requested:
export const PRODUCTION_API_URL = "https://api-thehandicrafthouse-com-900945.hostingersite.com/api";

const TOKEN_KEY = "thh_customer_token";
const USER_KEY = "thh_customer_user";
const ADMIN_TOKEN_KEY = "thh_admin_token";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // On localhost or local dev, prefer relative "/api" (which Vite proxies to local backend on port 5001)
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "/api";
    }
    // On live production site
    if (window.location.hostname.includes("hostingersite.com") || window.location.hostname.includes("thehandicrafthouse.com")) {
      return PRODUCTION_API_URL;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }

  return "/api";
}

// Admin Token & Authorization Management (stored per-session so login credentials are required on reopen)
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (typeof window === "undefined") return;
  // Ensure any persistent localStorage admin token is cleared
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function getAdminAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface AuthCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  addresses?: any[];
  cart?: { productId: string; quantity: number }[];
  wishlistProductIds?: string[];
  joinedAt?: string;
}

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getCachedCustomer(): AuthCustomer | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedCustomer(user: AuthCustomer | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getCustomerAuthHeaders(): HeadersInit {
  const token = getCustomerToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
