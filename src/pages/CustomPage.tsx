import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import contentPageApi, { type StorefrontContentPage } from "@/services/contentPageApi";
import { Markdown } from "@/lib/markdown";
import NotFound from "@/pages/NotFound";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function CustomPage() {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const [page, setPage] = useState<StorefrontContentPage | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let active = true;
    setState("loading");
    contentPageApi
      .getBySlug(slug)
      .then((p) => {
        if (!active) return;
        setPage(p);
        setState("ready");
        const pageTitle = p.content?.seo?.title || p.title;
        if (pageTitle) document.title = pageTitle;
      })
      .catch(() => active && setState("missing"));
    return () => { active = false; };
  }, [slug]);

  if (state === "missing") return <NotFound />;
  if (state === "loading" || !page) return <div className="min-h-screen bg-background pt-32 pb-20 container text-muted-foreground">{t("common:status.loading")}</div>;

  const hero = page.content?.hero;
  const title = hero?.title || page.title;
  const description = hero?.description || page.summary || "";

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <section className="container text-center mb-12">
        {hero?.kicker && <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">{hero.kicker}</p>}
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5 leading-tight">{title}</h1>
        {description && <p className="text-muted-foreground max-w-3xl mx-auto text-base leading-relaxed">{description}</p>}
      </section>
      <section className="container max-w-3xl">
        <Card className="p-6 sm:p-8">
          <Markdown source={page.body ?? ""} />
        </Card>
      </section>
    </div>
  );
}
