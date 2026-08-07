/**
 * ============================================================================
 * ELITEX TRADING OS
 * PDF Header
 * ============================================================================
 *
 * Reusable report header used across every PDF report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Company branding
 * • Report title
 * • Report subtitle
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

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/* ============================================================================
   Component
   ============================================================================ */

export function Header({
  title,
  subtitle,
}: HeaderProps) {

  return (
    <View style={styles.container}>

     <Text style={styles.brand}>
  ELITE X TRADING
</Text>

      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}

    </View>
  );

}

/* ============================================================================
   Styles
   ============================================================================ */

const styles = StyleSheet.create({

  container: {
    marginBottom: spacing.section,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingBottom: spacing.sectionSmall,
  },

brand: {
  ...typography.small,
  color: colors.text.primary,
  letterSpacing: 1.5,
  marginBottom: spacing.line,
},

  title: {
    ...typography.heading1,
    color: colors.text.primary,
  },

  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 4,
  },

});