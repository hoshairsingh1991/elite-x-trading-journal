/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Information Builder
 * ============================================================================
 *
 * Builds report information displayed at the end of the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Build report information
 * • Perform NO calculations
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import {
  BuildExpenseReportDataInput,
  ExpenseReportInformation,
} from "../types";

/* ============================================================================
   Build Report Information
   ============================================================================ */

export function buildReportInformation(
  expenses: ReportingExpense[],
  input: BuildExpenseReportDataInput
): ExpenseReportInformation {

  return {
    generatedBy: input.generatedBy,

    reportVersion: input.reportVersion,

    reportingCurrency:
      input.reportingCurrency,

    reportingPeriod:
      input.reportingPeriod,

    totalExpenseRecords:
      expenses.length,
  };

}