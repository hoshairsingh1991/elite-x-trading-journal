/**
 * ============================================================================
 * ELITEX TRADING OS
 * Expense Report Types
 * ============================================================================
 *
 * Canonical data contract for the Expense Report PDF.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * buildExpenseReportData()
 *   • Builds and validates the report data
 *   • Performs all calculations
 *   • Applies reporting currency
 *   • Produces an ExpenseReportData object
 *
 * generateExpensePdf()
 *   • Consumes ExpenseReportData
 *   • Renders the PDF
 *   • Performs NO business logic or calculations
 *
 * ============================================================================
 */

import { ReportingExpense } from "@/lib/types/expense";
import { PdfCurrencyTotal } from "../shared/types";

/* ============================================================================
   Report Metadata
   ============================================================================ */

export interface ExpenseReportMetadata {
  reportName: string;
  reportVersion: string;
  generatedAt: Date;
  generatedBy: string;
  reportingCurrency: string;
  reportingPeriod: string;
}

/* ============================================================================
   Export Options
   ============================================================================ */

export interface ExpenseReportOptions {
  includeSummary: boolean;

  includeCategorySummary: boolean;

  includeExpenseDetails: boolean;

  includeVendor: boolean;

  includeNotes: boolean;

  includeBusinessUse: boolean;

  includeDeductible: boolean;

  includeTaxInformation: boolean;

  includeReceiptStatus: boolean;

  includeRecurringStatus: boolean;

  includeExpenseType: boolean;

  includeTaxType: boolean;

  includeTaxAmount: boolean;
}

/* ============================================================================
   Executive Summary
   ============================================================================ */

export interface ExpenseReportSummary {
  totalExpenseCount: number;

  reportingCurrencyTotal: number;

  recurringExpenseTotal: number;

  oneTimeExpenseTotal: number;

  taxDeductibleTotal: number;

  nonDeductibleTotal: number;
}

/* ============================================================================
   Category Summary
   ============================================================================ */

export interface ExpenseCategorySummary {
  category: string;

  expenseCount: number;

  reportingTotal: number;
}

/* ============================================================================
   Vendor Summary
   ============================================================================ */

export interface ExpenseVendorSummary {
  vendor: string;

  expenseCount: number;

  reportingTotal: number;
}

/* ============================================================================
   Expense Table Row
   ============================================================================ */

export interface ExpenseReportRow {
  id: string;

  date: Date;

  expenseName: string;

  expenseType: string;

  category: string;

  vendor: string | null;

  originalCurrency: string;

  originalAmount: number;

  reportingAmount: number;

  reportingCurrency: string;

  businessUsePercent: number | null;

  deductiblePercent: number | null;

  taxType: string | null;

  taxAmount: number | null;

receiptStatus: string;

recurringStatus: string;

  notes: string | null;
}

/* ============================================================================
   Report Information
   ============================================================================ */

export interface ExpenseReportInformation {
  generatedBy: string;

  reportVersion: string;

  reportingCurrency: string;

  reportingPeriod: string;

  totalExpenseRecords: number;
}

/* ============================================================================
   Financial Summary
   ============================================================================ */

export interface MonthlyExpenseSummary {
  month: string;

  reportingTotal: number;
}

export interface ExpenseTypeSummary {
  expenseType: string;

  reportingTotal: number;
}

export interface TaxSummary {
  taxType: string;

  taxAmount: number;
}

export interface ExpenseFinancialSummary {
  monthlySummary: MonthlyExpenseSummary[];

  originalCurrencySummary: PdfCurrencyTotal[];

  expenseTypeSummary: ExpenseTypeSummary[];

  taxSummary: TaxSummary[];
}


/* ============================================================================
   Report Builder Input
   ============================================================================ */

export interface BuildExpenseReportDataInput {
  expenses: ReportingExpense[];

  reportingCurrency: string;

  reportingPeriod: string;

  options: ExpenseReportOptions;

  generatedBy: string;

  reportVersion: string;
}

/* ============================================================================
   Main Report
   ============================================================================ */

export interface ExpenseReportData {
  metadata: ExpenseReportMetadata;

  options: ExpenseReportOptions;

summary: ExpenseReportSummary;

categorySummary: ExpenseCategorySummary[];

vendorSummary: ExpenseVendorSummary[];

financialSummary: ExpenseFinancialSummary;

  rows: ExpenseReportRow[];

  reportInformation: ExpenseReportInformation;

  disclaimer: string[];
}