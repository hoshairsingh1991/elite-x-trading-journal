/**
 * ============================================================================
 * ELITEX TRADING OS
 * Export Expense Report
 * ============================================================================
 *
 * Public application service for exporting Expense Reports.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Build canonical report data
 * • Generate PDF
 *
 * This is the ONLY public entry point used by the UI.
 *
 * ============================================================================
 */

import { buildExpenseReportData } from "./buildExpenseReportData";
import { generateExpensePdf } from "./generateExpensePdf";

import {
  BuildExpenseReportDataInput,
} from "./types";

/* ============================================================================
   Export Expense Report
   ============================================================================ */

export async function exportExpenseReport(
  input: BuildExpenseReportDataInput
): Promise<void> {

  const report =
    buildExpenseReportData(
      input
    );

  await generateExpensePdf(
    report
  );

}