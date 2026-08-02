/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Vendor Summary Builder
 * ============================================================================
 *
 * Builds the Vendor Summary section for the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Group expenses by vendor
 * • Count expense records
 * • Sum reporting currency totals
 *
 * Performs NO formatting.
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import {
  ExpenseVendorSummary,
} from "../types";

/* ============================================================================
   Build Vendor Summary
   ============================================================================ */

export function buildVendorSummary(
  expenses: ReportingExpense[]
): ExpenseVendorSummary[] {

  const grouped = new Map<
    string,
    ExpenseVendorSummary
  >();

  expenses.forEach((expense) => {

    const vendor =
      expense.vendor?.trim() ||
      "Unknown";

    const existing =
      grouped.get(vendor);

    if (existing) {

      existing.expenseCount += 1;

      existing.reportingTotal +=
        expense.reporting_amount;

      return;

    }

    grouped.set(vendor, {

      vendor,

      expenseCount: 1,

      reportingTotal:
        expense.reporting_amount,

    });

  });

  return Array
    .from(grouped.values())
    .sort(
      (a, b) =>
        b.reportingTotal -
        a.reportingTotal
    );

}