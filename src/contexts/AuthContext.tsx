import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface DemoUser {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedDate: string;
}

export interface DemoOrder {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: { id: string; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: { fullName: string; address: string; city: string; state: string; zip: string };
  shippingMethod: string;
  paymentMethod: string;
}

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
  user: DemoUser | null;
  isLoggedIn: boolean;
  orders: DemoOrder[];
  addresses: DemoAddress[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<DemoUser>) => void;
  addOrder: (order: DemoOrder) => void;
  addAddress: (addr: Omit<DemoAddress, "id">) => void;
  updateAddress: (id: string, addr: Partial<DemoAddress>) => void;
  removeAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  user: "demo_user",
  orders: "demo_orders",
  addresses: "demo_addresses",
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const seedOrders: DemoOrder[] = [
  {
    id: "ORD-DEMO001",
    date: "2026-03-28T10:30:00Z",
    status: "delivered",
    items: [
      { id: "1", name: "Wireless Headphones Pro Max", price: 129.99, quantity: 1, image: "" },
      { id: "6", name: "Organic Green Tea Premium", price: 14.99, quantity: 2, image: "" },
    ],
    subtotal: 159.97,
    shipping: 5.99,
    tax: 12.80,
    total: 178.76,
    shippingAddress: { fullName: "John Doe", address: "123 Main St", city: "New York", state: "NY", zip: "10001" },
    shippingMethod: "Standard Shipping",
    paymentMethod: "Cash on Delivery",
  },
  {
    id: "ORD-DEMO002",
    date: "2026-04-05T14:15:00Z",
    status: "shipped",
    items: [
      { id: "4", name: "Smart Watch Elite Series", price: 249.99, quantity: 1, image: "" },
    ],
    subtotal: 249.99,
    shipping: 12.99,
    tax: 20.00,
    total: 282.98,
    shippingAddress: { fullName: "John Doe", address: "123 Main St", city: "New York", state: "NY", zip: "10001" },
    shippingMethod: "Express Shipping",
    paymentMethod: "Cash on Delivery",
  },
  {
    id: "ORD-DEMO003",
    date: "2026-04-07T09:00:00Z",
    status: "processing",
    items: [
      { id: "5", name: "AeroFlex Running Shoes", price: 119.99, quantity: 1, image: "" },
      { id: "b1", name: "Hydrating Face Moisturizer", price: 28.99, quantity: 1, image: "" },
    ],
    subtotal: 148.98,
    shipping: 5.99,
    tax: 11.92,
    total: 166.89,
    shippingAddress: { fullName: "John Doe", address: "123 Main St", city: "New York", state: "NY", zip: "10001" },
    shippingMethod: "Standard Shipping",
    paymentMethod: "Cash on Delivery",
  },
];

const seedAddresses: DemoAddress[] = [
  { id: "addr-1", label: "Home", fullName: "John Doe", address: "123 Main St", city: "New York", state: "NY", zip: "10001", phone: "+1 234-567-890", isDefault: true },
  { id: "addr-2", label: "Office", fullName: "John Doe", address: "456 Business Ave, Suite 200", city: "New York", state: "NY", zip: "10018", phone: "+1 234-567-891", isDefault: false },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => loadJSON(STORAGE_KEYS.user, null));
  const [orders, setOrders] = useState<DemoOrder[]>(() => loadJSON(STORAGE_KEYS.orders, []));
  const [addresses, setAddresses] = useState<DemoAddress[]>(() => loadJSON(STORAGE_KEYS.addresses, []));

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, [user]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.addresses, JSON.stringify(addresses)); }, [addresses]);

  const login = (email: string, name?: string) => {
    const newUser: DemoUser = {
      name: name || email.split("@")[0],
      email,
      phone: "+1 234-567-890",
      avatar: "",
      joinedDate: new Date().toISOString(),
    };
    setUser(newUser);
    if (orders.length === 0) setOrders(seedOrders);
    if (addresses.length === 0) setAddresses(seedAddresses);
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    setAddresses([]);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  const updateProfile = (data: Partial<DemoUser>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  };

  const addOrder = (order: DemoOrder) => setOrders((prev) => [order, ...prev]);

  const addAddress = (addr: Omit<DemoAddress, "id">) => {
    const newAddr = { ...addr, id: `addr-${Date.now()}` };
    if (newAddr.isDefault) {
      setAddresses((prev) => [...prev.map((a) => ({ ...a, isDefault: false })), newAddr]);
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }
  };

  const updateAddress = (id: string, data: Partial<DemoAddress>) => {
    setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : data.isDefault ? { ...a, isDefault: false } : a));
  };

  const removeAddress = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, orders, addresses, login, logout, updateProfile, addOrder, addAddress, updateAddress, removeAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
