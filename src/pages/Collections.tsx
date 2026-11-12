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
import { useTranslation } from "react-i18next";

export default function Collections() {
  const { t } = useTranslation();
  const { data: collections = [], isLoading, isError, refetch } = useCollections();
  const { storeName } = useCurrency();

  useEffect(() => {
    const title = t("common:nav.collections");
    document.title = storeName ? `${title} | ${storeName}` : title;
  }, [storeName, t]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/40">
        <div className="container py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">{t("common:nav.home")}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium" aria-current="page">{t("common:nav.collections")}</span>
          </nav>
          <PageHeader
            className="mt-2"
            title={t("common:nav.collections")}
            description={isLoading ? t("common:status.loading") : t("shop:collections.count", { count: collections.length })}
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
            title={t("shop:collections.loadError")}
            description={t("shop:collections.checkConnection")}
            action={<Button variant="outline" onClick={() => refetch()}>{t("common:actions.retry")}</Button>}
          />
        ) : collections.length === 0 ? (
          <EmptyState
            className="py-20"
            icon={LayoutGrid}
            title={t("shop:collections.emptyTitle")}
            description={t("shop:collections.emptyText")}
            action={<Button asChild><Link to="/shop">{t("shop:links.shopAll")}</Link></Button>}
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
