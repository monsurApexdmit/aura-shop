import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Separator } from "@/components/ui/separator";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { EmptyState } from "@/components/common/EmptyState";
import { WithTooltip } from "@/components/common/WithTooltip"
import { useTranslation } from "react-i18next";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border flex flex-col pb-[env(safe-area-inset-bottom)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base">{t("cart:drawer.title")}</h2>
                  <p className="text-xs text-muted-foreground">{t("common:product.items", { count: items.length })}</p>
                </div>
              </div>
              <WithTooltip content={t("cart:drawer.close")}><Button variant="ghost" size="icon" aria-label={t("cart:drawer.close")} onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button></WithTooltip>
            </div>
            <Separator />

            {items.length === 0 ? (
              <EmptyState
                className="flex-1"
                icon={ShoppingBag}
                title={t("cart:drawer.emptyTitle")}
                description={t("cart:drawer.emptyText")}
                action={
                  <Button onClick={() => setIsOpen(false)}>
                    {t("common:actions.continueShopping")} <ArrowRight className="h-4 w-4" />
                  </Button>
                }
              />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {items.map((item, i) => (
                    <Item key={item.id} asChild variant="outline" className="flex-nowrap items-start gap-3 p-3">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ItemMedia className="size-20 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = "none";
                              img.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span className={cn("text-xs text-muted-foreground text-center leading-tight px-1", item.image ? "hidden" : "")}>{t("cart:drawer.noImage")}</span>
                      </ItemMedia>
                      <ItemContent className="min-w-0">
                        <ItemTitle className="block truncate">{item.name}</ItemTitle>
                        <p className="text-primary font-semibold">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <WithTooltip content={t("common:actions.decrease")}><Button
                            variant="outline"
                            size="icon"
                            aria-label={t("common:actions.decrease")}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button></WithTooltip>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <WithTooltip content={t("common:actions.increase")}><Button
                            variant="outline"
                            size="icon"
                            aria-label={t("common:actions.increase")}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button></WithTooltip>
                        </div>
                      </ItemContent>
                      <ItemActions className="self-start">
                        <WithTooltip content={t("cart:drawer.removeItem", { name: item.name })}><Button variant="ghost" size="icon" aria-label={t("cart:drawer.removeItem", { name: item.name })} onClick={() => removeItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button></WithTooltip>
                      </ItemActions>
                    </motion.div>
                    </Item>
                  ))}
                </div>

                {/* Checkout */}
                <Separator />
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">{t("common:money.subtotal")}</span>
                    <span className="font-semibold text-xl tabular-nums">{formatCurrency(totalPrice)}</span>
                  </div>
                  <Button onClick={() => { setIsOpen(false); navigate("/checkout"); }} className="w-full">
                    {t("cart:drawer.checkout")} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    {t("common:actions.continueShopping")}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}