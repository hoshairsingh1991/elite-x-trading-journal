/**
 * ============================================================================
 * ELITEX TRADING OS
 * PDF Footer
 * ============================================================================
 *
 * Reusable footer displayed on every report page.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Generated timestamp
 * • Page number
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

/* ============================================================================
   Types
   ============================================================================ */

interface FooterProps {
  generatedAt: Date;
}

/* ============================================================================
   Component
   ============================================================================ */

export function Footer({
  generatedAt,
}: FooterProps) {

  return (
    <View style={styles.container} fixed>

      <Text style={styles.left}>
        Generated {generatedAt.toLocaleString()}
      </Text>

      <Text
        style={styles.right}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />

    </View>
  );

}

/* ============================================================================
   Styles
   ============================================================================ */

const styles = StyleSheet.create({

  container: {
    position: "absolute",
    left: spacing.pagePadding,
    right: spacing.pagePadding,
    bottom: 24,

    flexDirection: "row",
    justifyContent: "space-between",

    borderTopWidth: 1,
    borderTopColor: colors.border.light,

    paddingTop: spacing.sectionSmall,
  },

  left: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  right: {
    ...typography.caption,
    color: colors.text.secondary,
  },

});