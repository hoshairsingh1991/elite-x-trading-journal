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

import React from "react";

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

interface LedgerColumn {
  id: string;
  label: string;
  flex: number;
  render: (row: ExpenseReportRow) => React.ReactNode;
}

const DEFAULT_LEDGER_COLUMNS: LedgerColumn[] = [
  {
    id: "date",
    label: "Date",
    flex: 1.8,
    render: (row) => formatDate(row.date),
  },
  {
    id: "expenseName",
    label: "Expense",
    flex: 2.2,
    render: (row) => row.expenseName,
  },
  {
    id: "category",
    label: "Category",
    flex: 1.9,
    render: (row) => row.category,
  },
{
  id: "expenseType",
  label: "Expense Type",
  flex: 1.8,
  render: (row) => row.expenseType,
},

  {
    id: "vendor",
    label: "Vendor",
    flex: 2.2,
    render: (row) => row.vendor ?? "-",
  },
  {
    id: "originalAmount",
    label: "Original",
    flex: 1.5,
    render: (row) =>
      formatCurrency(
        row.originalAmount,
        row.originalCurrency
      ),
  },
  {
    id: "reportingAmount",
    label: "Reporting",
    flex: 1.5,
    render: (row) =>
      formatCurrency(
        row.reportingAmount,
        row.reportingCurrency
      ),
  },
  {
    id: "receiptStatus",
    label: "Receipt",
    flex: 1.0,
    render: (row) => row.receiptStatus,
  },
];

/* ============================================================================
   Component
   ============================================================================ */

export function ExpenseLedgerPages({
  report,
}: ExpenseLedgerPagesProps) {

  const columns = DEFAULT_LEDGER_COLUMNS.filter((column) => {

    if (
      column.id === "expenseType" &&
      !report.options.includeExpenseType
    ) {
      return false;
    }

    return true;

  });

  return (

    <View>

      <Text style={styles.heading}>
        Detailed Expense Ledger
      </Text>

     <LedgerHeader
  columns={columns}
/>

      {report.rows.map((row) => (

       <LedgerRow
  key={row.id}
  row={row}
  columns={columns}
/>

      ))}

    </View>

  );

}

/* ============================================================================
   Ledger Header
   ============================================================================ */

function LedgerHeader({
  columns,
}: {
  columns: LedgerColumn[];
}) {

  return (

    <View style={styles.headerRow}>

{columns.map((column) => (

  <Text
    key={column.id}
    style={[
      styles.headerCell,
      { flex: column.flex },
    ]}
  >
    {column.label}
  </Text>

))}

    </View>

  );

}

/* ============================================================================
   Ledger Row
   ============================================================================ */

interface LedgerRowProps {
  row: ExpenseReportRow;
  columns: LedgerColumn[];
}

function LedgerRow({
  row,
  columns,
}: LedgerRowProps) {

  return (

    <View style={styles.dataRow}>

{columns.map((column) => (

  <Text
    key={column.id}
    style={[
      styles.cell,
      { flex: column.flex },
    ]}
  >
    {column.render(row)}
  </Text>

))}

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