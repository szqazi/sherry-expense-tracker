import type { ExpenseCategory, IncomeCategory } from "./types";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "PK Groceries",
  "PK Rent",
  "PK Maids",
  "PK Bills",
  "PK Others",
  "DE",
  "Car",
  "Health",
  "Family Support",
  "DE Air Ticket",
  "Spende",
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "Salary",
  "Yearly Bonus",
  "Tax Return",
  "Health Insurance Return",
  "Gift",
  "Others",
];

export const DEFAULT_EXPENSE_CATEGORY: ExpenseCategory = "PK Groceries";
export const DEFAULT_INCOME_CATEGORY: IncomeCategory = "Salary";

// "Expense Distribution" covers Germany-related categories; "PK Expense
// Distribution" covers everything else.
export const DE_EXPENSE_CATEGORIES: ExpenseCategory[] = ["DE", "DE Air Ticket"];
export const NON_PK_EXPENSE_CATEGORIES: ExpenseCategory[] = DE_EXPENSE_CATEGORIES;
export const PK_EXPENSE_CATEGORIES: ExpenseCategory[] = EXPENSE_CATEGORIES.filter(
  (c) => !DE_EXPENSE_CATEGORIES.includes(c),
);
