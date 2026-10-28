import { cn } from "@/lib/utils"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { couponApi } from "@/services/couponApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { pastel } from "@/lib/pastels";

async function copyText(text: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}

// Active online coupons from admin (Coupons, channel "Online"), highest priority first.
export default function CouponStrip() {
  const { formatCurrency } = useCurrency();
  const [copied, setCopied] = useState<string | null>(null);
  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons-active"],
    queryFn: couponApi.getActive,
    staleTime: 1000 * 60 * 10,
  });

  if (coupons.length === 0) return null;

  const copy = async (code: string) => {
    await copyText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section aria-labelledby="offers-heading" className="container pt-12 md:pt-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id="offers-heading" className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Offers for you</h2>
        <span className="text-xs text-muted-foreground">Copy a code, use it at checkout</span>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-4">
          {coupons.map((c, i) => {
            const offer = c.free_shipping
              ? "Free shipping"
              : c.type === "fixed"
              ? `${formatCurrency(Number(c.discount ?? 0))} off`
              : `${c.discount}% off`;
            return (
              <li key={c.code} className={cn("flex w-[240px] flex-col gap-1 rounded-2xl p-5 text-neutral-950", pastel(i))}>
                <span className="font-display text-3xl font-extrabold leading-none">{offer}</span>
                <span className="mt-1 truncate text-sm font-semibold">{c.campaign_name}</span>
                <span className="text-xs text-neutral-950/70">
                  {c.min_order_amount ? `On orders over ${formatCurrency(Number(c.min_order_amount))}` : "No minimum order"}
                </span>
                <Button
                  type="button"
                  onClick={() => copy(c.code)}
                  aria-label={`Copy code ${c.code}`}
                  className="mt-3 h-10 w-full justify-between rounded-full border border-dashed border-neutral-950/40 bg-white/70 px-4 font-mono text-sm font-semibold text-neutral-950 hover:bg-white"
                >
                  {c.code}
                  {copied === c.code
                    ? <span className="flex items-center gap-1 font-body text-xs"><Check className="h-3.5 w-3.5" /> Copied</span>
                    : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
