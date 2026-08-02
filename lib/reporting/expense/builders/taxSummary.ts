/**
 * ============================================================================
 * ELITEX TRADING OS
 * Tax Summary Builder
 * ============================================================================
 *
 * Builds the Tax Summary used on the Financial Summary page.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Group expenses by tax type
 * • Sum tax amounts
 * • Sort alphabetically
 *
 * Performs NO rendering.
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import {
  TaxSummary,
} from "../types";

/* ============================================================================
   Build Tax Summary
   ============================================================================ */

export function buildTaxSummary(
  expenses: ReportingExpense[]
): TaxSummary[] {

  const totals =
    new Map<string, number>();

  for (const expense of expenses) {

    if (
      !expense.tax_type ||
      expense.tax_type.trim() === "" ||
      !expense.tax_amount ||
      expense.tax_amount <= 0
    ) {
      continue;
    }

    const current =
      totals.get(
        expense.tax_type
      ) ?? 0;

    totals.set(
      expense.tax_type,
      current +
      expense.tax_amount
    );

  }

  return Array.from(
    totals.entries()
  )
    .sort(
      ([typeA], [typeB]) =>
        typeA.localeCompare(typeB)
    )
    .map(
      ([taxType, taxAmount]) => ({
        taxType,
        taxAmount,
      })
    );

}