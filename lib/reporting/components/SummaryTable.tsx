/**
 * ============================================================================
 * ELITEX TRADING OS
 * Summary Table
 * ============================================================================
 *
 * Generic summary table used throughout PDF reports.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Render label / amount rows
 * • Render optional total row
 * • Perform NO calculations
 *
 * ============================================================================
 */

import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { formatCurrency }
from "@/lib/reporting/shared/formatters";

import { colors }
from "@/lib/reporting/theme/colors";

import { spacing }
from "@/lib/reporting/theme/spacing";

import { typography }
from "@/lib/reporting/theme/typography";

/* ============================================================================
   Types
   ============================================================================ */

export interface SummaryTableRow {
  label: string;

  amount: number;

  currency?: string;
}

interface SummaryTableProps {
  rows: SummaryTableRow[];

  reportingCurrency: string;

  leftHeader: string;

  rightHeader: string;

  totalLabel?: string;
}

/* ============================================================================
   Component
   ============================================================================ */

export function SummaryTable({
  rows,
  reportingCurrency,
  leftHeader,
  rightHeader,
  totalLabel,
}: SummaryTableProps) {

  const total =
    rows.reduce(
      (sum, row) => sum + row.amount,
      0
    );

  return (

    <View>

      <View style={styles.headerRow}>

        <Text style={styles.header}>
          {leftHeader}
        </Text>

        <Text style={styles.header}>
          {rightHeader}
        </Text>

      </View>

      {rows.map((row) => (

        <View
          key={row.label}
          style={styles.row}
        >

          <Text style={styles.label}>
            {row.label}
          </Text>

          <Text style={styles.amount}>
            {formatCurrency(
              row.amount,
              row.currency ??
                reportingCurrency
            )}
          </Text>

        </View>

      ))}

      {totalLabel && (

        <View style={styles.totalRow}>

          <Text style={styles.totalLabel}>
            {totalLabel}
          </Text>

          <Text style={styles.totalAmount}>
            {formatCurrency(
              total,
              reportingCurrency
            )}
          </Text>

        </View>

      )}

    </View>

  );

}

/* ============================================================================
   Styles
   ============================================================================ */

const styles = StyleSheet.create({

headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",

  paddingBottom: spacing.line,
  marginBottom: spacing.line,

  borderBottomWidth: 1,
  borderBottomColor: colors.border.medium,
},

header: {
  ...typography.label,
  color: colors.text.primary,
},

  row: {
    flexDirection: "row",
    justifyContent: "space-between",

    paddingVertical: spacing.line,

    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  label: {
    ...typography.body,
    color: colors.text.primary,
  },

amount: {
  ...typography.body,
  color: colors.text.primary,

  textAlign: "right",
},

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: spacing.sectionSmall,

    paddingTop: spacing.line,

    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
  },

  totalLabel: {
    ...typography.label,
    color: colors.text.primary,
  },

totalAmount: {
  ...typography.label,
  color: colors.text.primary,

  textAlign: "right",
},

});