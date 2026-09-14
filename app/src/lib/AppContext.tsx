import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { Currency, Entry, Settings } from "./types";
import { loadEntries, loadSettings, saveEntries, saveSettings } from "./storage";
import { supabase, syncConfigured } from "./supabase";
import {
  deleteRemoteEntry,
  mergeEntries,
  pullRemoteEntries,
  pullRemoteSettings,
  pushEntries,
  pushEntry,
  pushSettings,
} from "./sync";

export type SyncState = "disabled" | "signed-out" | "syncing" | "synced" | "error";

function describeSyncError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { message?: string; code?: string; details?: string; hint?: string };
    const parts = [e.message, e.code && `code: ${e.code}`, e.details, e.hint].filter(Boolean);
    if (parts.length > 0) return parts.join(" — ");
  }
  return String(err);
}

interface AppContextValue {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, "id" | "createdAt" | "updatedAt">) => void;
  updateEntry: (id: string, patch: Omit<Entry, "id" | "createdAt" | "updatedAt">) => void;
  deleteEntry: (id: string) => void;
  deleteAllEntries: () => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  deletePersonalInfo: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  syncConfigured: boolean;
  user: User | null;
  syncState: SyncState;
  syncErrorMessage: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutOfSync: () => Promise<void>;
  switchGoogleAccount: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [currency, setCurrency] = useState<Currency>(() => loadSettings().supportedCurrencies[0]);
  const [user, setUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(syncConfigured ? "signed-out" : "disabled");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const reconciledForUserId = useRef<string | null>(null);
  const entriesRef = useRef(entries);
  const settingsRef = useRef(settings);
  entriesRef.current = entries;
  settingsRef.current = settings;

  useEffect(() => {
    if (!settings.supportedCurrencies.includes(currency)) {
      setCurrency(settings.supportedCurrencies[0]);
    }
  }, [settings.supportedCurrencies, currency]);

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

  // Auth session bootstrap + subscription. Reconciliation (merging local and
  // remote data) runs once per sign-in, guarded by reconciledForUserId so it
  // doesn't re-run on every unrelated context re-render.
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        reconciledForUserId.current = null;
        setSyncState("signed-out");
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const reconcile = useCallback(async (userId: string) => {
    setSyncState("syncing");
    try {
      const [remoteEntries, remoteSettings] = await Promise.all([
        pullRemoteEntries(userId),
        pullRemoteSettings(userId),
      ]);

      const merged = mergeEntries(entriesRef.current, remoteEntries);
      setEntries(merged);
      await pushEntries(merged, userId);

      if (remoteSettings) {
        setSettings(remoteSettings);
      } else {
        await pushSettings(settingsRef.current, userId);
      }

      setSyncState("synced");
      setSyncErrorMessage(null);
    } catch (err) {
      console.error("[sync] reconcile failed", err);
      setSyncState("error");
      setSyncErrorMessage(describeSyncError(err));
    }
  }, []);

  useEffect(() => {
    if (!user || reconciledForUserId.current === user.id) return;
    reconciledForUserId.current = user.id;
    reconcile(user.id);
  }, [user, reconcile]);

  // If a push failed while offline (or mid-flight), catch back up once the
  // connection returns rather than waiting for the next sign-in.
  useEffect(() => {
    if (!user) return;
    function handleOnline() {
      if (user) reconcile(user.id);
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user, reconcile]);

  const addEntry = useCallback(
    (entry: Omit<Entry, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newEntry: Entry = { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      setEntries((prev) => [newEntry, ...prev]);
      if (user) {
        pushEntry(newEntry, user.id)
          .then(() => { setSyncState("synced"); setSyncErrorMessage(null); })
          .catch((err) => { console.error("[sync] push failed", err); setSyncState("error"); setSyncErrorMessage(describeSyncError(err)); });
      }
    },
    [user],
  );

  const updateEntry = useCallback(
    (id: string, patch: Omit<Entry, "id" | "createdAt" | "updatedAt">) => {
      let updated: Entry | undefined;
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          updated = { ...e, ...patch, updatedAt: new Date().toISOString() };
          return updated;
        }),
      );
      if (user && updated) {
        pushEntry(updated, user.id)
          .then(() => { setSyncState("synced"); setSyncErrorMessage(null); })
          .catch((err) => { console.error("[sync] push failed", err); setSyncState("error"); setSyncErrorMessage(describeSyncError(err)); });
      }
    },
    [user],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (user) {
        deleteRemoteEntry(id)
          .then(() => { setSyncState("synced"); setSyncErrorMessage(null); })
          .catch((err) => { console.error("[sync] push failed", err); setSyncState("error"); setSyncErrorMessage(describeSyncError(err)); });
      }
    },
    [user],
  );

  const deleteAllEntries = useCallback(() => {
    const idsToDelete = entries.map((e) => e.id);
    setEntries([]);
    if (user) {
      Promise.all(idsToDelete.map((id) => deleteRemoteEntry(id)))
        .then(() => { setSyncState("synced"); setSyncErrorMessage(null); })
        .catch((err) => { console.error("[sync] push failed", err); setSyncState("error"); setSyncErrorMessage(describeSyncError(err)); });
    }
  }, [user, entries]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (user) {
          pushSettings(next, user.id)
            .then(() => { setSyncState("synced"); setSyncErrorMessage(null); })
            .catch((err) => { console.error("[sync] push failed", err); setSyncState("error"); setSyncErrorMessage(describeSyncError(err)); });
        }
        return next;
      });
    },
    [user],
  );

  const deletePersonalInfo = useCallback(() => {
    updateSettings({ name: "", gender: null, dateOfBirth: null });
  }, [updateSettings]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    const base = import.meta.env.BASE_URL ?? "/";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + base,
        // Always show Google's account chooser instead of silently
        // reusing whichever Google session is already active in the
        // browser — otherwise there's no way to pick a different account.
        queryParams: { prompt: "select_account" },
      },
    });
  }, []);

  const signOutOfSync = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const switchGoogleAccount = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    await signInWithGoogle();
  }, [signInWithGoogle]);

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
      syncConfigured,
      user,
      syncState,
      syncErrorMessage,
      signInWithGoogle,
      signOutOfSync,
      switchGoogleAccount,
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
      syncErrorMessage,
      user,
      syncState,
      signInWithGoogle,
      signOutOfSync,
      switchGoogleAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
