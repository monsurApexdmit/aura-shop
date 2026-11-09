import { Link, useParams } from "react-router-dom";
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
import { CountBadge } from "./parts";
import { FOCUS } from "./lib";

function LoadingState() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading product">
      <div className="container py-3 md:py-5">
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
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Product not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have sold out or been removed. Try searching, or browse similar items.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/shop" className={cn("flex h-10 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-ink-foreground hover:bg-ink/90", FOCUS)}>Browse the shop</Link>
            <Link to="/deals" className={cn("flex h-10 items-center justify-center rounded-md border border-highlight px-5 text-sm font-semibold text-highlight hover:bg-highlight/10", FOCUS)}>Today's deals</Link>
          </div>
        </div>
      </div>
      <Footer />
      {/* Room so the fixed bar never covers the end of the page */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </div>
  );
}

/** Marketplace product page: gallery · buy box · service box, then detail panels and similar items. */
export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = useProductPage(slug, { relatedLimit: 12 });
  const ready = page.status === "ready" ? page : null;
  const { qty, setQty, addToCart } = useQuantityAdd(ready);
  const { totalItems } = useCart();

  if (page.status === "loading") return <LoadingState />;
  if (page.status === "missing" || !ready) return <MissingState />;

  const { product, images, selectedImage, setSelectedImage, discount, inWishlist, toggleWishlist, share, relatedProducts, inStock, cartItem, openCart, whatsAppHref, quickOrderHref, categoryHref } = ready;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-0 md:py-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden md:block">
          <ol className="mb-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className={cn("rounded-sm hover:text-highlight", FOCUS)}>Home</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
            {product.category && (
              <>
                <li className="shrink-0"><Link to={categoryHref} className={cn("rounded-sm hover:text-highlight", FOCUS)}>{product.category}</Link></li>
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              </>
            )}
            <li className="min-w-0 truncate font-medium text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-3 md:gap-4 lg:grid-cols-12">
          <div className="min-w-0 md:rounded-lg md:border md:border-border md:bg-card md:p-4 lg:col-span-9">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[5fr_4fr] lg:gap-6">
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
              <div className="min-w-0 rounded-lg bg-card p-3 md:p-0">
                <ProductBuyBox page={ready} qty={qty} setQty={setQty} addToCart={addToCart} />
              </div>
            </div>
          </div>
          <aside className="min-w-0 lg:col-span-3" aria-label="Delivery and store">
            <ProductSideBox page={ready} />
          </aside>
        </div>

        <div className="mt-3 md:mt-4 lg:w-9/12 lg:pr-2">
          <ProductDetails page={ready} />
        </div>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="mk-similar" className="mt-6">
            <h2 id="mk-similar" className="mb-3 font-display text-lg font-bold text-foreground">Similar products</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
              <MessageCircle className="h-5 w-5 text-foreground" aria-hidden="true" /> Chat
            </a>
          ) : (
            <Link to="/shop" className={cn("flex w-12 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground", FOCUS)}>
              <Store className="h-5 w-5 text-foreground" aria-hidden="true" /> Store
            </Link>
          )}
          <button type="button" onClick={openCart} aria-label={`Cart, ${totalItems} items`} className={cn("flex w-12 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground", FOCUS)}>
            <span className="relative">
              <ShoppingCart className="h-5 w-5 text-foreground" aria-hidden="true" />
              <CountBadge count={totalItems} />
            </span>
            Cart
          </button>
          {inStock ? (
            <div className="ml-1 flex h-11 min-w-0 flex-1 overflow-hidden rounded-md">
              <button
                type="button"
                onClick={cartItem ? openCart : addToCart}
                className={cn("flex min-w-0 flex-1 items-center justify-center bg-ink px-2 text-sm font-bold text-ink-foreground active:bg-ink/90", FOCUS)}
              >
                <span className="truncate">{cartItem ? `In cart (${cartItem.quantity})` : "Add to cart"}</span>
              </button>
              <Link to={quickOrderHref} className={cn("flex min-w-0 flex-1 items-center justify-center bg-highlight px-2 text-sm font-bold text-highlight-foreground active:bg-highlight/90", FOCUS)}>
                <span className="truncate">Buy now</span>
              </Link>
            </div>
          ) : (
            <button type="button" disabled className="ml-1 h-11 flex-1 rounded-md bg-secondary text-sm font-bold text-muted-foreground">Out of stock</button>
          )}
        </div>
      </div>

      <Footer />
      {/* Room so the fixed bar never covers the end of the page */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </div>
  );
}
