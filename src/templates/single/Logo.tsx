import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Store logo, else the store name in the display face. */
export default function Logo({ logo, storeName, className, imgClassName }: { logo: string | null; storeName: string; className?: string; imgClassName?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${storeName || "Store"} home`}
      className={cn("flex min-w-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", className)}
    >
      {logo ? (
        <img src={logo} alt={storeName} className={cn("h-9 w-auto max-w-[140px] object-contain sm:max-w-[180px]", imgClassName)} />
      ) : (
        <span className="truncate font-display text-lg font-extrabold tracking-tight text-foreground sm:text-xl">{storeName}</span>
      )}
    </Link>
  );
}
