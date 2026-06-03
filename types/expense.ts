export type ExpenseCategory =
  | "SOFTWARE"
  | "DATA"
  | "FUNDED_ACCOUNT"
  | "EDUCATION"
  | "VPS"
  | "NEWS_SERVICE"
  | "OTHER";

export interface Expense {

  id: string;

  userId: string;

  date: string;

  category: ExpenseCategory;

  description: string;

  amount: number;

  currency:
    | "USD"
    | "CAD"
    | "EUR"
    | string;

  createdAt: string;

  updatedAt: string;
}