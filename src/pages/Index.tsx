import { useStoreTemplate } from "@/templates/registry";

/** Home page of the active store template. */
export default function Index() {
  const t = useStoreTemplate();
  return t ? <t.Home /> : <div className="min-h-screen" />;
}
