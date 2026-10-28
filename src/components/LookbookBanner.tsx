import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/lib/api";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { mapApiProduct } from "@/lib/mappers";
import { PASTELS } from "@/lib/pastels";
import { AccentText } from "@/components/common/AccentText";

const FALLBACK = {
  tag: "Lookbook",
  title: "A year of *color*, no apologies.",
  text: "Bold colour, easy shapes and pieces for the whole family. Find your next favourite in the full collection.",
  cta: "Explore the collection",
  link: "/shop",
};
const EMPTY_SLOT = ["🛍️", "✨"];

const hasPhoto = (src: string) => !src.includes("placeholder");

// Brand story block. Admin can write it (Online store > Homepage sections > Lookbook); otherwise it
// spotlights the category most of the newest products belong to, with that category's photos.
export default function LookbookBanner() {
  const { data: sections, isLoading } = useHomepageSections();
  const { data: categories = [] } = useCategories();
  const { data } = useProducts({ limit: 8 });
  const custom = sections?.lookbook;
  const products = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);

  const spotlight = useMemo(() => {
    if (custom) return null;
    // Products carry their (sub)category name; count them per top-level category.
    const parentOf = (name: string) =>
      categories.find((c) => c.name === name || c.children.some((x) => x.name === name));
    const counts = new Map<number, number>();
    for (const p of products) {
      const parent = parentOf(p.category) ?? parentOf(p.subcategory);
      if (parent) counts.set(parent.id, (counts.get(parent.id) ?? 0) + 1);
    }
    const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const cat = categories.find((c) => c.id === topId);
    if (!cat) return null;
    const inCat = (p: (typeof products)[number]) => parentOf(p.category)?.id === cat.id || parentOf(p.subcategory)?.id === cat.id;
    const subs = cat.children.slice(0, 3).map((x) => x.name);
    return {
      copy: {
        tag: "Spotlight",
        title: `Fresh in *${cat.name}*.`,
        text: subs.length > 0
          ? `${subs.join(", ")} and more: new pieces in our ${cat.name} collection.`
          : `New pieces in our ${cat.name} collection, picked for you.`,
        cta: `Shop ${cat.name}`,
        link: `/shop?cat=${cat.slug}`,
      },
      images: [
        ...(cat.image ? [getImageUrl(cat.image)] : []),
        ...products.filter(inCat).map((p) => p.image),
      ],
    };
  }, [custom, categories, products]);

  const images = useMemo(() => {
    const own = custom ? custom.images.map((p) => getImageUrl(p)) : spotlight?.images ?? [];
    // Top up with other catalogue photos so neither slot stays empty when photos exist.
    const rest = products.map((p) => p.image);
    return Array.from(new Set([...own, ...rest].filter(hasPhoto))).slice(0, 2);
  }, [custom, spotlight, products]);

  if (isLoading) return null;
  if (custom && !custom.enabled) return null;
  const copy = custom ?? spotlight?.copy ?? FALLBACK;

  return (
    <section className="container py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#1C1917] p-6 text-white sm:p-8 md:grid-cols-2 md:gap-10 md:p-14"
      >
        <div className="min-w-0">
          {copy.tag && (
            <span className="inline-block rounded-full border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              {copy.tag}
            </span>
          )}
          <h2 className="mt-5 break-words font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            <AccentText text={copy.title} />
          </h2>
          {copy.text && <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base">{copy.text}</p>}
          <Button asChild className="mt-7 h-11 rounded-full bg-white px-6 font-semibold text-neutral-950 hover:bg-white/90">
            <Link to={copy.link || "/shop"}>
              {copy.cta || FALLBACK.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className={`aspect-[3/4] overflow-hidden rounded-2xl ${PASTELS[i + 2]} ${i === 1 ? "mt-6 sm:mt-8" : ""}`}>
              {images[i] ? (
                <img src={images[i]} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-5xl sm:text-6xl">{EMPTY_SLOT[i]}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
