import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Plus, Minus, ChevronRight, Truck, Shield, RotateCcw, Heart, Share2 } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find((p) => p.id === id);

  const cartItem = items.find((i) => i.id === product?.id);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

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

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
  };

  // Mock multiple images using same image
  const images = [product.image, product.image, product.image];

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
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square rounded-2xl border border-border bg-muted/20 overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
              {(discount > 0 || product.badge) && (
                <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  discount > 0 ? "gradient-accent text-accent-foreground" : "gradient-primary text-primary-foreground"
                }`}>
                  {discount > 0 ? `${discount}% Off` : product.badge}
                </span>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden bg-muted/20 transition-all ${
                    selectedImage === i ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  <Badge className="gradient-accent text-accent-foreground border-0 text-xs">Save ${(product.originalPrice - product.price).toFixed(2)}</Badge>
                </>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-display font-semibold text-sm text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience premium quality with the {product.name}. Designed for everyday use with attention to detail and craftsmanship. 
                This product combines functionality with modern aesthetics, making it the perfect choice for discerning customers.
              </p>
            </div>

            {/* Subcategory */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Badge variant="outline" className="text-xs">{product.subcategory}</Badge>
            </div>

            {/* Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              {cartItem ? (
                <div className="flex items-center gap-1 border border-border rounded-xl p-1">
                  <button
                    onClick={() => cartItem.quantity <= 1 ? removeItem(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-base font-bold text-foreground">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    className="w-10 h-10 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button onClick={handleAdd} size="lg" className="rounded-xl gap-2 flex-1 max-w-xs">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              )}
              <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 shrink-0">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 shrink-0">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-medium text-foreground leading-tight">Free Shipping</span>
                <span className="text-[10px] text-muted-foreground">Orders $50+</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-medium text-foreground leading-tight">Secure Payment</span>
                <span className="text-[10px] text-muted-foreground">100% Protected</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-medium text-foreground leading-tight">Easy Returns</span>
                <span className="text-[10px] text-muted-foreground">30-Day Policy</span>
              </div>
            </div>
          </motion.div>
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
