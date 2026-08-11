import { useState } from "react";
import { useApp } from "../lib/AppContext";
import { CURRENCY_SYMBOL } from "../lib/currency";
import {
  DEFAULT_EXPENSE_CATEGORY,
  DEFAULT_INCOME_CATEGORY,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../lib/categories";
import { todayStr } from "../lib/dateUtils";
import type { Category, EntryType } from "../lib/types";
import { Toast, type ToastState } from "../components/Toast";

export function EntryScreen() {
  const { addEntry, currency, setCurrency } = useApp();

  const [type, setType] = useState<EntryType>("expense");
  const [category, setCategory] = useState<Category>(DEFAULT_EXPENSE_CATEGORY);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(todayStr());
  const [toast, setToast] = useState<ToastState | null>(null);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: EntryType) {
    setType(next);
    setCategory(next === "expense" ? DEFAULT_EXPENSE_CATEGORY : DEFAULT_INCOME_CATEGORY);
  }

  function resetForm() {
    setType("expense");
    setCategory(DEFAULT_EXPENSE_CATEGORY);
    setAmount("");
    setComment("");
    setDate(todayStr());
  }

  function handleSave() {
    const numeric = parseFloat(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setToast({ kind: "error", message: "Please enter a valid amount." });
      return;
    }
    if (date > todayStr()) {
      setToast({ kind: "error", message: "Date can't be in the future." });
      return;
    }
    try {
      addEntry({
        type,
        category,
        amount: numeric,
        currency,
        comment: comment.trim(),
        date,
      });
      setToast({
        kind: "success",
        message: `${type === "expense" ? "Expense" : "Income"} saved.`,
      });
      resetForm();
    } catch {
      setToast({ kind: "error", message: "Something went wrong. Please try again." });
    }
  }

  return (
    <div className="relative flex-1 flex flex-col px-5 pb-6">
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}

      {/* Expense / Income toggle */}
      <div className="flex bg-[var(--surface)] rounded-full p-1 mb-6">
        <ToggleButton
          label="Expense"
          active={type === "expense"}
          activeColor="var(--expense)"
          onClick={() => handleTypeChange("expense")}
        />
        <ToggleButton
          label="Income"
          active={type === "income"}
          activeColor="var(--income)"
          onClick={() => handleTypeChange("income")}
        />
      </div>

      {/* Big amount entry */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrency(currency === "PKR" ? "EUR" : "PKR")}
            className="text-lg text-[var(--text-muted)] font-medium px-2 py-1 rounded-md active:bg-[var(--surface-2)] self-start mt-3"
            aria-label="Toggle currency"
          >
            {CURRENCY_SYMBOL[currency]}
          </button>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-[7ch] min-w-[240px] max-w-[75vw] bg-transparent text-center text-6xl font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <span className="text-xs text-[var(--text-muted)] mt-1">tap {CURRENCY_SYMBOL[currency]} to switch currency</span>
      </div>

      {/* Category */}
      <Field label="Category">
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full appearance-none bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text)] outline-none focus:border-[var(--accent)] text-base"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </Field>

      {/* Date */}
      <Field label="Date">
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text)] outline-none focus:border-[var(--accent)] text-base"
        />
      </Field>

      {/* Comments */}
      <Field label="Comment (optional)">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className="w-full resize-none bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)] text-base placeholder:text-[var(--text-muted)]/60"
        />
      </Field>

      <button
        onClick={handleSave}
        className="mt-auto pt-4 w-full rounded-xl py-4 font-semibold text-base text-white active:opacity-80 transition-opacity"
        style={{ background: type === "expense" ? "var(--expense)" : "var(--income)" }}
      >
        Save {type === "expense" ? "Expense" : "Income"}
      </button>
    </div>
  );
}

function ToggleButton({
  label,
  active,
  activeColor,
  onClick,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors"
      style={{
        background: active ? activeColor : "transparent",
        color: active ? "#0b0b0f" : "var(--text-muted)",
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}
