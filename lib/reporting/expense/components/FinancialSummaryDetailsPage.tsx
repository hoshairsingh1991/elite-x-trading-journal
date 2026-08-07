/**
 * ============================================================================
 * ELITEX TRADING OS
 * Financial Summary Details Page
 * ============================================================================
 *
 * Second Financial Summary page.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
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

import { ExpenseReportData } from "../types";

/* ============================================================================
   Types
   ============================================================================ */

interface FinancialSummaryDetailsPageProps {
  report: ExpenseReportData;
}

/* ============================================================================
   Component
   ============================================================================ */

export function FinancialSummaryDetailsPage({
  report,
}: FinancialSummaryDetailsPageProps) {

  const reportingCurrency =
    report.metadata.reportingCurrency;

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

  const hasExpenseTypeSummary =
    expenseTypeRows.length > 0;

  const hasTaxSummary =
    taxRows.length > 0;

  return (

    <View>

      {/* ============================================================= */}
      {/* PAGE TITLE */}
      {/* ============================================================= */}

      <Text style={styles.heading}>
        Financial Summary (continued)
      </Text>

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