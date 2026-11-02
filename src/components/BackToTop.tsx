import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/common/WithTooltip"

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <WithTooltip content="Back to top"><Button asChild size="icon" className="fixed bottom-[4.5rem] right-4 z-50 size-10 rounded-full shadow-lg sm:bottom-24 sm:right-6 sm:size-12 [&_svg]:size-4 sm:[&_svg]:size-5">
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </Button></WithTooltip>
      )}
    </AnimatePresence>
  );
}
