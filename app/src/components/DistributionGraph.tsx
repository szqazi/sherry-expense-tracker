import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useApp } from "../lib/AppContext";
import { categoryDistribution, entriesForMonth } from "../lib/aggregations";
import { formatAmount } from "../lib/currency";
import { currentMonthIndex, currentYear } from "../lib/dateUtils";
import { MonthPicker } from "./MonthPicker";

const PALETTE = [
  "#7c8cff",
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#c084fc",
  "#60a5fa",
  "#fb923c",
  "#f472b6",
  "#4ade80",
  "#a78bfa",
  "#38bdf8",
];

export function DistributionGraph({ categories }: { categories: string[] }) {
  const { entries, currency, settings } = useApp();
  const [year, setYear] = useState(currentYear());
  const [monthIndex, setMonthIndex] = useState(currentMonthIndex());

  const monthEntries = entriesForMonth(entries, year, monthIndex);
  const slices = categoryDistribution(monthEntries, currency, settings.exchangeRateEurToPkr, categories);
  const total = slices.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="flex flex-col items-center px-5">
      <MonthPicker year={year} monthIndex={monthIndex} onChange={(y, m) => { setYear(y); setMonthIndex(m); }} />

      {slices.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] mt-16">No expenses in this category group for this month.</p>
      ) : (
        <>
          <div className="relative w-[220px] h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={65}
                  outerRadius={100}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Total</span>
              <span className="text-xl font-semibold text-[var(--text)] mt-1">{formatAmount(total, currency)}</span>
            </div>
          </div>

          <div className="w-full mt-6 flex flex-col gap-2.5">
            {slices.map((s, i) => (
              <div key={s.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="text-[var(--text)] truncate">{s.category}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[var(--text-muted)]">{s.pct.toFixed(0)}%</span>
                  <span className="text-[var(--text)] font-medium">{formatAmount(s.amount, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
