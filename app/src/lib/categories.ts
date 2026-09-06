import type { IncomeCategory } from "./types";

// Seed list used to initialize Settings.expenseCategories on first run.
// Users can add/delete from Settings > App Settings > Expense Categories
// afterwards, so this is a starting point, not a fixed set.
export const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  "PK Groceries",
  "PK Dine Out / Delivery",
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

export const DEFAULT_EXPENSE_CATEGORY = "PK Groceries";
export const DEFAULT_INCOME_CATEGORY: IncomeCategory = "Salary";

// "PK Expense Distribution" excludes Germany-related categories; "Expense
// Distribution" covers every expense category with no exclusions.
export const DE_EXPENSE_CATEGORIES = ["DE", "DE Air Ticket"];
