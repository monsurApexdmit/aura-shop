import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Minus, Sun, Moon } from "lucide-react";
import Footer from "@/components/Footer";
import CollectionCard from "@/components/CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/api";
import { pastel } from "@/lib/pastels";
import { useCategories } from "@/hooks/useCategories";
import { useCollections } from "@/hooks/useCollections";
import { useStorefrontPages, pageLinkHref } from "@/hooks/useStorefrontPages";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";

const KICKER = "flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground";
const STICKER_TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

// The "Browse" tab, set like a magazine's contents page: numbered categories, sticker shortcuts,
// collections, and the help pages the footer carries on desktop.
export default function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: collections = [] } = useCollections();
  const { data: pages = [] } = useStorefrontPages();
  const { storeName } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    document.title = storeName ? `Browse | ${storeName}` : "Browse";
  }, [storeName]);

  const stickers = [
    { label: "Shop all", to: "/shop" },
    { label: "Sale %", to: "/deals", hot: true },
    ...(collections.length > 0 ? [{ label: "Collections", to: "/collections" }] : []),
    { label: "Track order", to: "/track-order" },
  ];
  const infoLinks = [
    ...pages.filter((p) => p.place === "header" || p.place === "footer").map((p) => ({ label: p.title, to: pageLinkHref(p.slug) })),
    { label: "Contact us", to: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl pb-6 pt-5 md:py-12">
        <div className={KICKER}>
          <span>The index</span>
          <span className="h-px flex-1 bg-foreground" aria-hidden="true" />
          <span className="tabular-nums">{String(categories.length).padStart(2, "0")} aisles</span>
        </div>
        <h1 className="mt-3 font-display text-[3.25rem] font-extrabold leading-[0.9] tracking-[-0.03em] text-foreground md:text-7xl">
          Browse <em className="text-highlight">it all.</em>
        </h1>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {stickers.map(({ label, to, hot }, i) => (
            <Link
              key={label}
              to={to}
              className={cn(
                "rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold transition-transform active:scale-95",
                STICKER_TILTS[i % STICKER_TILTS.length],
                hot ? "border-highlight bg-highlight text-highlight-foreground" : "bg-background text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <ol className="mt-8 border-t-2 border-foreground">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 border-b border-foreground/15 py-5"><Skeleton className="h-4 w-6" /><Skeleton className="h-7 w-1/2" /></li>
          ))}
          {categories.map((cat, i) => {
            const expanded = open === cat.slug;
            const hasChildren = cat.children.length > 0;
            const row = (
              <>
                <span className="w-6 shrink-0 pt-2 text-xs font-bold tabular-nums text-highlight">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[26px] font-extrabold leading-tight tracking-tight text-foreground">{cat.name}</span>
                  {hasChildren && (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{cat.children.length} edits · {cat.children.slice(0, 3).map((c) => c.name).join(", ")}</span>
                  )}
                </span>
                {cat.image && (
                  <span className={cn("mt-1 size-12 shrink-0 overflow-hidden rounded-lg rotate-3 shadow-md", pastel(i))}>
                    <img src={getImageUrl(cat.image)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                )}
                <span className="mt-2 flex size-7 shrink-0 items-center justify-center rounded-full border border-foreground" aria-hidden="true">
                  {hasChildren ? (expanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />) : <ArrowRight className="h-3.5 w-3.5" />}
                </span>
              </>
            );
            return (
              <li key={cat.slug} className="border-b border-foreground/15">
                {hasChildren ? (
                  <button type="button" className="flex w-full items-start gap-4 py-4 text-left" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : cat.slug)}>
                    {row}
                  </button>
                ) : (
                  <Link to={`/shop?cat=${cat.slug}`} className="flex items-start gap-4 py-4">{row}</Link>
                )}
                {expanded && (
                  <div className="flex flex-wrap gap-2 pb-5 pl-10">
                    <Link to={`/shop?cat=${cat.slug}`} className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-bold text-background">
                      All {cat.name} →
                    </Link>
                    {cat.children.map((child) => (
                      <Link key={child.slug} to={`/shop?cat=${cat.slug}&sub=${child.slug}`} className="rounded-full border border-foreground/30 px-3.5 py-1.5 text-xs font-semibold text-foreground">
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {!isLoading && categories.length === 0 && (
            <li className="border-b border-foreground/15">
              <Link to="/shop" className="flex items-center justify-between py-5 font-display text-[26px] font-extrabold">Shop everything <ArrowRight className="h-5 w-5" /></Link>
            </li>
          )}
        </ol>

        {collections.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 border-b border-foreground pb-2">
              <h2 className="font-display text-[28px] font-extrabold leading-none tracking-tight text-foreground">The edits</h2>
              <Link to="/collections" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">See all →</Link>
            </div>
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 pt-5 scroll-px-5 md:mx-0 md:grid md:grid-cols-3 md:px-0">
              {collections.map((c, i) => (
                <CollectionCard key={c.id} collection={c} index={i} className={cn("w-[66%] shrink-0 snap-start md:w-auto md:rotate-0", i % 2 ? "rotate-1" : "-rotate-1")} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className={KICKER}>
            <span>Help & info</span>
            <span className="h-px flex-1 bg-foreground" aria-hidden="true" />
          </div>
          <ul className="mt-2">
            {infoLinks.map(({ label, to }) => (
              <li key={to} className="border-b border-foreground/15">
                <Link to={to} className="flex items-center justify-between py-3.5 text-[15px] font-semibold text-foreground">
                  {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between py-3.5 text-left text-[15px] font-semibold text-foreground">
                {theme === "light" ? "Dark mode" : "Light mode"}
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}
