import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base">Shopping Cart</h2>
                  <p className="text-xs text-muted-foreground">{items.length} items</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="font-display font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground text-center">Looks like you haven't added anything yet.</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 gradient-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Continue Shopping <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 p-3 rounded-xl bg-card border border-border"
                    >
                      <div className="w-20 h-20 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-card-foreground truncate">{item.name}</h3>
                        <p className="text-primary font-display font-bold mt-1">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors self-start mt-1">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Checkout */}
                <div className="border-t border-border p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Subtotal</span>
                    <span className="font-display font-bold text-xl">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button onClick={() => { setIsOpen(false); navigate("/checkout"); }} className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg text-sm flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full border border-border text-foreground font-medium py-3 rounded-xl hover:bg-muted transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}