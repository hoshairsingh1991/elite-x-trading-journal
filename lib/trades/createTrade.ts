import { Trade } from "@/types/trade";

interface CreateTradeParams {

  ticker: string;

  quantity: number;

  entryPrice: number;

  exitPrice: number;

  commission: number;

  side?: "LONG" | "SHORT";

  assetType?: string;

  account?: string;

  tradeDate?: string;
}

export function createTrade({

  ticker,

  quantity,

  entryPrice,

  exitPrice,

  commission,

  side = "LONG",

  assetType = "FUTURES",

  account = "",

  tradeDate =
    new Date().toLocaleDateString(
      "en-CA"
    ),

}: CreateTradeParams): Trade {

  // =================================================
  // BASIC PNL CALCULATION
  // =================================================

  const grossPnl =
    side === "LONG"
      ? (
          exitPrice -
          entryPrice
        ) * quantity
      : (
          entryPrice -
          exitPrice
        ) * quantity;

  const netPnl =
    grossPnl -
    commission;

  // =================================================
  // STATUS
  // =================================================

  let status:
    Trade["status"] =
      "BREAKEVEN";

  if (netPnl > 0) {

    status = "WIN";
  }

  if (netPnl < 0) {

    status = "LOSS";
  }

  // =================================================
  // TIMESTAMP
  // =================================================

  const timestamp =
    new Date().toISOString();

  // =================================================
  // CANONICAL TRADE OBJECT
  // =================================================

  const trade: Trade = {

    id:
      crypto.randomUUID(),

    // =================================================
    // BASIC INFO
    // =================================================

    ticker:
      ticker.toUpperCase(),

    side,

    status,

    date:
      tradeDate,

    assetType,

    account,

    // =================================================
    // EXECUTION
    // =================================================

    entryPrice,

    exitPrice,

    quantity,

    // =================================================
    // PERFORMANCE
    // =================================================

    pnl:
      Number(
        netPnl.toFixed(2)
      ),

    fees:
      Number(
        commission.toFixed(2)
      ),

    currency:
      "USD",

    feeCurrency:
      "USD",

    // =================================================
    // OPEN POSITION SUPPORT
    // =================================================

    isOpen: false,

    openedAt:
      tradeDate,

    closedAt:
      tradeDate,

    // =================================================
    // JOURNALING
    // =================================================

    notes: "",

    // =================================================
    // METADATA
    // =================================================

    createdAt:
      timestamp,

    updatedAt:
      timestamp,
  };

  return trade;
}