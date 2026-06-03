import {
  Expense,
} from "@/types/expense";

export interface ExpenseAnalyticsData {

  totalExpenses: number;
}

// =================================================
// TOTAL EXPENSES
// =================================================

export function calculateTotalExpenses(
  expenses: Expense[]
): number {

  return expenses.reduce(
    (
      total,
      expense
    ) =>
      total + expense.amount,
    0
  );
}

// =================================================
// MASTER EXPENSE ANALYTICS
// =================================================

export function generateExpenseAnalytics(
  expenses: Expense[]
): ExpenseAnalyticsData {

  const totalExpenses =
    calculateTotalExpenses(
      expenses
    );

  return {

    totalExpenses,
  };
}