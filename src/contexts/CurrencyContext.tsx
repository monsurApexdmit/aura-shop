import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, COMPANY_ID, getImageUrl } from "@/lib/api";

function hexToHsl(hex: string): string | null {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return null;
  const r = parseInt(m[0], 16) / 255;
  const g = parseInt(m[1], 16) / 255;
  const b = parseInt(m[2], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hexLightness(hex: string): number {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return 50;
  const r = parseInt(m[0], 16) / 255;
  const g = parseInt(m[1], 16) / 255;
  const b = parseInt(m[2], 16) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}


function applyBrandColors(primary: string, accent: string, bg: string) {
  const pH  = hexToHsl(primary)!;
  const aH  = hexToHsl(accent)!;
  const bgH = hexToHsl(bg)!;
  const pLight  = hexLightness(primary);
  const aLight  = hexLightness(accent);
  const bgLight = hexLightness(bg);

  const [bh, bs] = bgH.split(" ");
  const cardL   = bgLight > 50 ? Math.min(bgLight + 4, 100) : Math.max(bgLight - 4, 0);
  const borderL = bgLight > 50 ? Math.max(bgLight - 10, 60)  : Math.min(bgLight + 10, 40);
  const mutedL  = bgLight > 50 ? bgLight - 5 : bgLight + 5;
  const fg      = bgLight > 50 ? "0 0% 8%"   : "0 0% 96%";
  const fgMuted = bgLight > 50 ? "0 0% 45%"  : "0 0% 60%";
  const pFg     = pLight  < 50 ? "0 0% 98%"  : "0 0% 8%";
  const aFg     = aLight  < 50 ? "0 0% 98%"  : "0 0% 8%";

  // Dark mode: invert bg luminance, keep hue/sat, swap primary↔accent roles
  const darkBgL   = 10;
  const darkCardL = 14;

  const css = `
:root {
  --primary: ${pH};
  --primary-foreground: ${pFg};
  --accent: ${aH};
  --accent-foreground: ${aFg};
  --background: ${bgH};
  --foreground: ${fg};
  --card: ${bh} ${bs} ${Math.round(cardL)}%;
  --card-foreground: ${fg};
  --popover: ${bh} ${bs} ${Math.round(cardL)}%;
  --popover-foreground: ${fg};
  --border: ${bh} ${bs} ${Math.round(borderL)}%;
  --input: ${bh} ${bs} ${Math.round(borderL)}%;
  --muted: ${bh} ${bs} ${Math.round(mutedL)}%;
  --muted-foreground: ${fgMuted};
  --ring: ${pH};
  --gradient-primary: linear-gradient(135deg, hsl(${pH}), hsl(${pH} / 0.8));
  --gradient-accent: linear-gradient(135deg, hsl(${aH}), hsl(${aH} / 0.8));
}
.dark {
  --primary: ${aH};
  --primary-foreground: ${aFg};
  --accent: ${pH};
  --accent-foreground: ${pFg};
  --background: ${bh} ${bs} ${darkBgL}%;
  --foreground: 0 0% 92%;
  --card: ${bh} ${bs} ${darkCardL}%;
  --card-foreground: 0 0% 92%;
  --popover: ${bh} ${bs} ${darkCardL}%;
  --popover-foreground: 0 0% 92%;
  --border: ${bh} ${bs} 20%;
  --input: ${bh} ${bs} 20%;
  --muted: ${bh} ${bs} 18%;
  --muted-foreground: 0 0% 55%;
  --ring: ${aH};
  --gradient-primary: linear-gradient(135deg, hsl(${aH}), hsl(${aH} / 0.8));
  --gradient-accent: linear-gradient(135deg, hsl(${pH}), hsl(${pH} / 0.8));
}`;

  let style = document.getElementById("brand-colors") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "brand-colors";
    document.head.appendChild(style);
  }
  style.textContent = css;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", AUD: "A$", CAD: "C$",
  JPY: "¥", CNY: "¥", BRL: "R$", MXN: "$", SGD: "S$", HKD: "HK$",
  SEK: "kr", NOK: "kr", DKK: "kr", CHF: "CHF", NZD: "NZ$",
  AED: "د.إ", SAR: "﷼", KRW: "₩", TRY: "₺", EGP: "£", GHS: "₵",
  BDT: "৳", PKR: "₨",
};

interface CompanySettings {
  currency: string;
  currencySymbolPosition?: "before" | "after";
  currencyDecimalSeparator?: "." | ",";
  currencyThousandsSeparator?: "," | "." | " " | "";
  currencyDecimalPlaces?: 0 | 1 | 2;
  taxRate: number;
  timezone: string;
  storeName?: string;
  paymentMethods?: string[];
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  storeHours?: Record<string, { open: string; close: string; isOpen: boolean }>;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
}

interface CurrencyContextType {
  formatCurrency: (amount: number) => string;
  currencySymbol: string;
  taxRate: number;
  settings: CompanySettings | null;
  storeName: string;
  paymentMethods: string[];
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  storeHours: Record<string, { open: string; close: string; isOpen: boolean }>;
  logoUrl: string | null;
  faviconUrl: string | null;
  bannerUrl: string | null;
}

const CurrencyContext = createContext<CurrencyContextType>({
  formatCurrency: (n) => `$${n.toFixed(2)}`,
  currencySymbol: "$",
  taxRate: 0,
  settings: null,
  storeName: "StoreFront",
  paymentMethods: [],
  storePhone: "",
  storeEmail: "",
  storeAddress: "",
  storeHours: {},
  logoUrl: null,
  faviconUrl: null,
  bannerUrl: null,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/store/settings/company`, { params: { company_id: COMPANY_ID } })
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        const data = {
          ...raw,
          logoUrl:    raw?.logoUrl    ? getImageUrl(raw.logoUrl)    : null,
          bannerUrl:  raw?.bannerUrl  ? getImageUrl(raw.bannerUrl)  : null,
          faviconUrl: raw?.faviconUrl ? getImageUrl(raw.faviconUrl) : null,
        };
        setSettings(data);
        const name = data?.storeName;
        if (name) document.title = name;

        // Inject brand colors as CSS variables (both light + dark)
        if (data?.primaryColor || data?.accentColor || data?.backgroundColor) {
          applyBrandColors(
            data.primaryColor    ?? "#6B1A2A",
            data.accentColor     ?? "#B8963E",
            data.backgroundColor ?? "#F0EBE3",
          );
        }

        const faviconUrl = data?.faviconUrl ?? data?.logoUrl ?? data?.bannerUrl;
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        if (faviconUrl) {
          link.type = "image/png";
          link.href = faviconUrl;
        } else if (name) {
          const initial = name.charAt(0).toUpperCase();
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><text x="32" y="46" font-family="system-ui,sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">${initial}</text></svg>`;
          link.type = "image/svg+xml";
          link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        }
      })
      .catch(() => {});
  }, []);

  const buildFormatter = (s: CompanySettings | null) => (amount: number): string => {
    if (!s) return `$${amount.toFixed(2)}`;
    const decimalPlaces = s.currencyDecimalPlaces ?? 2;
    const decSep = s.currencyDecimalSeparator ?? ".";
    const thouSep = s.currencyThousandsSeparator ?? ",";
    const symbol = CURRENCY_SYMBOLS[s.currency] ?? s.currency;
    const position = s.currencySymbolPosition ?? "before";

    const [intPart, decPart] = amount.toFixed(decimalPlaces).split(".");
    const formattedInt = thouSep
      ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thouSep)
      : intPart;
    const formatted = decimalPlaces > 0 ? `${formattedInt}${decSep}${decPart}` : formattedInt;
    return position === "before" ? `${symbol}${formatted}` : `${formatted}${symbol}`;
  };

  const symbol = settings ? (CURRENCY_SYMBOLS[settings.currency] ?? settings.currency) : "$";

  return (
    <CurrencyContext.Provider
      value={{
        formatCurrency: buildFormatter(settings),
        currencySymbol: symbol,
        taxRate: settings?.taxRate ?? 0,
        settings,
        storeName: settings?.storeName ?? "StoreFront",
        paymentMethods: settings?.paymentMethods ?? [],
        storePhone: settings?.storePhone ?? "",
        storeEmail: settings?.storeEmail ?? "",
        storeAddress: settings?.storeAddress ?? "",
        storeHours: settings?.storeHours ?? {},
        logoUrl: settings?.logoUrl ?? null,
        faviconUrl: settings?.faviconUrl ?? null,
        bannerUrl: settings?.bannerUrl ?? null,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
