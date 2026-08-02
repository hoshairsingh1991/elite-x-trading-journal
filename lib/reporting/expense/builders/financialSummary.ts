import {
  ExpenseFinancialSummary,
  ExpenseReportOptions,
} from "../types";

import { ReportingExpense } from "@/lib/types/expense";

import { buildOriginalCurrencyTotals }
from "./originalCurrencyTotals";

import { buildMonthlyExpenseSummary }
from "./monthlyExpenseSummary";

export function buildFinancialSummary(
  expenses: ReportingExpense[],
  options: ExpenseReportOptions
): ExpenseFinancialSummary {

return {

  monthlySummary:
    buildMonthlyExpenseSummary(
      expenses
    ),

  originalCurrencySummary:
    buildOriginalCurrencyTotals(
      expenses
    ),

  expenseTypeSummary: [],

  taxSummary: [],

};

}