import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const StorageCtx = createContext(null);

const KEYS = {
  wishlist: "wodmin_wishlist",
  compare: "wodmin_compare",
  recent: "wodmin_recent",
};
const COMPARE_LIMIT = 4;
const RECENT_LIMIT = 10;

const read = (k) => {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

export function StorageProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [compare, setCompare] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setWishlist(read(KEYS.wishlist));
    setCompare(read(KEYS.compare));
    setRecent(read(KEYS.recent));
  }, []);

  const persist = (key, value, setter) => { setter(value); write(key, value); };

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId];
      write(KEYS.wishlist, next);
      toast.success(prev.includes(productId) ? "Removed from wishlist" : "Added to wishlist");
      return next;
    });
  }, []);

  const toggleCompare = useCallback((productId) => {
    setCompare((prev) => {
      if (prev.includes(productId)) {
        const next = prev.filter((x) => x !== productId);
        write(KEYS.compare, next);
        toast.success("Removed from compare");
        return next;
      }
      if (prev.length >= COMPARE_LIMIT) {
        toast.error(`You can compare up to ${COMPARE_LIMIT} products`);
        return prev;
      }
      const next = [...prev, productId];
      write(KEYS.compare, next);
      toast.success("Added to compare");
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => persist(KEYS.compare, [], setCompare), []);
  const clearWishlist = useCallback(() => persist(KEYS.wishlist, [], setWishlist), []);

  const trackRecent = useCallback((productId) => {
    if (!productId) return;
    setRecent((prev) => {
      const next = [productId, ...prev.filter((x) => x !== productId)].slice(0, RECENT_LIMIT);
      write(KEYS.recent, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    wishlist, compare, recent,
    toggleWishlist, toggleCompare, clearCompare, clearWishlist, trackRecent,
    isWishlisted: (id) => wishlist.includes(id),
    isCompared: (id) => compare.includes(id),
  }), [wishlist, compare, recent, toggleWishlist, toggleCompare, clearCompare, clearWishlist, trackRecent]);

  return <StorageCtx.Provider value={value}>{children}</StorageCtx.Provider>;
}

export const useStorage = () => useContext(StorageCtx);
