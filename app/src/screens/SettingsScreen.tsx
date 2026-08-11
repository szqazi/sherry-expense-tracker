import { useState } from "react";
import { useApp } from "../lib/AppContext";
import { exportMonthlyOverviewPdf, exportYearlyOverviewPdf } from "../lib/pdfExport";
import { currentMonthIndex, currentYear, monthLabel } from "../lib/dateUtils";
import { Toast, type ToastState } from "../components/Toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { Gender } from "../lib/types";

const APP_VERSION = "1.0.0";

export function SettingsScreen() {
  const { settings, updateSettings, entries, deleteAllEntries, deletePersonalInfo, currency } = useApp();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [exportYear, setExportYear] = useState(currentYear());
  const [exportMonth, setExportMonth] = useState(currentMonthIndex());
  const [confirmAction, setConfirmAction] = useState<"entries" | "personalInfo" | null>(null);

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
      exportMonthlyOverviewPdf(entries, exportYear, exportMonth, currency, settings.exchangeRateEurToPkr);
      setToast({ kind: "success", message: "Monthly PDF exported." });
    } catch {
      setToast({ kind: "error", message: "Couldn't export PDF. Please try again." });
    }
  }

  function handleExportYearly() {
    try {
      exportYearlyOverviewPdf(entries, exportYear, currency, settings.exchangeRateEurToPkr);
      setToast({ kind: "success", message: "Yearly PDF exported." });
    } catch {
      setToast({ kind: "error", message: "Couldn't export PDF. Please try again." });
    }
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="relative flex flex-col gap-6 pt-1">
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}

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
        <Field label="EUR → PKR exchange rate" hint="Used to combine € and Rs entries in overview totals.">
          <input
            type="number"
            inputMode="decimal"
            value={settings.exchangeRateEurToPkr}
            onChange={(e) => updateSettings({ exchangeRateEurToPkr: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)] text-sm"
          />
        </Field>
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
