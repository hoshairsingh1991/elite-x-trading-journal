/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Document
 * ============================================================================
 *
 * Root document for the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Assemble all report pages
 * • Perform NO business logic
 *
 * ============================================================================
 */

import { Document } from "@/lib/reporting/components/Document";
import { Page } from "@/lib/reporting/components/Page";

import { ExpenseReportData } from "../types";

import { ExpenseCoverPage } from "./ExpenseCoverPage";
import { ExpenseSummaryPage } from "./ExpenseSummaryPage";
import { ExpenseLedgerPages } from "./ExpenseLedgerPages";
import { FinancialSummaryPage } from "./FinancialSummaryPage";

/* ============================================================================
   Types
   ============================================================================ */

interface ExpenseReportDocumentProps {
  report: ExpenseReportData;
}

/* ============================================================================
   Component
   ============================================================================ */

export function ExpenseReportDocument({
  report,
}: ExpenseReportDocumentProps) {

  return (

    <Document>

      {/* ========================================================== */}
      {/* PAGE 1 */}
      {/* ========================================================== */}

      <Page>

        <ExpenseCoverPage
          report={report}
        />

      </Page>

      {/* ========================================================== */}
      {/* PAGE 2 */}
      {/* ========================================================== */}

      <Page>

        <ExpenseSummaryPage
          report={report}
        />

      </Page>

{/* ========================================================== */}
{/* PAGE 3 */}
{/* ========================================================== */}

      <Page>

        <ExpenseLedgerPages
          report={report}
        />

      </Page>

      {/* ========================================================== */}
{/* PAGE 4 */}
{/* ========================================================== */}

<Page>

  <FinancialSummaryPage
    report={report}
  />

</Page>

    </Document>

  );

}