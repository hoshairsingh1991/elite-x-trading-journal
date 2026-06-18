import { Expense } from "@/lib/types/expense";

import {
  convertAmount,
} from "./fxConversion";

import {
  FxRates,
  FALLBACK_RATES,
} from "./fxRateProvider";

// =================================================
// CONVERT EXPENSES TO REPORTING CURRENCY
// =================================================

export function convertExpensesToReportingCurrency(
  expenses: Expense[],
  reportingCurrency: string,
  rates: FxRates = FALLBACK_RATES
): Expense[] {

  return expenses.map(
    (expense) => ({

      ...expense,

      original_amount:
        convertAmount(
          expense.original_amount,
          expense.billed_currency,
          reportingCurrency,
          rates
        ),

      billed_currency:
        reportingCurrency,
    })
  );
}