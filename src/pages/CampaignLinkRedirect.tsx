import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { quickOrderApi, safeRelativeTarget } from "@/services/quickOrderApi";
import { parseAttribution, recordCampaignCode, recordTouch } from "@/lib/attribution";
import { useTranslation } from "react-i18next";

/** Merge the incoming query (e.g. fbclid appended by Facebook) into the target, target params win. */
function mergeQuery(target: string, incomingSearch: string): string {
  try {
    const url = new URL(target, window.location.origin);
    const incoming = new URLSearchParams(incomingSearch);
    incoming.forEach((value, key) => {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return target;
  }
}

/** /l/:code — short campaign link: resolve (server records the click), then go to the target keeping utm params. */
export default function CampaignLinkRedirect() {
  const { t } = useTranslation();
  const { code = "" } = useParams<{ code: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const started = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    // one resolve per visit (StrictMode re-runs effects; the click must be recorded once)
    if (started.current) return;
    started.current = true;

    const go = (to: string) => { if (mounted.current) navigate(to, { replace: true }); };

    quickOrderApi
      .resolveLink(code, document.referrer || undefined)
      .then(({ targetUrl, code: resolvedCode }) => {
        const to = mergeQuery(safeRelativeTarget(targetUrl), search);
        try {
          const qs = to.includes("?") ? to.slice(to.indexOf("?")) : "";
          const touch = parseAttribution(qs, document.referrer, `${window.location.origin}${to}`, window.location.host);
          recordTouch({ ...(touch ?? { capturedAt: Date.now() }), campaignCode: touch?.campaignCode ?? resolvedCode });
        } catch {
          recordCampaignCode(resolvedCode);
        }
        go(to);
      })
      .catch(() => go(search ? `/${search}` : "/"));
  }, [code, navigate, search]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground" role="status" aria-live="polite">
      <Spinner className="size-6" />
      <p className="text-sm">{t("pages:campaignLink.opening")}</p>
    </div>
  );
}
