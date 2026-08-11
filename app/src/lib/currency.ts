import type { Currency } from "./types";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  PKR: "Rs",
  EUR: "€",
};

export function formatAmount(amount: number, currency: Currency): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = rounded.toLocaleString(undefined, {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return currency === "PKR" ? `Rs ${formatted}` : `€${formatted}`;
}

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  eurToPkrRate: number,
): number {
  if (from === to) return amount;
  if (from === "EUR" && to === "PKR") return amount * eurToPkrRate;
  if (from === "PKR" && to === "EUR") return amount / eurToPkrRate;
  return amount;
}
