/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Disclaimer Builder
 * ============================================================================
 *
 * Builds the standard disclaimer shown at the end of the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Return the canonical report disclaimer.
 *
 * Performs NO calculations.
 *
 * ============================================================================
 */

export function buildDisclaimer(): string[] {

  return [

    "This report has been generated automatically by ELITEX Trading OS.",

    "All amounts are presented in the selected reporting currency unless otherwise noted.",

    "This report is intended for record keeping and informational purposes only.",

    "Users are responsible for verifying all financial records before submitting them to accountants or tax authorities.",

    "Currency conversions are based on the reporting currency selected at the time this report was generated.",

  ];

}