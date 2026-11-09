import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote, Bike, ChevronRight, MessageCircle, Package, RotateCcw, SearchX, ShoppingBasket, Star, Truck, Zap, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProductReviews from "@/components/ProductReviews";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isColorAttribute, swatchColor, useProductPage, type ProductPageState } from "../shared/useProductPage";
import Footer from "./Footer";
import Gallery from "./Gallery";
import QtyStepper from "./QtyStepper";
import Rail from "./Rail";
import { tile } from "./helpers";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const BIG_BTN = cn("flex items-center justify-center gap-2 rounded-pill font-display font-extrabold transition-transform active:scale-[0.98]", FOCUS);

function Skeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading product">
      <div className="container grid gap-6 pt-4 md:grid-cols-2 md:gap-10 md:pt-8">
        <div className="aspect-square animate-pulse rounded-[2rem] bg-secondary" />
        <div className="space-y-4">
          <div className="h-6 w-28 animate-pulse rounded-pill bg-secondary" />
          <div className="h-9 w-4/5 animate-pulse rounded-pill bg-secondary" />
          <div className="h-4 w-1/3 animate-pulse rounded-pill bg-secondary" />
          <div className="h-10 w-1/2 animate-pulse rounded-pill bg-secondary" />
          <div className="h-14 w-full animate-pulse rounded-pill bg-secondary" />
          <div className="h-40 w-full animate-pulse rounded-3xl bg-secondary" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container flex flex-col items-center py-16 text-center md:py-24">
        <span className="flex size-28 items-center justify-center rounded-full bg-tile-2 text-ink">
          <SearchX className="h-12 w-12" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-foreground">We couldn't find that item</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">It may be sold out or no longer stocked. Plenty of fresh picks are waiting in the shop.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className={cn(BIG_BTN, "h-12 bg-primary px-6 text-primary-foreground")}>Browse the shop</Link>
          <Link to="/categories" className={cn(BIG_BTN, "h-12 border-2 border-border bg-card px-6 text-card-foreground")}>All categories</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function InfoTile({ Icon, title, text, index }: { Icon: LucideIcon; title: string; text: string; index: number }) {
  return (
    <li className="flex items-center gap-3">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl text-ink", tile(index))}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold leading-tight text-card-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{text}</span>
      </span>
    </li>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 md:mt-8 md:p-6">
      <h2 className="font-display text-xl font-bold text-card-foreground md:text-2xl">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BuyBox({ page }: { page: ProductPageState }) {
  const { product, cartItem, inStock, currentStock } = page;
  return (
    <div className="space-y-3">
      {!inStock ? (
        <button type="button" disabled className={cn(BIG_BTN, "h-14 w-full cursor-not-allowed bg-secondary text-lg text-muted-foreground")}>
          Out of stock
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
            className="w-40 shrink-0"
          />
          <button
            type="button"
            onClick={page.openCart}
            className={cn(BIG_BTN, "h-14 min-w-0 flex-1 border-2 border-primary bg-primary/10 px-4 text-lg text-primary")}
          >
            <span className="truncate">In cart · {cartItem.quantity}</span>
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={page.add} className={cn(BIG_BTN, "h-14 w-full bg-primary text-lg text-primary-foreground shadow-md")}>
          <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
          Add to cart
        </button>
      )}

      {(inStock || page.whatsAppHref) && (
        <div className="flex flex-wrap gap-3">
          {inStock && (
            <Link to={page.quickOrderHref} className={cn(BIG_BTN, "h-12 min-w-[9rem] flex-1 bg-highlight text-base text-highlight-foreground")}>
              <Zap className="h-4 w-4" aria-hidden="true" />
              Buy now
            </Link>
          )}
          {page.whatsAppHref && (
            <a
              href={page.whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BIG_BTN, "h-12 min-w-[9rem] flex-1 border-2 border-border bg-card text-base text-card-foreground hover:border-primary")}
            >
              <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              Order on WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** Phones: price and the add/stepper control always within thumb reach. */
function BottomBar({ page }: { page: ProductPageState }) {
  const { product, cartItem, inStock, formatCurrency, currentPrice, originalPrice } = page;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-extrabold leading-none text-primary">{formatCurrency(currentPrice)}</p>
          {originalPrice && <s className="text-xs text-muted-foreground">{formatCurrency(originalPrice)}</s>}
        </div>
        {!inStock ? (
          <span className="flex h-12 items-center rounded-pill bg-secondary px-5 text-sm font-extrabold text-muted-foreground">Out of stock</span>
        ) : cartItem ? (
          <>
            <QtyStepper size="md" name={product.name} quantity={cartItem.quantity} onIncrement={page.increment} onDecrement={page.decrement} max={page.currentStock} className="h-12 w-32" />
            <button type="button" onClick={page.openCart} aria-label="View cart" className={cn(BIG_BTN, "size-12 shrink-0 bg-highlight text-highlight-foreground")}>
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button type="button" onClick={page.add} className={cn(BIG_BTN, "h-12 flex-[1.4] bg-primary px-5 text-base text-primary-foreground")}>
            <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}

function ProductView({ page }: { page: ProductPageState }) {
  const { product, attributes, selectedAttributes, formatCurrency, currentPrice, originalPrice, discount, currentStock, inStock, freeShippingThreshold } = page;
  const unit = product.subcategory || product.category;
  const lowStock = inStock && currentStock > 0 && currentStock <= 5;

  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-3 md:pt-6">
        <nav aria-label="Breadcrumb" className="mb-3 hidden text-sm text-muted-foreground md:block">
          <ol className="flex items-center gap-1.5">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
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
          <div className="md:sticky md:top-44 md:self-start">
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
              <Link to={page.categoryHref} className={cn("inline-flex rounded-pill bg-secondary px-3 py-1 text-xs font-extrabold text-primary hover:bg-primary/10", FOCUS)}>
                {product.category}
              </Link>
            )}
            <h1 className="mt-2 font-display text-[1.75rem] font-bold leading-[1.1] text-foreground md:text-4xl">{product.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {unit && <span>{unit}</span>}
              {product.reviews > 0 && (
                <a href="#reviews" className="flex items-center gap-1 font-bold text-foreground hover:text-primary">
                  <Star className="h-4 w-4 fill-highlight text-highlight" aria-hidden="true" />
                  {product.rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">({product.reviews} reviews)</span>
                </a>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-display text-4xl font-extrabold leading-none text-primary">{formatCurrency(currentPrice)}</span>
              {originalPrice && (
                <>
                  <s className="text-lg text-muted-foreground"><span className="sr-only">was </span>{formatCurrency(originalPrice)}</s>
                  <span className="rounded-pill bg-highlight px-3 py-1 text-sm font-extrabold text-highlight-foreground">
                    Save {formatCurrency(originalPrice - currentPrice)}
                  </span>
                </>
              )}
            </div>
            <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-bold", !inStock || lowStock ? "text-destructive" : "text-primary")}>
              <span className={cn("size-2 rounded-full", !inStock || lowStock ? "bg-destructive" : "bg-primary")} aria-hidden="true" />
              {!inStock ? "Out of stock" : lowStock ? `Only ${currentStock} left, order soon` : "In stock, ready to deliver"}
            </p>

            {attributes.map((attr) => (
              <fieldset key={attr.name} className="mt-5">
                <legend className="text-sm font-bold text-foreground">
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
                          "flex h-10 items-center gap-2 rounded-pill border-2 px-4 text-sm font-bold transition-colors",
                          colour && "pl-1.5",
                          selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-card-foreground hover:border-primary/50",
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

            <ul className="mt-6 grid gap-4 rounded-3xl border border-border bg-card p-4 sm:grid-cols-2 md:p-5">
              <InfoTile index={0} Icon={Truck} title="Delivery in 24 hours" text="Order now, at your door by tomorrow" />
              <InfoTile
                index={1}
                Icon={Bike}
                title={freeShippingThreshold != null ? `Free delivery over ${formatCurrency(freeShippingThreshold)}` : "Home delivery"}
                text={freeShippingThreshold != null ? "Add a little more to save on delivery" : "Delivery charge shown at checkout"}
              />
              <InfoTile index={3} Icon={Banknote} title="Cash on delivery" text="Pay when your order arrives" />
              <InfoTile index={4} Icon={RotateCcw} title="Easy returns" text="Not right? We'll make it right" />
            </ul>

            <Accordion type="multiple" defaultValue={["description"]} className="mt-6 rounded-3xl border border-border bg-card px-4 md:px-5">
              <AccordionItem value="description" className="border-border">
                <AccordionTrigger className="font-display text-lg font-bold text-card-foreground hover:no-underline">Description</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {product.description?.trim() || `${product.name}, picked fresh and packed with care.`}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="specs" className="border-b-0">
                <AccordionTrigger className="font-display text-lg font-bold text-card-foreground hover:no-underline">Specifications</AccordionTrigger>
                <AccordionContent>
                  <dl className="divide-y divide-border overflow-hidden rounded-2xl bg-secondary">
                    {[
                      ["Category", product.category],
                      ["Type", product.subcategory],
                      ["SKU", page.currentSku],
                      ...attributes.map((a) => [a.displayName, a.values.join(", ")]),
                      ...(product.variants?.length ? [["Options", `${product.variants.length} choices`]] : []),
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
          <DetailSection title={`In this pack · ${product.bundleItems.length} items`}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.bundleItems.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center gap-3 rounded-2xl bg-secondary p-2.5">
                  <span className={cn("flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-ink", tile(i))}>
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" loading="lazy" />
                    ) : (
                      <Package className="h-6 w-6 opacity-50" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{item.productName}</span>
                  <span className="shrink-0 rounded-pill bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        <div id="reviews" className="scroll-mt-48">
          <DetailSection title="Reviews">
            <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
          </DetailSection>
        </div>
      </div>

      <div className="mt-4">
        <Rail title="You may also need" href={page.categoryHref} products={page.relatedProducts} tileOffset={2} />
      </div>

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
