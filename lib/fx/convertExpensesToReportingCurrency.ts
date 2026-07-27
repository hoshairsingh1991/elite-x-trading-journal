import {
  Expense,
  ReportingExpense,
} from "@/lib/types/expense";

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
): ReportingExpense[] {

  return expenses.map(
    (expense): ReportingExpense => ({

      ...expense,

      reporting_amount:
        convertAmount(
          expense.original_amount,
          expense.billed_currency,
          reportingCurrency,
          rates
        ),

      reporting_currency:
        reportingCurrency,
    })
  );
}