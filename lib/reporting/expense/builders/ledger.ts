/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Ledger Builder
 * ============================================================================
 *
 * Builds printable expense rows for the Expense Report.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * • Map ReportingExpense -> ExpenseReportRow
 * • Apply presentation defaults
 * • Perform NO calculations
 * * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";

import {
  ExpenseReportOptions,
  ExpenseReportRow,
} from "../types";

/* ============================================================================
   Build Ledger
   ============================================================================ */

export function buildLedger(
  expenses: ReportingExpense[],
  options: ExpenseReportOptions
): ExpenseReportRow[] {

  return expenses.map(
    (expense): ExpenseReportRow => ({

      id: expense.id,

      date: new Date(
        expense.expense_date
      ),

      expenseName:
        expense.expense_name,

      expenseType:
        expense.expense_type ?? "-",

      category:
        expense.category,

      vendor:
        options.includeVendor
          ? expense.vendor ?? "-"
          : "-",

      originalCurrency:
        expense.billed_currency,

      originalAmount:
        expense.original_amount,

      reportingAmount:
        expense.reporting_amount,

      businessUsePercent:
        options.includeBusinessUse
          ? expense.business_use_percent
          : null,

      deductiblePercent:
        options.includeDeductible
          ? expense.deductible_percent
          : null,

      taxType:
        options.includeTaxInformation
          ? expense.tax_type ?? "-"
          : "-",

      taxAmount:
        options.includeTaxInformation
          ? expense.tax_amount
          : null,

      receiptStatus:
        options.includeReceiptStatus
          ? expense.receipt_url
            ? "Yes"
            : "No"
          : "-",

      recurringStatus:
        options.includeRecurringStatus
          ? expense.is_recurring
            ? "Yes"
            : "No"
          : "-",

      notes:
        options.includeNotes
          ? expense.notes ?? "-"
          : "-",
    })
  );

}