import { useStoreTemplate } from "@/templates/registry";

/** Phone bottom navigation of the active store template (some templates have none). */
export default function MobileTabBar() {
  const t = useStoreTemplate();
  return t?.MobileNav ? <t.MobileNav /> : null;
}
