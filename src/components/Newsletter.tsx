import { motion } from "framer-motion";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-primary-foreground/5" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-primary-foreground/3" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-primary-foreground/10">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground mb-3">
            Don't Miss a Thing
          </h2>
          <p className="text-primary-foreground/70 text-sm md:text-base mb-8">
            Subscribe for exclusive deals, new arrivals & weekly recommendations curated just for you.
          </p>
          <div className="flex flex-col gap-2 max-w-md mx-auto sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1"
            />
            <Button variant="outline" className="shrink-0">
              <Send className="h-4 w-4" /> Subscribe
            </Button>
          </div>
          <p className="text-xs text-primary-foreground/50 mt-4">No spam ever. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
