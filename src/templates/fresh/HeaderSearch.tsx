import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { ApiCategory } from "@/services/categoryApi";
import { onProductImageError } from "../shared/useProductPage";

/**
 * Supermarket search: an optional category scope, the text box and a green search button.
 * Typing shows a few matching products; Enter / the button opens the full results in the shop.
 */
export default function HeaderSearch({ categories, className }: { categories: ApiCategory[]; className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const ids = useId();
  const wrap = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const category = categories.find((c) => c.slug === cat);
  const searching = debounced.length >= 2;
  const { data, isFetching } = useProducts(
    searching ? { search: debounced, limit: 5, ...(category ? { category_id: category.id } : {}) } : {},
    { enabled: searching },
  );
  const results = useMemo(() => (searching ? (data?.data ?? []).map(mapApiProduct) : []), [data, searching]);
  const showList = open && query.trim().length >= 2;

  const resultsHref = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (cat) params.set("cat", cat);
    return `/shop${params.toString() ? `?${params}` : ""}`;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !cat) return;
    setOpen(false);
    navigate(resultsHref());
  };

  const reset = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <form
      ref={wrap}
      role="search"
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      className={cn("relative w-full", className)}
    >
      <div className="flex h-11 w-full items-stretch overflow-hidden rounded-pill border border-input bg-card transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
        {categories.length > 0 && (
          <div className="relative hidden shrink-0 border-r border-input bg-secondary sm:block">
            <label htmlFor={`${ids}-cat`} className="sr-only">{t("tpl_fresh:search.scope")}</label>
            <select
              id={`${ids}-cat`}
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-full w-36 cursor-pointer appearance-none bg-transparent pl-3 pr-7 text-xs font-semibold text-foreground outline-none focus-visible:bg-accent lg:w-40"
            >
              <option value="">{t("common:nav.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        <label htmlFor={`${ids}-q`} className="sr-only">{t("common:search.label")}</label>
        <input
          id={`${ids}-q`}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("tpl_fresh:search.placeholder")}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label={t("common:search.submit")}
          className="flex w-12 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-primary/90 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground"
        >
          <Search className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>

      {showList && (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {isFetching && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">{t("tpl_fresh:search.searching")}</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">{t("tpl_fresh:search.noMatch", { query: query.trim() })}</p>
          ) : (
            <ul aria-label={t("tpl_fresh:search.suggestions")} className="max-h-80 overflow-y-auto py-1">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={reset}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-accent outline-none focus-visible:bg-accent"
                  >
                    <img src={p.image} alt="" onError={onProductImageError} className="size-10 shrink-0 rounded-md bg-secondary object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">{p.category}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold">{formatCurrency(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={resultsHref()}
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-accent outline-none focus-visible:bg-accent"
          >
            {category ? t("tpl_fresh:search.seeAllIn", { category: category.name }) : t("common:search.viewAll")}
          </Link>
        </div>
      )}
    </form>
  );
}
