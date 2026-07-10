import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { wishlistApi } from "@/services/wishlistApi";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistContextType {
  wishlist: string[];           // product IDs as strings (backward compat)
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
  loading: boolean;
}

const STORAGE_KEY = "wishlist";

function loadLocal(): string[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveLocal(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isRestoring } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>(loadLocal);
  const [loading, setLoading]   = useState(false);

  // Sync from server when customer logs in
  useEffect(() => {
    if (isRestoring) return;

    if (isLoggedIn) {
      setLoading(true);
      wishlistApi.getIds()
        .then((ids) => {
          const serverIds = ids.map(String);
          // Merge local (guest) items into server wishlist
          const local  = loadLocal();
          const merged = Array.from(new Set([...serverIds, ...local]));

          // Push any local-only items to server
          const localOnly = local.filter((id) => !serverIds.includes(id));
          localOnly.forEach((id) => wishlistApi.add(Number(id)).catch(() => {}));

          setWishlist(merged);
          saveLocal(merged);
        })
        .catch(() => {
          // Network error — keep local state, will retry on next mount
        })
        .finally(() => setLoading(false));
    }
  }, [isLoggedIn, isRestoring]);

  const toggleWishlist = useCallback((productId: string) => {
    const isIn = wishlist.includes(productId);

    // Optimistic update
    setWishlist((prev) => {
      const next = isIn ? prev.filter((id) => id !== productId) : [...prev, productId];
      saveLocal(next);
      return next;
    });

    // Persist to server if logged in
    if (isLoggedIn) {
      if (isIn) {
        wishlistApi.remove(Number(productId)).catch(() => {
          // Revert on failure
          setWishlist((prev) => {
            const reverted = [...prev, productId];
            saveLocal(reverted);
            return reverted;
          });
        });
      } else {
        wishlistApi.add(Number(productId)).catch(() => {
          setWishlist((prev) => {
            const reverted = prev.filter((id) => id !== productId);
            saveLocal(reverted);
            return reverted;
          });
        });
      }
    }
  }, [wishlist, isLoggedIn]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    saveLocal([]);
    if (isLoggedIn) {
      wishlistApi.clear().catch(() => {});
    }
  }, [isLoggedIn]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      totalWishlistItems: wishlist.length,
      loading,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
