/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Category Summary Builder
 * ============================================================================
 *
 * Builds the Category Summary section for the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Consume canonical analytics
 * • Build printable category totals
 *
 * Performs NO calculations.
 *
 * ============================================================================
 */

import {
  calculateCategoryBreakdown,
} from "@/lib/analytics/expenseAnalytics";

import {
  ReportingExpense,
} from "@/lib/types/expense";

import {
  ExpenseCategorySummary,
} from "../types";

/* ============================================================================
   Build Category Summary
   ============================================================================ */

export function buildCategorySummary(
  expenses: ReportingExpense[]
): ExpenseCategorySummary[] {

  const categories =
    calculateCategoryBreakdown(
      expenses
    );

  return categories.map(
    (category) => ({
      category:
        category.category,

      expenseCount:
        category.count,

      reportingTotal:
        category.amount,
    })
  );

}