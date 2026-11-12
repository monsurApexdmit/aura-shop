import { useTranslation } from "react-i18next";
import { useStoreHours } from "@/hooks/useShippingMethods";
import { localeTag } from "@/i18n";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(localeTag(), { weekday: "short", month: "short", day: "numeric" });
// Short weekday name in the current language (1 Jan 2024 was a Monday).
const dayName = (i: number) => new Date(2024, 0, 1 + i).toLocaleDateString(localeTag(), { weekday: "short" });

/** Slim banner: only renders when the store is closed today or a closure is coming within 7 days. */
export function StoreClosureBanner() {
  const { t } = useTranslation();
  const { data } = useStoreHours();
  if (!data) return null;
  let text = "";
  if (data.closedToday) {
    text = t("home:storeHours.closedToday");
  } else if (data.nextClosure) {
    const days = (new Date(data.nextClosure).getTime() - new Date(data.today).getTime()) / 86400000;
    if (days <= 7) text = t("home:storeHours.closingSoon", { date: fmtDate(data.nextClosure) });
  }
  if (!text) return null;
  return (
    <div className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs text-center py-1.5 px-4" role="status">
      {text}
    </div>
  );
}

/** Footer block: weekly opening hours + next closure. */
export function StoreHoursList() {
  const { t } = useTranslation();
  const { data } = useStoreHours();
  if (!data) return null;
  const rows = DAYS.filter((d) => data.hours[d]);
  if (rows.length === 0 && !data.nextClosure && !data.closedToday) return null;
  return (
    <div className="mt-4 text-sm text-background/50">
      <p className="font-semibold text-background/70 mb-1">{t("home:storeHours.title")}</p>
      {rows.map((d) => {
        const h = data.hours[d];
        return (
          <p key={d} className="flex justify-between gap-4 max-w-[220px]">
            <span className="capitalize">{dayName(DAYS.indexOf(d))}</span>
            <span>{h.isOpen ? `${h.open} - ${h.close}` : t("common:time.closed")}</span>
          </p>
        );
      })}
      {data.closedToday ? (
        <p className="mt-1 text-amber-400">{t("home:storeHours.closedTodayShort")}</p>
      ) : data.nextClosure ? (
        <p className="mt-1">{t("home:storeHours.nextClosure", { date: fmtDate(data.nextClosure) })}</p>
      ) : null}
    </div>
  );
}
