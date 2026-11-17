import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/common/WithTooltip"

export default function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <WithTooltip content={t("home:backToTop")}><Button asChild size="icon" className="fixed bottom-24 right-6 z-50 size-12 rounded-full shadow-lg max-md:hidden [&_svg]:size-5">
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t("home:backToTop")}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </Button></WithTooltip>
      )}
    </AnimatePresence>
  );
}
