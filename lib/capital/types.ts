export type CurrencyCode =
  | "CAD"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "INR";

export type AccountCurrencyCode = CurrencyCode | "UNKNOWN";

export type CapitalAccountCategory =
  | "brokerage"
  | "bank"
  | "cash"
  | "other";

export type CapitalTradingMode =
  | "cash"
  | "margin"
  | "portfolio_margin"
  | "limited_margin"
  | "other"
  | "unknown"
  | "not_applicable";

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export type PeriodFilter =
  | "YTD"
  | "30D"
  | "ALL"
  | "CUSTOM";

export interface BrokerageAccount {
  id: string;
  name: string;
  broker: string;

  // Existing display classification.
  type: string;

  // Canonical account classification.
  accountCategory: CapitalAccountCategory;
  accountSubtype: string | null;

  // Ownership.
  ownership: string | null;
  ownershipCustom: string | null;

  // Registration.
  registration: string | null;

  // Account metadata.
  accountNumberLast4: string | null;
  tradingMode: CapitalTradingMode;
  tradingModeCustom: string | null;

  baseCurrency: AccountCurrencyCode;
  source: "CONNECTED" | "MANUAL";
  status: "ACTIVE" | "CLOSED";
}

export interface CapitalTransaction {
  id: string;

  date: string;
  effectiveDate: string | null;

  type: TransactionType;
  status: TransactionStatus;

  amount: number;
  currency: CurrencyCode;

  fromAccountId: string | null;
  toAccountId: string | null;

  receivedAmount: number | null;
  receivedCurrency: CurrencyCode | null;
  exchangeRate: number | null;

  method: string;
  counterpartyInstitution: string;
  referenceNumber: string;
  notes: string;

  reversalOfTransactionId: string | null;
  reversalReason: string | null;

  createdAt: string;
  updatedAt: string;
}