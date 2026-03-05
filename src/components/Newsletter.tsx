import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-4"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            Stay in the Loop
          </h2>
          <p className="text-primary-foreground/80 text-sm">
            Get exclusive deals, new arrivals and special offers straight to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 h-11 px-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 text-sm"
            />
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 h-11 px-5">
              <Send className="h-4 w-4 mr-2" /> Subscribe
            </Button>
          </div>
          <p className="text-xs text-primary-foreground/60">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
