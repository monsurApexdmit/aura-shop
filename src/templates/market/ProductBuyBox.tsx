import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Minus, Plus, Share2, ShoppingCart, Ticket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isColorAttribute, swatchColor, type ProductPageState } from "@/templates/shared/useProductPage";
import { useActiveCoupons } from "@/templates/shared/useHomeContent";
import { Stars } from "./parts";
import { FOCUS, compactNumber, copyText, couponOffer } from "./lib";

function Stepper({ value, onDec, onInc, decDisabled, incDisabled, label }: { value: number; onDec: () => void; onInc: () => void; decDisabled?: boolean; incDisabled?: boolean; label: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-11 shrink-0 items-center rounded-pill border border-input bg-card" role="group" aria-label={label}>
      <button type="button" onClick={onDec} disabled={decDisabled} aria-label={t("common:actions.decrease")} className={cn("flex h-full w-10 items-center justify-center rounded-l-pill text-foreground hover:bg-secondary disabled:opacity-40", FOCUS)}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-9 text-center text-sm font-bold tabular-nums text-foreground" aria-live="polite">{value}</span>
      <button type="button" onClick={onInc} disabled={incDisabled} aria-label={t("common:actions.increase")} className={cn("flex h-full w-10 items-center justify-center rounded-r-pill text-foreground hover:bg-secondary disabled:opacity-40", FOCUS)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Right of the gallery: category, name, rating, price, vouchers, variants, quantity and buy buttons. */
export default function ProductBuyBox({ page, qty, setQty, addToCart }: { page: ProductPageState; qty: number; setQty: (fn: (q: number) => number) => void; addToCart: () => void }) {
  const {
    product, attributes, selectedAttributes, selectAttribute, currentPrice, originalPrice, discount, currentSku,
    currentStock, inStock, cartItem, increment, decrement, openCart, share, quickOrderHref, formatCurrency,
    categoryHref,
  } = page;
  const { t } = useTranslation();
  const coupons = useActiveCoupons();
  const sold = product.totalSold ?? 0;
  const maxQty = Math.max(1, currentStock);

  const copyCoupon = async (code: string) => {
    await copyText(code);
    toast.success(t("tpl_market:buyBox.codeCopied", { code }), { description: t("tpl_market:buyBox.pasteAtCheckout") });
  };

  return (
    <div className="min-w-0">
      {product.category && (
        <Link to={categoryHref} className={cn("text-[11px] font-bold uppercase tracking-[0.14em] text-primary hover:underline", FOCUS)}>
          {product.category}
        </Link>
      )}
      <h1 className="mt-1.5 font-display text-xl font-extrabold leading-snug tracking-tight text-foreground md:text-[26px]">{product.name}</h1>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-[13px]">
        {product.reviews > 0 ? (
          <a href="#reviews" className={cn("flex items-center gap-1.5 rounded-sm hover:text-primary", FOCUS)}>
            <Stars rating={product.rating} className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            <span>{t("tpl_market:buyBox.reviews", { count: product.reviews, value: compactNumber(product.reviews) })}</span>
          </a>
        ) : (
          <span className="flex items-center gap-1.5"><Stars rating={0} className="h-3.5 w-3.5" /> {t("tpl_market:buyBox.noReviews")}</span>
        )}
        {sold > 0 && <><span aria-hidden="true" className="text-border">|</span><span>{t("tpl_market:buyBox.sold", { count: sold, value: compactNumber(sold) })}</span></>}
        <span aria-hidden="true" className="text-border">|</span>
        <span><Trans i18nKey="tpl_market:buyBox.sku" values={{ sku: currentSku }} components={{ value: <span className="text-foreground" /> }} /></span>
        <button type="button" onClick={share} className={cn("ml-auto hidden items-center gap-1 rounded-sm hover:text-primary md:flex", FOCUS)}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> {t("common:actions.share")}
        </button>
      </div>

      {/* Price */}
      <div className="mt-4 border-y border-border py-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[28px] font-extrabold leading-none tabular-nums text-foreground md:text-[32px]">{formatCurrency(currentPrice)}</span>
          {originalPrice && <span className="text-sm tabular-nums text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>}
          {discount > 0 && <span className="rounded-pill bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">{t("common:product.save", { amount: `${discount}%` })}</span>}
        </div>
        <p className={cn("mt-2.5 flex items-center gap-1.5 text-[13px] font-medium", !inStock ? "text-destructive" : currentStock <= 5 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
          <span className="size-2 rounded-full bg-current" aria-hidden="true" />
          {!inStock ? t("common:product.outOfStock") : currentStock <= 5 ? t("common:product.lowStock", { count: currentStock }) : t("common:product.inStock")}
        </p>
        {coupons.length > 0 && (
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground"><Ticket className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {t("tpl_market:buyBox.vouchers")}</span>
            <ul className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto">
              {coupons.slice(0, 4).map((c) => (
                <li key={c.code} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => copyCoupon(c.code)}
                    aria-label={t("tpl_market:buyBox.copyVoucher", { code: c.code, offer: couponOffer(c, formatCurrency, t) })}
                    className={cn("rounded-sm border border-dashed border-primary bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/10", FOCUS)}
                  >
                    {couponOffer(c, formatCurrency, t)}
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
            <legend className="mb-2 text-[13px] text-muted-foreground">
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
                      "relative flex h-10 min-w-[2.75rem] items-center gap-2 rounded-pill border px-3.5 text-[13px] transition-colors",
                      selected ? "border-primary bg-accent font-semibold text-primary" : "border-input bg-card text-foreground hover:border-primary/50",
                      FOCUS,
                    )}
                  >
                    {color && <span className="size-4 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: swatchColor(value) }} aria-hidden="true" />}
                    {value}
                    {selected && (
                      <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
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

      {/* Quantity + buttons (phones use the fixed bar for the buttons) */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {cartItem ? (
          <Stepper label={t("tpl_market:buyBox.quantityInCart")} value={cartItem.quantity} onDec={decrement} onInc={increment} incDisabled={cartItem.quantity >= currentStock} />
        ) : (
          <Stepper label={t("common:product.quantity")} value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => Math.min(maxQty, q + 1))} decDisabled={qty <= 1} incDisabled={!inStock || qty >= maxQty} />
        )}
        {cartItem && <span className="text-xs font-medium text-muted-foreground md:hidden">{t("tpl_market:buyBox.inYourCart")}</span>}
        <div className="hidden min-w-0 flex-1 gap-2.5 md:flex">
          {inStock ? (
            <>
              <button
                type="button"
                onClick={cartItem ? openCart : addToCart}
                className={cn("flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-pill bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-12px_hsl(var(--primary))] hover:bg-primary/90", FOCUS)}
              >
                <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" /> <span className="truncate">{cartItem ? t("tpl_market:buyBox.viewCart", { count: cartItem.quantity }) : t("common:actions.addToCart")}</span>
              </button>
              <Link to={quickOrderHref} className={cn("flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-pill border border-primary bg-card px-4 text-sm font-semibold text-primary hover:bg-accent", FOCUS)}>
                <Zap className="h-4 w-4 shrink-0" aria-hidden="true" /> <span className="truncate">{t("common:actions.buyNow")}</span>
              </Link>
            </>
          ) : (
            <button type="button" disabled className="flex h-11 flex-1 items-center justify-center rounded-pill bg-secondary text-sm font-bold text-muted-foreground">{t("common:product.outOfStock")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
