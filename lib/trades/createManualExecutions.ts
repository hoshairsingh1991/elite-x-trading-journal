import {
  NormalizedExecution,
  TradeSide,
} from "@/types/trade";

// =================================================
// MANUAL ENTRY TYPE
// =================================================
//
// COMPLETE
//   Entry + Exit
//
// PARTIAL_ENTRY
//   One opening/additional execution
//
// PARTIAL_EXIT
//   One reducing/closing execution
//
// =================================================

export type ManualEntryType =
  | "COMPLETE"
  | "PARTIAL_ENTRY"
  | "PARTIAL_EXIT";

// =================================================
// CREATE MANUAL EXECUTIONS INPUT
// =================================================
//
// IMPORTANT:
//
// Manual Entry is an execution producer.
//
// This builder creates normalized executions only.
// It does NOT create trades directly.
//
// pairTrades() remains responsible for reconstructing
// positions/trades from executions.
//
// =================================================

interface CreateManualExecutionsInput {
  ticker: string;

  quantity: number;

  // Complete Trade / Partial Entry
  entryPrice?: number;

  // Complete Trade / Partial Exit
  exitPrice?: number;

  commission: number;

  side: TradeSide;

  assetType: string;

  account: string;

  // Complete Trade / Partial Entry
  entryDate?: string;

  // Complete Trade / Partial Exit
  exitDate?: string;

  // Complete Trade / Partial Entry
  entryTime?: string;

  // Complete Trade / Partial Exit
  exitTime?: string;

  currency: string;

  exchange?: string;

  // Defaults to COMPLETE for backwards compatibility
  // with the existing working Add Trade flow.
  tradeType?: ManualEntryType;

  // Required for PARTIAL_EXIT because the exit must
  // reduce an existing lifecycle/position.
  //
  // This is intentionally optional at the type level
  // so existing COMPLETE callers continue working.
  //
  // The validator requires it for PARTIAL_EXIT.
  contractKey?: string;
}

// =================================================
// VALIDATE MANUAL EXECUTION INPUT
// =================================================

function validateManualExecutionInput(
  input: CreateManualExecutionsInput
): void {
  const {
    ticker,
    quantity,
    entryPrice,
    exitPrice,
    commission,
    side,
    assetType,
    account,
    entryDate,
    exitDate,
    entryTime,
    exitTime,
    currency,
    tradeType = "COMPLETE",
    contractKey,
  } = input;

  // =================================================
  // REQUIRED TEXT FIELDS
  // =================================================

  if (!ticker?.trim()) {
    throw new Error(
      "Manual trade ticker is required."
    );
  }

  if (!account?.trim()) {
    throw new Error(
      "Manual trade account is required."
    );
  }

  if (!assetType?.trim()) {
    throw new Error(
      "Manual trade asset type is required."
    );
  }

  // =================================================
  // TRADE TYPE
  // =================================================

  if (
    tradeType !== "COMPLETE" &&
    tradeType !== "PARTIAL_ENTRY" &&
    tradeType !== "PARTIAL_EXIT"
  ) {
    throw new Error(
      "Invalid manual entry type."
    );
  }

  // =================================================
  // QUANTITY
  // =================================================

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Manual trade quantity must be greater than zero."
    );
  }

  // =================================================
  // COMPLETE / PARTIAL ENTRY DATE + TIME
  // =================================================

  if (
    tradeType === "COMPLETE" ||
    tradeType === "PARTIAL_ENTRY"
  ) {
    if (!entryDate?.trim()) {
      throw new Error(
        "Manual trade entry date is required."
      );
    }

    if (!entryTime?.trim()) {
      throw new Error(
        "Manual trade entry time is required."
      );
    }
  }

  // =================================================
  // COMPLETE / PARTIAL EXIT DATE + TIME
  // =================================================

  if (
    tradeType === "COMPLETE" ||
    tradeType === "PARTIAL_EXIT"
  ) {
    if (!exitDate?.trim()) {
      throw new Error(
        "Manual trade exit date is required."
      );
    }

    if (!exitTime?.trim()) {
      throw new Error(
        "Manual trade exit time is required."
      );
    }
  }

  // =================================================
  // ENTRY PRICE
  // =================================================

  if (
    tradeType === "COMPLETE" ||
    tradeType === "PARTIAL_ENTRY"
  ) {
    if (
      !Number.isFinite(entryPrice) ||
      (entryPrice ?? 0) <= 0
    ) {
      throw new Error(
        "Manual trade entry price must be greater than zero."
      );
    }
  }

  // =================================================
  // EXIT PRICE
  // =================================================

  if (
    tradeType === "COMPLETE" ||
    tradeType === "PARTIAL_EXIT"
  ) {
    if (
      !Number.isFinite(exitPrice) ||
      (exitPrice ?? 0) <= 0
    ) {
      throw new Error(
        "Manual trade exit price must be greater than zero."
      );
    }
  }

  // =================================================
  // COMMISSION
  // =================================================
  //
  // Zero commission is valid.
  //
  // COMPLETE:
  //   split between entry + exit
  //
  // PARTIAL ENTRY / PARTIAL EXIT:
  //   entire commission belongs to that execution
  //
  // =================================================

  if (
    !Number.isFinite(commission) ||
    commission < 0
  ) {
    throw new Error(
      "Manual trade commission cannot be negative."
    );
  }

  // =================================================
  // SIDE
  // =================================================

  if (
    side !== "LONG" &&
    side !== "SHORT"
  ) {
    throw new Error(
      "Manual trade side must be LONG or SHORT."
    );
  }

  // =================================================
  // CURRENCY
  // =================================================

  const normalizedCurrency =
    currency?.trim().toUpperCase();

  const supportedCurrencies = [
    "USD",
    "CAD",
    "EUR",
    "GBP",
    "JPY",
    "INR",
  ];

  if (
    !supportedCurrencies.includes(
      normalizedCurrency
    )
  ) {
    throw new Error(
      "Unsupported manual trade currency."
    );
  }

  // =================================================
  // TIME VALIDATION
  // =================================================

  const timePattern =
    /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    entryTime &&
    !timePattern.test(entryTime)
  ) {
    throw new Error(
      "Invalid manual trade entry time."
    );
  }

  if (
    exitTime &&
    !timePattern.test(exitTime)
  ) {
    throw new Error(
      "Invalid manual trade exit time."
    );
  }

  // =================================================
  // PARTIAL EXIT POSITION TARGET
  // =================================================
  //
  // A Partial Exit is fundamentally different from
  // creating a new lifecycle.
  //
  // It must reduce an existing position.
  //
  // Therefore it must eventually carry the existing
  // lifecycle/contract identity into the execution.
  //
  // =================================================

  if (
    tradeType === "PARTIAL_EXIT" &&
    !contractKey?.trim()
  ) {
    throw new Error(
      "Manual partial exit requires an existing position."
    );
  }
}

