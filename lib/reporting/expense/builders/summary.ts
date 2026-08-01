/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Summary Builder
 * ============================================================================
 *
 * Builds the Executive Summary for the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Consume canonical analytics
 * • Map analytics into ExpenseReportSummary
 *
 * Performs NO calculations.
 *
 * ============================================================================
 */

import { generateExpenseAnalytics } from "@/lib/analytics/expenseAnalytics";

import { ReportingExpense } from "@/lib/types/expense";

import { ExpenseReportSummary } from "../types";

/* ============================================================================
   Build Summary
   ============================================================================ */

export function buildSummary(
  expenses: ReportingExpense[]
): ExpenseReportSummary {

  const analytics =
    generateExpenseAnalytics(
      expenses
    );

  return {
    totalExpenseCount:
      expenses.length,

    reportingCurrencyTotal:
      analytics.totalExpenses,

    recurringExpenseTotal:
      analytics.recurringExpenses,

    oneTimeExpenseTotal:
      analytics.oneTimeExpenses,

    taxDeductibleTotal:
      analytics.taxDeductibleAmount,

    nonDeductibleTotal:
      analytics.nonDeductibleAmount,
  };

}