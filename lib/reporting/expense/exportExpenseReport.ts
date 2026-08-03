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
 * • Build PDF Blob
 * • Export PDF
 *
 * ============================================================================
 */

import { buildExpenseReportData } from "./buildExpenseReportData";

import {
  buildExpensePdfBlob,
  downloadExpensePdf,
} from "./generateExpensePdf";

import {
  BuildExpenseReportDataInput,
} from "./types";

/* ============================================================================
   Build Expense Report PDF
   ============================================================================ */

export async function buildExpenseReportPdf(
  input: BuildExpenseReportDataInput
): Promise<Blob> {

  const report =
    buildExpenseReportData(
      input
    );

  return await buildExpensePdfBlob(
    report
  );

}

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

  const blob =
    await buildExpensePdfBlob(
      report
    );

  downloadExpensePdf(
    blob,
    report
  );

}