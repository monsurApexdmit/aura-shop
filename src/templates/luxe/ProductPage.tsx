import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, CalendarCheck, Check, ChevronLeft, ChevronRight, Heart, Mail, MapPin, MessageCircle, Phone, Share2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { whatsAppLink } from "@/lib/bdPhone";
import { onProductImageError, useProductPage, type ProductPageState } from "@/templates/shared/useProductPage";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import { BadgePill } from "./parts";
import { BTN_PRIMARY, FOCUS, hasPhoto, listingLocation, listingSpecs } from "./lib";

const PANEL = "rounded-xl border border-border/70 bg-card card-shadow";

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label={t("tpl_luxe:page.loading")}>
      <div className="container py-6 md:py-8">
        <Skeleton className="h-4 w-60" />
        <Skeleton className="mt-4 h-9 w-3/4 max-w-xl" />
        <Skeleton className="mt-6 aspect-[16/10] w-full rounded-xl lg:aspect-[21/9]" />
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8"><Skeleton className="h-28 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" /></div>
          <Skeleton className="h-72 w-full rounded-xl lg:col-span-4" />
        </div>
      </div>
    </div>
  );
}

function MissingState() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container flex-1 py-16">
        <div className={cn(PANEL, "mx-auto max-w-md p-8 text-center")}>
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">{t("tpl_luxe:page.notFoundTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("tpl_luxe:page.notFoundText")}</p>
          <Link to="/shop" className={cn(BTN_PRIMARY, "mt-6 h-11", FOCUS)}>{t("tpl_luxe:page.browse")}</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/** Large photo with arrows and a counter, thumbnails below. */
