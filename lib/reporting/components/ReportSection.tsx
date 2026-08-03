/**
 * ============================================================================
 * ELITEX TRADING OS
 * Report Section
 * ============================================================================
 *
 * Generic report section wrapper.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Keep a report section together
 * • Prevent section splitting across pages
 * • Render children
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

import {
  View,
} from "@react-pdf/renderer";

import { ReactNode } from "react";

/* ============================================================================
   Types
   ============================================================================ */

interface ReportSectionProps {
  children: ReactNode;
}

/* ============================================================================
   Component
   ============================================================================ */

export function ReportSection({
  children,
}: ReportSectionProps) {

  return (

    <View
      wrap={false}
    >
      {children}
    </View>

  );

}