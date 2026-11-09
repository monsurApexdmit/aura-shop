import { useState, type ReactNode, type UIEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductReviews from "@/components/ProductReviews";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isColorAttribute,
  onProductImageError,
  swatchColor,
  useProductPage,
  type ProductPageState,
} from "@/templates/shared/useProductPage";
import Footer from "./Footer";
import { LuxeCard } from "./ProductCard";
import { EYEBROW, FOCUS, TEXT_LINK } from "./lib";

const PRIMARY_BTN = cn(
  "flex h-14 w-full items-center justify-center bg-primary px-6 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
  FOCUS,
);
const OUTLINE_BTN = cn(
  "flex h-14 w-full items-center justify-center border border-foreground px-6 text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background",
  FOCUS,
);

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = useProductPage(slug);

  if (page.status === "ready") return <ReadyPage page={page} />;
  return page.status === "loading" ? <LoadingState /> : <MissingState />;
}

function ReadyPage({ page }: { page: ProductPageState }) {
  const {
    product, attributes, selectedAttributes, selectAttribute, images, currentPrice, originalPrice, discount,
    currentStock, currentSku, inStock, cartItem, add, increment, decrement, openCart, inWishlist, toggleWishlist,
    share, whatsAppHref, quickOrderHref, categoryHref, relatedProducts, formatCurrency, freeShippingThreshold,
  } = page;
  const gallery = images.filter(Boolean);
  const price = formatCurrency(currentPrice);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <PhoneGallery images={gallery} name={product.name} />

      <div className="container md:pt-8 lg:pt-12">
        <div className="md:grid md:grid-cols-12 md:gap-10 lg:gap-16">
          <DesktopGallery images={gallery} name={product.name} />

          <div className="md:col-span-5">
            <div className="pt-8 md:sticky md:top-32 md:pt-0">
              <nav aria-label="Breadcrumb">
                <ol className={cn(EYEBROW, "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground")}>
                  <li><Link to="/" className={cn("hover:text-foreground", FOCUS)}>Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link to={categoryHref} className={cn("hover:text-foreground", FOCUS)}>{product.category}</Link></li>
                  <li aria-hidden="true" className="hidden sm:block">/</li>
                  <li aria-current="page" className="hidden max-w-[16rem] truncate text-foreground sm:block">{product.name}</li>
                </ol>
              </nav>

              <h1 className="mt-6 break-words font-display text-3xl font-normal leading-tight md:text-4xl">{product.name}</h1>

              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 tabular-nums">
                {originalPrice ? (
                  <>
                    <span className="sr-only">Sale price</span>
                    <span className="text-lg text-highlight">{price}</span>
                    <span className="sr-only">Original price</span>
                    <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
                    {discount > 0 && <span className={cn(EYEBROW, "text-[10px] text-highlight")}>−{discount}%</span>}
                  </>
                ) : (
                  <span className="text-lg">{price}</span>
                )}
              </p>

              {product.description && (
                <p className="mt-6 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              )}

              {attributes.length > 0 && (
                <div className="mt-8 space-y-7">
                  {attributes.map((attr) => {
                    const chosen = selectedAttributes[attr.name];
                    const colour = isColorAttribute(attr.name);
                    return (
                      <fieldset key={attr.name}>
                        <legend className={cn(EYEBROW, "mb-3 flex gap-2")}>
                          <span>{attr.displayName}</span>
                          {chosen && <span className="normal-case tracking-normal text-muted-foreground">— {chosen}</span>}
                        </legend>
                        <div role="radiogroup" aria-label={attr.displayName} className="flex flex-wrap gap-2">
                          {attr.values.map((val) => {
                            const selected = chosen === val;
                            return colour ? (
                              <button
                                key={val}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                aria-label={val}
                                title={val}
                                onClick={() => selectAttribute(attr.name, val)}
                                className={cn(
                                  "h-10 w-10 border p-[3px] transition-colors",
                                  selected ? "border-foreground" : "border-transparent hover:border-border",
                                  FOCUS,
                                )}
                              >
                                <span className="block h-full w-full ring-1 ring-inset ring-foreground/15" style={{ backgroundColor: swatchColor(val) }} />
                              </button>
                            ) : (
                              <button
                                key={val}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => selectAttribute(attr.name, val)}
                                className={cn(
                                  "h-11 min-w-[3rem] border px-3 text-xs uppercase tracking-[0.12em] transition-colors",
                                  selected ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                                  FOCUS,
                                )}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>
              )}

              <p className={cn(EYEBROW, "mt-8 text-[10px]", inStock && currentStock <= 5 ? "text-highlight" : "text-muted-foreground")} aria-live="polite">
                {!inStock ? "Sold out" : currentStock <= 5 ? `Only ${currentStock} left` : "In stock"}
              </p>

              <div className="mt-3 space-y-3">
                {!inStock ? (
                  <button type="button" disabled className={PRIMARY_BTN}>Sold out</button>
                ) : cartItem ? (
                  <>
                    <QuantityRow quantity={cartItem.quantity} onDecrement={decrement} onIncrement={increment} className="h-14" />
                    <button type="button" onClick={openCart} className={PRIMARY_BTN}>View bag</button>
                  </>
                ) : (
                  <button type="button" onClick={add} className={PRIMARY_BTN}>Add to bag</button>
                )}
                {inStock && (
                  <Link to={quickOrderHref} className={OUTLINE_BTN}>Buy it now</Link>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button type="button" onClick={toggleWishlist} aria-pressed={inWishlist} className={cn(TEXT_LINK, "no-underline hover:underline")}>
                  <Heart className={cn("h-3.5 w-3.5", inWishlist && "fill-current")} strokeWidth={1.25} />
                  {inWishlist ? "Saved" : "Save"}
                </button>
                <button type="button" onClick={share} className={cn(TEXT_LINK, "no-underline hover:underline")}>
                  <Share2 className="h-3.5 w-3.5" strokeWidth={1.25} />
                  Share
                </button>
                {whatsAppHref && (
                  <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
                    Order on WhatsApp
                  </a>
                )}
              </div>

              <Accordion type="multiple" defaultValue={["details"]} className="mt-10 border-t border-border">
                <Section value="details" title="Details">
                  <p className="whitespace-pre-line">
                    {product.description || `${product.name}: a considered piece, finished with care and made to last.`}
                  </p>
                </Section>
                <Section value="specs" title="Specifications">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                    <dt className="text-foreground">Category</dt>
                    <dd>{product.subcategory && product.subcategory !== product.category ? `${product.category} / ${product.subcategory}` : product.category}</dd>
                    <dt className="text-foreground">Reference</dt>
                    <dd className="break-all">{currentSku}</dd>
                    {attributes.map((a) => (
                      <SpecRow key={a.name} label={a.displayName} value={a.values.join(", ")} />
                    ))}
                  </dl>
                </Section>
                <Section value="delivery" title="Delivery & returns">
                  <p>
                    {freeShippingThreshold != null
                      ? `Complimentary delivery on orders over ${formatCurrency(freeShippingThreshold)}. `
                      : "Delivery options and costs are shown at checkout. "}
                    Unworn pieces may be returned in their original condition.
                  </p>
                  <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    <Link to="/shipping" className={TEXT_LINK}>Shipping</Link>
                    <Link to="/returns" className={TEXT_LINK}>Returns</Link>
                  </p>
                </Section>
                <Section value="reviews" title={`Reviews (${product.reviews})`}>
                  <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
                </Section>
              </Accordion>
            </div>
          </div>
        </div>

        {product.isBundle && product.bundleItems && product.bundleItems.length > 0 && (
          <section className="mt-20 md:mt-28">
            <h2 className={cn(EYEBROW, "mb-8 border-b border-border pb-3")}>In this set — {product.bundleItems.length} pieces</h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.bundleItems.map((item, i) => (
                <li key={`${item.productId}-${item.variantId ?? i}`} className="flex items-center gap-4">
                  <div className="h-24 w-[4.5rem] shrink-0 overflow-hidden bg-secondary">
                    {item.image && <img src={item.image} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs uppercase tracking-[0.12em]">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      × {item.quantity}{item.sku ? ` · ${item.sku}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-24 md:mt-36">
            <h2 className="mb-10 text-center font-display text-3xl font-normal md:mb-14 md:text-4xl">
              You may also <em className="italic">like</em>
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {relatedProducts.map((p, i) => (
                <LuxeCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="h-24 md:h-32" aria-hidden="true" />

      {/* Phones: the bag action stays in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:hidden">
        {!inStock ? (
          <button type="button" disabled className={cn(PRIMARY_BTN, "h-12")}>Sold out</button>
        ) : cartItem ? (
          <div className="flex gap-2">
            <QuantityRow quantity={cartItem.quantity} onDecrement={decrement} onIncrement={increment} className="h-12 w-36 shrink-0" compact />
            <button type="button" onClick={openCart} className={cn(PRIMARY_BTN, "h-12 flex-1")}>View bag</button>
          </div>
        ) : (
          <button type="button" onClick={add} className={cn(PRIMARY_BTN, "h-12 tabular-nums")}>
            Add to bag — {price}
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}

function Section({ value, title, children }: { value: string; title: string; children: ReactNode }) {
  return (
    <AccordionItem value={value} className="border-border">
      <AccordionTrigger className={cn(EYEBROW, "py-5 font-normal hover:no-underline [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:stroke-[1.25]", FOCUS)}>
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-foreground">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function QuantityRow({
  quantity, onDecrement, onIncrement, className, compact = false,
}: { quantity: number; onDecrement: () => void; onIncrement: () => void; className?: string; compact?: boolean }) {
  return (
    <div role="group" aria-label="Quantity in bag" className={cn("flex items-center justify-between border border-foreground", className)}>
      <button type="button" aria-label="Decrease quantity" onClick={onDecrement} className={cn("flex h-full w-12 items-center justify-center hover:opacity-60", FOCUS)}>
        <Minus className="h-4 w-4" strokeWidth={1.25} />
      </button>
      <span className="text-[11px] uppercase tracking-[0.2em] tabular-nums">
        {quantity}{compact ? "" : " in bag"}
      </span>
      <button type="button" aria-label="Increase quantity" onClick={onIncrement} className={cn("flex h-full w-12 items-center justify-center hover:opacity-60", FOCUS)}>
        <Plus className="h-4 w-4" strokeWidth={1.25} />
      </button>
    </div>
  );
}

function PhoneGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth > 0) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <div className="relative md:hidden">
      <div
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        aria-label={`${name} photos`}
        role="region"
        tabIndex={0}
      >
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-secondary">
            <img
              src={src}
              alt={i === 0 ? name : ""}
              loading={i === 0 ? "eager" : "lazy"}
              onError={onProductImageError}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <p className="pointer-events-none absolute bottom-4 right-4 bg-background/85 px-2.5 py-1 text-[11px] tracking-[0.2em] text-foreground tabular-nums" aria-live="polite">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}

function DesktopGallery({ images, name }: { images: string[]; name: string }) {
  const restOdd = (images.length - 1) % 2 === 1;
  return (
    <div className="hidden md:col-span-7 md:block">
      <div className="grid grid-cols-2 gap-2">
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={cn(
              "group relative aspect-[3/4] overflow-hidden bg-secondary",
              (i === 0 || (restOdd && i === images.length - 1)) && "col-span-2",
            )}
          >
            <img
              src={src}
              alt={i === 0 ? name : ""}
              loading={i < 2 ? "eager" : "lazy"}
              onError={onProductImageError}
              className="h-full w-full object-cover transition-transform [transition-duration:1500ms] ease-out group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="aspect-[3/4] w-full rounded-none md:hidden" />
      <div className="container md:pt-12">
        <div className="md:grid md:grid-cols-12 md:gap-16">
          <div className="hidden md:col-span-7 md:block">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
          </div>
          <div className="space-y-5 pt-8 md:col-span-5 md:pt-0">
            <Skeleton className="h-3 w-40 rounded-none" />
            <Skeleton className="h-9 w-3/4 rounded-none" />
            <Skeleton className="h-5 w-24 rounded-none" />
            <Skeleton className="h-16 w-full rounded-none" />
            <div className="flex gap-2 pt-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-12 rounded-none" />)}
            </div>
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MissingState() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className={cn(EYEBROW, "text-muted-foreground")}>Not found</p>
        <h1 className="mt-6 max-w-xl font-display text-4xl font-normal leading-tight md:text-5xl">
          This piece is no longer <em className="italic">available</em>
        </h1>
        <p className="mt-5 max-w-sm text-sm text-muted-foreground">It may have sold out or moved. The rest of the collection is waiting.</p>
        <Link to="/shop" className={cn(TEXT_LINK, "mt-10")}>
          Continue shopping <span aria-hidden="true">→</span>
        </Link>
      </section>
      <Footer />
    </div>
  );
}