function Gallery({ images, name, selected, onSelect }: { images: string[]; name: string; selected: number; onSelect: (i: number) => void }) {
  const { t } = useTranslation();
  const photos = images.filter(hasPhoto);
  const count = photos.length;
  const go = (i: number) => onSelect(((i % count) + count) % count);
  const current = Math.min(selected, Math.max(count - 1, 0));

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-tile-1 text-ink/30 lg:aspect-[21/9]" role="img" aria-label={t("tpl_luxe:page.noPhotos", { name })}>
        <Building2 className="h-16 w-16" strokeWidth={1.2} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary sm:aspect-[16/10] lg:aspect-[21/9]"
        role="group"
        aria-roledescription={t("tpl_luxe:page.carousel")}
        aria-label={t("tpl_luxe:page.photos", { name })}
        onKeyDown={(e) => {
          if (count < 2) return;
          if (e.key === "ArrowRight") go(current + 1);
          if (e.key === "ArrowLeft") go(current - 1);
        }}
      >
        <img src={photos[current]} alt={t("tpl_luxe:page.photoAlt", { name, current: current + 1, total: count })} onError={onProductImageError} className="h-full w-full object-cover" />
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(current - 1)} aria-label={t("tpl_luxe:page.previousPhoto")} className={cn("absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-md hover:bg-card", FOCUS)}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(current + 1)} aria-label={t("tpl_luxe:page.nextPhoto")} className={cn("absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-md hover:bg-card", FOCUS)}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white" aria-live="polite">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {photos.map((src, i) => (
            <li key={`${src}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={t("tpl_luxe:page.showPhoto", { number: i + 1 })}
                aria-current={i === current}
                className={cn("block h-16 w-24 overflow-hidden rounded-lg border-2 transition-opacity sm:h-20 sm:w-28", i === current ? "border-primary" : "border-transparent opacity-70 hover:opacity-100", FOCUS)}
              >
                <img src={src} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Variant pickers (only for options with a real choice). */
function Options({ page }: { page: ProductPageState }) {
  const choices = page.attributes.filter((a) => a.values.length > 1);
  if (choices.length === 0) return null;
  return (
    <div className="space-y-4">
      {choices.map((a) => (
        <fieldset key={a.name}>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{a.displayName}</legend>
          <div className="flex flex-wrap gap-2">
            {a.values.map((v) => {
              const active = page.selectedAttributes[a.name] === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => page.selectAttribute(a.name, v)}
                  aria-pressed={active}
                  className={cn("h-9 rounded-pill border px-3.5 text-sm font-medium transition-colors", active ? "border-primary bg-accent text-primary" : "border-border text-foreground hover:border-primary", FOCUS)}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** Price, options, reserve (add to cart) and the enquiry contacts. */
function EnquiryPanel({ page, enquiry }: { page: ProductPageState; enquiry: Enquiry }) {
  const { t } = useTranslation();
  const { product, formatCurrency, currentPrice, originalPrice, inStock, cartItem, add, openCart, inWishlist, toggleWishlist, share, quickOrderHref } = page;
  return (
    <div className="space-y-4 lg:sticky lg:top-32">
      <div className={cn(PANEL, "p-5 sm:p-6")}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("common:product.price")}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-3xl font-semibold text-foreground">{formatCurrency(currentPrice)}</span>
          {originalPrice && <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>}
        </p>
        <p className={cn("mt-2 flex items-center gap-1.5 text-sm", inStock ? "text-primary" : "text-destructive")}>
          <span className={cn("size-2 rounded-full", inStock ? "bg-primary" : "bg-destructive")} aria-hidden="true" />
          {inStock ? t("tpl_luxe:page.availableNow") : t("tpl_luxe:page.unavailableNow")}
        </p>

        <div className="mt-5"><Options page={page} /></div>

        <div className="mt-5 space-y-2.5">
          {inStock ? (
            cartItem ? (
              <button type="button" onClick={openCart} className={cn(BTN_PRIMARY, "h-12 w-full", FOCUS)}>
                <Check className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.inCartView")}
              </button>
            ) : (
              <button type="button" onClick={add} className={cn(BTN_PRIMARY, "h-12 w-full", FOCUS)}>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.reserveProperty")}
              </button>
            )
          ) : (
            <button type="button" disabled className="h-12 w-full rounded-pill bg-secondary text-sm font-semibold text-muted-foreground">{t("tpl_luxe:page.unavailableNow")}</button>
          )}
          {inStock && (
            <Link to={quickOrderHref} className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-pill border border-primary text-sm font-semibold text-primary transition-colors hover:bg-accent", FOCUS)}>
              <CalendarCheck className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.quickBooking")}
            </Link>
          )}
        </div>

        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <button type="button" onClick={toggleWishlist} aria-pressed={inWishlist} className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-medium text-foreground hover:bg-secondary", FOCUS)}>
            <Heart className={cn("h-4 w-4", inWishlist && "fill-highlight text-highlight")} aria-hidden="true" /> {inWishlist ? t("tpl_luxe:page.saved") : t("tpl_luxe:page.save")}
          </button>
          <button type="button" onClick={share} className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-medium text-foreground hover:bg-secondary", FOCUS)}>
            <Share2 className="h-4 w-4" aria-hidden="true" /> {t("common:actions.share")}
          </button>
        </div>
      </div>

      <div className={cn(PANEL, "p-5 sm:p-6")}>
        <h2 className="font-display text-lg font-semibold text-foreground">{t("tpl_luxe:page.interested")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("tpl_luxe:page.askAbout", { name: product.name })}</p>
        <div className="mt-4 space-y-2">
          {enquiry.whatsapp && (
            <a href={enquiry.whatsapp} target="_blank" rel="noopener noreferrer" className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-[#25D366] text-sm font-semibold text-[#06301a] hover:bg-[#25D366]/90", FOCUS)}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.whatsApp")}
            </a>
          )}
          {enquiry.phone && (
            <a href={`tel:${enquiry.phone}`} className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-ink text-sm font-semibold text-ink-foreground hover:bg-ink/90", FOCUS)}>
              <Phone className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.call", { phone: enquiry.phone })}
            </a>
          )}
          {enquiry.email ? (
            <a href={enquiry.email} className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-pill border border-border text-sm font-semibold text-foreground hover:border-primary hover:text-primary", FOCUS)}>
              <Mail className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.emailEnquiry")}
            </a>
          ) : (
            <Link to="/contact" className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-pill border border-border text-sm font-semibold text-foreground hover:border-primary hover:text-primary", FOCUS)}>
              <Mail className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:page.sendMessage")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface Enquiry {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
}

function useEnquiry(page: ProductPageState | null): Enquiry {
  const { t } = useTranslation();
  const { contact } = useStoreChrome();
  const { onlineStore } = useCurrency();
  if (!page) return { phone: null, whatsapp: null, email: null };
  const url = `${window.location.origin}/product/${page.product.slug}`;
  const number = onlineStore?.whatsappNumber || onlineStore?.social?.whatsapp || "";
  const message = `${t("tpl_luxe:page.enquiryMessage", { name: page.product.name, price: page.formatCurrency(page.currentPrice) })}\n${url}`;
  return {
    phone: contact.phone || null,
    whatsapp: whatsAppLink(number, message) || null,
    email: contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent(t("tpl_luxe:page.enquirySubject", { name: page.product.name }))}&body=${encodeURIComponent(message)}` : null,
  };
}

