/**
 * ============================================================================
 * ELITEX TRADING OS
 * Generate Expense PDF
 * ============================================================================
 *
 * Public API for generating Expense Report PDFs.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Build PDF Blob
 * • Download PDF Blob
 * • Generate Expense PDF
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

import { pdf } from "@react-pdf/renderer";

import { ExpenseReportDocument } from "./components/ExpenseReportDocument";

import { ExpenseReportData } from "./types";

/* ============================================================================
   Build PDF Blob
   ============================================================================ */

export async function buildExpensePdfBlob(
  report: ExpenseReportData
): Promise<Blob> {

  return await pdf(

    <ExpenseReportDocument
      report={report}
    />

  ).toBlob();

}

/* ============================================================================
   Download PDF Blob
   ============================================================================ */

export function downloadExpensePdf(
  blob: Blob,
  report: ExpenseReportData
): void {

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `Expense Report - ${report.metadata.reportingPeriod}.pdf`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);

}

/* ============================================================================
   Generate Expense PDF
   ============================================================================ */

export async function generateExpensePdf(
  report: ExpenseReportData
): Promise<void> {

  const blob =
    await buildExpensePdfBlob(
      report
    );

  downloadExpensePdf(
    blob,
    report
  );

}