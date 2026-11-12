import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, Heart, MessageCircle, Minus, Package, PackageSearch, Plus, RotateCcw, ShieldCheck, ShoppingCart, Sparkles, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductReviews from "@/components/ProductReviews";
import { isColorAttribute, swatchColor, useProductPage, type ProductPageState } from "@/templates/shared/useProductPage";
import ProductGallery from "./ProductGallery";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import { useQuantityAdd } from "./productActions";
import { ProductGrid, SectionHeader, Stars } from "./parts";
import { FOCUS, tone } from "./lib";

const PILL = "inline-flex items-center justify-center gap-2 rounded-pill text-sm font-extrabold transition-colors";

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label={t("tpl_single:page.loading")}>
      <div className="container grid gap-6 py-5 md:grid-cols-2 md:py-8 lg:gap-10">
        <div className="aspect-square animate-pulse rounded-[1.75rem] bg-secondary" />
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded-pill bg-secondary" />
          <div className="h-9 w-11/12 animate-pulse rounded-pill bg-secondary" />
          <div className="h-4 w-40 animate-pulse rounded-pill bg-secondary" />
          <div className="h-10 w-48 animate-pulse rounded-pill bg-secondary" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-secondary" />
          <div className="h-12 w-full animate-pulse rounded-pill bg-secondary" />
        </div>
      </div>
    </div>
  );
}

