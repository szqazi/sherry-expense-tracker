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
  "Clothing",
  "Educational",
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

// The category list that shipped before Clothing and Educational were
// added. Used once, as the historical baseline for mergeNewDefaultCategories
// on a device that has no snapshot yet, so existing users get genuinely new
// categories merged in without reintroducing any of these they'd already
// deleted on purpose.
const ORIGINAL_DEFAULT_CATEGORIES: string[] = [
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

// Merges any category that's new to DEFAULT_EXPENSE_CATEGORIES since `seen`
// (the snapshot of defaults last merged on this device, or the historical
// baseline above if this is the first run) into `categories`. A category the
// user deliberately deleted is never re-added, since it was already present
// in `seen` the first time it went missing — only ones that didn't exist in
// `seen` at all count as new. Returns the updated snapshot to persist as the
// new `seen` alongside the merged categories.
export function mergeNewDefaultCategories(
  categories: string[],
  seen: string[] | null,
): { categories: string[]; seen: string[] } {
  const baseline = seen ?? ORIGINAL_DEFAULT_CATEGORIES;
  const newOnes = DEFAULT_EXPENSE_CATEGORIES.filter((c) => !baseline.includes(c) && !categories.includes(c));
  return {
    categories: newOnes.length > 0 ? [...categories, ...newOnes] : categories,
    seen: DEFAULT_EXPENSE_CATEGORIES,
  };
}

// "PK Expense Distribution" excludes Germany-related categories; "Expense
// Distribution" covers every expense category with no exclusions.
export const DE_EXPENSE_CATEGORIES = ["DE", "DE Air Ticket"];
