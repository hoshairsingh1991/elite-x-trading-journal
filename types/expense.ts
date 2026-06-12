// ======================================================
// Expense Categories
// ======================================================

export type ExpenseCategory =
  | "TRADING_PLATFORM"
  | "MARKET_DATA"
  | "SOFTWARE_TOOLS"
  | "CLOUD_HOSTING"
  | "RESEARCH_NEWS"
  | "EDUCATION"
  | "HARDWARE"
  | "OFFICE_EQUIPMENT"
  | "INTERNET_CONNECTIVITY"
  | "ACCOUNTING_TAXES"
  | "PROFESSIONAL_SERVICES"
  | "BROKER_FEES"
  | "EXCHANGE_FEES"
  | "REGULATORY_FEES"
  | "MOBILE_APPS"
  | "TRAVEL_CONFERENCES"
  | "MISCELLANEOUS";

// ======================================================
// Recurring Frequency
// ======================================================

export type ExpenseRecurringFrequency =
  | "ONE_TIME"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUAL"
  | "ANNUAL";

// ======================================================
// Expense
// ======================================================

export interface Expense {
  // Identity
  id: string;
  userId: string;

  // Core Details
  expenseName: string;
  vendor: string;
  category: ExpenseCategory;

  // Financial Information
  amount: number;

  /**
   * IMPORTANT:
   * This is the ORIGINAL payment currency entered by the user.
   *
   * Examples:
   * - USD
   * - CAD
   * - EUR
   * - GBP
   * - JPY
   * - INR
   *
   * Never overwrite this value when the reporting currency changes.
   * Reporting currency conversion must happen only in the presentation layer.
   */
  currency: string;

  date: string;

  // Tax
  taxDeductible: boolean;

  // Recurring
  isRecurring: boolean;
  recurringFrequency: ExpenseRecurringFrequency;

  // Optional Metadata
  paymentMethod?: string;
  notes?: string;

  // Audit
  createdAt: string;
  updatedAt: string;
}