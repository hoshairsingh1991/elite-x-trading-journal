/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Summary Page
 * ============================================================================
 *
 * Second page of the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Render Category Summary
 * • Render Vendor Summary
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

import { colors } from "@/lib/reporting/theme/colors";
import { spacing } from "@/lib/reporting/theme/spacing";
import { typography } from "@/lib/reporting/theme/typography";

import {
  formatCurrency,
} from "@/lib/reporting/shared/formatters";

import { ExpenseReportData } from "../types";

/* ============================================================================
   Types
   ============================================================================ */

interface ExpenseSummaryPageProps {
  report: ExpenseReportData;
}

/* ============================================================================
   Component
   ============================================================================ */

export function ExpenseSummaryPage({
  report,
}: ExpenseSummaryPageProps) {

    const reportingCurrency =
  report.metadata.reportingCurrency;

  return (

    <View>

      {/* ============================================================= */}
      {/* CATEGORY SUMMARY */}
      {/* ============================================================= */}

      <Text style={styles.heading}>
        Expense Breakdown by Category
      </Text>

      <SummaryHeader
        itemTitle="Category"
      />

      {report.categorySummary.map((item) => (

<SummaryRow
  key={item.category}
  item={item.category}
  records={item.expenseCount}
  total={item.reportingTotal}
  reportingCurrency={reportingCurrency}
/>

      ))}

      {/* ============================================================= */}
      {/* VENDOR SUMMARY */}
      {/* ============================================================= */}

      <Text style={styles.heading}>
        Expense Breakdown by Vendor
      </Text>

      <SummaryHeader
        itemTitle="Vendor"
      />

      {report.vendorSummary.map((item) => (

<SummaryRow
  key={item.vendor}
  item={item.vendor}
  records={item.expenseCount}
  total={item.reportingTotal}
  reportingCurrency={reportingCurrency}
/>

))}

    </View>

  );

}

/* ============================================================================
   Summary Header
   ============================================================================ */

interface SummaryHeaderProps {
  itemTitle: string;
}

function SummaryHeader({
  itemTitle,
}: SummaryHeaderProps) {

  return (

    <View style={styles.headerRow}>

      <Text style={styles.headerItem}>
        {itemTitle}
      </Text>

      <Text style={styles.headerCount}>
        Records
      </Text>

      <Text style={styles.headerTotal}>
        Total
      </Text>

    </View>

  );

}

/* ============================================================================
   Summary Row
   ============================================================================ */

interface SummaryRowProps {
  item: string;
  records: number;
  total: number;
  reportingCurrency: string;
}

function SummaryRow({
  item,
  records,
  total,
  reportingCurrency,
}: SummaryRowProps) {

  return (

    <View style={styles.row}>

      <Text style={styles.item}>
        {item}
      </Text>

      <Text style={styles.count}>
        {records}
      </Text>

<Text style={styles.total}>
  {formatCurrency(
    total,
    reportingCurrency
  )}
</Text>

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
    marginBottom: spacing.sectionSmall,
    marginTop: spacing.section,
  },

  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
    paddingBottom: spacing.line,
    marginBottom: spacing.line,
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: spacing.line,
  },

  headerItem: {
    ...typography.label,
    flex: 3,
  },

  headerCount: {
    ...typography.label,
    flex: 1,
    textAlign: "center",
  },

  headerTotal: {
    ...typography.label,
    flex: 2,
    textAlign: "right",
  },

  item: {
    ...typography.body,
    flex: 3,
  },

  count: {
    ...typography.body,
    flex: 1,
    textAlign: "center",
  },

  total: {
    ...typography.body,
    flex: 2,
    textAlign: "right",
  },

});