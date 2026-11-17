import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WithTooltip } from "@/components/common/WithTooltip"
import { useTranslation } from "react-i18next";

const MotionCard = motion.create(Card);

interface SearchAutocompleteProps {
  /** Input hint; templates suit it to what the store sells */
  placeholder?: string;
  /** Shows a search button inside the box with this label (e.g. "Search") */
  submitLabel?: string;
  mobile?: boolean;
  onClose?: () => void;
}

export default function SearchAutocomplete({ mobile, onClose, placeholder, submitLabel }: SearchAutocompleteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  // Debounce the search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useProducts(
    debouncedQuery.trim().length >= 2 ? { search: debouncedQuery.trim(), limit: 6 } : {}
  );

  const results = debouncedQuery.trim().length >= 2
    ? (data?.data ?? []).map(mapApiProduct)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (slug: string) => {
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
    onClose?.();
    navigate(`/product/${slug}`);
  };

  const searchAll = () => {
    if (!query.trim()) return;
    setOpen(false);
    onClose?.();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (results.length > 0) handleSelect(results[0].slug);
      else searchAll();
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground text-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("shop:searchAutocomplete.placeholder")}
          aria-label={t("common:search.label")}
          className={cn("h-11 w-full rounded-pill border-input bg-secondary pl-11", submitLabel ? "pr-32" : "pr-11")}
          autoFocus={mobile}
        />
        {query && (
          <WithTooltip content={t("shop:searchAutocomplete.clear")}><Button variant="ghost" size="icon" aria-label={t("shop:searchAutocomplete.clear")} onClick={() => { setQuery(""); setDebouncedQuery(""); setOpen(false); }} className={cn("absolute top-1/2 -translate-y-1/2 rounded-full", submitLabel ? "right-24" : "right-0.5")}>
            <X className="h-4 w-4" />
          </Button></WithTooltip>
        )}
        {submitLabel && (
          <Button type="button" onClick={searchAll} className="absolute right-1 top-1/2 h-9 -translate-y-1/2 rounded-pill bg-highlight px-5 font-semibold text-highlight-foreground hover:bg-highlight/90">
            {submitLabel}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (isFetching || results.length > 0) && (
          <MotionCard
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden max-h-[360px] overflow-y-auto"
          >
            {isFetching && results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t("shop:searchAutocomplete.searching")}</div>
            ) : (
              results.map((product) => (
                <Button
                  key={product.id}
                  variant="ghost"
                  onClick={() => handleSelect(product.slug)}
                  className="h-auto w-full justify-start gap-3 text-left whitespace-normal"
                >
                  <img src={product.image} alt={product.name} className="w-10 h-10 shrink-0 object-contain" onError={(e) => { const img = e.target as HTMLImageElement; if (!img.src.includes('placeholder.svg')) img.src = '/placeholder.svg' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.category} · {formatCurrency(product.price)}</p>
                  </div>
                </Button>
              ))
            )}
            <Separator />
            <Button asChild variant="ghost" className="w-full rounded-none text-primary">
              <Link
                to={`/shop?search=${encodeURIComponent(query.trim())}`}
                onClick={() => { setOpen(false); onClose?.(); }}
              >
                {t("shop:searchAutocomplete.viewAllFor", { query })}
              </Link>
            </Button>
          </MotionCard>
        )}
        {showDropdown && !isFetching && results.length === 0 && (
          <MotionCard
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 p-6 text-center"
          >
            <p className="text-sm text-muted-foreground">{t("shop:searchAutocomplete.noResultsFor", { query })}</p>
          </MotionCard>
        )}
      </AnimatePresence>
    </div>
  );
}
