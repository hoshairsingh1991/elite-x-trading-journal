/**
 * ============================================================================
 * ELITEX TRADING OS
 * Report Layout
 * ============================================================================
 *
 * Canonical layout configuration for PDF reports.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Rows per page
 * • Section layout limits
 * • Shared report layout rules
 *
 * ============================================================================
 */

export const REPORT_LAYOUT = {

  /* ==========================================================================
     Expense Ledger
     ========================================================================== */

  LEDGER_ROWS_PER_PAGE: 14,

  /* ==========================================================================
     Financial Summary
     ========================================================================== */

  MONTHLY_SUMMARY_ROWS_PER_PAGE: 12,

  CURRENCY_SUMMARY_ROWS_PER_PAGE: 12,

  EXPENSE_TYPE_ROWS_PER_PAGE: 12,

  TAX_SUMMARY_ROWS_PER_PAGE: 12,

} as const;