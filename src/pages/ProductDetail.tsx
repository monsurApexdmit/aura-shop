import { useStoreTemplate } from "@/templates/registry";

/** Product page of the active store template. */
export default function ProductDetail() {
  const t = useStoreTemplate();
  return t ? <t.ProductPage /> : <div className="min-h-screen" />;
}
