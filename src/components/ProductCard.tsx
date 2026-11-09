import { useStoreTemplate } from "@/templates/registry";
import type { ProductCardProps } from "@/templates/types";

/** Product card of the active store template. */
export default function ProductCard(props: ProductCardProps) {
  const t = useStoreTemplate();
  return t ? <t.ProductCard {...props} /> : null;
}
