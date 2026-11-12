import { useMemo } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const { t } = useTranslation();
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
      <div className="bg-muted/40">
        <div className="container py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader
              title={
                <span className="flex items-center gap-3">
                  <Heart className="h-7 w-7 text-foreground fill-highlight" />
                  {t("account:wishlist.title")}
                </span>
              }
              description={isLoading ? t("common:status.loading") : t("account:wishlist.saved", { count: wishlistProducts.length })}
            />
          </motion.div>
        </div>
      </div>
      <Separator />

      <div className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState
              className="py-16"
              icon={Heart}
              title={t("account:wishlist.empty")}
              description={t("account:wishlist.emptyDesc")}
              action={
                <Button asChild className="gap-2">
                  <Link to="/shop">
                    <ShoppingCart className="h-4 w-4" /> {t("account:wishlist.browse")}
                  </Link>
                </Button>
              }
            />
          </motion.div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <Button variant="outline" size="sm" onClick={clearWishlist} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" /> {t("account:wishlist.clearAll")}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
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
