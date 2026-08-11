export type Currency = "PKR" | "EUR";

export type EntryType = "expense" | "income";

export type ExpenseCategory =
  | "DE"
  | "Car"
  | "Health"
  | "PK Rent"
  | "PK Maids"
  | "PK Bills"
  | "PK Groceries"
  | "PK Others"
  | "Family Support"
  | "DE Air Ticket"
  | "Spende";

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
}

export type ThemeMode = "dark" | "light";

export interface Settings {
  name: string;
  dateOfBirth: string | null;
  theme: ThemeMode;
  defaultCurrency: Currency;
  exchangeRateEurToPkr: number;
}
