import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-16 md:py-24 hero-gradient">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground text-lg">
            Get exclusive deals, new arrivals and style tips straight to your inbox.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="hero" size="lg" className="shrink-0">
              <Send className="h-4 w-4 mr-2" /> Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
