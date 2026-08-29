
import {
  NormalizedExecution,
  TradeSide,
} from "@/types/trade";

// =================================================
// CREATE MANUAL EXECUTIONS
// =================================================
//
// Manual Entry is an execution producer.
//
// IMPORTANT:
// - Executions remain the canonical trading data.
// - Manual Entry does NOT create trades directly.
// - pairTrades() remains responsible for reconstructing
//   trades from executions.
//
// LONG:
//   BUY  = entry
//   SELL = exit
//
// SHORT:
//   SELL = entry
//   BUY  = exit
//
// =================================================

interface CreateManualExecutionsInput {

  ticker: string;

  quantity: number;

  entryPrice: number;

  exitPrice: number;

  commission: number;

  side: TradeSide;

  assetType: string;

  account: string;

  tradeDate: string;

  entryTime?: string;

  exitTime?: string;

  currency: string;

  exchange?: string;
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
    tradeDate,
    entryTime,
    exitTime,
    currency,
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

  if (!tradeDate?.trim()) {

    throw new Error(
      "Manual trade date is required."
    );
  }

  if (!assetType?.trim()) {

    throw new Error(
      "Manual trade asset type is required."
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
  // ENTRY PRICE
  // =================================================

  if (
    !Number.isFinite(entryPrice) ||
    entryPrice <= 0
  ) {

    throw new Error(
      "Manual trade entry price must be greater than zero."
    );
  }

  // =================================================
  // EXIT PRICE
  // =================================================

  if (
    !Number.isFinite(exitPrice) ||
    exitPrice <= 0
  ) {

    throw new Error(
      "Manual trade exit price must be greater than zero."
    );
  }

  // =================================================
  // COMMISSION
  // =================================================
  //
  // Zero commission is valid.
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
  // OPTIONAL TIME VALIDATION
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
}

// =================================================
// CREATE MANUAL EXECUTIONS
// =================================================

export function createManualExecutions(
  input: CreateManualExecutionsInput
): NormalizedExecution[] {

  // =================================================
  // VALIDATE BEFORE CREATING ANY EXECUTIONS
  // =================================================

  validateManualExecutionInput(
    input
  );

  const {
    ticker,
    quantity,
    entryPrice,
    exitPrice,
    commission,
    side,
    assetType,
    account,
    tradeDate,
    entryTime,
    exitTime,
    currency,
    exchange,
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

  const lifecycleId =
    crypto.randomUUID();

  // =================================================
  // CANONICAL CONTRACT KEY
  // =================================================
  //
  // Every manual trade gets its own lifecycle.
  //
  // This prevents unrelated manual trades from being
  // accidentally paired together by the FIFO engine.
  //
  // Broker executions continue using their own
  // broker-derived contract keys.
  //
  // =================================================

  const contractKey =
    `MANUAL-${normalizedTicker}-${lifecycleId}`;

  // =================================================
  // ASSET MULTIPLIER
  // =================================================
  //
  // Options:
  //   100
  //
  // Everything else:
  //   1
  //
  // =================================================

  const multiplier =
    normalizedAssetType === "OPTIONS"
      ? 100
      : 1;

  // =================================================
  // EXECUTION IDS
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
  // EXECUTION ACTIONS
  // =================================================
  //
  // LONG:
  //   BUY -> SELL
  //
  // SHORT:
  //   SELL -> BUY
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
  // COMMISSION ALLOCATION
  // =================================================
  //
  // Total commission supplied by the user is split
  // across the two executions.
  //
  // The sum always equals the original commission.
  //
  // =================================================

  const entryFees =
    commission / 2;

  const exitFees =
    commission - entryFees;

// =================================================
// EXECUTION TIMESTAMPS
// =================================================
//
// Manual Entry always produces a canonical timestamp.
//
// Entry:
//   tradeDate + entryTime
//
// Exit:
//   tradeDate + exitTime
//
// executionTimestamp remains REQUIRED in
// NormalizedExecution.
//
// =================================================

const entryTimestamp: string =
  `${tradeDate}T${entryTime}:00`;

const exitTimestamp: string =
  `${tradeDate}T${exitTime}:00`;

// =================================================
// ENTRY EXECUTION
// =================================================

const entryExecution:
  NormalizedExecution = {

  id:
    entryExecutionId,

  date:
    tradeDate,

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
    entryPrice,

  executionValue:
    entryPrice *
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
    tradeDate,

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
    exitPrice,

  executionValue:
    exitPrice *
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
  // RETURN NORMALIZED EXECUTIONS
  // =================================================

  return [
    entryExecution,
    exitExecution,
  ];
}