// =================================================
// CREATE MANUAL EXECUTIONS
// =================================================

export function createManualExecutions(
  input: CreateManualExecutionsInput
): NormalizedExecution[] {
  // =================================================
  // DEFAULT TRADE TYPE
  // =================================================
  //
  // COMPLETE is the default intentionally.
  //
  // This preserves backwards compatibility with the
  // current working Complete Trade implementation.
  //
  // =================================================

  const tradeType =
    input.tradeType ?? "COMPLETE";

  // =================================================
  // VALIDATE BEFORE CREATING ANY EXECUTIONS
  // =================================================

  validateManualExecutionInput({
    ...input,
    tradeType,
  });

  const {
    ticker,
    quantity,
    entryPrice,
    exitPrice,
    commission,
    side,
    assetType,
    account,
    entryDate,
    exitDate,
    entryTime,
    exitTime,
    currency,
    exchange,
    contractKey: suppliedContractKey,
  } = input;

  // =================================================
  // NORMALIZE BASIC VALUES
  // =================================================

  const normalizedTicker =
    ticker.trim().toUpperCase();

  const normalizedAssetType =
    assetType.trim().toUpperCase();

  const normalizedAccount =
    account.trim();

  const normalizedCurrency =
    currency.trim().toUpperCase();

  const normalizedExchange =
    exchange?.trim() || "";

  // =================================================
  // UNIQUE MANUAL LIFECYCLE ID
  // =================================================
  //
  // COMPLETE and PARTIAL ENTRY create a new manual
  // lifecycle at this stage.
  //
  // PARTIAL EXIT must target an existing lifecycle,
  // so its supplied contractKey is preserved.
  //
  // =================================================

  const lifecycleId =
    crypto.randomUUID();

  // =================================================
  // CANONICAL CONTRACT KEY
  // =================================================

  const contractKey =
    tradeType === "PARTIAL_EXIT"
      ? suppliedContractKey!.trim()
      : `MANUAL-${normalizedTicker}-${lifecycleId}`;

  // =================================================
  // ASSET MULTIPLIER
  // =================================================

  const multiplier =
    normalizedAssetType === "OPTIONS"
      ? 100
      : 1;

  // =================================================
  // EXECUTION ACTIONS
  // =================================================
  //
  // LONG:
  //   Entry = BUY
  //   Exit  = SELL
  //
  // SHORT:
  //   Entry = SELL
  //   Exit  = BUY
  //
  // =================================================

  const entryAction =
    side === "LONG"
      ? "BUY"
      : "SELL";

  const exitAction =
    side === "LONG"
      ? "SELL"
      : "BUY";

  // =================================================
  // EXECUTION IDs
  // =================================================
  //
  // Keep the current Complete Trade ID structure
  // unchanged for regression safety.
  //
  // Partial Entry / Partial Exit receive their own
  // unique execution identity.
  //
  // Deterministic identity hardening is intentionally
  // deferred to a separate controlled phase.
  //
  // =================================================

  const entryExecutionId =
    `manual-${lifecycleId}-entry`;

  const exitExecutionId =
    `manual-${lifecycleId}-exit`;

  // =================================================
  // MANUAL EXECUTION IDS
  // =================================================

  const entryBrokerExecutionId =
    `MANUAL-${lifecycleId}-ENTRY`;

  const exitBrokerExecutionId =
    `MANUAL-${lifecycleId}-EXIT`;

  // =================================================
  // PARTIAL ENTRY
  // =================================================

  if (
    tradeType === "PARTIAL_ENTRY"
  ) {
    const executionTimestamp =
      `${entryDate}T${entryTime}:00`;

    const execution:
      NormalizedExecution = {
        id:
          entryExecutionId,

        date:
          entryDate!,

        ticker:
          normalizedTicker,

        contract:
          normalizedTicker,

        contractKey,

        exchange:
          normalizedExchange,

        action:
          entryAction,

        quantity,

        executionPrice:
          entryPrice!,

        executionValue:
          entryPrice! *
          quantity *
          multiplier,

        fees:
          commission,

        account:
          normalizedAccount,

        assetType:
          normalizedAssetType,

        multiplier,

        currency:
          normalizedCurrency,

        feeCurrency:
          normalizedCurrency,

        brokerExecutionId:
          entryBrokerExecutionId,

        executionTimestamp,
      };

    return [execution];
  }

  // =================================================
  // PARTIAL EXIT
  // =================================================

  if (
    tradeType === "PARTIAL_EXIT"
  ) {
    const executionTimestamp =
      `${exitDate}T${exitTime}:00`;

    const execution:
      NormalizedExecution = {
        id:
          exitExecutionId,

        date:
          exitDate!,

        ticker:
          normalizedTicker,

        contract:
          normalizedTicker,

        contractKey,

        exchange:
          normalizedExchange,

        action:
          exitAction,

        quantity,

        executionPrice:
          exitPrice!,

        executionValue:
          exitPrice! *
          quantity *
          multiplier,

        fees:
          commission,

        account:
          normalizedAccount,

        assetType:
          normalizedAssetType,

        multiplier,

        currency:
          normalizedCurrency,

        feeCurrency:
          normalizedCurrency,

        brokerExecutionId:
          exitBrokerExecutionId,

        executionTimestamp,
      };

    return [execution];
  }

  // =================================================
  // COMPLETE TRADE
  // =================================================
  //
  // This section intentionally preserves the current
  // working two-execution behavior.
  //
  // =================================================

  const entryFees =
    commission / 2;

  const exitFees =
    commission - entryFees;

  const entryTimestamp:
    string =
    `${entryDate}T${entryTime}:00`;

  const exitTimestamp:
    string =
    `${exitDate}T${exitTime}:00`;

  // =================================================
  // ENTRY EXECUTION
  // =================================================

  const entryExecution:
    NormalizedExecution = {
    id:
      entryExecutionId,

    date:
      entryDate!,

    ticker:
      normalizedTicker,

    contract:
      normalizedTicker,

    contractKey,

    exchange:
      normalizedExchange,

    action:
      entryAction,

    quantity,

    executionPrice:
      entryPrice!,

    executionValue:
      entryPrice! *
      quantity *
      multiplier,

    fees:
      entryFees,

    account:
      normalizedAccount,

    assetType:
      normalizedAssetType,

    multiplier,

    currency:
      normalizedCurrency,

    feeCurrency:
      normalizedCurrency,

    brokerExecutionId:
      entryBrokerExecutionId,

    executionTimestamp:
      entryTimestamp,
  };

  // =================================================
  // EXIT EXECUTION
  // =================================================

  const exitExecution:
    NormalizedExecution = {
    id:
      exitExecutionId,

    date:
      exitDate!,

    ticker:
      normalizedTicker,

    contract:
      normalizedTicker,

    contractKey,

    exchange:
      normalizedExchange,

    action:
      exitAction,

    quantity,

    executionPrice:
      exitPrice!,

    executionValue:
      exitPrice! *
      quantity *
      multiplier,

    fees:
      exitFees,

    account:
      normalizedAccount,

    assetType:
      normalizedAssetType,

    multiplier,

    currency:
      normalizedCurrency,

    feeCurrency:
      normalizedCurrency,

    brokerExecutionId:
      exitBrokerExecutionId,

    executionTimestamp:
      exitTimestamp,
  };

  // =================================================
  // RETURN COMPLETE TRADE EXECUTIONS
  // =================================================

  return [
    entryExecution,
    exitExecution,
  ];
}