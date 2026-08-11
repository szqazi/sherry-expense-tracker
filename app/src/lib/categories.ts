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

// Categories prefixed "PK " are grouped separately for the "PK Expense
// Distribution" overview graph; everything else falls under "Expense
// Distribution".
export const PK_EXPENSE_CATEGORIES: ExpenseCategory[] = EXPENSE_CATEGORIES.filter((c) =>
  c.startsWith("PK "),
);
export const NON_PK_EXPENSE_CATEGORIES: ExpenseCategory[] = EXPENSE_CATEGORIES.filter(
  (c) => !c.startsWith("PK "),
);
