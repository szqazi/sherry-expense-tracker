import jsPDF from "jspdf";
import { entriesForMonth, entriesForYear, monthlySummary, yearlyOverview } from "./aggregations";
import { formatAmount } from "./currency";
import { monthLabel } from "./dateUtils";
import type { Currency, Entry } from "./types";

const MARGIN = 16;

function header(doc: jsPDF, title: string, subtitle: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Sherry Expenses", MARGIN, 20);
  doc.setFontSize(13);
  doc.text(title, MARGIN, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(subtitle, MARGIN, 37);
  doc.setTextColor(20);
  doc.setDrawColor(220);
  doc.line(MARGIN, 42, 210 - MARGIN, 42);
}

function statRow(doc: jsPDF, y: number, label: string, value: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(label, MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text(value, 210 - MARGIN, y, { align: "right" });
}

export function exportMonthlyOverviewPdf(
  entries: Entry[],
  year: number,
  monthIndex: number,
  currency: Currency,
  rate: number,
) {
  const monthEntries = entriesForMonth(entries, year, monthIndex);
  const summary = monthlySummary(monthEntries, currency, rate);

  const doc = new jsPDF();
  header(doc, "Monthly Overview", `${monthLabel(year, monthIndex)} ${year}`);

  let y = 55;
  statRow(doc, y, "Total Income", formatAmount(summary.income, currency));
  y += 9;
  statRow(doc, y, "Total Expenses", formatAmount(summary.expense, currency));
  y += 9;
  statRow(doc, y, "Savings", formatAmount(summary.savings, currency));
  y += 9;
  statRow(doc, y, "Savings %", `${summary.savingsPct.toFixed(1)}%`);
  y += 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text("Entries", MARGIN, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Date", MARGIN, y);
  doc.text("Type", MARGIN + 22, y);
  doc.text("Category", MARGIN + 42, y);
  doc.text("Comment", MARGIN + 90, y);
  doc.text("Amount", 210 - MARGIN, y, { align: "right" });
  y += 4;
  doc.setDrawColor(230);
  doc.line(MARGIN, y, 210 - MARGIN, y);
  y += 5;

  const sorted = [...monthEntries].sort((a, b) => a.date.localeCompare(b.date));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const e of sorted) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(20);
    doc.text(e.date, MARGIN, y);
    doc.setTextColor(e.type === "income" ? 16 : 190, e.type === "income" ? 150 : 60, e.type === "income" ? 90 : 60);
    doc.text(e.type, MARGIN + 22, y);
    doc.setTextColor(20);
    doc.text(e.category, MARGIN + 42, y, { maxWidth: 46 });
    doc.setTextColor(110);
    doc.text(e.comment || "-", MARGIN + 90, y, { maxWidth: 55 });
    doc.setTextColor(20);
    doc.text(formatAmount(e.amount, e.currency), 210 - MARGIN, y, { align: "right" });
    y += 7;
  }

  if (sorted.length === 0) {
    doc.setTextColor(150);
    doc.text("No entries recorded this month.", MARGIN, y);
  }

  doc.save(`sherry-expenses-monthly-${year}-${String(monthIndex + 1).padStart(2, "0")}.pdf`);
}

export function exportYearlyOverviewPdf(entries: Entry[], year: number, currency: Currency, rate: number) {
  const yearEntries = entriesForYear(entries, year);
  const overview = yearlyOverview(yearEntries, currency, rate);

  const doc = new jsPDF();
  header(doc, "Yearly Overview", `${year}`);

  let y = 55;
  statRow(doc, y, "Total Salary", formatAmount(overview.totalIncome, currency));
  y += 9;
  statRow(doc, y, "Total Savings", formatAmount(overview.totalSavings, currency));
  y += 9;
  statRow(doc, y, "Total Expenses", formatAmount(overview.totalExpense, currency));
  y += 9;
  statRow(doc, y, "Average Monthly Expense", formatAmount(overview.avgMonthlyExpense, currency));
  y += 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text("Monthly Breakdown", MARGIN, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Month", MARGIN, y);
  doc.text("Income", MARGIN + 60, y, { align: "right" });
  doc.text("Expense", MARGIN + 100, y, { align: "right" });
  doc.text("Net", 210 - MARGIN, y, { align: "right" });
  y += 4;
  doc.setDrawColor(230);
  doc.line(MARGIN, y, 210 - MARGIN, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  for (const m of overview.months) {
    const label = monthLabel(year, m.monthIndex);
    const tag = m.monthIndex === overview.bestMonthIndex ? " (best)" : m.monthIndex === overview.worstMonthIndex ? " (worst)" : "";
    doc.setTextColor(20);
    doc.text(label + tag, MARGIN, y);
    doc.text(formatAmount(m.income, currency), MARGIN + 60, y, { align: "right" });
    doc.text(formatAmount(m.expense, currency), MARGIN + 100, y, { align: "right" });
    doc.setTextColor(m.net >= 0 ? 16 : 190, m.net >= 0 ? 150 : 60, m.net >= 0 ? 90 : 60);
    doc.text(formatAmount(m.net, currency), 210 - MARGIN, y, { align: "right" });
    y += 8;
  }

  doc.save(`sherry-expenses-yearly-${year}.pdf`);
}
