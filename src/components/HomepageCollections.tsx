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
    <section className="container pb-8 md:pb-24">
      <div className="mb-5 flex items-end justify-between gap-x-4 gap-y-2 border-b border-foreground pb-2 sm:mb-8 sm:flex-wrap sm:border-0 sm:pb-0 md:mb-10">
        <div className="min-w-0">
          <h2 className="font-display text-[28px] font-extrabold leading-none tracking-tight text-foreground sm:text-3xl sm:leading-tight md:text-5xl">{custom?.title || DEFAULT_TITLE}</h2>
          {subtitle && <p className="mt-2 hidden text-sm text-muted-foreground sm:block md:text-base">{subtitle}</p>}
        </div>
        <Link to="/collections" className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground underline-offset-4 hover:underline sm:text-sm sm:font-semibold sm:normal-case sm:tracking-normal">
          <span className="sm:hidden">See all →</span><span className="hidden sm:inline">All collections</span> <ArrowRight className="hidden h-4 w-4 sm:block" />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {featured.map((c, i) => <CollectionCard key={c.id} collection={c} index={i} className="w-[72%] shrink-0 snap-start sm:w-auto" />)}
      </div>
    </section>
  );
}
