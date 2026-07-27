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

import { Expense } from "@/types/expense";
import { PdfCurrencyTotal } from "../shared/types";

/* ============================================================================
   Report Metadata
   ============================================================================ */

export interface ExpenseReportMetadata {
  reportName: string;
  generatedAt: Date;
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
}

/* ============================================================================
   Executive Summary
   ============================================================================ */

export interface ExpenseReportSummary {
  totalExpenses: number;

  recurringExpenses: number;

  oneTimeExpenses: number;

  reportingCurrencyTotal: number;

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

  businessUsePercent: number | null;

  deductiblePercent: number | null;

  taxType: string | null;

  taxAmount: number | null;

  hasReceipt: boolean;

  recurring: boolean;

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
   Report Builder Input
   ============================================================================ */

export interface BuildExpenseReportDataInput {
  expenses: Expense[];

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

  originalCurrencyTotals: PdfCurrencyTotal[];

  rows: ExpenseReportRow[];

  reportInformation: ExpenseReportInformation;

  disclaimer: string[];
}