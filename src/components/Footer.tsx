import { useStoreTemplate } from "@/templates/registry";

/** Footer of the active store template. */
export default function Footer() {
  const t = useStoreTemplate();
  return t ? <t.Footer /> : null;
}
