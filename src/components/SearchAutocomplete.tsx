import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";

interface SearchAutocompleteProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function SearchAutocomplete({ mobile, onClose }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce the search query by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
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

  const handleSelect = (id: string) => {
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
    onClose?.();
    navigate(`/product/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (results.length > 0) {
        handleSelect(results[0].id);
      } else if (query.trim()) {
        setOpen(false);
        onClose?.();
        navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands, categories..."
          className="w-full h-11 pl-11 pr-10 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          autoFocus={mobile}
        />
        {query && (
          <button onClick={() => { setQuery(""); setDebouncedQuery(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (isFetching || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-[360px] overflow-y-auto"
          >
            {isFetching && results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
            ) : (
              results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-contain rounded-lg bg-muted/30 p-1" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placeholder.svg')) t.src = '/placeholder.svg' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-popover-foreground truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.category} · ${product.price.toFixed(2)}</p>
                  </div>
                </button>
              ))
            )}
            <Link
              to={`/shop?search=${encodeURIComponent(query.trim())}`}
              onClick={() => { setOpen(false); onClose?.(); }}
              className="block px-4 py-3 text-sm text-primary font-medium border-t border-border hover:bg-muted/30 transition-colors text-center"
            >
              View all results for "{query}"
            </Link>
          </motion.div>
        )}
        {showDropdown && !isFetching && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl z-50 p-6 text-center"
          >
            <p className="text-sm text-muted-foreground">No products found for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
