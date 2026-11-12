import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { ProductPageState } from "@/templates/shared/useProductPage";

/**
 * Quantity picked before adding, and an add that respects it: the shared add() puts one in,
 * then the cart line is set to the full amount (same line id rule as useProductPage).
 */
export function useQuantityAdd(page: ProductPageState | null) {
  const { updateQuantity } = useCart();
  const [qty, setQty] = useState(1);
  const addToCart = () => {
    if (!page) return;
    const lineId = String(page.selectedVariant?.id ?? page.product.id);
    const existing = page.cartItem?.quantity ?? 0;
    page.add();
    const amount = Math.min(qty, Math.max(1, page.currentStock - existing));
    if (amount > 1) updateQuantity(lineId, existing + amount);
    setQty(1);
  };
  return { qty, setQty, addToCart };
}
