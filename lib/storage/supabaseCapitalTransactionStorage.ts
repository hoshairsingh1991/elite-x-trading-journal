
import { supabase } from "@/lib/supabase";

import type {
  CapitalTransaction,
  CurrencyCode,
  TransactionStatus,
  TransactionType,
} from "@/lib/capital/types";

// =====================================================
// CONSTANTS
// =====================================================

const TRANSACTION_PAGE_SIZE = 50;

// =====================================================
// DATABASE TYPES
// =====================================================

interface CapitalTransactionRow {
  id: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;

  from_account_id: string | null;
  to_account_id: string | null;

  received_amount: number | null;
  received_currency: CurrencyCode | null;
  exchange_rate: number | null;

  transaction_date: string;
  effective_date: string | null;

  method: string | null;
  counterparty_institution: string | null;
  reference_number: string | null;
  notes: string | null;

  reversal_of_transaction_id: string | null;
  reversal_reason: string | null;

  created_at: string;
  updated_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CapitalTransactionFilters {
  status?: TransactionStatus | null;
  transactionType?: TransactionType | null;
  accountId?: string | null;
  currency?: CurrencyCode | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CapitalTransactionCursor {
  activityDate: string;
  id: string;
}

export interface CapitalTransactionPage {
  transactions: CapitalTransaction[];
  nextCursor: CapitalTransactionCursor | null;
  hasMore: boolean;
}

export interface CreateCapitalTransactionInput {
  idempotencyKey: string;

  transactionType: TransactionType;
  status: TransactionStatus;

  amount: number;
  currency: CurrencyCode;

  fromAccountId: string | null;
  toAccountId: string | null;

  receivedAmount: number | null;
  receivedCurrency: CurrencyCode | null;
  exchangeRate: number | null;

  transactionDate: string;
  effectiveDate: string | null;

  method: string;
  counterpartyInstitution: string;
  referenceNumber: string;
  notes: string;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

function readRecord(value: unknown): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Invalid transaction record returned by Capital API."
    );
  }

  return value as Record<string, unknown>;
}

function readRequiredString(
  value: unknown,
  field: string
): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Invalid Capital API response: ${field} is missing or invalid.`
    );
  }

  return value;
}

function readNullableString(
  value: unknown,
  field: string
): string | null {
  if (value === null) {
    return null;
  }

  return readRequiredString(value, field);
}

function readRequiredNumber(
  value: unknown,
  field: string
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Invalid Capital API response: ${field} is missing or invalid.`
    );
  }

  return value;
}

function readNullableNumber(
  value: unknown,
  field: string
): number | null {
  if (value === null) {
    return null;
  }

  return readRequiredNumber(value, field);
}

function parseTransactionType(
  value: unknown
): TransactionType {
  if (
    value !== "DEPOSIT" &&
    value !== "WITHDRAWAL" &&
    value !== "TRANSFER"
  ) {
    throw new Error(
      "Invalid transaction type returned by Capital API."
    );
  }

  return value;
}

function parseTransactionStatus(
  value: unknown
): TransactionStatus {
  if (
    value !== "PENDING" &&
    value !== "COMPLETED" &&
    value !== "CANCELLED"
  ) {
    throw new Error(
      "Invalid transaction status returned by Capital API."
    );
  }

  return value;
}

function parseCurrency(value: unknown): CurrencyCode {
  const validCurrencies: CurrencyCode[] = [
    "CAD",
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "INR",
  ];

  if (
    typeof value !== "string" ||
    !validCurrencies.includes(value as CurrencyCode)
  ) {
    throw new Error(
      "Invalid transaction currency returned by Capital API."
    );
  }

  return value as CurrencyCode;
}

function parseNullableCurrency(
  value: unknown
): CurrencyCode | null {
  if (value === null) {
    return null;
  }

  return parseCurrency(value);
}

// =====================================================
// DATABASE RESPONSE PARSING
// =====================================================

