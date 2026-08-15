import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LocalizedString, Product, ProductCategory } from "@/types";

export interface CartItem {
  productId: string;
  slug: string;
  category: ProductCategory;
  title: LocalizedString;
  price: number;
  currency: string;
  image?: string;
  qty: number;
  stock?: number;
  requiresShipping?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  currency: string;
  isOpen: boolean;
  hasPhysical: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "liv-cart-v1";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : loadCart()
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = useCallback((product: Product, qty = 1) => {
    if (product.stock != null && product.stock <= 0) {
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      const isPhysical =
        product.category === "physical" ||
        product.format === "Physical" ||
        product.requiresShipping === true;
      const maxStock = product.stock != null ? product.stock : 99;

      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, qty: Math.min(i.qty + qty, maxStock), stock: product.stock }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          category: product.category,
          title: product.title,
          price: product.price,
          currency: product.currency,
          image: product.heroImage ?? product.images?.[0],
          qty: Math.min(qty, maxStock),
          stock: product.stock,
          requiresShipping: isPhysical,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => {
            if (i.productId !== productId) return i;
            const max = i.stock != null ? i.stock : 99;
            return { ...i, qty: Math.min(qty, max) };
          })
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const currency = items[0]?.currency ?? "USD";
    const hasPhysical = items.some(
      (i) => i.category === "physical" || i.requiresShipping
    );
    return {
      items,
      count,
      subtotal,
      currency,
      isOpen,
      hasPhysical,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((o) => !o),
      addItem,
      removeItem,
      updateQty,
      clear,
    };
  }, [items, isOpen, addItem, removeItem, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
