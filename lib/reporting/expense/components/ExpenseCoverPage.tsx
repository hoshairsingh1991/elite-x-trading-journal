/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Cover Page
 * ============================================================================
 *
 * First page of the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Render report header
 * • Render report information
 * • Render executive summary
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

import { Header } from "@/lib/reporting/components/Header";

import { colors } from "@/lib/reporting/theme/colors";
import { spacing } from "@/lib/reporting/theme/spacing";
import { typography } from "@/lib/reporting/theme/typography";

import {
  formatCurrency,
  formatDateTime,
} from "@/lib/reporting/shared/formatters";

import { ExpenseReportData } from "../types";

/* ============================================================================
   Types
   ============================================================================ */

interface ExpenseCoverPageProps {
  report: ExpenseReportData;
}

/* ============================================================================
   Component
   ============================================================================ */

export function ExpenseCoverPage({
  report,
}: ExpenseCoverPageProps) {

  const reportingCurrency =
    report.metadata.reportingCurrency;

  return (

    <View>

      <Header
  title={report.metadata.reportName}
/>

      {/* ============================================================= */}
      {/* REPORT INFORMATION */}
      {/* ============================================================= */}

      <Text style={styles.sectionTitle}>
        Report Information
      </Text>

      <View style={styles.infoGrid}>

        <InfoRow
          label="Report Owner"
          value={report.metadata.reportOwner}
        />

        <InfoRow
          label="Generated On"
          value={formatDateTime(
            report.metadata.generatedAt
          )}
        />

        <InfoRow
          label="Reporting Period"
          value={report.metadata.reportingPeriod}
        />

        <InfoRow
          label="Reporting Currency"
          value={report.metadata.reportingCurrency}
        />

      </View>

      {/* ============================================================= */}
      {/* EXECUTIVE SUMMARY */}
      {/* ============================================================= */}

      <Text style={styles.sectionTitle}>
        Executive Summary
      </Text>

      <View style={styles.infoGrid}>

        <InfoRow
          label="Expense Records"
          value={String(report.summary.totalExpenseCount)}
        />

        <InfoRow
          label="Recurring Total"
          value={formatCurrency(
            report.summary.recurringExpenseTotal,
            reportingCurrency
          )}
        />

        <InfoRow
          label="One-Time Total"
          value={formatCurrency(
            report.summary.oneTimeExpenseTotal,
            reportingCurrency
          )}
        />

        <TotalRow
          label="TOTAL EXPENSES"
          value={formatCurrency(
            report.summary.reportingCurrencyTotal,
            reportingCurrency
          )}
        />

      </View>

    </View>

  );

}

/* ============================================================================
   Info Row
   ============================================================================ */

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {

  return (

    <View style={styles.row}>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

    </View>

  );

}

/* ============================================================================
   Total Row
   ============================================================================ */

interface TotalRowProps {
  label: string;
  value: string;
}

function TotalRow({
  label,
  value,
}: TotalRowProps) {

  return (

    <View style={styles.totalRow}>

      <Text style={styles.totalLabel}>
        {label}
      </Text>

      <Text style={styles.totalValue}>
        {value}
      </Text>

    </View>

  );

}

/* ============================================================================
   Styles
   ============================================================================ */

const styles = StyleSheet.create({

  sectionTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    marginTop: spacing.section,
    marginBottom: spacing.sectionSmall,
  },

  infoGrid: {
    marginBottom: spacing.section,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.line,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: spacing.sectionSmall,
    paddingTop: spacing.sectionSmall,
    paddingBottom: spacing.line,

    borderTopWidth: 2,
    borderTopColor: colors.border.dark,
  },

label: {
  ...typography.body,
  color: colors.text.primary,
},

  value: {
    ...typography.body,
    color: colors.text.primary,
  },

  totalLabel: {
    ...typography.body,
    fontWeight: 700,
    color: colors.text.primary,
  },

  totalValue: {
    ...typography.body,
    fontWeight: 700,
    color: colors.text.primary,
  },

});