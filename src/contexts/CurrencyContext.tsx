import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, COMPANY_ID, getImageUrl } from "@/lib/api";

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
