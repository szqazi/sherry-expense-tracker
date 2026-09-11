import { useState } from "react";
import { useApp } from "../lib/AppContext";
import { exportMonthlyOverviewPdf, exportYearlyOverviewPdf } from "../lib/pdfExport";
import { currentMonthIndex, currentYear, monthLabel } from "../lib/dateUtils";
import { ALL_CURRENCIES, CURRENCY_LABEL, CURRENCY_SYMBOL } from "../lib/currency";
import { Toast, type ToastState } from "../components/Toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TrashIcon } from "../components/Icons";
import type { Currency, Gender } from "../lib/types";

const APP_VERSION = "1.0.0";
const APP_SHARE_URL = "https://szqazi.github.io/sherry-expense-tracker/";

export function SettingsScreen() {
  const {
    settings,
    updateSettings,
    entries,
    deleteAllEntries,
    deletePersonalInfo,
    currency,
    syncConfigured,
    user,
    syncState,
    signInWithGoogle,
    signOutOfSync,
  } = useApp();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [exportYear, setExportYear] = useState(currentYear());
  const [exportMonth, setExportMonth] = useState(currentMonthIndex());
  const [confirmAction, setConfirmAction] = useState<"entries" | "personalInfo" | null>(null);
  const [newCategory, setNewCategory] = useState("");

  function handleConfirmDelete() {
    if (confirmAction === "entries") {
      deleteAllEntries();
      setToast({ kind: "success", message: "All data entries deleted." });
    } else if (confirmAction === "personalInfo") {
      deletePersonalInfo();
      setToast({ kind: "success", message: "Personal info deleted." });
    }
    setConfirmAction(null);
  }

  function handleExportMonthly() {
    try {
      exportMonthlyOverviewPdf(entries, exportYear, exportMonth, currency, settings.exchangeRates);
      setToast({ kind: "success", message: "Monthly PDF exported." });
    } catch {
      setToast({ kind: "error", message: "Couldn't export PDF. Please try again." });
    }
  }

  function handleExportYearly() {
    try {
      exportYearlyOverviewPdf(entries, exportYear, currency, settings.exchangeRates);
      setToast({ kind: "success", message: "Yearly PDF exported." });
    } catch {
      setToast({ kind: "error", message: "Couldn't export PDF. Please try again." });
    }
  }

  function handleToggleCurrency(c: Currency) {
    const selected = settings.supportedCurrencies;
    if (selected.includes(c)) {
      if (selected.length === 1) {
        setToast({ kind: "error", message: "At least 1 currency must stay selected." });
        return;
      }
      updateSettings({ supportedCurrencies: selected.filter((x) => x !== c) });
    } else {
      if (selected.length >= 2) {
        setToast({ kind: "error", message: "You can select up to 2 currencies. Deselect one first." });
        return;
      }
      updateSettings({ supportedCurrencies: [...selected, c] });
    }
  }

  function handleRateChange(c: Currency, value: string) {
    const numeric = parseFloat(value);
    updateSettings({ exchangeRates: { ...settings.exchangeRates, [c]: Number.isNaN(numeric) ? 0 : numeric } });
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (settings.expenseCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setToast({ kind: "error", message: "That category already exists." });
      return;
    }
    updateSettings({ expenseCategories: [...settings.expenseCategories, trimmed] });
    setNewCategory("");
  }

  function handleDeleteCategory(c: string) {
    if (settings.expenseCategories.length === 1) {
      setToast({ kind: "error", message: "At least 1 expense category must stay." });
      return;
    }
    updateSettings({ expenseCategories: settings.expenseCategories.filter((x) => x !== c) });
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sherry Expense Tracker", url: APP_SHARE_URL });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(APP_SHARE_URL);
      setToast({ kind: "success", message: "Link copied to clipboard." });
    } catch {
      setToast({ kind: "error", message: "Couldn't copy the link. Please try again." });
    }
  }

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch {
      setToast({ kind: "error", message: "Couldn't start sign-in. Please try again." });
    }
  }

  async function handleSignOut() {
    try {
      await signOutOfSync();
      setToast({ kind: "success", message: "Signed out. Your data stays on this device." });
    } catch {
      setToast({ kind: "error", message: "Couldn't sign out. Please try again." });
    }
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="relative flex flex-col gap-6 pt-1">
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}

      {syncConfigured && (
        <Section title="Account">
          {user ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text)] truncate">{user.email}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {syncState === "syncing" && "Syncing…"}
                    {syncState === "synced" && "Synced"}
                    {syncState === "error" && "Sync error — will retry"}
                  </div>
                </div>
                <span
                  className="w-2 h-2 rounded-full shrink-0 ml-2"
                  style={{
                    background:
                      syncState === "error" ? "var(--danger)" : syncState === "syncing" ? "#fbbf24" : "var(--income)",
                  }}
                />
              </div>
              <button
                onClick={handleSignOut}
                className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium bg-[var(--surface-2)] text-[var(--text)] active:opacity-80"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5">
              <p className="text-sm text-[var(--text)] mb-1">Not synced</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Your data stays on this device only. Sign in to back it up and use it on other devices.
              </p>
              <button
                onClick={handleSignIn}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white active:opacity-80"
                style={{ background: "var(--accent)" }}
              >
                Sign in with Google
              </button>
            </div>
          )}
        </Section>
      )}

      <Section title="Personal Info">
        <Field label="Name">
          <input
            type="text"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            placeholder="Your name"
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)] text-sm"
          />
        </Field>
        <Field label="Gender">
          <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
            <GenderButton
              label="Male"
              active={settings.gender === "Male"}
              onClick={() => updateSettings({ gender: "Male" as Gender })}
            />
            <GenderButton
              label="Female"
              active={settings.gender === "Female"}
              onClick={() => updateSettings({ gender: "Female" as Gender })}
            />
          </div>
        </Field>
        <Field label="Date of Birth">
          <input
            type="date"
            value={settings.dateOfBirth ?? ""}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => updateSettings({ dateOfBirth: e.target.value || null })}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)] text-sm"
          />
        </Field>
      </Section>

      <Section title="Delete">
        <button
          onClick={() => setConfirmAction("entries")}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-medium text-left active:bg-[var(--surface-2)]"
          style={{ color: "var(--danger)" }}
        >
          Delete ALL Data Entries
        </button>
        <button
          onClick={() => setConfirmAction("personalInfo")}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-medium text-left active:bg-[var(--surface-2)]"
          style={{ color: "var(--danger)" }}
        >
          Delete Personal Info
        </button>
      </Section>

      <Section title="App Settings">
        <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5">
          <span className="text-sm text-[var(--text)]">Theme</span>
          <div className="flex bg-[var(--surface-2)] rounded-full p-1">
            <ThemeButton
              label="Dark"
              active={settings.theme === "dark"}
              onClick={() => updateSettings({ theme: "dark" })}
            />
            <ThemeButton
              label="Light"
              active={settings.theme === "light"}
              onClick={() => updateSettings({ theme: "light" })}
            />
          </div>
        </div>
        <Field label="Currencies" hint="Pick up to 2. Entries can use either; Overview and exports convert between them.">
          <div className="flex flex-wrap gap-2">
            {ALL_CURRENCIES.map((c) => {
              const active = settings.supportedCurrencies.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => handleToggleCurrency(c)}
                  className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface)",
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    color: active ? "#fff" : "var(--text-muted)",
                  }}
                >
                  {CURRENCY_SYMBOL[c]} {c}
                </button>
              );
            })}
          </div>
        </Field>
        {settings.supportedCurrencies
          .filter((c) => c !== "PKR")
          .map((c) => (
            <Field key={c} label={`${CURRENCY_LABEL[c]} → PKR rate`} hint={`How many Rs is 1 ${c}. Used to combine currencies in Overview totals and exports.`}>
              <input
                type="number"
                inputMode="decimal"
                value={settings.exchangeRates[c]}
                onChange={(e) => handleRateChange(c, e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)] text-sm"
              />
            </Field>
          ))}
      </Section>

      <Section title="Expense Categories">
        <div className="flex flex-col gap-2">
          {settings.expenseCategories.map((c) => (
            <div
              key={c}
              className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5"
            >
              <span className="text-sm text-[var(--text)]">{c}</span>
              <button
                onClick={() => handleDeleteCategory(c)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
                style={{ color: "var(--danger)" }}
                aria-label={`Delete ${c}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
            placeholder="New category name"
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)] text-sm"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 rounded-xl text-sm font-semibold text-white active:opacity-80"
            style={{ background: "var(--accent)" }}
          >
            Add
          </button>
        </div>
      </Section>

      <Section title="Export Data">
        <div className="flex gap-2">
          <select
            value={exportMonth}
            onChange={(e) => setExportMonth(parseInt(e.target.value, 10))}
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text)] text-sm outline-none"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {monthLabel(exportYear, m)}
              </option>
            ))}
          </select>
          <select
            value={exportYear}
            onChange={(e) => setExportYear(parseInt(e.target.value, 10))}
            className="w-24 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text)] text-sm outline-none"
          >
            {Array.from({ length: 6 }, (_, i) => currentYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExportMonthly}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text)] text-left active:bg-[var(--surface-2)]"
        >
          Export Monthly Overview as PDF
        </button>
        <button
          onClick={handleExportYearly}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-medium text-[var(--text)] text-left active:bg-[var(--surface-2)]"
        >
          Export Yearly Overview as PDF
        </button>
      </Section>

      <Section title="About">
        <InfoRow label="App Version" value={APP_VERSION} />
        <InfoRow label="Developer" value="Sherry" />
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-left active:bg-[var(--surface-2)]"
        >
          <span className="text-sm font-medium text-[var(--text)]">Share App</span>
          <span className="text-xs text-[var(--accent)] truncate ml-3">szqazi.github.io/sherry-expense-tracker</span>
        </button>
      </Section>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction === "entries" ? "Delete all data entries?" : "Delete personal info?"}
          message={
            confirmAction === "entries"
              ? "This permanently deletes every expense and income entry you've recorded. This can't be undone."
              : "This permanently clears your name, gender, and date of birth. This can't be undone."
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2.5">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

function GenderButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

function ThemeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text)]">{value}</span>
    </div>
  );
}
