export type Currency = "PKR" | "EUR" | "USD" | "SAR" | "CAD" | "AUD" | "GBP";

export type EntryType = "expense" | "income";

// User-editable via Settings > App Settings > Expense Categories, so this
// can't be a fixed literal union — any string the user adds is valid.
export type ExpenseCategory = string;

export type IncomeCategory =
  | "Salary"
  | "Yearly Bonus"
  | "Tax Return"
  | "Health Insurance Return"
  | "Gift"
  | "Others";

export type Category = ExpenseCategory | IncomeCategory;

export interface Entry {
  id: string;
  type: EntryType;
  category: Category;
  amount: number;
  currency: Currency;
  comment: string;
  date: string; // yyyy-MM-dd
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp, used to resolve sync merge conflicts
}

export type ThemeMode = "dark" | "light";

export type Gender = "Male" | "Female";

export interface Settings {
  name: string;
  gender: Gender | null;
  dateOfBirth: string | null;
  theme: ThemeMode;
  supportedCurrencies: Currency[];
  exchangeRates: Record<Currency, number>;
  expenseCategories: string[];
}
