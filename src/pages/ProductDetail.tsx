import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Plus, Minus, ChevronRight, Truck, Shield, RotateCcw, Heart, Share2, Check, Package, Tag } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import type { ProductAttribute } from "@/types/product";

// Color map for visual swatches
const COLOR_MAP: Record<string, string> = {
  "black": "#1a1a1a", "midnight black": "#0a0a0a", "white": "#f5f5f5", "navy": "#1e3a5f",
  "silver": "#c0c0c0", "rose gold": "#b76e79", "red": "#e53e3e", "green": "#38a169",
  "blue": "#3182ce",
};

function deriveAttributes(variants: NonNullable<ReturnType<typeof mapApiProduct>["variants"]>): ProductAttribute[] {
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

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatCurrency } = useCurrency();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const { data: apiProduct, isLoading } = useProduct(slug ?? null);
  const product = useMemo(() => (apiProduct ? mapApiProduct(apiProduct) : null), [apiProduct]);

  const attributes = useMemo(() => {
    if (!product?.variants?.length) return [];
    return deriveAttributes(product.variants);
  }, [product]);

  // Related products — only fetch once we know the category
  const { data: relatedData } = useProducts(
    product ? { category_id: apiProduct?.category_id ?? undefined, limit: 5 } : {}
  );
  const relatedProducts = useMemo(() => {
    if (!product || !relatedData) return [];
    return relatedData.data
      .map(mapApiProduct)
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [relatedData, product]);

  // Initialize attribute selections when product loads
  useEffect(() => {
    if (product?.slug && slug && product.slug !== slug) {
      navigate(`/product/${product.slug}`, { replace: true });
    }
  }, [navigate, product?.slug, slug]);

  useEffect(() => {
    if (attributes.length) {
      const initial: Record<string, string> = {};
      attributes.forEach((attr) => { initial[attr.name] = attr.values[0]; });
      setSelectedAttributes(initial);
    } else {
      setSelectedAttributes({});
    }
    setSelectedImage(0);
  }, [product?.id, attributes.length]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) =>
      Object.entries(selectedAttributes).every(([key, val]) => v.attributes[key] === val)
    ) || product.variants[0];
  }, [product, selectedAttributes]);

  const cartItem = items.find((i) => i.id === String(selectedVariant?.id ?? product?.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/40 border-b border-border">
          <div className="container py-4">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-6 w-64 rounded mt-2" />
          </div>
        </div>
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-20 h-20 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-6 w-1/2 rounded" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-12 w-48 rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/shop")} className="rounded-xl">Back to Shop</Button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant ? selectedVariant.price : product.originalPrice;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const currentSku = selectedVariant?.sku ?? product.sku ?? "N/A";
  const discount = originalPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const images = product.images?.length ? product.images : [product.image];

  const handleAdd = () => {
    addItem({
      id: String(selectedVariant?.id ?? product.id),
      productId: Number(product.id),
      variantId: selectedVariant ? Number(selectedVariant.id) : null,
      name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      price: currentPrice,
      image: product.image,
    });
  };

  const isColorAttribute = (name: string) => name.toLowerCase() === "color";

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/40 border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/shop?cat=${product.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`} className="hover:text-primary transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-square rounded-2xl border border-border bg-muted/20 overflow-hidden mb-4 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                  onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placeholder.svg')) t.src = '/placeholder.svg' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {(discount > 0 || product.badge) && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider gradient-accent text-accent-foreground">
                      {discount}% Off
                    </span>
                  )}
                  {product.badge && (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-primary-foreground">
                      {product.badge}
                    </span>
                  )}
                </div>
              )}
              {/* Floating actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleWishlist(product.id)}
                  className={`rounded-full h-10 w-10 backdrop-blur-sm border-border/50 ${isInWishlist(product.id) ? "bg-accent text-accent-foreground" : "bg-background/80"}`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden bg-muted/20 transition-all shrink-0 ${
                    selectedImage === i ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placeholder.svg')) t.src = '/placeholder.svg' }} />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-semibold text-primary border-primary/30">
                {product.category}
              </Badge>
              {currentStock > 0 && currentStock <= 5 && (
                <Badge variant="destructive" className="text-[10px]">Only {currentStock} left!</Badge>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price Block */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-foreground">{formatCurrency(currentPrice)}</span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
                )}
                {discount > 0 && (
                  <Badge className="gradient-accent text-accent-foreground border-0 text-xs">
                    Save {formatCurrency(originalPrice! - currentPrice)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> SKU: {currentSku}</span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {currentStock > 0 ? (
                    <span className="text-primary font-medium">In Stock ({currentStock})</span>
                  ) : (
                    <span className="text-destructive font-medium">Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Variant Selectors */}
            {attributes.length > 0 && (
              <div className="space-y-5 mb-6">
                {attributes.map((attr) => (
                  <div key={attr.name}>
                    <label className="text-sm font-semibold text-foreground mb-2.5 block">
                      {attr.displayName}: <span className="text-primary font-bold">{selectedAttributes[attr.name]}</span>
                    </label>
                    {isColorAttribute(attr.displayName) ? (
                      <div className="flex flex-wrap gap-2.5">
                        {attr.values.map((val) => {
                          const hex = COLOR_MAP[val.toLowerCase()] || "#888";
                          const selected = selectedAttributes[attr.name] === val;
                          return (
                            <motion.button
                              key={val}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedAttributes((p) => ({ ...p, [attr.name]: val }))}
                              className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                                selected ? "border-primary ring-2 ring-primary/30 shadow-lg" : "border-border hover:border-primary/50"
                              }`}
                              title={val}
                            >
                              <span className="absolute inset-1 rounded-full" style={{ backgroundColor: hex }} />
                              {selected && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                                </motion.span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((val) => {
                          const selected = selectedAttributes[attr.name] === val;
                          return (
                            <motion.button
                              key={val}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedAttributes((p) => ({ ...p, [attr.name]: val }))}
                              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {val}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">Available stock</span>
                    {currentStock > 0 ? (
                      <span className="font-semibold text-primary">{currentStock} unit{currentStock === 1 ? "" : "s"}</span>
                    ) : (
                      <span className="font-semibold text-destructive">Out of stock</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              {cartItem ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-1 border border-border rounded-xl p-1 bg-muted/30">
                  <button
                    onClick={() => cartItem.quantity <= 1 ? removeItem(cartItem.id) : updateQuantity(cartItem.id, cartItem.quantity - 1)}
                    className="w-11 h-11 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-14 text-center text-base font-bold text-foreground">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                    className="w-11 h-11 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <Button
                  onClick={handleAdd}
                  size="lg"
                  disabled={currentStock === 0}
                  className="rounded-xl gap-2 flex-1 max-w-xs h-12 text-base"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, title: "Free Shipping", sub: `Orders ${formatCurrency(50)}+` },
                { icon: Shield, title: "Secure Payment", sub: "100% Protected" },
                { icon: RotateCcw, title: "Easy Returns", sub: "30-Day Policy" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center border border-border/30">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground leading-tight">{title}</span>
                  <span className="text-[10px] text-muted-foreground">{sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1 h-auto">
              <TabsTrigger value="description" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Reviews ({product.reviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="leading-relaxed text-sm">
                  {product.description || `Experience premium quality with the ${product.name}. Designed for everyday use with attention to detail and craftsmanship. This product combines functionality with modern aesthetics, making it the perfect choice for discerning customers.`}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{product.category}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium text-foreground">{currentSku}</span>
                </div>
                {attributes.map((attr) => (
                  <div key={attr.name} className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                    <span className="text-muted-foreground">{attr.displayName}</span>
                    <span className="font-medium text-foreground">{attr.values.join(", ")}</span>
                  </div>
                ))}
                {product.variants && product.variants.length > 0 && (
                  <div className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                    <span className="text-muted-foreground">Variants</span>
                    <span className="font-medium text-foreground">{product.variants.length} options</span>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
            <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Related Products</h2>
              <Link to={`/shop?cat=${product.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
