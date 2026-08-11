import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Currency, Entry, Settings } from "./types";
import { loadEntries, loadSettings, saveEntries, saveSettings } from "./storage";

interface AppContextValue {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, "id" | "createdAt">) => void;
  deleteEntry: (id: string) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [currency, setCurrency] = useState<Currency>(() => loadSettings().defaultCurrency);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const addEntry = useCallback((entry: Omit<Entry, "id" | "createdAt">) => {
    const newEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      entries,
      addEntry,
      deleteEntry,
      settings,
      updateSettings,
      currency,
      setCurrency,
    }),
    [entries, addEntry, deleteEntry, settings, updateSettings, currency],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
