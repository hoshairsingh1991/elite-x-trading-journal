import type { Expense } from "@/lib/types/expense";

export interface ExpenseAnalyticsData {

  totalExpenses: number;

  recurringExpenses: number;

  taxDeductibleAmount: number;

  nonDeductibleAmount: number;

  deductiblePercent: number;
}


export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface RecurringBreakdownData {
  recurringAmount: number;
  oneTimeAmount: number;
  recurringPercent: number;
  oneTimePercent: number;
}

export interface MonthlyExpenseData {
  month: string;
  amount: number;
}

export interface UpcomingRenewal {
  expenseName: string;
  vendor: string;
  amount: number;

  renewalDate: string;
  daysRemaining: number;
}

// =================================================
// UPCOMING RENEWALS
// =================================================

export function calculateUpcomingRenewals(
  expenses: any[]
): UpcomingRenewal[] {

  return [];
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
// CATEGORY BREAKDOWN
// =================================================

export function calculateCategoryBreakdown(
  expenses: Expense[]
): CategoryBreakdownItem[] {

  const total =
    calculateTotalExpenses(
      expenses
    );

  if (total === 0) {
    return [];
  }

const grouped:
  Record<string, number> = {

    Software: 0,

    "Market Data": 0,

    "Brokerage Fees": 0,

    Education: 0,

    Infrastructure: 0,

    Other: 0,
  };

  expenses.forEach(
    (expense) => {

      const category =
        expense.category ||
        "Other";

      grouped[category] =
        (grouped[category] || 0) +
        expense.original_amount;
    }
  );

  return Object.entries(
    grouped
  )
    .map(
      ([category, amount]) => ({
        category,
        amount,
        percentage:
          (amount / total) * 100,
      })
    )
    .sort(
      (a, b) =>
        b.amount - a.amount
    );
}

// =================================================
// RECURRING BREAKDOWN
// =================================================

export function calculateRecurringBreakdown(
  expenses: Expense[]
): RecurringBreakdownData {

  const recurringAmount =
    expenses
      .filter(
        expense =>
          expense.is_recurring
      )
      .reduce(
        (total, expense) =>
          total +
          expense.original_amount,
        0
      );

  const oneTimeAmount =
    expenses
      .filter(
        expense =>
          !expense.is_recurring
      )
      .reduce(
        (total, expense) =>
          total +
          expense.original_amount,
        0
      );

  const total =
    recurringAmount +
    oneTimeAmount;

  return {
    recurringAmount,

    oneTimeAmount,

    recurringPercent:
      total > 0
        ? (
            recurringAmount /
            total
          ) * 100
        : 0,

    oneTimePercent:
      total > 0
        ? (
            oneTimeAmount /
            total
          ) * 100
        : 0,
  };
}

// =================================================
// WEEKLY EXPENSES
// =================================================

export interface WeeklyExpenseData {
  week: string;
  amount: number;
}

export function calculateWeeklyExpenses(
  expenses: Expense[]
): WeeklyExpenseData[] {

  const grouped:
    Record<string, number> = {};

  expenses.forEach((expense) => {

    const date =
      new Date(
        expense.expense_date +
        "T12:00:00"
      );

    const week =
      Math.ceil(
        date.getDate() / 7
      );

    const key = `W${week}`;

    grouped[key] =
      (grouped[key] || 0) +
      expense.original_amount;
  });

  return [
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
  ].map(
    (week) => ({
      week,
      amount:
        grouped[week] || 0,
    })
  );
}

// =================================================
// MONTHLY EXPENSES
// =================================================

export interface MonthlyExpenseData {
  month: string;
  amount: number;
}

export function calculateMonthlyExpenses(
  expenses: Expense[]
): MonthlyExpenseData[] {

  const grouped:
    Record<string, number> = {};

  expenses.forEach(
    (expense) => {

      const date =
        new Date(
          expense.expense_date +
          "T12:00:00"
        );

      const month =
        date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );

      grouped[month] =
        (grouped[month] || 0) +
        expense.original_amount;
    }
  );

  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map(
    (month) => ({
      month,
      amount:
        grouped[month] || 0,
    })
  );
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