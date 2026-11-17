import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Product } from "@/types/product";

// Colour attribute values are free text; only ones the browser can paint get a dot.
const isPaintable = (value: string) => typeof CSS !== "undefined" && CSS.supports?.("color", value.trim().toLowerCase());

/** Card data and actions shared by every template's product card. */
export function useProductCard(product: Product) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatCurrency } = useCurrency();
  const [imageFailed, setImageFailed] = useState(false);

  const id = String(product.id);
  const cartItem = items.find((i) => i.id === id);
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  // Variant products need a size/colour pick on the product page before adding.
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const colours = Array.from(new Set(
    (product.variants ?? []).flatMap((v) =>
      Object.entries(v.attributes).filter(([k]) => /colou?r/i.test(k)).map(([, val]) => String(val)),
    ),
  )).filter(isPaintable);
  const images = (product.images?.length ? product.images : [product.image]).filter((src) => !!src && !src.includes("placeholder"));

  const add = () => addItem({ id, productId: Number(product.id), variantId: null, name: product.name, price: product.price, image: product.image });

  return {
    href: `/product/${product.slug}`,
    /** First photo, or null when missing or broken (show the template's own placeholder) */
    image: !imageFailed && images[0] ? images[0] : null,
    /** Second photo for hover swaps, if any */
    hoverImage: !imageFailed && images[1] ? images[1] : null,
    onImageError: () => setImageFailed(true),
    price: formatCurrency(product.price),
    originalPrice: product.originalPrice && discount > 0 ? formatCurrency(product.originalPrice) : null,
    discount,
    badge: product.badge || null,
    inStock: product.stock === undefined || product.stock > 0,
    sold: product.totalSold ?? 0,
    rating: product.rating,
    reviews: product.reviews,
    colours,
    hasVariants,
    liked: isInWishlist(product.id),
    toggleLike: () => toggleWishlist(product.id),
    quantity: cartItem?.quantity ?? 0,
    add,
    increment: () => (cartItem ? updateQuantity(id, cartItem.quantity + 1) : add()),
    decrement: () => {
      if (!cartItem) return;
      if (cartItem.quantity <= 1) removeItem(id);
      else updateQuantity(id, cartItem.quantity - 1);
    },
    formatCurrency,
  };
}
