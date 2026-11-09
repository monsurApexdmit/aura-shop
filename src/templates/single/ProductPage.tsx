import { useParams } from "react-router-dom";
import Landing from "./Landing";

/** /product/:slug — the same landing page, for that product. */
export default function ProductPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  return <Landing key={slug} slug={slug} />;
}
