/**
 * ============================================================================
 * ELITEX TRADING OS
 * Shared PDF Types
 * ============================================================================
 *
 * Shared interfaces used by every PDF report.
 *
 * Report-specific types belong inside their own modules.
 *
 * Examples:
 * - pdf/expense/types.ts
 * - pdf/performance/types.ts
 * - pdf/trades/types.ts
 *
 * ============================================================================
 */

/* ============================================================================
   PDF Metadata
   ============================================================================ */

export interface PdfMetadata {
  generatedAt: Date;
  generatedBy: string;
  reportName: string;
  reportVersion: string;
}

/* ============================================================================
   Page Information
   ============================================================================ */

export interface PdfPageInfo {
  currentPage: number;
  totalPages: number;
}

/* ============================================================================
   Page Margins
   ============================================================================ */

export interface PdfMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/* ============================================================================
   Table Column
   ============================================================================ */

/**
 * Width expressed as a percentage of the printable table width.
 */
export interface PdfTableColumn {
  key: string;
  title: string;
  width: number;
}

/* ============================================================================
   Currency Totals
   ============================================================================ */

export interface PdfCurrencyTotal {
  currency: string;
  amount: number;
}

/* ============================================================================
   Report Sections
   ============================================================================ */

export interface PdfReportSection {
  id: string;
  title: string;
  enabled: boolean;
}