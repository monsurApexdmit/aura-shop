import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiCategory } from "@/services/categoryApi";
import { CategoryThumb } from "./parts";
import { FOCUS, categoryLink, subCategoryLink } from "./lib";

/**
 * "All categories" button and its mega dropdown: top-level categories on the left,
 * the hovered/focused one's children on the right. Escape, click-outside and navigation close it.
 */
export default function CategoryMenu({ categories }: { categories: ApiCategory[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Hover opens the menu; a click right after that should not immediately close it again
  const hoverOpenedAt = useRef(0);
  const panelId = useId();
  const { pathname, search } = useLocation();

  useEffect(() => setOpen(false), [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div ref={rootRef} className="relative shrink-0" onMouseLeave={() => setOpen(false)}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => (o && Date.now() - hoverOpenedAt.current < 600 ? true : !o))}
        onMouseEnter={() => {
          if (!open) hoverOpenedAt.current = Date.now();
          setOpen(true);
        }}
        className={cn("flex h-10 w-[230px] items-center gap-2.5 rounded-t-md bg-ink px-4 text-sm font-semibold text-ink-foreground", !open && "rounded-b-md", FOCUS)}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
        All categories
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div id={panelId} className="absolute left-0 top-full z-50 flex w-[min(880px,calc(100vw-4rem))] overflow-hidden rounded-b-md rounded-tr-md border border-border bg-card shadow-xl">
          {categories.length === 0 ? (
            <div className="w-full p-6 text-sm text-muted-foreground">
              Categories will show here once the store adds them. <Link to="/shop" className="font-semibold text-highlight hover:underline">Browse all products</Link>
            </div>
          ) : (
            <>
              <ul className="max-h-[420px] w-[230px] shrink-0 overflow-y-auto border-r border-border py-1.5">
                {categories.map((cat, i) => (
                  <li key={cat.id}>
                    <Link
                      to={categoryLink(cat)}
                      onMouseEnter={() => setActiveId(cat.id)}
                      onFocus={() => setActiveId(cat.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-sm outline-none transition-colors focus-visible:bg-secondary",
                        active?.id === cat.id ? "bg-secondary font-semibold text-highlight" : "text-foreground hover:bg-secondary",
                      )}
                    >
                      <CategoryThumb category={cat} index={i} className="size-6 rounded" letterClassName="text-[11px]" />
                      <span className="min-w-0 flex-1 truncate">{cat.name}</span>
                      {cat.children.length > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    </Link>
                  </li>
                ))}
              </ul>
              {active && (
                <div className="min-w-0 flex-1 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
                    <p className="truncate font-display text-base font-bold text-foreground">{active.name}</p>
                    <Link to={categoryLink(active)} className={cn("shrink-0 rounded-sm text-sm font-semibold text-highlight hover:underline", FOCUS)}>
                      Shop all {active.name} →
                    </Link>
                  </div>
                  {active.children.length > 0 ? (
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-1 xl:grid-cols-3">
                      {active.children.map((sub) => (
                        <li key={sub.id}>
                          <Link to={subCategoryLink(active, sub)} className={cn("block truncate rounded-sm py-1.5 text-sm text-muted-foreground hover:text-highlight", FOCUS)}>
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Link to={categoryLink(active)} className={cn("flex items-center gap-3 rounded-md bg-secondary p-4 text-sm text-foreground hover:bg-accent", FOCUS)}>
                      <LayoutGrid className="h-5 w-5 text-highlight" aria-hidden="true" />
                      Browse everything in {active.name}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
