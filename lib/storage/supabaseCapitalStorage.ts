import { supabase } from "@/lib/supabase";

import type {
  AccountCurrencyCode,
  BrokerageAccount,
} from "@/lib/capital/types";

// =====================================================
// DATABASE TYPES
// =====================================================

export type CapitalAccountCategory =
  | "brokerage"
  | "bank"
  | "cash"
  | "other";

type CapitalAccountSource = "manual" | "broker_import";
type CapitalAccountStatus = "active" | "archived";

interface CapitalAccountRow {
  id: string;
  account_name: string;
  broker_name: string | null;
  account_type: CapitalAccountCategory;
  account_subtype: string | null;
  currency: AccountCurrencyCode;
  account_source: CapitalAccountSource;
  status: CapitalAccountStatus;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CreateCapitalAccountInput {
  accountName: string;
  brokerName?: string | null;
  accountType?: CapitalAccountCategory;
  accountSubtype?: string | null;
  currency?: AccountCurrencyCode;
}

export interface UpdateCapitalAccountInput {
  accountId: string;
  accountName: string;
  brokerName: string | null;
  accountType: CapitalAccountCategory;
  accountSubtype: string | null;
  currency: AccountCurrencyCode;
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
    throw new Error("Invalid account record returned by Capital API.");
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

function normalizeAccountSubtype(
  value: string | null | undefined
): string | null {
  const normalized = value?.trim() || null;

  if (normalized && normalized.length > 80) {
    throw new Error("Account subtype cannot exceed 80 characters.");
  }

  return normalized;
}

// =====================================================
// DATABASE RESPONSE MAPPING
// =====================================================

function parseCapitalAccountRow(value: unknown): CapitalAccountRow {
  const row = readRecord(value);

  const id = readRequiredString(row.id, "id");
  const accountName = readRequiredString(
    row.account_name,
    "account_name"
  );

  const brokerName = readNullableString(
    row.broker_name,
    "broker_name"
  );

  const accountType = row.account_type;
  if (
    accountType !== "brokerage" &&
    accountType !== "bank" &&
    accountType !== "cash" &&
    accountType !== "other"
  ) {
    throw new Error("Invalid account category returned by Capital API.");
  }

  const accountSubtype = readNullableString(
    row.account_subtype,
    "account_subtype"
  );

  const currency = row.currency;
  const validCurrencies: AccountCurrencyCode[] = [
    "CAD",
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "INR",
    "UNKNOWN",
  ];

  if (
    typeof currency !== "string" ||
    !validCurrencies.includes(currency as AccountCurrencyCode)
  ) {
    throw new Error("Invalid account currency returned by Capital API.");
  }

  const accountSource = row.account_source;
  if (
    accountSource !== "manual" &&
    accountSource !== "broker_import"
  ) {
    throw new Error("Invalid account source returned by Capital API.");
  }

  const status = row.status;
  if (status !== "active" && status !== "archived") {
    throw new Error("Invalid account status returned by Capital API.");
  }

  return {
    id,
    account_name: accountName,
    broker_name: brokerName,
    account_type: accountType,
    account_subtype: accountSubtype,
    currency: currency as AccountCurrencyCode,
    account_source: accountSource,
    status,
    created_at: readRequiredString(row.created_at, "created_at"),
    updated_at: readRequiredString(row.updated_at, "updated_at"),
  };
}

function mapCapitalAccount(row: CapitalAccountRow): BrokerageAccount {
  return {
    id: row.id,
    name: row.account_name,
    broker: row.broker_name ?? "Unassigned",

    // The existing UI displays the specific classification.
    // Fall back to the broad category when no subtype exists.
    type: row.account_subtype ?? row.account_type,

    baseCurrency: row.currency,

    source:
      row.account_source === "broker_import"
        ? "CONNECTED"
        : "MANUAL",

    status:
      row.status === "active"
        ? "ACTIVE"
        : "CLOSED",
  };
}

function mapSingleAccount(
  data: unknown,
  operation: string
): BrokerageAccount {
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(
      `${operation} did not return exactly one account.`
    );
  }

  return mapCapitalAccount(parseCapitalAccountRow(data[0]));
}

// =====================================================
// LOAD ACCOUNTS
// =====================================================

export async function loadCapitalAccounts(): Promise<BrokerageAccount[]> {
  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("list_accounts");

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    throw new Error("Capital API returned an invalid account list.");
  }

  return data.map((row) =>
    mapCapitalAccount(parseCapitalAccountRow(row))
  );
}

// =====================================================
// CREATE MANUAL ACCOUNT
// =====================================================

export async function createCapitalAccount(
  input: CreateCapitalAccountInput
): Promise<BrokerageAccount> {
  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("create_manual_account", {
      p_account_name: input.accountName,
      p_broker_name: input.brokerName?.trim() || null,
      p_account_type: input.accountType ?? "brokerage",
      p_currency: input.currency ?? "UNKNOWN",
      p_account_subtype: normalizeAccountSubtype(
        input.accountSubtype
      ),
    });

  if (error) {
    throw error;
  }

  return mapSingleAccount(data, "Create account");
}

// =====================================================
// UPDATE ACCOUNT
// =====================================================

export async function updateCapitalAccount(
  input: UpdateCapitalAccountInput
): Promise<BrokerageAccount> {
  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("update_account", {
      p_account_id: input.accountId,
      p_account_name: input.accountName,
      p_broker_name: input.brokerName?.trim() || null,
      p_account_type: input.accountType,
      p_currency: input.currency,

      // Always explicit: null intentionally clears the subtype.
      p_account_subtype: normalizeAccountSubtype(
        input.accountSubtype
      ),
    });

  if (error) {
    throw error;
  }

  return mapSingleAccount(data, "Update account");
}

// =====================================================
// ARCHIVE ACCOUNT
// =====================================================

export async function archiveCapitalAccount(
  accountId: string
): Promise<BrokerageAccount> {
  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("archive_account", {
      p_account_id: accountId,
    });

  if (error) {
    throw error;
  }

  return mapSingleAccount(data, "Archive account");
}
