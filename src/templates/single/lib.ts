import {
  Baby, Bath, BedDouble, BookOpen, Bike, Gamepad2, Gift, Milk, Palette, Puzzle, Shirt, Sparkles, Sun, ToyBrick, Trees, Car, Footprints, Music, Backpack, Heart,
  type LucideIcon,
} from "lucide-react";
import type { TFunction } from "i18next";
import type { ApiCategory } from "@/services/categoryApi";
import { getImageUrl } from "@/lib/api";

/** Keyboard focus ring that reads on cream, pastel, purple and dark surfaces. */
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Focus ring for controls sitting on the purple bars (announcement, footer, perks). */
export const FOCUS_ON_PURPLE = "outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-ink-foreground dark:focus-visible:ring-offset-ink";

/**
 * Pastel colourways cycled by index. `bg` is the theme tile (light) or a soft tint of it (dark);
 * `fg` is a deeper shade of the same hue for icons and tile titles. Full class names so Tailwind keeps them.
 */
export const TONES = [
  { bg: "bg-tile-1 dark:bg-tile-1/15", fg: "text-primary" },
  { bg: "bg-tile-2 dark:bg-tile-2/15", fg: "text-[hsl(28_85%_36%)] dark:text-[hsl(40_92%_66%)]" },
  { bg: "bg-tile-3 dark:bg-tile-3/15", fg: "text-[hsl(164_62%_27%)] dark:text-[hsl(158_55%_62%)]" },
  { bg: "bg-tile-4 dark:bg-tile-4/15", fg: "text-highlight" },
  { bg: "bg-tile-5 dark:bg-tile-5/15", fg: "text-[hsl(210_70%_38%)] dark:text-[hsl(205_80%_72%)]" },
] as const;

export const tone = (i: number) => TONES[((i % TONES.length) + TONES.length) % TONES.length];

/** Letter colours for the text logo, cycled across the store name. */
export const LOGO_COLOURS = [
  "text-primary",
  "text-highlight",
  "text-[hsl(38_92%_48%)] dark:text-[hsl(40_92%_62%)]",
  "text-[hsl(164_62%_36%)] dark:text-[hsl(158_55%_58%)]",
  "text-[hsl(205_75%_48%)] dark:text-[hsl(205_80%_68%)]",
] as const;

/**
 * Link labels the shared chrome hook builds in English, by route + label. Owner pages and aisles keep
 * their own titles (they never match both).
 */
const CHROME_LABELS: Record<string, string> = {
  "/shop|Shop all": "tpl_single:nav.shopAll",
  "/collections|Collections": "common:nav.collections",
  "/deals|Deals": "common:nav.deals",
  "/contact|Contact": "common:nav.contact",
  "/track-order|Track order": "common:nav.trackOrder",
  "/account|My account": "common:nav.myAccount",
};

export function navLabel(t: TFunction, link: { label: string; to: string }): string {
  const key = CHROME_LABELS[`${link.to}|${link.label}`];
  return key ? t(key) : link.label;
}

export const categoryLink = (cat: Pick<ApiCategory, "slug">) => `/shop?cat=${cat.slug}`;
export const categoryImage = (cat: Pick<ApiCategory, "image">) => (cat.image ? getImageUrl(cat.image) : null);

const ICON_RULES: [RegExp, LucideIcon][] = [
  [/bath|care|hygien|skin|diaper|nappy|potty/i, Bath],
  [/book|read|learn|educat|school/i, BookOpen],
  [/cloth|wear|dress|shirt|romper|fashion|apparel/i, Shirt],
  [/shoe|sock|foot/i, Footprints],
  [/feed|food|milk|bottle|meal|bib|snack/i, Milk],
  [/nurser|bed|sleep|crib|cot|furnit|room/i, BedDouble],
  [/outdoor|garden|park|summer|beach|swim|sun/i, Trees],
  [/ride|bike|cycle|scooter|trike/i, Bike],
  [/car|seat|travel|stroller|pram|gear/i, Car],
  [/game|video|console/i, Gamepad2],
  [/puzzle|brain/i, Puzzle],
  [/art|craft|paint|draw|colou?r/i, Palette],
  [/music|sing|instrument/i, Music],
  [/bag|school|backpack/i, Backpack],
  [/gift|party|birthday/i, Gift],
  [/toy|play|block|lego|doll|plush/i, ToyBrick],
  [/baby|infant|newborn|toddler/i, Baby],
  [/sale|deal|offer/i, Sparkles],
  [/love|favou?rite/i, Heart],
  [/new/i, Sun],
];

/** A friendly icon for a category or menu label, by keyword. */
export function categoryIcon(label: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(label))?.[1] ?? ToyBrick;
}
