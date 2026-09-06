import { useState } from "react";
import { MonthlySummaryGraph } from "../components/MonthlySummaryGraph";
import { DistributionGraph } from "../components/DistributionGraph";
import { YearlyOverviewGraph } from "../components/YearlyOverviewGraph";
import { DailyExpenseGraph } from "../components/DailyExpenseGraph";
import { DE_EXPENSE_CATEGORIES } from "../lib/categories";
import { CloseIcon } from "../components/Icons";
import { useApp } from "../lib/AppContext";
import { CURRENCY_SYMBOL, nextCurrency } from "../lib/currency";

type GraphKey = "summary" | "expense" | "pkExpense" | "daily" | "yearly";

const CARDS: { key: GraphKey; title: string; hint: string }[] = [
  { key: "summary", title: "Monthly Summary", hint: "Income · Expense · Savings" },
  { key: "expense", title: "Expense Distribution", hint: "All categories" },
  { key: "pkExpense", title: "PK Expense Distribution", hint: "Everything except DE" },
  { key: "daily", title: "Expenses variation on Days", hint: "Daily expenses by week/month" },
  { key: "yearly", title: "Yearly Overview", hint: "Totals & monthly trend" },
];

export function OverviewScreen() {
  const [open, setOpen] = useState<GraphKey | null>(null);
  const { currency, setCurrency, settings } = useApp();

  return (
    <div className="flex-1 flex flex-col px-5 pb-6">
      <div className="grid grid-cols-2 gap-3 mt-2">
        {CARDS.map((c) => (
          <button
            key={c.key}
            onClick={() => setOpen(c.key)}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-left active:opacity-70 transition-opacity flex flex-col justify-between min-h-[120px]"
          >
            <span className="text-sm font-semibold text-[var(--text)] leading-snug">{c.title}</span>
            <span className="text-[11px] text-[var(--text-muted)] mt-2">{c.hint}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-[var(--app-bg)] flex flex-col">
          <div className="w-full max-w-[480px] mx-auto flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 shrink-0">
              <h2 className="text-base font-semibold text-[var(--text)]">
                {CARDS.find((c) => c.key === open)?.title}
              </h2>
              <div className="flex items-center gap-1">
                {settings.supportedCurrencies.length > 1 && (
                  <button
                    onClick={() => setCurrency(nextCurrency(currency, settings.supportedCurrencies))}
                    className="text-sm text-[var(--text-muted)] font-medium px-2.5 py-1.5 rounded-full active:bg-[var(--surface-2)]"
                    aria-label="Toggle currency"
                  >
                    {CURRENCY_SYMBOL[currency]}
                  </button>
                )}
                <button
                  onClick={() => setOpen(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
                  aria-label="Close"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-8">
              {open === "summary" && <MonthlySummaryGraph />}
              {open === "expense" && <DistributionGraph />}
              {open === "pkExpense" && <DistributionGraph excludeCategories={DE_EXPENSE_CATEGORIES} />}
              {open === "daily" && <DailyExpenseGraph />}
              {open === "yearly" && <YearlyOverviewGraph />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
