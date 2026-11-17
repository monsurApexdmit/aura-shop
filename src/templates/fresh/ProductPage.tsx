import { useId, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote, Bike, ChevronRight, MessageCircle, Package, RotateCcw, SearchX, ShoppingBasket, Truck, Zap, type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ProductReviews from "@/components/ProductReviews";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isColorAttribute, swatchColor, useProductPage, type ProductPageState } from "../shared/useProductPage";
import Footer from "./Footer";
import Gallery from "./Gallery";
import QtyStepper from "./QtyStepper";
import { ProductRow, SectionHeading } from "./Section";
import { Stars } from "./ProductCard";
import { FOCUS, tile } from "./lib";

const BIG_BTN = cn("flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors active:scale-[0.98]", FOCUS);

function Skeleton() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label={t("tpl_fresh:product.loading")}>
      <div className="container grid gap-6 pt-4 md:grid-cols-2 md:gap-10 md:pt-8">
        <div className="aspect-square animate-pulse rounded-2xl bg-secondary" />
        <div className="space-y-4">
          <div className="h-6 w-28 animate-pulse rounded-pill bg-secondary" />
          <div className="h-9 w-4/5 animate-pulse rounded-pill bg-secondary" />
          <div className="h-4 w-1/3 animate-pulse rounded-pill bg-secondary" />
          <div className="h-10 w-1/2 animate-pulse rounded-pill bg-secondary" />
          <div className="h-14 w-full animate-pulse rounded-pill bg-secondary" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-secondary" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container flex flex-col items-center py-16 text-center md:py-24">
        <span className="flex size-28 items-center justify-center rounded-full bg-tile-2 text-ink">
          <SearchX className="h-12 w-12" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground">{t("tpl_fresh:product.notFoundTitle")}</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">{t("tpl_fresh:product.notFoundText")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className={cn(BIG_BTN, "h-12 bg-primary px-6 text-primary-foreground")}>{t("tpl_fresh:product.browseShop")}</Link>
          <Link to="/categories" className={cn(BIG_BTN, "h-12 border-2 border-border bg-card px-6 text-card-foreground")}>{t("common:nav.allCategories")}</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function InfoTile({ Icon, title, text, index }: { Icon: LucideIcon; title: string; text: string; index: number }) {
  return (
    <li className="flex items-center gap-3">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-ink", tile(index))}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-tight text-card-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{text}</span>
      </span>
    </li>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4 md:mt-8 md:p-6">
      <h2 className="font-display text-xl font-bold text-card-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BuyBox({ page }: { page: ProductPageState }) {
  const { t } = useTranslation();
  const { product, cartItem, inStock, currentStock } = page;
  return (
    <div className="space-y-3">
      {!inStock ? (
        <button type="button" disabled className={cn(BIG_BTN, "h-12 w-full cursor-not-allowed bg-secondary text-base text-muted-foreground")}>
          {t("common:product.outOfStock")}
        </button>
      ) : cartItem ? (
        <div className="flex gap-3">
          <QtyStepper
            size="lg"
            name={product.name}
            quantity={cartItem.quantity}
            onIncrement={page.increment}
            onDecrement={page.decrement}
            max={currentStock}
            className="w-36 shrink-0"
          />
          <button
            type="button"
            onClick={page.openCart}
            className={cn(BIG_BTN, "h-12 min-w-0 flex-1 border border-primary bg-accent px-4 text-base text-primary hover:bg-primary hover:text-primary-foreground")}
          >
            <span className="truncate">{t("tpl_fresh:product.inCart", { count: cartItem.quantity })}</span>
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={page.add} className={cn(BIG_BTN, "h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90")}>
          <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
          {t("common:actions.addToCart")}
        </button>
      )}

      {(inStock || page.whatsAppHref) && (
        <div className="flex flex-wrap gap-3">
          {inStock && (
            <Link to={page.quickOrderHref} className={cn(BIG_BTN, "h-12 min-w-[9rem] flex-1 bg-highlight text-base text-highlight-foreground hover:bg-highlight/90")}>
              <Zap className="h-4 w-4" aria-hidden="true" />
              {t("common:actions.buyNow")}
            </Link>
          )}
          {page.whatsAppHref && (
            <a
              href={page.whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BIG_BTN, "h-12 min-w-[9rem] flex-1 border border-border bg-card text-base text-card-foreground hover:border-primary")}
            >
              <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("tpl_fresh:product.whatsApp")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** Phones: price and the add/stepper control always within thumb reach. */
function BottomBar({ page }: { page: ProductPageState }) {
  const { t } = useTranslation();
  const { product, cartItem, inStock, formatCurrency, currentPrice, originalPrice } = page;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-display text-xl font-bold leading-none", originalPrice ? "text-highlight" : "text-foreground")}>{formatCurrency(currentPrice)}</p>
          {originalPrice && <s className="text-xs text-muted-foreground">{formatCurrency(originalPrice)}</s>}
        </div>
        {!inStock ? (
          <span className="flex h-12 items-center rounded-pill bg-secondary px-5 text-sm font-semibold text-muted-foreground">{t("common:product.outOfStock")}</span>
        ) : cartItem ? (
          <>
            <QtyStepper size="md" name={product.name} quantity={cartItem.quantity} onIncrement={page.increment} onDecrement={page.decrement} max={page.currentStock} className="h-12 w-32" />
            <button type="button" onClick={page.openCart} aria-label={t("tpl_fresh:shared.viewCart")} className={cn(BIG_BTN, "size-12 shrink-0 bg-highlight text-highlight-foreground")}>
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button type="button" onClick={page.add} className={cn(BIG_BTN, "h-12 flex-[1.4] bg-primary px-5 text-base text-primary-foreground")}>
            <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
            {t("common:actions.addToCart")}
          </button>
        )}
      </div>
    </div>
  );
}

function Related({ page }: { page: ProductPageState }) {
  const { t } = useTranslation();
  const id = useId();
  if (page.relatedProducts.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container pt-8 md:pt-12">
      <SectionHeading id={id} title={t("tpl_fresh:product.youMayAlsoLike")} href={page.categoryHref} />
      <ProductRow products={page.relatedProducts.slice(0, 6)} label={t("tpl_fresh:product.youMayAlsoLike")} tileOffset={2} />
    </section>
  );
}

function ProductView({ page }: { page: ProductPageState }) {
  const { t } = useTranslation();
  const { product, attributes, selectedAttributes, formatCurrency, currentPrice, originalPrice, discount, currentStock, inStock, freeShippingThreshold } = page;
  const unit = product.subcategory || product.category;
  const lowStock = inStock && currentStock > 0 && currentStock <= 5;

  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-3 md:pt-6">
        <nav aria-label={t("tpl_fresh:product.breadcrumb")} className="mb-4 hidden text-[13px] text-muted-foreground md:block">
          <ol className="flex items-center gap-1.5">
            <li><Link to="/" className="hover:text-primary">{t("common:nav.home")}</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            {product.category && (
              <>
                <li><Link to={page.categoryHref} className="hover:text-primary">{product.category}</Link></li>
                <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              </>
            )}
            <li aria-current="page" className="truncate font-semibold text-foreground">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-5 md:grid-cols-2 md:gap-8 lg:gap-12">
          <div className="md:sticky md:top-48 md:self-start">
            <Gallery
              images={page.images}
              name={product.name}
              selected={page.selectedImage}
              onSelect={page.setSelectedImage}
              discount={discount}
              liked={page.inWishlist}
              onToggleLike={page.toggleWishlist}
              onShare={page.share}
            />
          </div>

          <div className="min-w-0">
            {product.category && (
              <Link to={page.categoryHref} className={cn("inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10", FOCUS)}>
                {product.category}
              </Link>
            )}
            <h1 className="mt-2 font-display text-[1.75rem] font-bold leading-[1.15] text-foreground md:text-[2.25rem]">{product.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {unit && <span>{unit}</span>}
              {product.reviews > 0 && (
                <a href="#reviews" className={cn("flex items-center gap-1.5 rounded-sm font-semibold text-foreground hover:text-primary", FOCUS)}>
                  <Stars rating={product.rating} reviews={product.reviews} />
                  {product.rating.toFixed(1)}
                </a>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className={cn("font-display text-4xl font-bold leading-none", originalPrice ? "text-highlight" : "text-foreground")}>{formatCurrency(currentPrice)}</span>
              {originalPrice && (
                <>
                  <s className="text-lg text-muted-foreground"><span className="sr-only">{t("tpl_fresh:card.was")} </span>{formatCurrency(originalPrice)}</s>
                  <span className="rounded-full bg-highlight px-3 py-1 text-sm font-semibold text-highlight-foreground">
                    {t("common:product.save", { amount: formatCurrency(originalPrice - currentPrice) })}
                  </span>
                </>
              )}
            </div>
            <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-bold", !inStock || lowStock ? "text-destructive" : "text-primary")}>
              <span className={cn("size-2 rounded-full", !inStock || lowStock ? "bg-destructive" : "bg-primary")} aria-hidden="true" />
              {!inStock
                ? t("common:product.outOfStock")
                : lowStock
                  ? t("tpl_fresh:product.lowStock", { count: currentStock })
                  : t("tpl_fresh:product.inStockReady")}
            </p>

            {attributes.map((attr) => (
              <fieldset key={attr.name} className="mt-5">
                <legend className="text-sm font-semibold text-foreground">
                  {attr.displayName}: <span className="text-primary">{selectedAttributes[attr.name]}</span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {attr.values.map((val) => {
                    const selected = selectedAttributes[attr.name] === val;
                    const colour = isColorAttribute(attr.name);
                    return (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => page.selectAttribute(attr.name, val)}
                        className={cn(
                          "flex h-10 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-colors",
                          colour && "pl-1.5",
                          selected ? "border-primary bg-accent text-primary ring-1 ring-primary" : "border-border bg-card text-card-foreground hover:border-primary/50",
                          FOCUS,
                        )}
                      >
                        {colour && (
                          <span className="size-7 rounded-full ring-1 ring-inset ring-foreground/15" style={{ backgroundColor: swatchColor(val) }} aria-hidden="true" />
                        )}
                        {val}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-6">
              <BuyBox page={page} />
            </div>

            <ul className="mt-6 grid gap-4 rounded-xl border border-border bg-secondary p-4 sm:grid-cols-2 md:p-5">
              <InfoTile index={0} Icon={Truck} title={t("tpl_fresh:product.delivery24")} text={t("tpl_fresh:product.delivery24Text")} />
              <InfoTile
                index={1}
                Icon={Bike}
                title={
                  freeShippingThreshold != null
                    ? t("tpl_fresh:product.freeDeliveryOver", { amount: formatCurrency(freeShippingThreshold) })
                    : t("tpl_fresh:product.homeDelivery")
                }
                text={freeShippingThreshold != null ? t("tpl_fresh:product.freeDeliveryText") : t("tpl_fresh:product.homeDeliveryText")}
              />
              <InfoTile index={3} Icon={Banknote} title={t("tpl_fresh:product.cod")} text={t("tpl_fresh:product.codText")} />
              <InfoTile index={4} Icon={RotateCcw} title={t("tpl_fresh:product.easyReturns")} text={t("tpl_fresh:product.easyReturnsText")} />
            </ul>

            <Accordion type="multiple" defaultValue={["description"]} className="mt-6 rounded-xl border border-border bg-card px-4 md:px-5">
              <AccordionItem value="description" className="border-border">
                <AccordionTrigger className="font-display text-lg font-bold text-card-foreground hover:no-underline">{t("tpl_fresh:product.description")}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {product.description?.trim() || t("tpl_fresh:product.defaultDescription", { name: product.name })}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="specs" className="border-b-0">
                <AccordionTrigger className="font-display text-lg font-bold text-card-foreground hover:no-underline">{t("tpl_fresh:product.specifications")}</AccordionTrigger>
                <AccordionContent>
                  <dl className="divide-y divide-border overflow-hidden rounded-lg bg-secondary">
                    {[
                      [t("tpl_fresh:product.category"), product.category],
                      [t("tpl_fresh:product.type"), product.subcategory],
                      [t("tpl_fresh:product.sku"), page.currentSku],
                      ...attributes.map((a) => [a.displayName, a.values.join(", ")]),
                      ...(product.variants?.length
                        ? [[t("tpl_fresh:product.options"), t("tpl_fresh:product.choices", { count: product.variants.length })]]
                        : []),
                    ]
                      .filter(([, v]) => !!v)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="text-right font-bold text-foreground">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {product.isBundle && product.bundleItems && product.bundleItems.length > 0 && (
          <DetailSection title={t("tpl_fresh:product.inPack", { count: product.bundleItems.length })}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.bundleItems.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center gap-3 rounded-xl bg-secondary p-2.5">
                  <span className={cn("flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg text-ink", tile(i))}>
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" loading="lazy" />
                    ) : (
                      <Package className="h-6 w-6 opacity-50" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{item.productName}</span>
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        <div id="reviews" className="scroll-mt-48">
          <DetailSection title={t("tpl_fresh:product.reviews")}>
            <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
          </DetailSection>
        </div>
      </div>

      <Related page={page} />

      <Footer />
      {/* Room for the phone bottom bar */}
      <div aria-hidden="true" className="h-[calc(5rem+env(safe-area-inset-bottom))] md:hidden" />
      <BottomBar page={page} />
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = useProductPage(slug, { relatedLimit: 12 });
  if (page.status !== "ready") return page.status === "loading" ? <Skeleton /> : <NotFound />;
  return <ProductView page={page} />;
}
