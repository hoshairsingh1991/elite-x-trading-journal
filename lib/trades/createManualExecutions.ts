import {
  NormalizedExecution,
} from "@/types/trade";

interface CreateManualExecutionsParams {

  ticker: string;

  quantity: number;

  entryPrice: number;

  exitPrice: number;

  commission: number;

  assetType?: string;

  account?: string;

  tradeDate?: string;
}

export function
createManualExecutions({

  ticker,

  quantity,

  entryPrice,

  exitPrice,

  commission,

  assetType = "FUTURES",

  account = "",

  tradeDate =
    new Date()
      .toISOString()
      .split("T")[0],

}: CreateManualExecutionsParams):
NormalizedExecution[] {

  // =============================================
  // CANONICAL IDS
  // =============================================

  const lifecycleId =
    crypto.randomUUID();

  const contractKey =
    `MANUAL-${ticker.toUpperCase()}-${lifecycleId}`;

  // =============================================
  // ASSET MULTIPLIER
  // =============================================

  const multiplier =
    assetType === "OPTIONS"
      ? 100
      : 1;

  // =============================================
  // FEE RECONCILIATION
  // =============================================

  const entryFees =
    Number(
      (
        commission / 2
      ).toFixed(2)
    );

  const exitFees =
    Number(
      (
        commission -
        entryFees
      ).toFixed(2)
    );

  // =============================================
  // ENTRY EXECUTION
  // =============================================

  const entryExecution:
    NormalizedExecution = {

    id:
      crypto.randomUUID(),

    date:
      tradeDate,

    executionTimestamp:
      `${tradeDate}T09:30:00`,

    ticker:
      ticker.toUpperCase(),

    contract:
      ticker.toUpperCase(),

    contractKey,

    // =========================================
    // EXECUTION ACTION
    // =========================================
    // BUY does NOT mean LONG by itself.
    //
    // pairTrades() determines whether this BUY
    // opens a LONG position or closes a SHORT
    // position.

    action:
      "BUY",

    quantity,

    executionPrice:
      entryPrice,

    executionValue:
      Number(
        (
          quantity *
          entryPrice *
          multiplier
        ).toFixed(2)
      ),

    fees:
      entryFees,

    currency:
      "USD",

    feeCurrency:
      "USD",

    account,

    assetType,

    multiplier,
  };

  // =============================================
  // EXIT EXECUTION
  // =============================================

  const exitExecution:
    NormalizedExecution = {

    id:
      crypto.randomUUID(),

    date:
      tradeDate,

    executionTimestamp:
      `${tradeDate}T16:00:00`,

    ticker:
      ticker.toUpperCase(),

    contract:
      ticker.toUpperCase(),

    // =========================================
    // EXECUTION ACTION
    // =========================================
    // SELL does NOT mean SHORT by itself.
    //
    // pairTrades() determines whether this SELL
    // closes a LONG position or opens a SHORT
    // position.

    action:
      "SELL",

    quantity,

    executionPrice:
      exitPrice,

    executionValue:
      Number(
        (
          quantity *
          exitPrice *
          multiplier
        ).toFixed(2)
      ),

    fees:
      exitFees,

    currency:
      "USD",

    feeCurrency:
      "USD",

    account,

    assetType,

    multiplier,
  };

  return [
    entryExecution,
    exitExecution,
  ];
}