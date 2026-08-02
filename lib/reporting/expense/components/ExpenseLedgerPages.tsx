/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Ledger Pages
 * ============================================================================
 *
 * Renders the detailed expense ledger.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Render printable expense table
 * • Support automatic page continuation
 * • Support optional columns
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
  formatDate,
} from "@/lib/reporting/shared/formatters";

import {
  ExpenseReportData,
  ExpenseReportRow,
} from "../types";

/* ============================================================================
   Types
   ============================================================================ */

interface ExpenseLedgerPagesProps {
  report: ExpenseReportData;
}

/* ============================================================================
   Component
   ============================================================================ */

export function ExpenseLedgerPages({
  report,
}: ExpenseLedgerPagesProps) {

  return (

    <View>

      <Text style={styles.heading}>
        Detailed Expense Ledger
      </Text>

      <LedgerHeader />

      {report.rows.map((row) => (

        <LedgerRow
          key={row.id}
          row={row}
        />

      ))}

    </View>

  );

}

/* ============================================================================
   Ledger Header
   ============================================================================ */

function LedgerHeader() {

  return (

    <View style={styles.headerRow}>

<Text style={[styles.headerCell, { flex: 1.8 }]}>
  Date
</Text>

<Text style={[styles.headerCell, { flex: 2.2 }]}>
  Expense
</Text>

<Text style={[styles.headerCell, { flex: 1.9 }]}>
  Category
</Text>

<Text style={[styles.headerCell, { flex: 2.2 }]}>
  Vendor
</Text>

<Text style={[styles.headerCell, { flex: 1.5 }]}>
  Original
</Text>

<Text style={[styles.headerCell, { flex: 1.5 }]}>
  Reporting
</Text>

<Text style={[styles.headerCell, { flex: 1.0 }]}>
  Receipt
</Text>

    </View>

  );

}

/* ============================================================================
   Ledger Row
   ============================================================================ */

interface LedgerRowProps {
  row: ExpenseReportRow;
}

function LedgerRow({
  row,
}: LedgerRowProps) {

  return (

    <View style={styles.dataRow}>

      <Text style={[styles.cell, { flex: 1.8 }]}>
        {formatDate(row.date)}
      </Text>

      <Text style={[styles.cell, { flex: 2.2 }]}>
        {row.expenseName}
      </Text>

      <Text style={[styles.cell, { flex: 1.9 }]}>
        {row.category}
      </Text>

      <Text style={[styles.cell, { flex: 2.2 }]}>
        {row.vendor ?? "-"}
      </Text>

<Text style={[styles.cell, { flex: 1.5 }]}>
  {formatCurrency(
    row.originalAmount,
    row.originalCurrency
  )}
</Text>

<Text style={[styles.cell, { flex: 1.5 }]}>
  {formatCurrency(
    row.reportingAmount,
    row.reportingCurrency
  )}
</Text>

      <Text style={[styles.cell, { flex: 1.0 }]}>
        {row.receiptStatus}
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
  },

  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
    paddingVertical: spacing.line,
  },

  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: spacing.line,
  },

  headerCell: {
    ...typography.label,
    color: colors.text.primary,
    paddingRight: 6,
  },

  cell: {
    ...typography.body,
    color: colors.text.primary,
    paddingRight: 6,
  },

});