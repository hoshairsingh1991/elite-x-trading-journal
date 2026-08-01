/**
 * ============================================================================
 * ELITEX TRADING OS
 * Original Currency Totals Builder
 * ============================================================================
 *
 * Builds totals grouped by the original billed currency.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Group expenses by billed currency
 * • Sum original amounts
 * • Return printable currency totals
 *
 * Performs NO reporting currency conversion.
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import { PdfCurrencyTotal } from "../../shared/types";

/* ============================================================================
   Build Original Currency Totals
   ============================================================================ */

export function buildOriginalCurrencyTotals(
  expenses: ReportingExpense[]
): PdfCurrencyTotal[] {

  const totals =
    new Map<string, number>();

  for (const expense of expenses) {

    const currency =
      expense.billed_currency;

    const amount =
      totals.get(currency) ?? 0;

    totals.set(
      currency,
      amount + expense.original_amount
    );

  }

  return Array.from(
    totals.entries()
  )
    .map(
      ([currency, amount]) => ({
        currency,
        amount,
      })
    )
    .sort(
      (a, b) =>
        a.currency.localeCompare(
          b.currency
        )
    );

}