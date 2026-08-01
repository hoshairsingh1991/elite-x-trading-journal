/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Metadata Builder
 * ============================================================================
 *
 * Builds the canonical metadata for the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Build report metadata
 *
 * This builder performs no validation, calculations, or formatting.
 *
 * ============================================================================
 */

import {
  BuildExpenseReportDataInput,
  ExpenseReportMetadata,
} from "../types";

/* ============================================================================
   Build Metadata
   ============================================================================ */

export function buildMetadata(
  input: BuildExpenseReportDataInput
): ExpenseReportMetadata {

  const generatedAt = new Date();

  return {
    reportName: "Business Expense Report",

    reportVersion: input.reportVersion,

    generatedAt,

    generatedBy: input.generatedBy,

    reportingCurrency: input.reportingCurrency,

    reportingPeriod: input.reportingPeriod,
  };

}