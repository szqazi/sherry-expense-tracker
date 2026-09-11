import type { Currency } from "./types";

export const ALL_CURRENCIES: Currency[] = ["PKR", "EUR", "USD", "SAR", "CAD", "AUD", "GBP"];

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  PKR: "Rs",
  EUR: "€",
  USD: "$",
  SAR: "SR",
  CAD: "C$",
  AUD: "A$",
  GBP: "£",
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  PKR: "PKR — Pakistani Rupee",
  EUR: "EUR — Euro",
  USD: "USD — US Dollar",
  SAR: "SAR — Saudi Riyal",
  CAD: "CAD — Canadian Dollar",
  AUD: "AUD — Australian Dollar",
  GBP: "GBP — British Pound",
};

// Approximate value of 1 unit of each currency in PKR. User-editable in
// Settings; used as a pivot so any two supported currencies can convert
// through PKR without needing a rate for every possible pair.
export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  PKR: 1,
  EUR: 310,
  USD: 280,
  SAR: 74,
  CAD: 205,
  AUD: 185,
  GBP: 355,
};

export function formatAmount(amount: number, currency: Currency): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = rounded.toLocaleString(undefined, {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL[currency]} ${formatted}`;
}

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number>,
): number {
  if (from === to) return amount;
  const amountInPkr = amount * (rates[from] ?? 1);
  return amountInPkr / (rates[to] ?? 1);
}

export function nextCurrency(current: Currency, supported: Currency[]): Currency {
  if (supported.length === 0) return current;
  const idx = supported.indexOf(current);
  return supported[(idx + 1) % supported.length];
}

// Short axis-tick labels for large amounts (e.g. 60000 -> "60K") so a
// narrow chart y-axis never has to clip full numbers to fit.
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