/** Listing detail: gallery, price and title, specs grid, description, sticky reserve + enquiry panel, similar listings. */
export default function ProductPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const page = useProductPage(slug, { relatedLimit: 3 });
  const ready = page.status === "ready" ? page : null;
  const enquiry = useEnquiry(ready);
  const [showAll, setShowAll] = useState(false);

  if (page.status === "loading") return <LoadingState />;
  if (!ready) return <MissingState />;

  const { product, images, selectedImage, setSelectedImage, categoryHref, relatedProducts, formatCurrency, currentPrice, inStock, cartItem, add, openCart } = ready;
  const specs = listingSpecs(product);
  const location = listingLocation(product);
  const description = product.description?.trim() ?? "";
  const longText = description.length > 700;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container flex-1 py-5 md:py-8">
        <nav aria-label={t("tpl_luxe:page.breadcrumb")}>
          <ol className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <li className="shrink-0"><Link to="/" className={cn("rounded-sm hover:text-primary", FOCUS)}>{t("common:nav.home")}</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
            <li className="shrink-0"><Link to="/shop" className={cn("rounded-sm hover:text-primary", FOCUS)}>{t("tpl_luxe:nav.properties")}</Link></li>
            {product.category && (
              <>
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
                <li className="hidden shrink-0 sm:block"><Link to={categoryHref} className={cn("rounded-sm hover:text-primary", FOCUS)}>{product.category}</Link></li>
                <li aria-hidden="true" className="hidden sm:block"><ChevronRight className="h-3 w-3" /></li>
              </>
            )}
            <li className="min-w-0 truncate font-medium text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && <Link to={categoryHref} className={cn("rounded-sm text-[11px] font-bold uppercase tracking-[0.16em] text-primary hover:underline", FOCUS)}>{product.category}</Link>}
              {product.badge && <BadgePill text={product.badge} className="border border-border" />}
            </div>
            <h1 className="mt-2 font-display text-[1.9rem] font-semibold leading-tight text-foreground sm:text-4xl">{product.name}</h1>
            {location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> {location}
              </p>
            )}
          </div>
          <p className="shrink-0 font-display text-2xl font-semibold text-primary md:text-3xl">{formatCurrency(currentPrice)}</p>
        </div>

        <div className="mt-5">
          <Gallery images={images} name={product.name} selected={selectedImage} onSelect={setSelectedImage} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 space-y-6 lg:col-span-8">
            {specs.length > 0 && (
              <section aria-labelledby="lx-specs" className={cn(PANEL, "p-5 sm:p-6")}>
                <h2 id="lx-specs" className="font-display text-xl font-semibold text-foreground">{t("tpl_luxe:page.details")}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {specs.map(({ key, label, value, Icon }) => (
                    <div key={key} className="flex min-w-0 items-center gap-3 rounded-lg bg-secondary/70 p-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <dt className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
                        <dd className="break-words text-sm font-semibold text-foreground">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section aria-labelledby="lx-about" className={cn(PANEL, "p-5 sm:p-6")}>
              <h2 id="lx-about" className="font-display text-xl font-semibold text-foreground">{t("tpl_luxe:page.about")}</h2>
              {description ? (
                <>
                  <p id="lx-about-text" className={cn("mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground/85", longText && !showAll && "line-clamp-[10]")}>{description}</p>
                  {longText && (
                    <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} aria-controls="lx-about-text" className={cn("mt-3 rounded-sm text-sm font-semibold text-primary hover:underline", FOCUS)}>
                      {showAll ? t("tpl_luxe:page.showLess") : t("tpl_luxe:page.readMore")}
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t("tpl_luxe:page.comingSoon")}</p>
              )}
            </section>
          </div>

          <aside className="min-w-0 lg:col-span-4" aria-label={t("tpl_luxe:page.reserveAndEnquire")}>
            <EnquiryPanel page={ready} enquiry={enquiry} />
          </aside>
        </div>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="lx-similar" className="mt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 id="lx-similar" className="font-display text-2xl font-semibold text-foreground sm:text-[1.75rem]">{t("tpl_luxe:page.similar")}</h2>
              <Link to={categoryHref} className={cn("rounded-sm text-sm font-semibold text-primary hover:underline", FOCUS)}>{t("common:actions.seeAll")}</Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p, i) => <li key={p.id} className="min-w-0"><ProductCard product={p} index={i} /></li>)}
            </ul>
          </section>
        )}
      </div>

      {/* Phones: enquiry + reserve bar in place of the tab bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="flex h-16 items-center gap-2 px-4">
          {(enquiry.whatsapp || enquiry.phone) && (
            <a
              href={enquiry.whatsapp ?? `tel:${enquiry.phone}`}
              {...(enquiry.whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={enquiry.whatsapp ? t("tpl_luxe:page.enquireWhatsApp") : t("tpl_luxe:page.call", { phone: enquiry.phone })}
              className={cn("flex size-11 shrink-0 items-center justify-center rounded-pill border border-border text-foreground", FOCUS)}
            >
              {enquiry.whatsapp ? <MessageCircle className="h-5 w-5" aria-hidden="true" /> : <Phone className="h-5 w-5" aria-hidden="true" />}
            </a>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-muted-foreground">{t("common:product.price")}</p>
            <p className="truncate text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
          </div>
          {inStock ? (
            <button type="button" onClick={cartItem ? openCart : add} className={cn(BTN_PRIMARY, "h-11 shrink-0 px-4", FOCUS)}>
              {cartItem ? t("tpl_luxe:page.inCartShort") : t("tpl_luxe:page.reserve")}
            </button>
          ) : (
            <button type="button" disabled className="h-11 shrink-0 rounded-pill bg-secondary px-4 text-sm font-semibold text-muted-foreground">{t("tpl_luxe:page.unavailable")}</button>
          )}
        </div>
      </div>

      <Footer />
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </div>
  );
}
