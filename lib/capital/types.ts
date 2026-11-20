
export type CurrencyCode =
  | "CAD"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "INR";

export type AccountCurrencyCode = CurrencyCode | "UNKNOWN";

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
  type: string;
  baseCurrency: AccountCurrencyCode;
  source: "CONNECTED" | "MANUAL";
  status: "ACTIVE" | "CLOSED";
}

export interface CapitalTransaction {
  id: string;
  date: string;
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
}
