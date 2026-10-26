import { cn } from "@/lib/utils"
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Plus, Minus, ChevronRight, Truck, Shield, RotateCcw, Heart, Share2, Package, Tag } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { EmptyState } from "@/components/common/EmptyState";
import { ImageThumbButton } from "@/components/common/ImageThumbButton";
import { InfoList, InfoRow } from "@/components/common/InfoList";
import { SwatchPicker } from "@/components/common/SwatchPicker";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import type { ProductAttribute } from "@/types/product";

const MotionCard = motion.create(Card);

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
  const { formatCurrency, freeShippingThreshold } = useCurrency();
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
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-64 mt-2" />
          </div>
        </div>
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="space-y-4">
              <Skeleton className="aspect-square" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-20 h-20" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-48" />
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
        <EmptyState
          icon={Package}
          title="Product Not Found"
          description="The product you're looking for doesn't exist."
          action={<Button onClick={() => navigate("/shop")}>Back to Shop</Button>}
        />
      </div>
    );
  }

  const currentPrice = (() => {
    if (!selectedVariant) return product.price
    // variant base price (sale_price or price)
    const vBase = selectedVariant.salePrice && selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.price
    // use variant's own offer if set, else fall back to product-level offer
    const offerPrice = selectedVariant.offerPrice ?? product.offerPrice
    const offerType = selectedVariant.offerType ?? product.offerType ?? 'percentage'
    if (offerPrice && offerPrice > 0) {
      const final = offerType === 'percentage' ? vBase * (1 - offerPrice / 100) : vBase - offerPrice
      if (final > 0 && final < vBase) return final
    }
    return vBase
  })()
  const originalPrice = (() => {
    if (!selectedVariant) return product.originalPrice
    const vBase = selectedVariant.salePrice && selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.price
    const offerPrice = selectedVariant.offerPrice ?? product.offerPrice
    const offerType = selectedVariant.offerType ?? product.offerType ?? 'percentage'
    if (offerPrice && offerPrice > 0) {
      const final = offerType === 'percentage' ? vBase * (1 - offerPrice / 100) : vBase - offerPrice
      if (final > 0 && final < vBase) return vBase
    }
    return undefined
  })()
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const currentSku = selectedVariant?.sku ?? product.sku ?? "N/A";
  const discount = originalPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

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
            <Card className="relative aspect-square overflow-hidden mb-4 group">
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
                    <Badge variant="destructive" className="uppercase">
                      {discount}% Off
                    </Badge>
                  )}
                  {product.badge && (
                    <Badge className="uppercase">
                      {product.badge}
                    </Badge>
                  )}
                </div>
              )}
              {/* Floating actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant={isInWishlist(product.id) ? "default" : "outline"}
                  size="icon"
                  aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={isInWishlist(product.id)}
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className={cn("h-4 w-4", isInWishlist(product.id) ? "fill-current" : "")} />
                </Button>
                <Button variant="outline" size="icon" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <ImageThumbButton
                  key={i}
                  src={img}
                  aria-label={`Show image ${i + 1}`}
                  selected={selectedImage === i}
                  onClick={() => setSelectedImage(i)}
                  className="size-20"
                  imgClassName="object-contain p-2"
                  onImageError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placeholder.svg')) t.src = '/placeholder.svg' }}
                />
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="uppercase">
                {product.category}
              </Badge>
              {currentStock > 0 && currentStock <= 5 && (
                <Badge variant="destructive">Only {currentStock} left!</Badge>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border")} />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price Block */}
            <Card className="p-4 mb-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-3xl font-bold text-foreground">{formatCurrency(currentPrice)}</span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
                )}
                {discount > 0 && (
                  <Badge variant="secondary">
                    Save {formatCurrency(originalPrice! - currentPrice)}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
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
            </Card>

            {/* Variant Selectors */}
            {attributes.length > 0 && (
              <div className="space-y-5 mb-6">
                {attributes.map((attr) => (
                  <div key={attr.name}>
                    <Label className="mb-2.5 block">
                      {attr.displayName}: <span className="text-primary font-bold">{selectedAttributes[attr.name]}</span>
                    </Label>
                    {isColorAttribute(attr.displayName) ? (
                      <SwatchPicker
                        aria-label={attr.displayName}
                        options={attr.values.map((v) => ({ value: v, label: v, color: COLOR_MAP[v.toLowerCase()] || "#888" }))}
                        value={selectedAttributes[attr.name]}
                        onValueChange={(val) => setSelectedAttributes((p) => ({ ...p, [attr.name]: val }))}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((val) => {
                          const selected = selectedAttributes[attr.name] === val;
                          return (
                            <Button key={val} variant={selected ? "default" : "outline"} asChild>
                              <motion.button
                                type="button"
                                aria-pressed={selected}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedAttributes((p) => ({ ...p, [attr.name]: val }))}
                              >
                                {val}
                              </motion.button>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                <Card className="px-4 py-3">
                  <InfoList>
                    <InfoRow
                      label="Available stock"
                      value={currentStock > 0 ? (
                        <span className="text-primary">{currentStock} unit{currentStock === 1 ? "" : "s"}</span>
                      ) : (
                        <span className="text-destructive">Out of stock</span>
                      )}
                    />
                  </InfoList>
                </Card>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Add to Cart */}
            <div className="flex flex-col gap-3 mb-6 min-[420px]:flex-row min-[420px]:items-center">
              {cartItem ? (
                <MotionCard initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-1 p-1">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    onClick={() => cartItem.quantity <= 1 ? removeItem(cartItem.id) : updateQuantity(cartItem.id, cartItem.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-14 text-center text-base font-bold text-foreground">{cartItem.quantity}</span>
                  <Button
                    size="icon"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </MotionCard>
              ) : (
                <Button
                  onClick={handleAdd}
                  size="lg"
                  disabled={currentStock === 0}
                  className="gap-2 flex-1 min-[420px]:max-w-xs"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Trust Badges */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3">
              {[
                { icon: Truck, title: "Free Shipping", sub: freeShippingThreshold != null ? `Orders ${formatCurrency(freeShippingThreshold)}+` : "Fast delivery" },
                { icon: Shield, title: "Secure Payment", sub: "100% Protected" },
                { icon: RotateCcw, title: "Easy Returns", sub: "30-Day Policy" },
              ].map(({ icon: Icon, title, sub }) => (
                <Card key={title} className="flex flex-col items-center gap-2 p-3 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground leading-tight">{title}</span>
                  <span className="text-[10px] text-muted-foreground">{sub}</span>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bundle Contents */}
        {product.isBundle && product.bundleItems && product.bundleItems.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">What's in this bundle</h3>
              <Badge variant="secondary">{product.bundleItems.length} items</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.bundleItems.map((item, i) => (
                <Item key={i} variant="outline" size="sm" className="flex-nowrap">
                  <ItemMedia>
                    <UserAvatar
                      shape="square"
                      className="size-12"
                      src={item.image}
                      name={item.productName}
                      fallback={<Package className="h-5 w-5 opacity-40" />}
                    />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="block w-full truncate">{item.productName}</ItemTitle>
                    {item.sku && <ItemDescription className="text-xs">SKU: {item.sku}</ItemDescription>}
                  </ItemContent>
                  <ItemActions>
                    <Badge variant="secondary">×{item.quantity}</Badge>
                  </ItemActions>
                </Item>
              ))}
            </div>
          </div>
        )}

        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="leading-relaxed text-sm">
                  {product.description || `Experience premium quality with the ${product.name}. Designed for everyday use with attention to detail and craftsmanship. This product combines functionality with modern aesthetics, making it the perfect choice for discerning customers.`}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <InfoList className="grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow label="Category" value={product.category} />
                <InfoRow label="SKU" value={currentSku} />
                {attributes.map((attr) => (
                  <InfoRow key={attr.name} label={attr.displayName} value={attr.values.join(", ")} />
                ))}
                {product.variants && product.variants.length > 0 && (
                  <InfoRow label="Variants" value={`${product.variants.length} options`} />
                )}
              </InfoList>
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
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to={`/shop?cat=${product.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}>
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
