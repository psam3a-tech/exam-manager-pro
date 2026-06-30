import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  sessionExpired: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("oems_token"));
  const [sessionExpired, setSessionExpired] = useState(false);
  const logoutRef = useRef<() => void>(() => {});

  const { data: user, isLoading, isError, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  // If the /auth/me call fails (expired/invalid token), clear storage silently
  useEffect(() => {
    if (isError && token) {
      localStorage.removeItem("oems_token");
      setToken(null);
      setSessionExpired(true);
    }
  }, [isError, token]);

  const logout = useCallback((expired = false) => {
    localStorage.removeItem("oems_token");
    setToken(null);
    if (expired) setSessionExpired(true);
  }, []);

  // Keep ref current so the event listener below always calls the latest logout
  logoutRef.current = logout;

  // Listen for 401 events fired by api.ts on any non-auth API call
  useEffect(() => {
    const handler = () => logoutRef.current(true);
    window.addEventListener("oems:unauthorized", handler);
    return () => window.removeEventListener("oems:unauthorized", handler);
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("oems_token", newToken);
    setToken(newToken);
    setSessionExpired(false);
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading && !!token,
        login,
        logout: () => logout(false),
        isAuthenticated: !!user,
        sessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
