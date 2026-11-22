
import { supabase } from "@/lib/supabase";

import type {
  AccountCurrencyCode,
  BrokerageAccount,
  CapitalAccountCategory,
  CapitalTradingMode,
} from "@/lib/capital/types";

export type { CapitalAccountCategory };

// =====================================================
// DATABASE TYPES
// =====================================================

type CapitalAccountSource = "manual" | "broker_import";
type CapitalAccountStatus = "active" | "archived";

interface CapitalAccountRow {
  id: string;
  account_name: string;
  broker_name: string | null;
  account_type: CapitalAccountCategory;
  account_subtype: string | null;

  ownership: string | null;
  ownership_custom: string | null;
  registration: string | null;

  account_number_last4: string | null;
  trading_mode: CapitalTradingMode;
  trading_mode_custom: string | null;

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

  ownership?: string | null;
  ownershipCustom?: string | null;
  registration?: string | null;

  accountNumberLast4?: string | null;
  tradingMode?: CapitalTradingMode;
  tradingModeCustom?: string | null;

  currency?: AccountCurrencyCode;
}

export interface UpdateCapitalAccountInput {
  accountId: string;
  accountName: string;
  brokerName: string | null;
  accountType: CapitalAccountCategory;
  accountSubtype: string | null;

  ownership: string | null;
  ownershipCustom: string | null;
  registration: string | null;

  accountNumberLast4: string | null;
  tradingMode: CapitalTradingMode;
  tradingModeCustom: string | null;

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

function normalizeOptionalString(
  value: string | null | undefined,
  field: string,
  maxLength = 80
): string | null {
  const normalized = value?.trim() || null;

  if (normalized && normalized.length > maxLength) {
    throw new Error(`${field} cannot exceed ${maxLength} characters.`);
  }

  return normalized;
}

function normalizeAccountSubtype(
  value: string | null | undefined
): string | null {
  return normalizeOptionalString(value, "Account subtype", 80);
}

function normalizeAccountNumberLast4(
  value: string | null | undefined
): string | null {
  const normalized = value?.trim() || null;

  if (normalized !== null && !/^\d{4}$/.test(normalized)) {
    throw new Error(
      "Account number must contain exactly four digits."
    );
  }

  return normalized;
}

function readTradingMode(value: unknown): CapitalTradingMode {
  const validTradingModes: CapitalTradingMode[] = [
    "cash",
    "margin",
    "portfolio_margin",
    "limited_margin",
    "other",
    "unknown",
    "not_applicable",
  ];

  if (
    typeof value !== "string" ||
    !validTradingModes.includes(value as CapitalTradingMode)
  ) {
    throw new Error("Invalid trading mode returned by Capital API.");
  }

  return value as CapitalTradingMode;
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

  const ownership = readNullableString(
    row.ownership,
    "ownership"
  );

  const ownershipCustom = readNullableString(
    row.ownership_custom,
    "ownership_custom"
  );

  const registration = readNullableString(
    row.registration,
    "registration"
  );

  const accountNumberLast4 = readNullableString(
    row.account_number_last4,
    "account_number_last4"
  );

  if (
    accountNumberLast4 !== null &&
    !/^\d{4}$/.test(accountNumberLast4)
  ) {
    throw new Error(
      "Invalid account number last four returned by Capital API."
    );
  }

  const tradingMode = readTradingMode(row.trading_mode);

  const tradingModeCustom = readNullableString(
    row.trading_mode_custom,
    "trading_mode_custom"
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

    ownership,
    ownership_custom: ownershipCustom,
    registration,

    account_number_last4: accountNumberLast4,
    trading_mode: tradingMode,
    trading_mode_custom: tradingModeCustom,

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

    // Existing display classification.
    type: row.account_subtype ?? row.account_type,

    // Canonical classification.
    accountCategory: row.account_type,
    accountSubtype: row.account_subtype,

    // Ownership.
    ownership: row.ownership,
    ownershipCustom: row.ownership_custom,

    // Registration.
    registration: row.registration,

    // Account metadata.
    accountNumberLast4: row.account_number_last4,
    tradingMode: row.trading_mode,
    tradingModeCustom: row.trading_mode_custom,

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
  const accountType = input.accountType ?? "brokerage";

  const { data, error } = await supabase
    .schema("capital_api")
    .rpc("create_manual_account", {
      p_account_name: input.accountName,
      p_broker_name: input.brokerName?.trim() || null,
      p_account_type: accountType,
      p_currency: input.currency ?? "UNKNOWN",

      p_account_subtype: normalizeAccountSubtype(
        input.accountSubtype
      ),

      p_ownership: normalizeOptionalString(
        input.ownership,
        "Ownership",
        40
      ),

      p_ownership_custom: normalizeOptionalString(
        input.ownershipCustom,
        "Custom ownership",
        80
      ),

      p_registration: normalizeOptionalString(
        input.registration,
        "Registration",
        80
      ),

      p_account_number_last4: normalizeAccountNumberLast4(
        input.accountNumberLast4
      ),

      p_trading_mode:
        input.tradingMode ??
        (accountType === "brokerage"
          ? "unknown"
          : "not_applicable"),

      p_trading_mode_custom: normalizeOptionalString(
        input.tradingModeCustom,
        "Custom trading mode",
        80
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

      p_ownership: normalizeOptionalString(
        input.ownership,
        "Ownership",
        40
      ),

      p_ownership_custom: normalizeOptionalString(
        input.ownershipCustom,
        "Custom ownership",
        80
      ),

      p_registration: normalizeOptionalString(
        input.registration,
        "Registration",
        80
      ),

      // Always explicit: null intentionally clears the account number.
      p_account_number_last4: normalizeAccountNumberLast4(
        input.accountNumberLast4
      ),

      p_trading_mode: input.tradingMode,

      p_trading_mode_custom: normalizeOptionalString(
        input.tradingModeCustom,
        "Custom trading mode",
        80
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
