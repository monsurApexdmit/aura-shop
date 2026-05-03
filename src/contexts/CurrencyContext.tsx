import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, COMPANY_ID } from "@/lib/api";

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
}

interface CurrencyContextType {
  formatCurrency: (amount: number) => string;
  currencySymbol: string;
  taxRate: number;
  settings: CompanySettings | null;
}

const CurrencyContext = createContext<CurrencyContextType>({
  formatCurrency: (n) => `$${n.toFixed(2)}`,
  currencySymbol: "$",
  taxRate: 0,
  settings: null,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/store/settings/company`, { params: { company_id: COMPANY_ID } })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setSettings(data);
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
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
