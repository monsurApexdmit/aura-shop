import { useId, useMemo, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTemplateBlock } from "../shared/useTemplateContent";
import { FOCUS_ON_DARK } from "./lib";

/** Green sign-up panel (Template content > Newsletter). No backend yet: thanks the shopper. */
export default function Newsletter() {
  const { t } = useTranslation();
  const fallback = useMemo(() => ({ title: t("tpl_fresh:newsletter.title"), text: t("tpl_fresh:newsletter.text") }), [t]);
  const { block } = useTemplateBlock("newsletter", fallback);
  const id = useId();
  const [email, setEmail] = useState("");
  if (!block) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success(t("tpl_fresh:newsletter.thanks"), { description: t("tpl_fresh:newsletter.thanksText") });
    setEmail("");
  };

  return (
    <section aria-labelledby={`${id}-title`} className="container py-6 md:py-8">
      <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-7 text-primary-foreground md:px-10 md:py-10">
        <span aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full bg-primary-foreground/10" />
        <span aria-hidden="true" className="absolute -bottom-24 right-40 size-56 rounded-full bg-primary-foreground/5" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 sm:flex" aria-hidden="true">
              <Mail className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 id={`${id}-title`} className="font-display text-2xl font-bold leading-tight md:text-[1.75rem]">{block.title}</h2>
              {block.text && <p className="mt-1 max-w-xl text-sm text-primary-foreground/85">{block.text}</p>}
            </div>
          </div>
          <div className="w-full lg:max-w-md">
            <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`${id}-email`} className="sr-only">{t("common:form.emailAddress")}</label>
              <input
                id={`${id}-email`}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("tpl_fresh:newsletter.placeholder")}
                className="h-12 min-w-0 flex-1 rounded-pill border-0 bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-highlight"
              />
              <button type="submit" className={cn("h-12 shrink-0 rounded-pill bg-highlight px-6 text-sm font-semibold text-highlight-foreground transition-colors hover:bg-highlight/90", FOCUS_ON_DARK)}>
                {t("common:actions.subscribe")}
              </button>
            </form>
            <p className="mt-2 text-xs text-primary-foreground/75">{t("common:footer.noSpam")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
