/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Type Summary Builder
 * ============================================================================
 *
 * Builds the Expense Type Summary used on the Financial Summary page.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Group expenses by expense type
 * • Sum reporting currency totals
 * • Sort alphabetically
 *
 * Performs NO rendering.
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import {
  ExpenseTypeSummary,
} from "../types";

/* ============================================================================
   Build Expense Type Summary
   ============================================================================ */

export function buildExpenseTypeSummary(
  expenses: ReportingExpense[]
): ExpenseTypeSummary[] {

  const totals =
    new Map<string, number>();

  for (const expense of expenses) {

if (
  !expense.expense_type ||
  expense.expense_type.trim() === ""
) {
  continue;
}

    const current =
      totals.get(
        expense.expense_type
      ) ?? 0;

    totals.set(
      expense.expense_type,
      current +
      expense.reporting_amount
    );

  }


  return Array.from(
    totals.entries()
  )
    .sort(
      ([typeA], [typeB]) =>
        typeA.localeCompare(typeB)
    )
    .map(
      ([expenseType, reportingTotal]) => ({
        expenseType,
        reportingTotal,
      })
    );

}