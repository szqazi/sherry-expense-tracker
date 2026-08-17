import { NON_PK_EXPENSE_CATEGORIES, PK_EXPENSE_CATEGORIES } from "./categories";
import { convert } from "./currency";
import type { Currency, Entry } from "./types";

export function amountIn(entry: Entry, display: Currency, rates: Record<Currency, number>): number {
  return convert(entry.amount, entry.currency, display, rates);
}

export function entriesForMonth(entries: Entry[], year: number, monthIndex: number): Entry[] {
  return entries.filter((e) => {
    const d = new Date(e.date + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  });
}

export function entriesForYear(entries: Entry[], year: number): Entry[] {
  return entries.filter((e) => new Date(e.date + "T00:00:00").getFullYear() === year);
}

export interface MonthlySummary {
  income: number;
  expense: number;
  savings: number;
  savingsPct: number;
  expensePct: number;
}

export function monthlySummary(
  monthEntries: Entry[],
  display: Currency,
  rates: Record<Currency, number>,
): MonthlySummary {
  let income = 0;
  let expense = 0;
  for (const e of monthEntries) {
    const amt = amountIn(e, display, rates);
    if (e.type === "income") income += amt;
    else expense += amt;
  }
  const savings = income - expense;
  const expensePct = income > 0 ? Math.min(100, (expense / income) * 100) : expense > 0 ? 100 : 0;
  const savingsPct = income > 0 ? Math.max(0, 100 - expensePct) : 0;
  return { income, expense, savings, savingsPct, expensePct };
}

export interface CategorySlice {
  category: string;
  amount: number;
  pct: number;
}

export function categoryDistribution(
  monthEntries: Entry[],
  display: Currency,
  rates: Record<Currency, number>,
  categoriesFilter: string[],
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const e of monthEntries) {
    if (e.type !== "expense") continue;
    if (!categoriesFilter.includes(e.category)) continue;
    const amt = amountIn(e, display, rates);
    totals.set(e.category, (totals.get(e.category) ?? 0) + amt);
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function expenseDistribution(
  monthEntries: Entry[],
  display: Currency,
  rates: Record<Currency, number>,
) {
  return categoryDistribution(monthEntries, display, rates, NON_PK_EXPENSE_CATEGORIES);
}

export function pkExpenseDistribution(
  monthEntries: Entry[],
  display: Currency,
  rates: Record<Currency, number>,
) {
  return categoryDistribution(monthEntries, display, rates, PK_EXPENSE_CATEGORIES);
}

export interface MonthPoint {
  monthIndex: number;
  income: number;
  expense: number;
  net: number;
}

export interface YearlyOverview {
  months: MonthPoint[];
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  avgMonthlyExpense: number;
  bestMonthIndex: number | null;
  worstMonthIndex: number | null;
}

export function yearlyOverview(
  yearEntries: Entry[],
  display: Currency,
  rates: Record<Currency, number>,
): YearlyOverview {
  const months: MonthPoint[] = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    income: 0,
    expense: 0,
    net: 0,
  }));

  for (const e of yearEntries) {
    const d = new Date(e.date + "T00:00:00");
    const amt = amountIn(e, display, rates);
    const m = months[d.getMonth()];
    if (e.type === "income") m.income += amt;
    else m.expense += amt;
  }
  months.forEach((m) => (m.net = m.income - m.expense));

  const totalIncome = months.reduce((a, m) => a + m.income, 0);
  const totalExpense = months.reduce((a, m) => a + m.expense, 0);
  const totalSavings = totalIncome - totalExpense;
  const activeMonths = months.filter((m) => m.income > 0 || m.expense > 0);
  const avgMonthlyExpense = activeMonths.length > 0 ? totalExpense / activeMonths.length : 0;

  let bestMonthIndex: number | null = null;
  let worstMonthIndex: number | null = null;
  let bestNet = -Infinity;
  let worstNet = Infinity;
  for (const m of activeMonths) {
    if (m.net > bestNet) {
      bestNet = m.net;
      bestMonthIndex = m.monthIndex;
    }
    if (m.net < worstNet) {
      worstNet = m.net;
      worstMonthIndex = m.monthIndex;
    }
  }
  if (activeMonths.length < 2) {
    worstMonthIndex = bestMonthIndex === worstMonthIndex ? null : worstMonthIndex;
  }

  return {
    months,
    totalIncome,
    totalExpense,
    totalSavings,
    avgMonthlyExpense,
    bestMonthIndex,
    worstMonthIndex,
  };
}
