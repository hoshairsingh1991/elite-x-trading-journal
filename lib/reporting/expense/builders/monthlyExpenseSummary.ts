/**
 * ============================================================================
 * ELITEX TRADING OS
 * Monthly Expense Summary Builder
 * ============================================================================
 *
 * Builds monthly totals for the Financial Summary.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Group expenses by month
 * • Sum reporting currency totals
 * • Return chronological monthly totals
 *
 * Performs NO rendering.
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import {
  MonthlyExpenseSummary,
} from "../types";

/* ============================================================================
   Build Monthly Expense Summary
   ============================================================================ */

export function buildMonthlyExpenseSummary(
  expenses: ReportingExpense[]
): MonthlyExpenseSummary[] {

  const totals =
    new Map<string, number>();

  for (const expense of expenses) {

    const date =
      new Date(
        expense.expense_date +
        "T12:00:00"
      );

    const month =
      date.toLocaleString(
        "en-US",
        {
          month: "long",
        }
      );

    const current =
      totals.get(month) ?? 0;

    totals.set(
      month,
      current +
      expense.reporting_amount
    );

  }

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

return Array.from(
  totals.entries()
)
  .sort(
    ([monthA], [monthB]) =>
      monthOrder.indexOf(monthA) -
      monthOrder.indexOf(monthB)
  )
  .map(
    ([month, reportingTotal]) => ({
      month,
      reportingTotal,
    })
  );

}