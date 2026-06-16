import type { Expense } from "@/lib/types/expense";

export interface ExpenseAnalyticsData {
  totalExpenses: number;

  recurringExpenses: number;

  taxDeductibleAmount: number;

  nonDeductibleAmount: number;

  deductiblePercent: number;
}

// =================================================
// TOTAL EXPENSES
// =================================================

export function calculateTotalExpenses(
  expenses: Expense[]
): number {

  return expenses.reduce(
    (total, expense) =>
      total + expense.original_amount,
    0
  );
}

// =================================================
// RECURRING EXPENSES
// =================================================

export function calculateRecurringExpenses(
  expenses: Expense[]
): number {

  return expenses
    .filter(
      expense => expense.is_recurring
    )
    .reduce(
      (total, expense) =>
        total + expense.original_amount,
      0
    );
}

// =================================================
// TAX DEDUCTIBLE
// =================================================

export function calculateTaxDeductibleAmount(
  expenses: Expense[]
): number {

  return expenses
    .filter(
      expense => expense.is_tax_deductible
    )
    .reduce(
      (total, expense) =>
        total +
        (
          expense.original_amount *
          expense.deductible_percent
        ) / 100,
      0
    );
}

// =================================================
// NON DEDUCTIBLE
// =================================================

export function calculateNonDeductibleAmount(
  expenses: Expense[]
): number {

  const total =
    calculateTotalExpenses(
      expenses
    );

  const deductible =
    calculateTaxDeductibleAmount(
      expenses
    );

  return total - deductible;
}

// =================================================
// DEDUCTIBLE %
// =================================================

export function calculateDeductiblePercent(
  expenses: Expense[]
): number {

  const total =
    calculateTotalExpenses(
      expenses
    );

  if (total === 0) {
    return 0;
  }

  const deductible =
    calculateTaxDeductibleAmount(
      expenses
    );

  return (
    deductible /
    total
  ) * 100;
}

// =================================================
// MASTER ANALYTICS
// =================================================

export function generateExpenseAnalytics(
  expenses: Expense[]
): ExpenseAnalyticsData {

  const totalExpenses =
    calculateTotalExpenses(
      expenses
    );

  const recurringExpenses =
    calculateRecurringExpenses(
      expenses
    );

  const taxDeductibleAmount =
    calculateTaxDeductibleAmount(
      expenses
    );

  const nonDeductibleAmount =
    calculateNonDeductibleAmount(
      expenses
    );

  const deductiblePercent =
    calculateDeductiblePercent(
      expenses
    );

  return {
    totalExpenses,

    recurringExpenses,

    taxDeductibleAmount,

    nonDeductibleAmount,

    deductiblePercent,
  };
}