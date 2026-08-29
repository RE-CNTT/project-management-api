"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe } from "@/features/users/api";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import type { ResponseUser } from "./types";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "./token";

interface AuthContextValue {
  token: string | null;
  user: ResponseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setSession: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ResponseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAccessToken();
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const handleAuthExpired = useCallback(
    (msg = "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.") => {
      clearAccessToken();
      setToken(null);
      setUser(null);
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        toast.error(msg, "Hết phiên đăng nhập");
        window.location.href = "/login";
      }
    },
    [toast],
  );

  const fetchProfile = useCallback(
    async (jwt: string) => {
      try {
        const profile = await getMe(jwt);
        setUser(profile);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          handleAuthExpired(error.message);
        }
      }
    },
    [handleAuthExpired],
  );

  const refreshUser = useCallback(async () => {
    const currentToken = token || getAccessToken();
    if (currentToken) {
      await fetchProfile(currentToken);
    }
  }, [fetchProfile, token]);

  // Initial load check ONCE on mount
  useEffect(() => {
    const storedToken = getAccessToken();
    if (storedToken) {
      setToken(storedToken);
      setIsLoading(false);
      void fetchProfile(storedToken);
    } else {
      setIsLoading(false);
      if (pathname !== "/login") {
        router.replace("/login");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to 401 unauthorized events emitted from API client
  useEffect(() => {
    function handleUnauthorized(event: Event) {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const msg = customEvent.detail?.message;
      handleAuthExpired(msg);
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [handleAuthExpired]);

  const setSession = useCallback(
    async (newToken: string) => {
      saveAccessToken(newToken);
      setToken(newToken);
      setIsLoading(false);
      try {
        await fetchProfile(newToken);
      } catch {
        // ignore
      }
    },
    [fetchProfile],
  );

  const activeToken = token || (typeof window !== "undefined" ? getAccessToken() : null);
  const isAuthenticated = Boolean(activeToken);
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        token: activeToken,
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        setSession,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
