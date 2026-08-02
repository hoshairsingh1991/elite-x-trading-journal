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
  report.financialSummary.originalCurrencySummary.map(
    item => ({
      label: item.currency,
      amount: item.amount,
      currency: item.currency,
    })
  );

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

      {/* ============================================================= */}
      {/* ORIGINAL CURRENCY SUMMARY */}
      {/* ============================================================= */}

<Text style={styles.sectionHeading}>
  Original Currency Summary
</Text>

<SummaryTable
  leftHeader="Currency"
  rightHeader="Original Amount"
  rows={originalCurrencyRows}
  reportingCurrency={
    reportingCurrency
  }
/>

      {/* ============================================================= */}
      {/* EXPENSE TYPE SUMMARY */}
      {/* ============================================================= */}

      <Text style={styles.sectionHeading}>
        Expense Type Summary
      </Text>

      {/* Expense Type Summary Table */}

      {/* ============================================================= */}
      {/* TAX SUMMARY */}
      {/* ============================================================= */}

      <Text style={styles.sectionHeading}>
        Tax Summary
      </Text>

      {/* Tax Summary Table */}

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