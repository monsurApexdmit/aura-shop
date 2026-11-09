import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { anchorClick } from "./scroll";

/** Height the bar takes on phones, for the spacer that keeps the footer readable. */
export const STICKY_BAR_SPACER = "h-[calc(4.75rem+env(safe-area-inset-bottom))] md:hidden";

/** Phone-only bar with the price and an "Order now" button; hides while the order form is on screen. */
export default function StickyOrderBar({ price, originalPrice, discount }: { price: string; originalPrice: string | null; discount: number }) {
  const [orderVisible, setOrderVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("order");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOrderVisible(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Portal: page transitions transform the route wrapper, which would pin `fixed` to it instead of the screen.
  return createPortal(
    <AnimatePresence>
      {!orderVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 420, damping: 40 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_hsl(var(--foreground)/0.25)] md:hidden"
        >
          <div className="container flex h-[4.75rem] items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="truncate font-display text-xl font-extrabold tracking-tight text-foreground">{price}</span>
                {discount > 0 && <span className="shrink-0 rounded-pill bg-highlight/10 px-1.5 py-0.5 text-[11px] font-bold text-highlight">-{discount}%</span>}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {originalPrice ? <span className="mr-1.5 line-through">{originalPrice}</span> : null}
                Cash on delivery
              </p>
            </div>
            <a
              href="#order"
              onClick={anchorClick("order")}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill bg-highlight px-5 font-display text-sm font-bold text-highlight-foreground shadow-md shadow-highlight/25 transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              Order now
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
