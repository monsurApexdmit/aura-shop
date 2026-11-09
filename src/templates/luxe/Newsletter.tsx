import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EYEBROW, FOCUS } from "./lib";

/** Underline-only email field with a text submit. No backend yet: thanks the shopper. */
export default function Newsletter({ className, compact = false }: { className?: string; compact?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thank you", { description: "You are on the list." });
    setEmail("");
  };

  return (
    <form onSubmit={submit} className={cn("flex w-full items-end gap-4 border-b border-foreground", className)}>
      <label htmlFor={id} className="sr-only">Email address</label>
      <input
        id={id}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className={cn(
          "min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0",
          compact ? "h-10 text-sm" : "h-12 text-base",
        )}
      />
      <button type="submit" className={cn(EYEBROW, FOCUS, "shrink-0 pb-3 text-foreground transition-opacity hover:opacity-60", compact && "pb-2.5")}>
        Subscribe
      </button>
    </form>
  );
}
