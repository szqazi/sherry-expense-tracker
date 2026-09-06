import { DEFAULT_EXCHANGE_RATES } from "./currency";
import { DEFAULT_EXPENSE_CATEGORIES } from "./categories";
import type { Entry, Settings } from "./types";

const ENTRIES_KEY = "sherry-expenses:entries";
const SETTINGS_KEY = "sherry-expenses:settings";

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  gender: null,
  dateOfBirth: null,
  theme: "dark",
  supportedCurrencies: ["PKR", "EUR"],
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
};

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      exchangeRates: { ...DEFAULT_SETTINGS.exchangeRates, ...parsed.exchangeRates },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
