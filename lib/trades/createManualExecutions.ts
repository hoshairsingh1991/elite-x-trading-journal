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
  // ENTRY EXECUTION
  // =============================================

  const entryExecution:
    NormalizedExecution = {

      id:
        crypto.randomUUID(),

      date:
        `${tradeDate}T09:30:00.000Z`,

      ticker:
        ticker.toUpperCase(),

      contract:
        ticker.toUpperCase(),

      contractKey,

      side: "LONG",

      quantity,

      executionPrice:
        entryPrice,

      executionValue:
        Number(
          (
            quantity *
            entryPrice
          ).toFixed(2)
        ),

      fees:
        Number(
          (
            commission / 2
          ).toFixed(2)
        ),

      account,

      assetType,

      multiplier: 1,
    };

  // =============================================
  // EXIT EXECUTION
  // =============================================

  const exitExecution:
    NormalizedExecution = {

      id:
        crypto.randomUUID(),

      date:
        `${tradeDate}T16:00:00.000Z`,

      ticker:
        ticker.toUpperCase(),

      contract:
        ticker.toUpperCase(),

      contractKey,

      side: "SHORT",

      quantity,

      executionPrice:
        exitPrice,

      executionValue:
        Number(
          (
            quantity *
            exitPrice
          ).toFixed(2)
        ),

      fees:
        Number(
          (
            commission / 2
          ).toFixed(2)
        ),

      account,

      assetType,

      multiplier: 1,
    };

  return [
    entryExecution,
    exitExecution,
  ];
}