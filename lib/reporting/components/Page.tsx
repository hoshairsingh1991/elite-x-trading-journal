/**
 * ============================================================================
 * ELITEX TRADING OS
 * PDF Page
 * ============================================================================
 *
 * Standard page container used across every PDF report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Standard page margins
 * • Shared page layout
 * • Render children
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

import {
  Page as PdfPage,
  StyleSheet,
  View,
} from "@react-pdf/renderer";

import { ReactNode } from "react";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

/* ============================================================================
   Types
   ============================================================================ */

interface PageProps {
  children: ReactNode;
}

/* ============================================================================
   Component
   ============================================================================ */

export function Page({
  children,
}: PageProps) {

  return (
    <PdfPage
      size="A4"
      style={styles.page}
    >
      <View style={styles.content}>
        {children}
      </View>
    </PdfPage>
  );

}

/* ============================================================================
   Styles
   ============================================================================ */

const styles = StyleSheet.create({

  page: {
    backgroundColor:
      colors.background.page,
  },

  content: {
    padding: spacing.pagePadding,
  },

});