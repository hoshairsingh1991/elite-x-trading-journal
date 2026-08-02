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
 * • Render ExpenseReportDocument
 * • Generate PDF Blob
 * • Trigger browser download
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

import { pdf } from "@react-pdf/renderer";

import { ExpenseReportDocument } from "./components/ExpenseReportDocument";

import { ExpenseReportData } from "./types";

/* ============================================================================
   Generate Expense PDF
   ============================================================================ */

export async function generateExpensePdf(
  report: ExpenseReportData
): Promise<void> {

  const blob = await pdf(

    <ExpenseReportDocument
      report={report}
    />

  ).toBlob();

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