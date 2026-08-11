"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  register: (token: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const syncCookie = useCallback((nextToken: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (nextToken) {
      document.cookie = `fixitnow-token=${encodeURIComponent(nextToken)}; path=/; max-age=86400; samesite=lax`;
    } else {
      document.cookie = "fixitnow-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const storedToken = readCookie("fixitnow-token") || window.localStorage.getItem("fixitnow-token");
      const storedUser = window.localStorage.getItem("fixitnow-user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as AuthUser);
        } catch {
          window.localStorage.removeItem("fixitnow-user");
        }
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const login = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem("fixitnow-token", nextToken);
    window.localStorage.setItem("fixitnow-user", JSON.stringify(nextUser));
    syncCookie(nextToken);
  }, [syncCookie]);

  const register = useCallback((nextToken: string, nextUser: AuthUser) => {
    login(nextToken, nextUser);
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem("fixitnow-token");
    window.localStorage.removeItem("fixitnow-user");
    syncCookie(null);
    router.push("/");
  }, [router, syncCookie]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      register,
    }),
    [token, user, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
