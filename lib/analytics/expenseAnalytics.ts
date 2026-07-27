import type {
  ReportingExpense,
} from "@/lib/types/expense";

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

export interface VendorBreakdownItem {
  vendor: string;
  amount: number;
  percentage: number;
}

// =================================================
// UPCOMING RENEWALS
// =================================================

export function calculateUpcomingRenewals(
  expenses: any[]
): UpcomingRenewal[] {

  const today = new Date();

  const renewals = expenses
    .filter(
      expense =>
        expense.is_recurring &&
        expense.start_date &&
        expense.frequency
    )
    .map(expense => {

      const renewalDate =
        new Date(expense.start_date);

      while (
        renewalDate < today
      ) {

        switch (
          expense.frequency
        ) {

          case "Daily":
  renewalDate.setDate(
    renewalDate.getDate() + 1
  );
  break;

          case "Weekly":
            renewalDate.setDate(
              renewalDate.getDate() + 7
            );
            break;

          case "Monthly":
            renewalDate.setMonth(
              renewalDate.getMonth() + 1
            );
            break;

          case "Quarterly":
            renewalDate.setMonth(
              renewalDate.getMonth() + 3
            );
            break;

          case "Yearly":
            renewalDate.setFullYear(
              renewalDate.getFullYear() + 1
            );
            break;

          default:
            break;
        }
      }

      const daysRemaining =
        Math.ceil(
          (
            renewalDate.getTime() -
            today.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

      return {
        expenseName:
          expense.expense_name,

        vendor:
          expense.vendor,

        amount:
  expense.original_amount,

        renewalDate:
          renewalDate
            .toISOString()
            .split("T")[0],

        daysRemaining,
      };
    })
    .sort(
      (a, b) =>
        a.daysRemaining -
        b.daysRemaining
    );

  return renewals;
}

// =================================================
// TOTAL EXPENSES
// =================================================

export function calculateTotalExpenses(
  expenses: ReportingExpense[]
): number {

  return expenses.reduce(
    (total, expense) =>
      total + expense.reporting_amount,
    0
  );
}


// =================================================
// RECURRING EXPENSES
// =================================================

export function calculateRecurringExpenses(
expenses: ReportingExpense[]
): number {

  return expenses
    .filter(
      expense => expense.is_recurring
    )
    .reduce(
      (total, expense) =>
        total + expense.reporting_amount,
      0
    );
}

// =================================================
// TAX DEDUCTIBLE
// =================================================

export function calculateTaxDeductibleAmount(
expenses: ReportingExpense[]
): number {

  return expenses
    .filter(
      expense => expense.is_tax_deductible
    )
    .reduce(
      (total, expense) =>
        total +
        (
          expense.reporting_amount *
          expense.deductible_percent
        ) / 100,
      0
    );
}

// =================================================
// NON DEDUCTIBLE
// =================================================

export function calculateNonDeductibleAmount(
  expenses: ReportingExpense[]
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
  expenses: ReportingExpense[]
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
expenses: ReportingExpense[]
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
        expense.reporting_amount;
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
// VENDOR BREAKDOWN
// =================================================

export function calculateVendorBreakdown(
  expenses: ReportingExpense[]
): VendorBreakdownItem[] {

  const total =
    calculateTotalExpenses(
      expenses
    );

  if (total === 0) {
    return [];
  }

  const grouped:
    Record<string, number> = {};

  expenses.forEach(
    (expense) => {

      const vendor =
        expense.vendor?.trim() ||
        "Other Vendors";

      grouped[vendor] =
        (grouped[vendor] || 0) +
        expense.reporting_amount;
    }
  );

  return Object.entries(
    grouped
  )
    .map(
      ([vendor, amount]) => ({
        vendor,
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
  expenses: ReportingExpense[]
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
          expense.reporting_amount,
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
          expense.reporting_amount,
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
  expenses: ReportingExpense[]
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
      expense.reporting_amount;
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
  expenses: ReportingExpense[]
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
       expense.reporting_amount;
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
  expenses: ReportingExpense[]
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