function parseCapitalTransactionRow(
  value: unknown
): CapitalTransactionRow {
  const row = readRecord(value);

  return {
    id: readRequiredString(row.id, "id"),
    transaction_type: parseTransactionType(
      row.transaction_type
    ),
    status: parseTransactionStatus(row.status),
    amount: readRequiredNumber(row.amount, "amount"),
    currency: parseCurrency(row.currency),

    from_account_id: readNullableString(
      row.from_account_id,
      "from_account_id"
    ),
    to_account_id: readNullableString(
      row.to_account_id,
      "to_account_id"
    ),

    received_amount: readNullableNumber(
      row.received_amount,
      "received_amount"
    ),
    received_currency: parseNullableCurrency(
      row.received_currency
    ),
    exchange_rate: readNullableNumber(
      row.exchange_rate,
      "exchange_rate"
    ),

    transaction_date: readRequiredString(
      row.transaction_date,
      "transaction_date"
    ),
    effective_date: readNullableString(
      row.effective_date,
      "effective_date"
    ),

    method: readNullableString(row.method, "method"),
    counterparty_institution: readNullableString(
      row.counterparty_institution,
      "counterparty_institution"
    ),
    reference_number: readNullableString(
      row.reference_number,
      "reference_number"
    ),
    notes: readNullableString(row.notes, "notes"),

    reversal_of_transaction_id: readNullableString(
      row.reversal_of_transaction_id,
      "reversal_of_transaction_id"
    ),
    reversal_reason: readNullableString(
      row.reversal_reason,
      "reversal_reason"
    ),

    created_at: readRequiredString(
      row.created_at,
      "created_at"
    ),
    updated_at: readRequiredString(
      row.updated_at,
      "updated_at"
    ),
  };
}

// =====================================================
// FRONTEND MAPPING
// =====================================================

function mapCapitalTransaction(
  row: CapitalTransactionRow
): CapitalTransaction {
  return {
    id: row.id,

    date: row.transaction_date,
    effectiveDate: row.effective_date,

    type: row.transaction_type,
    status: row.status,

    amount: row.amount,
    currency: row.currency,

    fromAccountId: row.from_account_id,
    toAccountId: row.to_account_id,

    receivedAmount: row.received_amount,
    receivedCurrency: row.received_currency,
    exchangeRate: row.exchange_rate,

    method: row.method ?? "",
    counterpartyInstitution:
      row.counterparty_institution ?? "",
    referenceNumber: row.reference_number ?? "",
    notes: row.notes ?? "",

    reversalOfTransactionId:
      row.reversal_of_transaction_id,
    reversalReason: row.reversal_reason,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =====================================================
// LOAD TRANSACTION PAGE
// =====================================================

export async function loadCapitalTransactions(
  filters: CapitalTransactionFilters = {},
  cursor: CapitalTransactionCursor | null = null
): Promise<CapitalTransactionPage> {
  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("list_transactions", {
      p_status: filters.status ?? null,
      p_transaction_type:
        filters.transactionType ?? null,
      p_account_id: filters.accountId ?? null,
      p_currency: filters.currency ?? null,
      p_start_date: filters.startDate ?? null,
      p_end_date: filters.endDate ?? null,
      p_limit: TRANSACTION_PAGE_SIZE + 1,
      p_before_activity_date:
        cursor?.activityDate ?? null,
      p_before_id: cursor?.id ?? null,
    });

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    throw new Error(
      "Capital API returned an invalid transaction list."
    );
  }

  const rows = data.map(parseCapitalTransactionRow);

  const hasMore = rows.length > TRANSACTION_PAGE_SIZE;

  const pageRows = rows.slice(
    0,
    TRANSACTION_PAGE_SIZE
  );

  const transactions = pageRows.map(
    mapCapitalTransaction
  );

  const lastTransaction =
    transactions[transactions.length - 1];

  const nextCursor =
    hasMore && lastTransaction
      ? {
          activityDate:
            lastTransaction.effectiveDate ??
            lastTransaction.date,
          id: lastTransaction.id,
        }
      : null;

  return {
    transactions,
    nextCursor,
    hasMore,
  };
}

// =====================================================
// CREATE TRANSACTION
// =====================================================

export async function createCapitalTransaction(
  input: CreateCapitalTransactionInput
): Promise<CapitalTransaction> {
  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("create_transaction", {
      p_idempotency_key: input.idempotencyKey,
      p_transaction_type: input.transactionType,
      p_status: input.status,
      p_amount: input.amount,
      p_currency: input.currency,
      p_from_account_id: input.fromAccountId,
      p_to_account_id: input.toAccountId,
      p_received_amount: input.receivedAmount,
      p_received_currency: input.receivedCurrency,
      p_exchange_rate: input.exchangeRate,
      p_transaction_date: input.transactionDate,
      p_effective_date: input.effectiveDate,
      p_method: input.method,
      p_counterparty_institution:
        input.counterpartyInstitution,
      p_reference_number: input.referenceNumber,
      p_notes: input.notes,
    });

  if (error) {
    throw error;
  }

  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(
      "Capital API returned an invalid transaction creation response."
    );
  }

  const row = parseCapitalTransactionRow(data[0]);

  return mapCapitalTransaction(row);
}
