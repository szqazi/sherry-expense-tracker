import { DEFAULT_EXCHANGE_RATES } from "./currency";
import { DEFAULT_EXPENSE_CATEGORIES } from "./categories";
import { toDateStr } from "./dateUtils";
import type { Entry, Settings, ThemeMode } from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

function monthsAgoOnDay(monthsBack: number, dayOfMonth: number): string {
  const d = new Date();
  d.setDate(1); // avoid month-length rollover when shifting months
  d.setMonth(d.getMonth() - monthsBack);
  d.setDate(Math.min(dayOfMonth, 28));
  return toDateStr(d);
}

function jitter(base: number, spread: number): number {
  return Math.round(base + (Math.random() - 0.5) * 2 * spread);
}

function mkEntry(
  type: Entry["type"],
  category: string,
  amount: number,
  currency: Entry["currency"],
  comment: string,
  date: string,
): Entry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type,
    category,
    amount,
    currency,
    comment,
    date,
    createdAt: now,
    updatedAt: now,
  };
}

// A spread of realistic-looking entries: income + expenses across ~8 months
// (so Yearly Overview has a real trend with a clear best/worst month),
// dense enough in the current week and month that every Overview graph has
// something to show the moment it's opened.
export function generateDemoEntries(): Entry[] {
  const entries: Entry[] = [];

  for (let m = 0; m < 8; m++) {
    entries.push(mkEntry("income", "Salary", jitter(280000, 20000), "PKR", "", monthsAgoOnDay(m, 1)));
    entries.push(mkEntry("expense", "PK Rent", 60000, "PKR", "", monthsAgoOnDay(m, 3)));
    entries.push(mkEntry("expense", "PK Groceries", jitter(15000, 4000), "PKR", "monthly shop", monthsAgoOnDay(m, 6)));
    entries.push(mkEntry("expense", "PK Bills", jitter(9000, 2000), "PKR", "electricity + gas", monthsAgoOnDay(m, 10)));
    entries.push(mkEntry("expense", "Car", jitter(6000, 2000), "PKR", "fuel", monthsAgoOnDay(m, 14)));

    if (m % 2 === 0) {
      entries.push(mkEntry("expense", "PK Maids", 8000, "PKR", "", monthsAgoOnDay(m, 8)));
    }
    if (m === 5) {
      entries.push(mkEntry("income", "Yearly Bonus", 150000, "PKR", "annual bonus", monthsAgoOnDay(m, 15)));
    }
    if (m === 3) {
      entries.push(mkEntry("expense", "DE Air Ticket", 450, "EUR", "flight home", monthsAgoOnDay(m, 20)));
      entries.push(mkEntry("expense", "DE", 120, "EUR", "utilities", monthsAgoOnDay(m, 22)));
    }
    if (m === 1) {
      entries.push(mkEntry("expense", "Family Support", 20000, "PKR", "", monthsAgoOnDay(m, 18)));
      entries.push(mkEntry("expense", "Spende", 5000, "PKR", "donation", monthsAgoOnDay(m, 25)));
    }
    if (m === 0) {
      entries.push(mkEntry("expense", "Health", 7500, "PKR", "checkup", monthsAgoOnDay(m, 12)));
    }
  }

  // Dense recent activity so "this week" / "this month" views (the default
  // for several graphs) aren't empty, and both weekday and weekend bars show.
  entries.push(mkEntry("expense", "PK Groceries", 2200, "PKR", "milk and bread", daysAgo(0)));
  entries.push(mkEntry("expense", "PK Dine Out / Delivery", 1800, "PKR", "dinner out", daysAgo(1)));
  entries.push(mkEntry("expense", "Car", 3500, "PKR", "fuel", daysAgo(2)));
  entries.push(mkEntry("expense", "PK Groceries", 1400, "PKR", "", daysAgo(3)));
  entries.push(mkEntry("expense", "PK Others", 900, "PKR", "", daysAgo(4)));
  entries.push(mkEntry("expense", "PK Dine Out / Delivery", 2600, "PKR", "weekend takeout", daysAgo(5)));
  entries.push(mkEntry("expense", "Health", 1200, "PKR", "pharmacy", daysAgo(6)));

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function generateDemoSettings(theme: ThemeMode): Settings {
  return {
    name: "Demo User",
    gender: null,
    dateOfBirth: null,
    theme,
    supportedCurrencies: ["PKR", "EUR"],
    exchangeRates: DEFAULT_EXCHANGE_RATES,
    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
  };
}
