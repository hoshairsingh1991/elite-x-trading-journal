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
import { FinancialSummaryOverviewPage } from "./FinancialSummaryOverviewPage";
import { FinancialSummaryDetailsPage } from "./FinancialSummaryDetailsPage";
import { paginateRows } from "@/lib/reporting/shared/paginateRows";
import { REPORT_LAYOUT } from "@/lib/reporting/theme/reportLayout";

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

const ledgerPages =
  paginateRows(
    report.rows,
    REPORT_LAYOUT.LEDGER_ROWS_PER_PAGE
  );

const hasFinancialSummaryDetails =
  report.financialSummary.expenseTypeSummary.length > 0 ||
  report.financialSummary.taxSummary.length > 0;

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
{/* EXPENSE LEDGER */}
{/* ========================================================== */}

{ledgerPages.map(
  (
    rows,
    index,
  ) => (

    <Page
      key={`ledger-${index}`}
    >

      <ExpenseLedgerPages
        report={report}
        rows={rows}
      />

    </Page>

  )
)}

      {/* ========================================================== */}
      {/* PAGE 4 */}
      {/* ========================================================== */}

{/* ========================================================== */}
{/* FINANCIAL SUMMARY — OVERVIEW */}
{/* ========================================================== */}

<Page>

  <FinancialSummaryOverviewPage
    report={report}
  />

</Page>

{/* ========================================================== */}
{/* FINANCIAL SUMMARY — DETAILS */}
{/* ========================================================== */}

{hasFinancialSummaryDetails && (

  <Page>

    <FinancialSummaryDetailsPage
      report={report}
    />

  </Page>

)}
    </Document>

  );

}