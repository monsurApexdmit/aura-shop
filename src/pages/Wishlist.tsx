import { useMemo } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Wishlist() {
  const { wishlist, clearWishlist } = useWishlist();

  // Fetch a broad set of products and filter by wishlist IDs client-side
  const { data, isLoading } = useProducts({ limit: 100 });
  const allProducts = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);
  const wishlistProducts = useMemo(
    () => allProducts.filter((p) => wishlist.includes(p.id)),
    [allProducts, wishlist]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/40 border-b border-border">
        <div className="container py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="h-7 w-7 text-accent fill-accent" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isLoading ? "Loading..." : `${wishlistProducts.length} ${wishlistProducts.length === 1 ? "item" : "items"} saved`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm mb-6">Browse our products and save your favorites!</p>
            <Link to="/shop">
              <Button className="rounded-xl gap-2">
                <ShoppingCart className="h-4 w-4" /> Browse Products
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <Button variant="outline" size="sm" onClick={clearWishlist} className="rounded-xl gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Clear All
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {wishlistProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
