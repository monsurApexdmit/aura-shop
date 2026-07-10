import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, type ApiCustomer } from "@/services/authApi";

// Keep DemoAddress for UI compatibility (addresses still managed via backend API calls)
export interface DemoAddress {
  id: string;
  label: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: ApiCustomer | null;
  token: string | null;
  isLoggedIn: boolean;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<ApiCustomer & { password?: string }>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<ApiCustomer | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("customer_token");
    const savedUser  = localStorage.getItem("customer_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
      }
    }
    setIsRestoring(false);
  }, []);

  const persist = (token: string, customer: ApiCustomer) => {
    localStorage.setItem("customer_token", token);
    localStorage.setItem("customer_user", JSON.stringify(customer));
    setToken(token);
    setUser(customer);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    persist(res.token, res.customer);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await authApi.register({ name, email, password, phone });
    persist(res.token, res.customer);
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<ApiCustomer & { password?: string }>) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
    localStorage.setItem("customer_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, isRestoring, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
