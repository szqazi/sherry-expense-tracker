import { useState, type ReactNode } from "react";
import { CURRENCY_SYMBOL, nextCurrency } from "../lib/currency";
import {
  DEFAULT_EXPENSE_CATEGORY,
  DEFAULT_INCOME_CATEGORY,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../lib/categories";
import { todayStr } from "../lib/dateUtils";
import type { Category, Currency, Entry, EntryType } from "../lib/types";

export interface EntryFormValues {
  type: EntryType;
  category: Category;
  amount: number;
  currency: Currency;
  comment: string;
  date: string;
}

interface EntryFormProps {
  initial?: Entry;
  currency: Currency;
  supportedCurrencies: Currency[];
  onCurrencyChange: (c: Currency) => void;
  onSubmit: (values: EntryFormValues) => void;
  onValidationError: (message: string) => void;
  submitLabelPrefix: string;
  extraActions?: ReactNode;
}

export function EntryForm({
  initial,
  currency,
  supportedCurrencies,
  onCurrencyChange,
  onSubmit,
  onValidationError,
  submitLabelPrefix,
  extraActions,
}: EntryFormProps) {
  const [type, setType] = useState<EntryType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? DEFAULT_EXPENSE_CATEGORY,
  );
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [date, setDate] = useState(initial?.date ?? todayStr());

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: EntryType) {
    setType(next);
    if (!initial) {
      setCategory(next === "expense" ? DEFAULT_EXPENSE_CATEGORY : DEFAULT_INCOME_CATEGORY);
    }
  }

  function handleSubmit() {
    const numeric = parseFloat(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      onValidationError("Please enter a valid amount.");
      return;
    }
    if (date > todayStr()) {
      onValidationError("Date can't be in the future.");
      return;
    }
    onSubmit({ type, category, amount: numeric, currency, comment: comment.trim(), date });
  }

  return (
    <div className="relative flex-1 flex flex-col px-5 pb-6">
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
            onClick={() => onCurrencyChange(nextCurrency(currency, supportedCurrencies))}
            className="text-lg text-[var(--text-muted)] font-medium px-2 py-1 rounded-md active:bg-[var(--surface-2)] self-start mt-3 disabled:opacity-60"
            aria-label="Toggle currency"
            disabled={supportedCurrencies.length < 2}
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
        {supportedCurrencies.length > 1 && (
          <span className="text-xs text-[var(--text-muted)] mt-1">
            tap {CURRENCY_SYMBOL[currency]} to switch currency
          </span>
        )}
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

      <div className="mt-auto pt-4 flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          className="w-full rounded-xl py-4 font-semibold text-base text-white active:opacity-80 transition-opacity"
          style={{ background: type === "expense" ? "var(--expense)" : "var(--income)" }}
        >
          {submitLabelPrefix} {type === "expense" ? "Expense" : "Income"}
        </button>
        {extraActions}
      </div>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
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
