import {
  ExpenseFinancialSummary,
  ExpenseReportOptions,
} from "../types";

import { ReportingExpense } from "@/lib/types/expense";

import { buildOriginalCurrencyTotals }
from "./originalCurrencyTotals";

import { buildMonthlyExpenseSummary }
from "./monthlyExpenseSummary";

import { buildExpenseTypeSummary }
from "./expenseTypeSummary";

import { buildTaxSummary }
from "./taxSummary";

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

expenseTypeSummary:
  buildExpenseTypeSummary(
    expenses
  ),

  taxSummary:
  buildTaxSummary(
    expenses
  ),

};

}