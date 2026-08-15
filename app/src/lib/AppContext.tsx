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
  updateEntry: (id: string, patch: Omit<Entry, "id" | "createdAt">) => void;
  deleteEntry: (id: string) => void;
  deleteAllEntries: () => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  deletePersonalInfo: () => void;
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

  const updateEntry = useCallback((id: string, patch: Omit<Entry, "id" | "createdAt">) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteAllEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const deletePersonalInfo = useCallback(() => {
    setSettings((prev) => ({ ...prev, name: "", gender: null, dateOfBirth: null }));
  }, []);

  const value = useMemo(
    () => ({
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      deleteAllEntries,
      settings,
      updateSettings,
      deletePersonalInfo,
      currency,
      setCurrency,
    }),
    [
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      deleteAllEntries,
      settings,
      updateSettings,
      deletePersonalInfo,
      currency,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
