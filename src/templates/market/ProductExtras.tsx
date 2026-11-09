import { Link } from "react-router-dom";
import { Banknote, MapPin, MessageCircle, Package, RotateCcw, ShieldCheck, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductReviews from "@/components/ProductReviews";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import type { ProductPageState } from "@/templates/shared/useProductPage";
import { FOCUS } from "./lib";

function Row({ Icon, title, text, to }: { Icon: typeof Truck; title: string; text?: string; to?: string }) {
  const body = (
    <>
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-highlight" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        {text && <span className="block text-xs text-muted-foreground">{text}</span>}
      </span>
    </>
  );
  return (
    <li className="border-b border-border last:border-0">
      {to ? (
        <Link to={to} className={cn("flex gap-3 py-3 hover:bg-secondary/60", FOCUS)}>{body}</Link>
      ) : (
        <div className="flex gap-3 py-3">{body}</div>
      )}
    </li>
  );
}

/** Right column: delivery and service facts, then the store card. */
export function ProductSideBox({ page }: { page: ProductPageState }) {
  const { storeName, logo } = useStoreChrome();
  const { freeShippingThreshold, formatCurrency, whatsAppHref } = page;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card px-4 py-1">
        <p className="border-b border-border py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery & service</p>
        <ul>
          <Row Icon={MapPin} title="Home delivery" text="Delivered to your door, anywhere we ship" />
          <Row
            Icon={Truck}
            title={freeShippingThreshold != null ? `Free delivery over ${formatCurrency(freeShippingThreshold)}` : "Standard delivery"}
            text="Charges and timing shown at checkout"
          />
          <Row Icon={Banknote} title="Cash on delivery" text="Pay when your parcel arrives" />
          <Row Icon={RotateCcw} title="Easy returns" text="See our return policy" to="/returns" />
          <Row Icon={ShieldCheck} title="Secure checkout" text="Your details stay protected" />
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink text-ink-foreground" aria-hidden="true">
            {logo ? <img src={logo} alt="" className="h-full w-full bg-card object-contain p-1" /> : <Store className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{storeName}</p>
            <p className="text-xs text-muted-foreground">Sold & shipped by this store</p>
          </div>
        </div>
        <div className="mt-3 grid gap-2">
          {whatsAppHref && (
            <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className={cn("flex h-9 items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold text-foreground hover:border-highlight hover:text-highlight", FOCUS)}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
            </a>
          )}
          <Link to="/shop" className={cn("flex h-9 items-center justify-center gap-2 rounded-md bg-secondary text-sm font-semibold text-foreground hover:bg-accent", FOCUS)}>
            <Store className="h-4 w-4" aria-hidden="true" /> Visit store
          </Link>
        </div>
      </div>
    </div>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-40 overflow-hidden rounded-lg border border-border bg-card">
      <h2 id={`${id}-h`} className="border-b border-border bg-secondary/60 px-4 py-2.5 font-display text-base font-bold text-foreground">{title}</h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

/** Description, specifications, bundle contents and reviews, stacked as panels. */
export function ProductDetails({ page }: { page: ProductPageState }) {
  const { product, attributes, currentSku } = page;
  const specs: [string, string][] = [
    ["Category", product.subcategory ? `${product.category} › ${product.subcategory}` : product.category],
    ["SKU", currentSku],
    ...attributes.map((a): [string, string] => [a.displayName, a.values.join(", ")]),
    ...(product.variants?.length ? [["Variants", `${product.variants.length} options`] as [string, string]] : []),
  ];

  return (
    <div className="space-y-3">
      <Block id="description" title="Description">
        {product.description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{product.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">The store hasn't added a description for this product yet.</p>
        )}
      </Block>

      <Block id="specifications" title="Specifications">
        <table className="w-full text-sm">
          <tbody>
            {specs.map(([k, v]) => (
              <tr key={k} className="border-b border-border last:border-0">
                <th scope="row" className="w-1/3 bg-secondary/50 px-3 py-2 text-left align-top font-medium text-muted-foreground sm:w-1/4">{k}</th>
                <td className="break-words px-3 py-2 text-foreground">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      {product.isBundle && product.bundleItems && product.bundleItems.length > 0 && (
        <Block id="bundle" title={`What's in the bundle (${product.bundleItems.length})`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {product.bundleItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3 rounded-md border border-border p-2">
                <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary text-muted-foreground">
                  {item.image ? <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Package className="h-5 w-5" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{item.productName}</span>
                  {item.sku && <span className="block truncate text-xs text-muted-foreground">SKU {item.sku}</span>}
                </span>
                <span className="shrink-0 rounded-sm bg-ink px-1.5 py-0.5 text-xs font-bold text-ink-foreground">×{item.quantity}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block id="reviews" title={`Ratings & reviews${product.reviews > 0 ? ` (${product.reviews})` : ""}`}>
        <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
      </Block>
    </div>
  );
}
