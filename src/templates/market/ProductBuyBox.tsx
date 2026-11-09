import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, Minus, Plus, Share2, ShoppingCart, Star, Ticket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isColorAttribute, swatchColor, type ProductPageState } from "@/templates/shared/useProductPage";
import { useActiveCoupons } from "@/templates/shared/useHomeContent";
import { FOCUS, compactNumber, copyText, couponOffer } from "./lib";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(rating) ? "fill-highlight text-highlight" : "text-border")} />
      ))}
    </span>
  );
}

function Stepper({ value, onDec, onInc, decDisabled, incDisabled, label }: { value: number; onDec: () => void; onInc: () => void; decDisabled?: boolean; incDisabled?: boolean; label: string }) {
  return (
    <div className="flex h-10 items-center rounded-md border border-border bg-card" role="group" aria-label={label}>
      <button type="button" onClick={onDec} disabled={decDisabled} aria-label="Decrease quantity" className={cn("flex h-full w-10 items-center justify-center rounded-l-md text-foreground hover:bg-secondary disabled:opacity-40", FOCUS)}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-10 text-center text-sm font-bold tabular-nums text-foreground" aria-live="polite">{value}</span>
      <button type="button" onClick={onInc} disabled={incDisabled} aria-label="Increase quantity" className={cn("flex h-full w-10 items-center justify-center rounded-r-md text-foreground hover:bg-secondary disabled:opacity-40", FOCUS)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Middle column: name, rating · sold · share, price panel, vouchers, variants, quantity, buy buttons. */
export default function ProductBuyBox({ page, qty, setQty, addToCart }: { page: ProductPageState; qty: number; setQty: (fn: (q: number) => number) => void; addToCart: () => void }) {
  const {
    product, attributes, selectedAttributes, selectAttribute, currentPrice, originalPrice, discount,
    currentStock, inStock, cartItem, increment, decrement, openCart, share, quickOrderHref, formatCurrency,
  } = page;
  const coupons = useActiveCoupons();
  const sold = product.totalSold ?? 0;
  const maxQty = Math.max(1, currentStock);

  const copyCoupon = async (code: string) => {
    await copyText(code);
    toast.success(`Code ${code} copied`, { description: "Paste it at checkout." });
  };

  return (
    <div className="min-w-0">
      <h1 className="font-display text-lg font-bold leading-snug text-foreground md:text-2xl">{product.name}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
        {product.reviews > 0 ? (
          <a href="#reviews" className={cn("flex items-center gap-1.5 rounded-sm hover:text-highlight", FOCUS)}>
            <Stars rating={product.rating} />
            <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            <span>({compactNumber(product.reviews)} ratings)</span>
          </a>
        ) : (
          <span className="flex items-center gap-1.5"><Stars rating={0} /> No ratings yet</span>
        )}
        {sold > 0 && <><span aria-hidden="true">|</span><span>{compactNumber(sold)} sold</span></>}
        <button type="button" onClick={share} className={cn("ml-auto hidden items-center gap-1 rounded-sm hover:text-highlight md:flex", FOCUS)}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Share
        </button>
      </div>

      {/* Price panel */}
      <div className="mt-3 rounded-lg bg-secondary p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[28px] font-extrabold leading-none tabular-nums text-highlight md:text-[32px]">{formatCurrency(currentPrice)}</span>
          {originalPrice && <span className="text-sm tabular-nums text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>}
          {discount > 0 && <span className="rounded-sm bg-highlight px-1.5 py-0.5 text-xs font-bold text-highlight-foreground">-{discount}%</span>}
        </div>
        {coupons.length > 0 && (
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground"><Ticket className="h-3.5 w-3.5 text-highlight" aria-hidden="true" /> Vouchers</span>
            <ul className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto">
              {coupons.slice(0, 4).map((c) => (
                <li key={c.code} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => copyCoupon(c.code)}
                    aria-label={`Copy voucher ${c.code}: ${couponOffer(c, formatCurrency)}`}
                    className={cn("rounded-sm border border-dashed border-highlight bg-card px-2 py-0.5 text-[11px] font-semibold text-highlight hover:bg-highlight/10", FOCUS)}
                  >
                    {couponOffer(c, formatCurrency)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Variants */}
      {attributes.map((attr) => {
        const color = isColorAttribute(attr.name);
        return (
          <fieldset key={attr.name} className="mt-4">
            <legend className="mb-2 text-sm text-muted-foreground">
              {attr.displayName}: <span className="font-semibold text-foreground">{selectedAttributes[attr.name]}</span>
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
                      "relative flex h-9 min-w-[2.75rem] items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                      selected ? "border-highlight bg-highlight/10 font-semibold text-highlight" : "border-border bg-card text-foreground hover:border-foreground/40",
                      FOCUS,
                    )}
                  >
                    {color && <span className="size-4 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: swatchColor(value) }} aria-hidden="true" />}
                    {value}
                    {selected && (
                      <span className="absolute -bottom-px -right-px flex size-3.5 items-center justify-center rounded-br-md rounded-tl-md bg-highlight text-highlight-foreground" aria-hidden="true">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {/* Quantity */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Quantity</span>
        {cartItem ? (
          <Stepper label="Quantity in cart" value={cartItem.quantity} onDec={decrement} onInc={increment} incDisabled={cartItem.quantity >= currentStock} />
        ) : (
          <Stepper label="Quantity" value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => Math.min(maxQty, q + 1))} decDisabled={qty <= 1} incDisabled={!inStock || qty >= maxQty} />
        )}
        <span className={cn("text-xs", inStock ? (currentStock <= 5 ? "font-semibold text-highlight" : "text-muted-foreground") : "font-semibold text-destructive")}>
          {!inStock ? "Out of stock" : currentStock <= 5 ? `Only ${currentStock} left` : `${currentStock} available`}
        </span>
        {cartItem && <span className="text-xs font-medium text-foreground">· in your cart</span>}
      </div>

      {/* Buttons (phones use the fixed bar instead) */}
      <div className="mt-5 hidden gap-3 md:flex">
        {inStock ? (
          <>
            <Link to={quickOrderHref} className={cn("flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-highlight text-sm font-bold text-highlight-foreground hover:bg-highlight/90", FOCUS)}>
              <Zap className="h-4 w-4" aria-hidden="true" /> Buy now
            </Link>
            <button
              type="button"
              onClick={cartItem ? openCart : addToCart}
              className={cn("flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-ink text-sm font-bold text-ink-foreground hover:bg-ink/90", FOCUS)}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" /> {cartItem ? "View cart" : "Add to cart"}
            </button>
          </>
        ) : (
          <button type="button" disabled className="flex h-12 flex-1 items-center justify-center rounded-md bg-secondary text-sm font-bold text-muted-foreground">Out of stock</button>
        )}
      </div>
    </div>
  );
}
