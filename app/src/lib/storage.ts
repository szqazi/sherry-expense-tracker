import { DEFAULT_EXCHANGE_RATES } from "./currency";
import { DEFAULT_EXPENSE_CATEGORIES } from "./categories";
import type { Entry, Settings } from "./types";

const ENTRIES_KEY = "sherry-expenses:entries";
const SETTINGS_KEY = "sherry-expenses:settings";
const DEMO_MODE_KEY = "sherry-expenses:demoMode";
const REAL_ENTRIES_BACKUP_KEY = "sherry-expenses:realEntriesBackup";
const REAL_SETTINGS_BACKUP_KEY = "sherry-expenses:realSettingsBackup";

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
    // Entries saved before `updatedAt` existed are missing it — backfill
    // from createdAt so sync (which needs it) never sees a gap.
    return parsed.map((e: Entry) => (e.updatedAt ? e : { ...e, updatedAt: e.createdAt }));
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

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

// Backs up the caller's real data, then swaps the active entries/settings
// slots for the demo dataset. Real data stays untouched in the backup keys
// until exitDemoMode() restores it.
export function enterDemoMode(
  realEntries: Entry[],
  realSettings: Settings,
  demoEntries: Entry[],
  demoSettings: Settings,
): void {
  localStorage.setItem(REAL_ENTRIES_BACKUP_KEY, JSON.stringify(realEntries));
  localStorage.setItem(REAL_SETTINGS_BACKUP_KEY, JSON.stringify(realSettings));
  saveEntries(demoEntries);
  saveSettings(demoSettings);
  localStorage.setItem(DEMO_MODE_KEY, "true");
}

export function exitDemoMode(): { entries: Entry[]; settings: Settings } {
  const rawEntries = localStorage.getItem(REAL_ENTRIES_BACKUP_KEY);
  const rawSettings = localStorage.getItem(REAL_SETTINGS_BACKUP_KEY);
  const entries: Entry[] = rawEntries ? JSON.parse(rawEntries) : [];
  const settings: Settings = rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : { ...DEFAULT_SETTINGS };

  saveEntries(entries);
  saveSettings(settings);
  localStorage.removeItem(REAL_ENTRIES_BACKUP_KEY);
  localStorage.removeItem(REAL_SETTINGS_BACKUP_KEY);
  localStorage.removeItem(DEMO_MODE_KEY);

  return { entries, settings };
}
