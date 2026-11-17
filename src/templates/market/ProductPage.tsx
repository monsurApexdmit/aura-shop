import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, MessageCircle, PackageSearch, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useProductPage } from "@/templates/shared/useProductPage";
import ProductGallery from "./ProductGallery";
import ProductBuyBox from "./ProductBuyBox";
import { ProductDetails, ProductSideBox } from "./ProductExtras";
import { useQuantityAdd } from "./productActions";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import { CountBadge, PRODUCT_GRID, SectionHeader } from "./parts";
import { FOCUS, WRAP } from "./lib";

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label={t("tpl_market:page.loading")}>
      <div className={cn(WRAP, "py-3 md:py-5")}>
        <Skeleton className="mb-4 hidden h-4 w-72 md:block" />
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="-mx-4 md:mx-0 lg:col-span-5">
            <Skeleton className="aspect-square w-full rounded-none md:rounded-lg" />
          </div>
          <div className="space-y-3 lg:col-span-4">
            <Skeleton className="h-7 w-11/12" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="hidden h-12 w-full md:block" />
          </div>
          <div className="hidden space-y-3 lg:col-span-3 lg:block">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MissingState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className={cn(WRAP, "py-16")}>
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">{t("tpl_market:page.notFound")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("tpl_market:page.notFoundText")}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/shop" className={cn("flex h-10 items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90", FOCUS)}>{t("tpl_market:page.browseShop")}</Link>
            <Link to="/deals" className={cn("flex h-10 items-center justify-center rounded-pill border border-primary px-5 text-sm font-semibold text-primary hover:bg-primary/10", FOCUS)}>{t("tpl_market:page.todaysDeals")}</Link>
          </div>
        </div>
      </div>
      <Footer />
      {/* Room so the fixed bar never covers the end of the page */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </div>
  );
}

/** Tech Store product page: gallery · buy box in one white panel, delivery/store box beside it, then detail panels and similar items. */
export default function ProductPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const page = useProductPage(slug, { relatedLimit: 10 });
  const ready = page.status === "ready" ? page : null;
  const { qty, setQty, addToCart } = useQuantityAdd(ready);
  const { totalItems } = useCart();

  if (page.status === "loading") return <LoadingState />;
  if (page.status === "missing" || !ready) return <MissingState />;

  const { product, images, selectedImage, setSelectedImage, discount, inWishlist, toggleWishlist, share, relatedProducts, inStock, cartItem, openCart, whatsAppHref, quickOrderHref, categoryHref } = ready;

  return (
    <div className="min-h-screen bg-background">
      <div className={cn(WRAP, "py-0 md:py-5")}>
        {/* Breadcrumbs */}
        <nav aria-label={t("tpl_market:page.breadcrumb")} className="hidden md:block">
          <ol className="mb-4 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className={cn("rounded-sm hover:text-primary", FOCUS)}>{t("common:nav.home")}</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
            {product.category && (
              <>
                <li className="shrink-0"><Link to={categoryHref} className={cn("rounded-sm hover:text-primary", FOCUS)}>{product.category}</Link></li>
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              </>
            )}
            <li className="min-w-0 truncate font-medium text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-3 md:gap-4 lg:grid-cols-12">
          <div className="min-w-0 md:rounded-xl md:border md:border-border md:bg-card md:p-5 lg:col-span-9 xl:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
              <ProductGallery
                images={images}
                name={product.name}
                selected={selectedImage}
                onSelect={setSelectedImage}
                discount={discount}
                liked={inWishlist}
                onLike={toggleWishlist}
                onShare={share}
              />
              <div className="min-w-0 rounded-xl bg-card p-3 md:p-0">
                <ProductBuyBox page={ready} qty={qty} setQty={setQty} addToCart={addToCart} />
              </div>
            </div>
          </div>
          <aside className="min-w-0 lg:col-span-3" aria-label={t("tpl_market:page.deliveryAndStore")}>
            <ProductSideBox page={ready} />
          </aside>
        </div>

        <div className="mt-3 md:mt-4 lg:w-9/12 lg:pr-2">
          <ProductDetails page={ready} />
        </div>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="ts-similar" className="mt-8 md:mt-10">
            <SectionHeader id="ts-similar" title={t("tpl_market:page.alsoLike")} to={categoryHref} />
            <div className={PRODUCT_GRID}>
              {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Phones: marketplace action bar in place of the tab bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex h-16 items-center gap-1 px-2">
          {whatsAppHref ? (
            <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className={cn("flex w-12 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground", FOCUS)}>
              <MessageCircle className="h-5 w-5 text-foreground" aria-hidden="true" /> {t("tpl_market:page.chat")}
            </a>
          ) : (
            <Link to="/shop" className={cn("flex w-12 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground", FOCUS)}>
              <Store className="h-5 w-5 text-foreground" aria-hidden="true" /> {t("tpl_market:page.store")}
            </Link>
          )}
          <button type="button" onClick={openCart} aria-label={t("tpl_market:mobileNav.cartLabel", { count: totalItems })} className={cn("flex w-12 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground", FOCUS)}>
            <span className="relative">
              <ShoppingCart className="h-5 w-5 text-foreground" aria-hidden="true" />
              <CountBadge count={totalItems} />
            </span>
            {t("common:nav.cart")}
          </button>
          {inStock ? (
            <div className="ml-1 flex h-11 min-w-0 flex-1 overflow-hidden rounded-pill">
              <button
                type="button"
                onClick={cartItem ? openCart : addToCart}
                className={cn("flex min-w-0 flex-1 items-center justify-center border border-primary bg-card px-2 text-sm font-semibold text-primary active:bg-accent", FOCUS)}
              >
                <span className="truncate">{cartItem ? t("tpl_market:page.inCart", { count: cartItem.quantity }) : t("common:actions.addToCart")}</span>
              </button>
              <Link to={quickOrderHref} className={cn("flex min-w-0 flex-1 items-center justify-center bg-primary px-2 text-sm font-semibold text-primary-foreground active:bg-primary/90", FOCUS)}>
                <span className="truncate">{t("common:actions.buyNow")}</span>
              </Link>
            </div>
          ) : (
            <button type="button" disabled className="ml-1 h-11 flex-1 rounded-pill bg-secondary text-sm font-bold text-muted-foreground">{t("common:product.outOfStock")}</button>
          )}
        </div>
      </div>

      <Footer />
      {/* Room so the fixed bar never covers the end of the page */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </div>
  );
}
