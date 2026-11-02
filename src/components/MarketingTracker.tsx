import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { captureAttribution } from "@/lib/attribution";
import { initPixels, trackPageView } from "@/lib/pixels";

/**
 * Mounted once inside the router: captures ad attribution (utm / click ids / campaign code /
 * referrer) on the first load and on any in-app navigation that carries those params, loads the
 * optional Facebook / TikTok pixels from the online-store settings and fires PageView per route.
 */
export default function MarketingTracker() {
  const location = useLocation();
  const { onlineStore } = useCurrency();
  const first = useRef(true);
  const pixelsReady = useRef(false);

  useEffect(() => {
    captureAttribution({ includeReferrer: first.current });
    first.current = false;
    if (pixelsReady.current) trackPageView();
  }, [location.pathname, location.search]);

  const fbId = onlineStore?.facebookPixelId?.trim() || "";
  const ttId = onlineStore?.tiktokPixelId?.trim() || "";
  useEffect(() => {
    if (!fbId && !ttId) return;
    initPixels({ facebookPixelId: fbId, tiktokPixelId: ttId });
    if (!pixelsReady.current) {
      pixelsReady.current = true;
      trackPageView(); // the page that was open when the settings arrived
    }
  }, [fbId, ttId]);

  return null;
}
