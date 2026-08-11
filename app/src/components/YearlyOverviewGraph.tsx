import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../lib/AppContext";
import { entriesForYear, yearlyOverview } from "../lib/aggregations";
import { formatAmount } from "../lib/currency";
import { currentYear, monthLabel } from "../lib/dateUtils";
import { YearPicker } from "./MonthPicker";

export function YearlyOverviewGraph() {
  const { entries, currency, settings } = useApp();
  const [year, setYear] = useState(currentYear());

  const yearEntries = entriesForYear(entries, year);
  const data = yearlyOverview(yearEntries, currency, settings.exchangeRateEurToPkr);

  const chartData = data.months.map((m) => ({
    name: monthLabel(year, m.monthIndex),
    monthIndex: m.monthIndex,
    Income: Math.round(m.income),
    Expense: Math.round(m.expense),
  }));

  return (
    <div className="flex flex-col px-5">
      <YearPicker year={year} onChange={setYear} />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Salary" value={formatAmount(data.totalIncome, currency)} />
        <StatCard label="Total Savings" value={formatAmount(data.totalSavings, currency)} />
        <StatCard label="Total Expenses" value={formatAmount(data.totalExpense, currency)} />
        <StatCard label="Avg Monthly Expense" value={formatAmount(data.avgMonthlyExpense, currency)} />
      </div>

      <div className="flex items-center gap-4 mb-2 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--accent)" }} /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--text-muted)" }} /> Expense
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--income)" }} /> Best month
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--expense)" }} /> Worst month
        </span>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={(props) => (
                <MonthTick {...props} bestMonthIndex={data.bestMonthIndex} worstMonthIndex={data.worstMonthIndex} chartData={chartData} />
              )}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => formatAmount(Number(value), currency)}
            />
            <Bar dataKey="Income" radius={[3, 3, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.monthIndex} fill={cellFill(entry.monthIndex, data.bestMonthIndex, data.worstMonthIndex, "var(--accent)")} />
              ))}
            </Bar>
            <Bar dataKey="Expense" radius={[3, 3, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.monthIndex} fill={cellFill(entry.monthIndex, data.bestMonthIndex, data.worstMonthIndex, "var(--text-muted)")} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function cellFill(monthIndex: number, best: number | null, worst: number | null, defaultColor: string): string {
  if (monthIndex === best) return "var(--income)";
  if (monthIndex === worst) return "var(--expense)";
  return defaultColor;
}

function MonthTick(props: {
  x?: number | string;
  y?: number | string;
  payload?: { value: string; index: number };
  bestMonthIndex: number | null;
  worstMonthIndex: number | null;
  chartData: { monthIndex: number }[];
}) {
  const { x, y, payload, bestMonthIndex, worstMonthIndex, chartData } = props;
  if (!payload) return <g />;
  const monthIndex = chartData[payload.index]?.monthIndex;
  const isBest = monthIndex === bestMonthIndex;
  const isWorst = monthIndex === worstMonthIndex;
  const color = isBest ? "var(--income)" : isWorst ? "var(--expense)" : "var(--text-muted)";
  return (
    <text x={x} y={Number(y ?? 0) + 12} textAnchor="middle" fontSize={10} fontWeight={isBest || isWorst ? 700 : 400} fill={color}>
      {payload.value}
    </text>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">{label}</div>
      <div className="text-base font-semibold text-[var(--text)]">{value}</div>
    </div>
  );
}
