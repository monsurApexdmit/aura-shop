import { useStoreTemplate } from "@/templates/registry";

/** Site header of the active store template. */
export default function Header() {
  const t = useStoreTemplate();
  return t ? <t.Header /> : null;
}
