/**
 * ============================================================================
 * ELITEX TRADING OS
 * Financial Summary Page
 * ============================================================================
 *
 * Final page of the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Render Monthly Expense Summary
 * • Render Original Currency Summary
 * • Render Expense Type Summary
 * • Render Tax Summary
 *
 * Performs NO calculations.
 *
 * ============================================================================
 */

import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  SummaryTable,
} from "@/lib/reporting/components/SummaryTable";

import { colors } from "@/lib/reporting/theme/colors";
import { spacing } from "@/lib/reporting/theme/spacing";
import { typography } from "@/lib/reporting/theme/typography";
import { ReportSection }
from "@/lib/reporting/components/ReportSection";

import { ExpenseReportData } from "../types";

/* ============================================================================
   Types
   ============================================================================ */

interface FinancialSummaryPageProps {
  report: ExpenseReportData;
}

/* ============================================================================
   Component
   ============================================================================ */

export function FinancialSummaryPage({
  report,
}: FinancialSummaryPageProps) {

  const reportingCurrency =
    report.metadata.reportingCurrency;

  const monthlyRows =
    report.financialSummary.monthlySummary.map(
      item => ({
        label: item.month,
        amount: item.reportingTotal,
      })
    );

const originalCurrencyRows =
  report.financialSummary
    .originalCurrencySummary
    .map(
      item => ({
        label: item.currency,
        amount: item.amount,
        currency: item.currency,
      })
    );

const expenseTypeRows =
  report.financialSummary
    .expenseTypeSummary
    .map(
      item => ({
        label: item.expenseType,
        amount: item.reportingTotal,
      })
    );

    const taxRows =
  report.financialSummary
    .taxSummary
    .map(
      item => ({
        label: item.taxType,
        amount: item.taxAmount,
      })
    );

const hasOriginalCurrencySummary =
  originalCurrencyRows.length >
  0;

const hasExpenseTypeSummary =
  report.financialSummary
    .expenseTypeSummary.length > 0;

const hasTaxSummary =
  report.financialSummary
    .taxSummary.length > 0;

  return (

    <View>

      {/* ============================================================= */}
      {/* PAGE TITLE */}
      {/* ============================================================= */}

      <Text style={styles.heading}>
        Financial Summary
      </Text>

      {/* ============================================================= */}
      {/* MONTHLY EXPENSE SUMMARY */}
      {/* ============================================================= */}

<ReportSection>

  <Text style={styles.sectionHeading}>
    Monthly Expense Summary
  </Text>

  <SummaryTable
    leftHeader="Month"
    rightHeader="Total"
    rows={monthlyRows}
    reportingCurrency={
      reportingCurrency
    }
    totalLabel="Total Expenses"
  />

</ReportSection>

{/* ============================================================= */}
{/* ORIGINAL CURRENCY SUMMARY */}
{/* ============================================================= */}

{hasOriginalCurrencySummary && (

  <>

    <Text style={styles.sectionHeading}>
      Original Currency Totals
    </Text>

    <SummaryTable
      leftHeader="Currency"
      rightHeader="Original Amount"
      rows={originalCurrencyRows}
      reportingCurrency={
        reportingCurrency
      }
    />

  </>

)}

      {/* ============================================================= */}
      {/* EXPENSE TYPE SUMMARY */}
      {/* ============================================================= */}

{hasExpenseTypeSummary && (

  <>

    <Text style={styles.sectionHeading}>
      Expense Type Summary
    </Text>

    <SummaryTable
      leftHeader="Expense Type"
      rightHeader="Total"
      rows={expenseTypeRows}
      reportingCurrency={
        reportingCurrency
      }
      totalLabel="Total by Type"
    />

  </>

)}

      {/* ============================================================= */}
      {/* TAX SUMMARY */}
      {/* ============================================================= */}

{hasTaxSummary && (

  <>

    <Text style={styles.sectionHeading}>
      Tax Summary
    </Text>

    <SummaryTable
      leftHeader="Tax Type"
      rightHeader="Tax Amount"
      rows={taxRows}
      reportingCurrency={
        reportingCurrency
      }
      totalLabel="Total Tax"
    />

  </>

)}

    </View>

  );

}

/* ============================================================================
   Styles
   ============================================================================ */

const styles = StyleSheet.create({

  heading: {
    ...typography.heading2,
    color: colors.text.primary,
    marginBottom: spacing.section,
  },

  sectionHeading: {
    ...typography.heading2,
    color: colors.text.primary,
    marginTop: spacing.section,
    marginBottom: spacing.sectionSmall,
  },

});