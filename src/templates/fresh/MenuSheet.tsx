import { Link } from "react-router-dom";
import { Heart, LayoutGrid, LogOut, MapPin, Moon, Percent, Sparkles, Sun, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { getImageUrl } from "@/lib/api";
import { useStoreChrome, type NavLink } from "../shared/useStoreChrome";
import { TwoToneName } from "./Brand";
import { FOCUS, categoryIcon, tile } from "./lib";

const ROW = cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground hover:bg-accent", FOCUS);

function LinkGroup({ title, links, onNavigate }: { title: string; links: NavLink[]; onNavigate: () => void }) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={title} className="border-t border-border pt-3">
      <h3 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul>
        {links.map((l) => (
          <li key={`${l.label}-${l.to}`}>
            <Link to={l.to} onClick={onNavigate} className={cn(ROW, "min-h-10")}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Slide-in menu (hamburger): account, categories with icons, deals, help and company links. */
export default function MenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { auth, darkMode, categories } = chrome;
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[86vw] max-w-sm flex-col gap-0 overflow-y-auto p-0">
        <div className="border-b border-border px-4 pb-4 pt-5">
          <SheetTitle className="pr-8">
            <TwoToneName name={chrome.storeName} className="text-xl" />
          </SheetTitle>
          <SheetDescription className="mt-1 text-xs">{chrome.tagline || t("tpl_fresh:shared.tagline")}</SheetDescription>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to={auth.isLoggedIn ? "/account" : "/login"} onClick={close} className={cn("flex h-10 items-center justify-center gap-2 rounded-pill bg-primary text-sm font-semibold text-primary-foreground", FOCUS)}>
              <User className="h-4 w-4" aria-hidden="true" /> {auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn")}
            </Link>
            <Link to="/wishlist" onClick={close} className={cn("flex h-10 items-center justify-center gap-2 rounded-pill border border-border text-sm font-semibold text-foreground", FOCUS)}>
              <Heart className="h-4 w-4" aria-hidden="true" /> {t("common:nav.wishlist")}
            </Link>
          </div>
        </div>

        <div className="flex-1 space-y-3 px-2 py-3">
          <ul>
            <li>
              <Link to="/deals" onClick={close} className={cn(ROW, "font-semibold text-highlight")}>
                <Percent className="h-4 w-4" aria-hidden="true" /> {t("tpl_fresh:shared.weeklyDeals")}
              </Link>
            </li>
            <li>
              <Link to="/shop" onClick={close} className={ROW}>
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> {t("tpl_fresh:shared.newArrivals")}
              </Link>
            </li>
            <li>
              <Link to="/categories" onClick={close} className={ROW}>
                <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" /> {t("common:nav.allCategories")}
              </Link>
            </li>
            <li>
              <Link to="/track-order" onClick={close} className={ROW}>
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> {t("common:nav.trackOrder")}
              </Link>
            </li>
          </ul>

          {categories.length > 0 && (
            <nav aria-label={t("common:nav.categories")} className="border-t border-border pt-3">
              <h3 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("common:nav.categories")}</h3>
              <ul>
                {categories.map((c, i) => {
                  const Icon = categoryIcon(c.name);
                  return (
                    <li key={c.id}>
                      <Link to={`/shop?cat=${c.slug}`} onClick={close} className={ROW}>
                        <span className={cn("flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-ink", tile(i))} aria-hidden="true">
                          {c.image ? <img src={getImageUrl(c.image)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}
                        </span>
                        <span className="truncate">{c.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <LinkGroup title={t("tpl_fresh:shared.customerCare")} links={chrome.helpLinks} onNavigate={close} />
          <LinkGroup title={t("tpl_fresh:shared.company")} links={chrome.utilityLinks.filter((l) => l.to !== "/contact")} onNavigate={close} />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border p-3">
          <button type="button" onClick={darkMode.toggle} className={cn(ROW, "flex-1 border border-border")}>
            {darkMode.isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            {darkMode.isDark ? t("common:theme.light") : t("common:theme.dark")}
          </button>
          <LanguageSwitcher
            variant="full"
            align="start"
            contentClassName="z-[60]"
            className={cn(ROW, "h-auto rounded-lg border border-border px-3 hover:bg-accent")}
          />
          {auth.isLoggedIn && (
            <button type="button" onClick={() => { auth.logout(); close(); }} className={cn(ROW, "border border-border")}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> {t("common:nav.signOut")}
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