function MissingState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <div className="mx-auto max-w-md rounded-[1.75rem] bg-tile-1 p-8 text-center dark:bg-tile-1/15">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-card text-primary" aria-hidden="true">
            <PackageSearch className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">{t("tpl_single:page.notFound")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("tpl_single:page.notFoundText")}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/shop" className={cn(PILL, "h-11 bg-primary px-6 text-primary-foreground hover:bg-primary/90", FOCUS)}>{t("tpl_single:page.browseShop")}</Link>
            <Link to="/deals" className={cn(PILL, "h-11 border-2 border-primary bg-card px-6 text-primary hover:bg-accent", FOCUS)}>{t("tpl_single:page.seeDeals")}</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Stepper({ value, onDec, onInc, decDisabled, incDisabled, label }: { value: number; onDec: () => void; onInc: () => void; decDisabled?: boolean; incDisabled?: boolean; label: string }) {
  const { t } = useTranslation();
  const btn = cn("flex size-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm hover:text-primary disabled:opacity-40", FOCUS);
  return (
    <div className="flex h-12 items-center gap-1 rounded-pill bg-secondary p-1" role="group" aria-label={label}>
      <button type="button" onClick={onDec} disabled={decDisabled} aria-label={t("common:actions.decrease")} className={btn}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-9 text-center font-display text-lg font-semibold tabular-nums text-foreground" aria-live="polite">{value}</span>
      <button type="button" onClick={onInc} disabled={incDisabled} aria-label={t("common:actions.increase")} className={btn}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function BuyBox({ page, qty, setQty, addToCart }: { page: ProductPageState; qty: number; setQty: (fn: (q: number) => number) => void; addToCart: () => void }) {
  const {
    product, attributes, selectedAttributes, selectAttribute, currentPrice, originalPrice, discount, currentStock, inStock,
    cartItem, increment, decrement, openCart, inWishlist, toggleWishlist, quickOrderHref, whatsAppHref, categoryHref, formatCurrency, freeShippingThreshold,
  } = page;
  const { t } = useTranslation();
  const sold = product.totalSold ?? 0;
  const maxQty = Math.max(1, currentStock);

  return (
    <div className="min-w-0">
      {product.category && (
        <Link to={categoryHref} className={cn("inline-flex rounded-pill bg-accent px-3 py-1 text-xs font-extrabold text-primary hover:bg-primary hover:text-primary-foreground", FOCUS)}>
          {product.category}
        </Link>
      )}
      <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight text-foreground sm:text-[32px]">{product.name}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {product.reviews > 0 ? (
          <a href="#reviews" className={cn("flex items-center gap-1.5 rounded-pill hover:text-primary", FOCUS)}>
            <Stars rating={product.rating} className="[&_svg]:h-4 [&_svg]:w-4" />
            <span className="font-bold text-foreground">{product.rating.toFixed(1)}</span>
            <span>({t("common:product.reviews", { count: product.reviews })})</span>
          </a>
        ) : (
          <span className="flex items-center gap-1.5"><Stars rating={0} className="[&_svg]:h-4 [&_svg]:w-4" /> {t("tpl_single:page.noReviews")}</span>
        )}
        {sold > 0 && <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-highlight" aria-hidden="true" /> {t("tpl_single:page.sold", { count: sold })}</span>}
      </div>

      {/* Price */}
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-display text-[34px] font-semibold leading-none tabular-nums text-foreground">{formatCurrency(currentPrice)}</span>
        {originalPrice && (
          <span className="text-base tabular-nums text-muted-foreground line-through">
            <span className="sr-only">{t("tpl_single:card.was")}</span>{formatCurrency(originalPrice)}
          </span>
        )}
        {discount > 0 && <span className="rounded-pill bg-highlight px-2.5 py-0.5 text-xs font-extrabold text-highlight-foreground">{t("common:product.save", { amount: `${discount}%` })}</span>}
      </div>
      <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-bold", !inStock ? "text-destructive" : currentStock <= 5 ? "text-highlight" : "text-[hsl(152_60%_32%)] dark:text-[hsl(152_55%_60%)]")}>
        <span className={cn("size-2 rounded-full bg-current")} aria-hidden="true" />
        {!inStock ? t("common:product.outOfStock") : currentStock <= 5 ? t("tpl_single:page.hurry", { count: currentStock }) : t("tpl_single:page.readyToShip")}
      </p>

      {/* Variants */}
      {attributes.map((attr) => {
        const color = isColorAttribute(attr.name);
        return (
          <fieldset key={attr.name} className="mt-5">
            <legend className="mb-2 text-sm font-bold text-foreground">
              {attr.displayName}: <span className="font-semibold text-muted-foreground">{selectedAttributes[attr.name]}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((value) => {
                const selected = selectedAttributes[attr.name] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectAttribute(attr.name, value)}
                    className={cn(
                      "flex h-10 min-w-[2.75rem] items-center gap-2 rounded-pill border-2 px-4 text-sm font-bold transition-colors",
                      selected ? "border-primary bg-accent text-primary" : "border-border bg-card text-foreground hover:border-primary/50",
                      FOCUS,
                    )}
                  >
                    {color && <span className="size-4 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: swatchColor(value) }} aria-hidden="true" />}
                    {value}
                    {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {/* Quantity + buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {cartItem ? (
          <Stepper label={t("tpl_single:page.quantityInCart")} value={cartItem.quantity} onDec={decrement} onInc={increment} incDisabled={cartItem.quantity >= currentStock} />
        ) : (
          <Stepper label={t("common:product.quantity")} value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => Math.min(maxQty, q + 1))} decDisabled={qty <= 1} incDisabled={!inStock || qty >= maxQty} />
        )}
        {cartItem && <span className="text-sm font-bold text-primary">{t("tpl_single:page.inYourCart")}</span>}
      </div>

      <div className="mt-4 hidden gap-3 md:flex">
        {inStock ? (
          <>
            <button
              type="button"
              onClick={cartItem ? openCart : addToCart}
              className={cn(PILL, "h-12 flex-1 bg-primary text-primary-foreground shadow-[0_10px_20px_-10px_hsl(var(--primary))] hover:bg-primary/90", FOCUS)}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" /> {cartItem ? t("tpl_single:page.viewCart") : t("common:actions.addToCart")}
            </button>
            <Link to={quickOrderHref} className={cn(PILL, "h-12 flex-1 bg-highlight text-highlight-foreground hover:bg-highlight/90", FOCUS)}>
              <Zap className="h-4 w-4" aria-hidden="true" /> {t("common:actions.buyNow")}
            </Link>
          </>
        ) : (
          <button type="button" disabled className={cn(PILL, "h-12 flex-1 bg-secondary text-muted-foreground")}>{t("common:product.outOfStock")}</button>
        )}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? t("common:actions.removeFromWishlist") : t("common:actions.addToWishlist")}
          className={cn("flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card text-foreground hover:border-highlight hover:text-highlight", FOCUS)}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-highlight text-highlight")} aria-hidden="true" />
        </button>
      </div>

      {whatsAppHref && (
        <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className={cn("mt-3 inline-flex items-center gap-2 rounded-pill text-sm font-bold text-primary hover:underline", FOCUS)}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("tpl_single:page.whatsApp")}
        </a>
      )}

      {/* Promises */}
      <ul className="mt-6 grid gap-2 sm:grid-cols-3">
        {[
          { Icon: Truck, title: freeShippingThreshold != null ? t("tpl_single:page.freeOver", { amount: formatCurrency(freeShippingThreshold) }) : t("tpl_single:page.fastDelivery"), text: t("tpl_single:page.toYourDoor") },
          { Icon: RotateCcw, title: t("tpl_single:page.returns"), text: t("tpl_single:page.seePolicy") },
          { Icon: ShieldCheck, title: t("tpl_single:page.secureCheckout"), text: t("tpl_single:page.protectedPayment") },
        ].map(({ Icon, title, text }, i) => (
          <li key={title} className={cn("flex items-center gap-2.5 rounded-2xl px-3 py-2.5", tone(i + 2).bg)}>
            <Icon className={cn("h-5 w-5 shrink-0", tone(i + 2).fg)} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-extrabold text-foreground">{title}</span>
              <span className="block truncate text-[11px] text-foreground/75">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cn("scroll-mt-44 rounded-[1.5rem] border border-border bg-card p-5 card-shadow sm:p-6", className)}>
      <h2 id={`${id}-h`} className="mb-3 font-display text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Details({ page }: { page: ProductPageState }) {
  const { t } = useTranslation();
  const { product, attributes, currentSku } = page;
  const specs: [string, string][] = [
    [t("tpl_single:page.category"), product.subcategory ? `${product.category} › ${product.subcategory}` : product.category],
    [t("tpl_single:page.sku"), currentSku],
    ...attributes.map((a): [string, string] => [a.displayName, a.values.join(", ")]),
  ];

  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-[3fr_2fr]">
      <Panel id="description" title={t("tpl_single:page.about")}>
        {product.description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{product.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("tpl_single:page.noDescription")}</p>
        )}
      </Panel>

      <Panel id="details" title={t("tpl_single:page.details")}>
        <dl className="divide-y divide-border text-sm">
          {specs.map(([k, v]) => (
            <div key={k} className="flex gap-3 py-2">
              <dt className="w-28 shrink-0 font-bold text-muted-foreground">{k}</dt>
              <dd className="min-w-0 break-words text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      {product.isBundle && product.bundleItems && product.bundleItems.length > 0 && (
        <Panel id="bundle" title={t("tpl_single:page.bundle", { count: product.bundleItems.length })} className="lg:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-2">
            {product.bundleItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-secondary p-2">
                <span className={cn("flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl", tone(i).bg)}>
                  {item.image ? <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Package className={cn("h-5 w-5", tone(i).fg)} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{item.productName}</span>
                <span className="shrink-0 rounded-pill bg-primary px-2 py-0.5 text-xs font-extrabold text-primary-foreground">×{item.quantity}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel id="reviews" title={product.reviews > 0 ? t("tpl_single:page.reviewsCount", { count: product.reviews }) : t("tpl_single:page.reviews")} className="lg:col-span-2">
        <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
      </Panel>
    </div>
  );
}

/** Kids product page: pastel gallery · buy box with pill controls, then about / details / reviews and more to love. */
export default function ProductPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const page = useProductPage(slug, { relatedLimit: 6 });
  const ready = page.status === "ready" ? page : null;
  const { qty, setQty, addToCart } = useQuantityAdd(ready);

  if (page.status === "loading") return <LoadingState />;
  if (page.status === "missing" || !ready) return <MissingState />;

  const { product, images, selectedImage, setSelectedImage, discount, inWishlist, toggleWishlist, share, relatedProducts, inStock, cartItem, openCart, quickOrderHref, categoryHref, currentPrice, formatCurrency } = ready;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 md:py-6">
        <nav aria-label={t("tpl_single:page.breadcrumb")} className="mb-4 hidden md:block">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <li><Link to="/" className={cn("rounded-sm hover:text-primary", FOCUS)}>{t("common:nav.home")}</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
            {product.category && (
              <>
                <li className="shrink-0"><Link to={categoryHref} className={cn("rounded-sm hover:text-primary", FOCUS)}>{product.category}</Link></li>
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              </>
            )}
            <li className="min-w-0 truncate text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={images}
            name={product.name}
            selected={selectedImage}
            onSelect={setSelectedImage}
            discount={discount}
            badge={product.badge}
            liked={inWishlist}
            onLike={toggleWishlist}
            onShare={share}
          />
          <BuyBox page={ready} qty={qty} setQty={setQty} addToCart={addToCart} />
        </div>

        <Details page={ready} />

        {relatedProducts.length > 0 && (
          <section aria-labelledby="kb-related" className="mt-12">
            <SectionHeader id="kb-related" title={t("tpl_single:page.moreToLove")} Icon={Heart} to={categoryHref} />
            <ProductGrid>
              {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </ProductGrid>
          </section>
        )}
      </div>

      {/* Phones: action bar in place of the tab bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_hsl(var(--primary)/0.35)] md:hidden">
        <div className="flex h-16 items-center gap-2 px-3">
          <span className="min-w-0 shrink font-display text-lg font-semibold tabular-nums text-foreground">{formatCurrency(currentPrice)}</span>
          {inStock ? (
            <div className="ml-auto flex min-w-0 gap-2">
              <button
                type="button"
                onClick={cartItem ? openCart : addToCart}
                className={cn(PILL, "h-11 min-w-0 bg-primary px-4 text-primary-foreground active:bg-primary/90", FOCUS)}
              >
                <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{cartItem ? t("tpl_single:page.inCart", { count: cartItem.quantity }) : t("common:actions.addToCart")}</span>
              </button>
              <Link to={quickOrderHref} className={cn(PILL, "h-11 shrink-0 bg-highlight px-4 text-highlight-foreground active:bg-highlight/90", FOCUS)}>
                {t("common:actions.buyNow")}
              </Link>
            </div>
          ) : (
            <button type="button" disabled className={cn(PILL, "ml-auto h-11 bg-secondary px-6 text-muted-foreground")}>{t("common:product.outOfStock")}</button>
          )}
        </div>
      </div>

      <Footer />
      {/* Room so the fixed bar never covers the end of the page */}
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </div>
  );
}
