import { cn } from "@/lib/utils"
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { useProducts } from "@/hooks/useProducts";
import { useDepartments, type ResolvedDepartment } from "@/hooks/useDepartments";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { mapApiProduct } from "@/lib/mappers";
import { pastel, PASTELS } from "@/lib/pastels";

const DEFAULT_TITLE = "Pick your aisle";
const COUNT_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six"];
const MAX_AUTO = 6;

const AISLE_COPY: Record<ResolvedDepartment["key"], { emoji: string; tagline: string; tone: string }> = {
  women: { emoji: "🌸", tagline: "Soft power, loud color.", tone: PASTELS[0] },
  men:   { emoji: "🌞", tagline: "Easy tailoring, sun-baked color.", tone: PASTELS[1] },
  kids:  { emoji: "🎈", tagline: "Built for jumping, spinning, climbing.", tone: PASTELS[2] },
};

interface Aisle {
  key: string;
  label: string;
  tagline: string;
  emoji: string;
  href: string;
  tone: string;
  image?: string;
}

// Fewer cards get wider shapes so one or two cards don't turn into giant posters.
const WIDE_ASPECT: Record<number, string> = { 1: "sm:aspect-[21/9]", 2: "sm:aspect-[4/3]" };

function AisleCard({ aisle, index, compact, count = 3 }: { aisle: Aisle; index: number; compact?: boolean; count?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      viewport={{ once: true }}
    >
      <Link
        to={aisle.href}
        className={cn("group relative block overflow-hidden rounded-3xl", WIDE_ASPECT[count] ?? "sm:aspect-[4/5]", compact ? "aspect-[4/5] rounded-2xl sm:rounded-3xl" : "aspect-[4/3]", aisle.tone)}
      >
        {aisle.image ? (
          <img
            src={aisle.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden="true" className={cn("flex h-full w-full items-start justify-center transition-transform duration-500 group-hover:scale-105 sm:text-[6rem] lg:text-[7rem]", count > 2 && "sm:pt-[18%]", compact ? "pt-[16%] text-[3.5rem]" : "pt-[10%] text-[5rem]")}>
            {aisle.emoji || <span className="font-display font-extrabold text-neutral-950/20">{aisle.label.charAt(0)}</span>}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className={cn("absolute inset-x-0 bottom-0 text-white md:p-6", compact ? "p-3 sm:p-5" : "p-5")}>
          {aisle.emoji && <span aria-hidden="true" className="text-xl">{aisle.emoji}</span>}
          <h3 className={cn("font-display font-extrabold md:text-3xl lg:text-4xl", compact ? "text-lg sm:text-2xl" : "text-2xl")}>{aisle.label}</h3>
          {aisle.tagline && <p className={cn("mt-1 text-white/85", compact ? "line-clamp-2 text-xs sm:text-sm" : "text-sm")}>{aisle.tagline}</p>}
          <span className={cn("inline-flex items-center gap-1.5 font-semibold", compact ? "mt-2 text-xs sm:mt-4 sm:text-sm" : "mt-4 text-sm")}>
            Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

interface AutoAisle {
  aisle: Aisle;
  /** Fetch a cover photo from this category's products when the aisle has no image. */
  categoryId?: number;
  search?: string;
}

// Automatic card: category image, else a photo from the latest products, else the aisle's newest product.
function AutoAisleCard({ item, index, compact, count }: { item: AutoAisle; index: number; compact?: boolean; count: number }) {
  const { aisle, categoryId, search } = item;
  const { data } = useProducts(
    categoryId ? { limit: 1, category_id: categoryId } : { limit: 1, search },
    { enabled: !aisle.image }
  );
  const first = data?.data?.[0];
  const photo = first ? mapApiProduct(first).image : undefined;
  const image = aisle.image ?? (photo && !photo.includes("placeholder") ? photo : undefined);
  return <AisleCard index={index} compact={compact} count={count} aisle={{ ...aisle, image }} />;
}

// Card count decides the columns so 1–6 cards always fill the row neatly; 4+ cards sit two-up on phones.
const GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 lg:grid-cols-3",
  6: "grid-cols-2 lg:grid-cols-3",
};

// Automatic mode, from the store's own categories:
// 1. Women/Men/Kids categories (or subcategories) when the store has them;
// 2. otherwise its top-level categories, tagged with their subcategories;
// 3. with no categories at all, Women/Men/Kids cards that search the catalogue.
function useAutoAisles(): AutoAisle[] {
  const { departments } = useDepartments();
  const { data: categories = [] } = useCategories();
  // Products are usually filed under subcategories, so match the latest products by (sub)category name
  // instead of relying on the parent-category filter.
  const { data: latest } = useProducts({ limit: 8 });
  const latestProducts = (latest?.data ?? []).map(mapApiProduct).filter((p) => !p.image.includes("placeholder"));
  const imageOf = (id?: number) => {
    const cat = categories.find((c) => c.id === id);
    if (cat?.image) return getImageUrl(cat.image);
    const names = new Set<string>([...(cat ? [cat.name, ...cat.children.map((x) => x.name)] : [])]);
    // A subcategory id (e.g. a "Women" subcategory) matches by its own name.
    for (const parent of categories) {
      const sub = parent.children.find((x) => x.id === id);
      if (sub) names.add(sub.name);
    }
    return latestProducts.find((p) => names.has(p.category) || names.has(p.subcategory))?.image;
  };
  const deptAisle = (d: ResolvedDepartment): Aisle => ({
    key: d.key, label: d.label, tagline: AISLE_COPY[d.key].tagline, emoji: AISLE_COPY[d.key].emoji,
    href: d.href, tone: AISLE_COPY[d.key].tone, image: imageOf(d.categoryId),
  });

  const matched = departments.filter((d) => d.categoryId);
  if (matched.length > 0) return matched.map((d) => ({ aisle: deptAisle(d), categoryId: d.categoryId }));
  if (categories.length > 0) {
    return categories.slice(0, MAX_AUTO).map((c, i) => ({
      aisle: {
        key: c.slug,
        label: c.name,
        tagline: c.children.length > 0 ? c.children.slice(0, 3).map((x) => x.name).join(" · ") : `Shop all ${c.name}`,
        emoji: "",
        href: `/shop?cat=${c.slug}`,
        tone: pastel(i),
        image: imageOf(c.id),
      },
      categoryId: c.id,
    }));
  }
  return departments.map((d) => ({ aisle: deptAisle(d), search: d.label }));
}

export default function DepartmentAisles() {
  const { data: sections, isLoading } = useHomepageSections();
  const { isLoading: categoriesLoading } = useCategories();
  const auto = useAutoAisles();
  const custom = sections?.aisles;

  // Wait for settings and categories so a hidden or custom section never flashes the automatic one.
  if (isLoading || (!custom && categoriesLoading)) return null;
  if (custom && (!custom.enabled || custom.items.length === 0)) return null;

  const count = custom ? custom.items.length : auto.length;
  const compact = count >= 4;
  const subtitle = custom
    ? custom.subtitle
    : `${COUNT_WORDS[Math.min(count, MAX_AUTO)]} aisle${count === 1 ? "" : "s"}, one wardrobe philosophy.`;

  return (
    <section className="container py-14 md:py-24">
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">{custom?.title || DEFAULT_TITLE}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>}
      <div className={cn("mt-8 grid gap-3 sm:gap-4 md:mt-10 md:gap-5", GRID_COLS[Math.min(count, 6)])}>
        {custom
          ? custom.items.map((item, i) => (
              <AisleCard
                key={item.id || i}
                index={i}
                compact={compact}
                count={count}
                aisle={{
                  key: item.id, label: item.label, tagline: item.tagline, emoji: item.emoji, href: item.link, tone: pastel(i),
                  image: item.imagePath ? getImageUrl(item.imagePath) : undefined,
                }}
              />
            ))
          : auto.map((item, i) => <AutoAisleCard key={item.aisle.key} item={item} index={i} compact={compact} count={count} />)}
      </div>
    </section>
  );
}
