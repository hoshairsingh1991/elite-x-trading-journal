/**
 * ============================================================================
 * ELITEX TRADING OS
 * PDF Document
 * ============================================================================
 *
 * Root PDF document shared across every report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Render PDF document
 * • Render pages
 *
 * Performs NO business logic.
 *
 * ============================================================================
 */

import {
  Document as PdfDocument,
} from "@react-pdf/renderer";

import { ReactNode } from "react";

/* ============================================================================
   Types
   ============================================================================ */

interface DocumentProps {
  children: ReactNode;
}

/* ============================================================================
   Component
   ============================================================================ */

export function Document({
  children,
}: DocumentProps) {

  return (
    <PdfDocument>
      {children}
    </PdfDocument>
  );

}