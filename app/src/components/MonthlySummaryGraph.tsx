import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useApp } from "../lib/AppContext";
import { entriesForMonth, monthlySummary } from "../lib/aggregations";
import { formatAmount } from "../lib/currency";
import { currentMonthIndex, currentYear } from "../lib/dateUtils";
import { MonthPicker } from "./MonthPicker";

export function MonthlySummaryGraph() {
  const { entries, currency, settings } = useApp();
  const [year, setYear] = useState(currentYear());
  const [monthIndex, setMonthIndex] = useState(currentMonthIndex());

  const monthEntries = entriesForMonth(entries, year, monthIndex);
  const summary = monthlySummary(monthEntries, currency, settings.exchangeRates);

  const hasData = summary.income > 0 || summary.expense > 0;
  const data = hasData
    ? [
        { name: "Expenses", value: summary.expensePct || 0.0001 },
        { name: "Savings", value: summary.savingsPct || 0.0001 },
      ]
    : [{ name: "empty", value: 1 }];

  return (
    <div className="flex flex-col items-center px-5">
      <MonthPicker year={year} monthIndex={monthIndex} onChange={(y, m) => { setYear(y); setMonthIndex(m); }} />

      <div className="relative w-[260px] h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={80}
              outerRadius={110}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {hasData ? (
                <>
                  <Cell fill="var(--expense)" />
                  <Cell fill="var(--income)" />
                </>
              ) : (
                <Cell fill="var(--border)" />
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Total Income</span>
          <span className="text-2xl font-semibold text-[var(--text)] mt-1">
            {formatAmount(summary.income, currency)}
          </span>
        </div>
      </div>

      <div className="flex gap-8 mt-6">
        <Legend color="var(--expense)" label="Expenses" value={`${summary.expensePct.toFixed(0)}%`} sub={formatAmount(summary.expense, currency)} />
        <Legend color="var(--income)" label="Savings" value={`${summary.savingsPct.toFixed(0)}%`} sub={formatAmount(summary.savings, currency)} />
      </div>

      {!hasData && (
        <p className="text-sm text-[var(--text-muted)] mt-8">No entries for this month yet.</p>
      )}
    </div>
  );
}

function Legend({ color, label, value, sub }: { color: string; label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      </div>
      <span className="text-lg font-semibold text-[var(--text)] mt-1">{value}</span>
      <span className="text-xs text-[var(--text-muted)]">{sub}</span>
    </div>
  );
}
