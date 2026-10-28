import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LayoutGrid } from "lucide-react";
import CollectionCard, { CollectionCardSkeleton } from "@/components/CollectionCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useCollections } from "@/hooks/useCollections";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Collections() {
  const { data: collections = [], isLoading, isError, refetch } = useCollections();
  const { storeName } = useCurrency();

  useEffect(() => {
    document.title = storeName ? `Collections | ${storeName}` : "Collections";
  }, [storeName]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/40">
        <div className="container py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium" aria-current="page">Collections</span>
          </nav>
          <PageHeader
            className="mt-2"
            title="Collections"
            description={isLoading ? "Loading..." : `${collections.length} collection${collections.length === 1 ? "" : "s"} to explore`}
          />
        </div>
      </div>
      <Separator />

      <div className="container py-8 md:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CollectionCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <EmptyState
            className="py-20"
            icon={LayoutGrid}
            title="Collections could not be loaded"
            description="Please check your connection and try again."
            action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
          />
        ) : collections.length === 0 ? (
          <EmptyState
            className="py-20"
            icon={LayoutGrid}
            title="No collections yet"
            description="Browse the full catalogue in the meantime."
            action={<Button asChild><Link to="/shop">Shop all</Link></Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => <CollectionCard key={c.id} collection={c} index={i} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
