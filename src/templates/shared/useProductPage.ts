import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { whatsAppLink } from "@/lib/bdPhone";
import { trackViewContent } from "@/lib/pixels";
import type { Product, ProductAttribute, ProductVariant } from "@/types/product";

/** Colour names the API sends as text, painted as swatches. */
export const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", "midnight black": "#0a0a0a", white: "#f5f5f5", navy: "#1e3a5f",
  silver: "#c0c0c0", "rose gold": "#b76e79", red: "#e53e3e", green: "#38a169", blue: "#3182ce",
};

export const isColorAttribute = (name: string) => /^colou?r$/i.test(name.trim());

/** A swatch colour for a variant value: known name, any CSS colour, else grey. */
export function swatchColor(value: string): string {
  const v = value.trim().toLowerCase();
  if (COLOR_MAP[v]) return COLOR_MAP[v];
  return typeof CSS !== "undefined" && CSS.supports?.("color", v) ? v : "#888";
}

function deriveAttributes(variants: ProductVariant[]): ProductAttribute[] {
  const attrMap = new Map<string, Set<string>>();
  for (const v of variants) {
    for (const [key, val] of Object.entries(v.attributes)) {
      if (!attrMap.has(key)) attrMap.set(key, new Set());
      attrMap.get(key)!.add(val);
    }
  }
  return Array.from(attrMap.entries()).map(([name, valSet]) => ({
    name,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    values: Array.from(valSet),
  }));
}

function variantPrices(product: Product, variant: ProductVariant | null): { price: number; original?: number } {
  if (!variant) return { price: product.price, original: product.originalPrice };
  const base = variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.price;
  const offer = variant.offerPrice ?? product.offerPrice;
  const type = variant.offerType ?? product.offerType ?? "percentage";
  if (offer && offer > 0) {
    const final = type === "percentage" ? base * (1 - offer / 100) : base - offer;
    if (final > 0 && final < base) return { price: final, original: base };
  }
  return { price: base };
}

export const categoryHref = (category: string) =>
  `/shop?cat=${category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`;

/** Fallback for broken product photos. */
export const onProductImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const t = e.currentTarget;
  if (!t.src.includes("placeholder.svg")) t.src = "/placeholder.svg";
};

/**
 * Everything a product page needs, shared by every template: the product, variant selection,
 * price/stock for the chosen variant, cart and wishlist actions, related products and share.
 * Templates only decide how it looks.
 */
export function useProductPage(slug: string | undefined, { relatedLimit = 4 }: { relatedLimit?: number } = {}) {
  const navigate = useNavigate();
  const { addItem, items, updateQuantity, removeItem, setIsOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatCurrency, freeShippingThreshold, onlineStore, settings } = useCurrency();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const { data: apiProduct, isLoading } = useProduct(slug ?? null);
  const product = useMemo(() => (apiProduct ? mapApiProduct(apiProduct) : null), [apiProduct]);
  const attributes = useMemo(() => (product?.variants?.length ? deriveAttributes(product.variants) : []), [product]);

  const { data: relatedData } = useProducts(
    product ? { category_id: apiProduct?.category_id ?? undefined, limit: relatedLimit + 1 } : {},
    { enabled: !!product },
  );
  const relatedProducts = useMemo(() => {
    if (!product || !relatedData) return [];
    return relatedData.data.map(mapApiProduct).filter((p) => p.id !== product.id).slice(0, relatedLimit);
  }, [relatedData, product, relatedLimit]);

  // Old or renamed slugs land on the product's current URL
  useEffect(() => {
    if (product?.slug && slug && product.slug !== slug) navigate(`/product/${product.slug}`, { replace: true });
  }, [navigate, product?.slug, slug]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    attributes.forEach((attr) => { initial[attr.name] = attr.values[0]; });
    setSelectedAttributes(initial);
    setSelectedImage(0);
  }, [product?.id, attributes]);

  // Ad pixels (no-op unless configured): ViewContent once per product
  useEffect(() => {
    if (product) trackViewContent({ id: product.id, name: product.name, value: product.price, currency: settings?.currency || "BDT" });
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) => Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)) || product.variants[0];
  }, [product, selectedAttributes]);

  const lineId = String(selectedVariant?.id ?? product?.id);
  const cartItem = items.find((i) => i.id === lineId);

  if (!product) {
    return { status: (isLoading ? "loading" : "missing") as "loading" | "missing", formatCurrency } as const;
  }

  const { price: currentPrice, original } = variantPrices(product, selectedVariant);
  const originalPrice = original && original > currentPrice ? original : undefined;
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const currentSku = selectedVariant?.sku ?? product.sku ?? "N/A";
  const images = product.images?.length ? product.images : [product.image];
  const inWishlist = isInWishlist(product.id);

  const add = () =>
    addItem({
      id: lineId,
      productId: Number(product.id),
      variantId: selectedVariant ? Number(selectedVariant.id) : null,
      name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      price: currentPrice,
      image: product.image,
    });
  const increment = () => (cartItem ? updateQuantity(cartItem.id, cartItem.quantity + 1) : add());
  const decrement = () => {
    if (!cartItem) return;
    if (cartItem.quantity <= 1) removeItem(cartItem.id);
    else updateQuantity(cartItem.id, cartItem.quantity - 1);
  };
  const selectAttribute = (name: string, value: string) => setSelectedAttributes((p) => ({ ...p, [name]: value }));

  // Native share sheet on phones; copies the link elsewhere.
  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const share = async () => {
    if (navigator.share) await navigator.share({ title: product.name, url: productUrl }).catch(() => {});
    else {
      await navigator.clipboard?.writeText(productUrl);
      toast.success("Link copied");
    }
  };

  const storeWhatsApp = onlineStore?.whatsappNumber || onlineStore?.social?.whatsapp || "";
  const variantText = selectedVariant && attributes.length ? ` (${Object.values(selectedAttributes).join(", ")})` : "";
  const whatsAppHref = whatsAppLink(storeWhatsApp, `Hi, I'd like to order: ${product.name}${variantText} — ${formatCurrency(currentPrice)}\n${productUrl}`) || null;

  return {
    status: "ready" as const,
    product,
    attributes,
    selectedAttributes,
    selectAttribute,
    selectedVariant,
    images,
    selectedImage,
    setSelectedImage,
    currentPrice,
    originalPrice,
    discount,
    currentStock,
    currentSku,
    inStock: currentStock > 0,
    cartItem,
    add,
    increment,
    decrement,
    openCart: () => setIsOpen(true),
    inWishlist,
    toggleWishlist: () => toggleWishlist(product.id),
    share,
    whatsAppHref,
    quickOrderHref: `/order/${product.slug}`,
    categoryHref: categoryHref(product.category),
    relatedProducts,
    formatCurrency,
    freeShippingThreshold,
  };
}

export type ProductPageState = Extract<ReturnType<typeof useProductPage>, { status: "ready" }>;
