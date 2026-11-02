import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CollectionCard from "@/components/CollectionCard";
import { useCollections } from "@/hooks/useCollections";
import { useHomepageSections } from "@/hooks/useHomepageSections";

const DEFAULT_TITLE = "Shop by collection";
const DEFAULT_SUBTITLE = "Hand-picked edits, refreshed often.";
const MAX_CARDS = 6;

// Collections flagged "Show on homepage" in admin. Hidden when none are flagged,
// or when the homepage sections setting turns the block off.
export default function HomepageCollections() {
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const { data: collections = [], isLoading } = useCollections();
  const custom = sections?.collections;
  const featured = collections.filter((c) => c.showOnHomepage).slice(0, MAX_CARDS);

  // Wait for both so a hidden or empty block never flashes in.
  if (sectionsLoading || isLoading) return null;
  if (custom && !custom.enabled) return null;
  if (featured.length === 0) return null;

  const subtitle = custom ? custom.subtitle : DEFAULT_SUBTITLE;

  return (
    <section className="container pb-16 md:pb-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-10">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">{custom?.title || DEFAULT_TITLE}</h2>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>}
        </div>
        <Link to="/collections" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline">
          All collections <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((c, i) => <CollectionCard key={c.id} collection={c} index={i} />)}
      </div>
    </section>
  );
}
