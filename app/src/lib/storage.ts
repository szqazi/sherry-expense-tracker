import { DEFAULT_EXCHANGE_RATES } from "./currency";
import { DEFAULT_EXPENSE_CATEGORIES, mergeNewDefaultCategories } from "./categories";
import type { Entry, Settings } from "./types";

const ENTRIES_KEY = "sherry-expenses:entries";
const SETTINGS_KEY = "sherry-expenses:settings";
const DEMO_MODE_KEY = "sherry-expenses:demoMode";
const REAL_ENTRIES_BACKUP_KEY = "sherry-expenses:realEntriesBackup";
const REAL_SETTINGS_BACKUP_KEY = "sherry-expenses:realSettingsBackup";
const SEEN_DEFAULT_CATEGORIES_KEY = "sherry-expenses:seenDefaultCategories";

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

// Merges any category added to DEFAULT_EXPENSE_CATEGORIES since this device
// last checked into `settings.expenseCategories`, without reintroducing one
// the user deliberately deleted. See mergeNewDefaultCategories for how "new"
// is decided. Safe to call on any Settings, local or pulled from sync.
export function applyNewDefaultCategories(settings: Settings): Settings {
  let seen: string[] | null = null;
  try {
    const raw = localStorage.getItem(SEEN_DEFAULT_CATEGORIES_KEY);
    seen = raw ? JSON.parse(raw) : null;
  } catch {
    seen = null;
  }
  const result = mergeNewDefaultCategories(settings.expenseCategories, seen);
  localStorage.setItem(SEEN_DEFAULT_CATEGORIES_KEY, JSON.stringify(result.seen));
  return result.categories === settings.expenseCategories ? settings : { ...settings, expenseCategories: result.categories };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return applyNewDefaultCategories({ ...DEFAULT_SETTINGS });
    const parsed = JSON.parse(raw);
    return applyNewDefaultCategories({
      ...DEFAULT_SETTINGS,
      ...parsed,
      exchangeRates: { ...DEFAULT_SETTINGS.exchangeRates, ...parsed.exchangeRates },
    });
  } catch {
    return applyNewDefaultCategories({ ...DEFAULT_SETTINGS });
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
  const settings: Settings = applyNewDefaultCategories(
    rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : { ...DEFAULT_SETTINGS },
  );

  saveEntries(entries);
  saveSettings(settings);
  localStorage.removeItem(REAL_ENTRIES_BACKUP_KEY);
  localStorage.removeItem(REAL_SETTINGS_BACKUP_KEY);
  localStorage.removeItem(DEMO_MODE_KEY);

  return { entries, settings };
}
