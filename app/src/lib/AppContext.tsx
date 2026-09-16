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
import {
  applyNewDefaultCategories,
  enterDemoMode,
  exitDemoMode,
  isDemoMode,
  loadEntries,
  loadSettings,
  saveEntries,
  saveSettings,
} from "./storage";
import { generateDemoEntries, generateDemoSettings } from "./demoData";
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
  demoMode: boolean;
  loadDemoData: () => Promise<void>;
  clearDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [currency, setCurrency] = useState<Currency>(() => loadSettings().supportedCurrencies[0]);
  const [user, setUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(syncConfigured ? "signed-out" : "disabled");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(() => isDemoMode());
  const reconciledForUserId = useRef<string | null>(null);
  const entriesRef = useRef(entries);
  const settingsRef = useRef(settings);
  const demoModeRef = useRef(demoMode);
  entriesRef.current = entries;
  settingsRef.current = settings;
  demoModeRef.current = demoMode;

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
  //
  // demoModeRef is checked (not the `demoMode` state) so this never needs to
  // re-subscribe, and always sees the latest value even though this effect
  // only runs once. This is the hard barrier that keeps a signed-in session
  // from ever reaching `user` while demo mode is active — any session found
  // here gets torn down immediately instead. Without this, a session that
  // becomes active while demo mode is on (e.g. an OAuth redirect completing
  // late) would let reconcile() run against whatever's currently loaded,
  // which could be the demo dataset, and push it straight to the real
  // account.
  useEffect(() => {
    if (!supabase) return;

    function acceptSession(session: { user: User } | null) {
      if (session?.user && demoModeRef.current) {
        supabase!.auth.signOut();
        return;
      }
      setUser(session?.user ?? null);
      if (!session?.user) {
        reconciledForUserId.current = null;
        setSyncState("signed-out");
      }
    }

    supabase.auth.getSession().then(({ data }) => acceptSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      acceptSession(session);
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

      // Demo mode may have started while that pull was in flight — the local
      // entries/settings read below would then be the demo dataset, not the
      // real data this sync is for. Bail out rather than merge and push it.
      if (demoModeRef.current) {
        setSyncState("signed-out");
        return;
      }

      const merged = mergeEntries(entriesRef.current, remoteEntries);
      setEntries(merged);
      await pushEntries(merged, userId);

      if (remoteSettings) {
        setSettings(applyNewDefaultCategories(remoteSettings));
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
    if (!user || demoModeRef.current || reconciledForUserId.current === user.id) return;
    reconciledForUserId.current = user.id;
    reconcile(user.id);
  }, [user, reconcile]);

  // If a push failed while offline (or mid-flight), catch back up once the
  // connection returns rather than waiting for the next sign-in.
  useEffect(() => {
    if (!user) return;
    function handleOnline() {
      if (user && !demoModeRef.current) reconcile(user.id);
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user, reconcile]);

  const addEntry = useCallback(
    (entry: Omit<Entry, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newEntry: Entry = { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      setEntries((prev) => [newEntry, ...prev]);
      if (user && !demoModeRef.current) {
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
      if (user && updated && !demoModeRef.current) {
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
      if (user && !demoModeRef.current) {
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
    if (user && !demoModeRef.current) {
      Promise.all(idsToDelete.map((id) => deleteRemoteEntry(id)))
        .then(() => { setSyncState("synced"); setSyncErrorMessage(null); })
        .catch((err) => { console.error("[sync] push failed", err); setSyncState("error"); setSyncErrorMessage(describeSyncError(err)); });
    }
  }, [user, entries]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (user && !demoModeRef.current) {
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
    if (!supabase || demoMode) return;
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
  }, [demoMode]);

  const signOutOfSync = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const switchGoogleAccount = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const loadDemoData = useCallback(async () => {
    if (user) {
      // Never let demo data touch a real signed-in cloud account.
      await signOutOfSync();
    }
    const demoEntries = generateDemoEntries();
    const demoSettings = generateDemoSettings(settingsRef.current.theme);
    enterDemoMode(entriesRef.current, settingsRef.current, demoEntries, demoSettings);
    setEntries(demoEntries);
    setSettings(demoSettings);
    setDemoMode(true);
  }, [user, signOutOfSync]);

  const clearDemoData = useCallback(() => {
    const restored = exitDemoMode();
    setEntries(restored.entries);
    setSettings(restored.settings);
    setDemoMode(false);
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
      syncConfigured,
      user,
      syncState,
      syncErrorMessage,
      signInWithGoogle,
      signOutOfSync,
      switchGoogleAccount,
      demoMode,
      loadDemoData,
      clearDemoData,
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
      demoMode,
      loadDemoData,
      clearDemoData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
