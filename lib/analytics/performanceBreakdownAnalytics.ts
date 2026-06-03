import {
  Trade,
} from "@/types/trade";

export interface PerformanceBreakdownData {

  longPnL: number;

  shortPnL: number;

  commissions: number;

  Expenses: number;

  netTradingPnL: number;

  realProfit: number;
}

// =================================================
// LONG P&L
// =================================================

export function calculateLongPnL(
  trades: Trade[]
): number {

  return trades
    .filter(
      (trade) =>
        trade.side === "LONG"
    )
    .reduce(
      (
        total,
        trade
      ) =>
        total + trade.pnl,
      0
    );
}

// =================================================
// SHORT P&L
// =================================================

export function calculateShortPnL(
  trades: Trade[]
): number {

  return trades
    .filter(
      (trade) =>
        trade.side === "SHORT"
    )
    .reduce(
      (
        total,
        trade
      ) =>
        total + trade.pnl,
      0
    );
}

// =================================================
// COMMISSIONS
// =================================================

export function calculateCommissions(
  trades: Trade[]
): number {

  return trades.reduce(
    (
      total,
      trade
    ) =>
      total + trade.fees,
    0
  );
}

// =================================================
// MASTER PERFORMANCE BREAKDOWN
// =================================================

export function generatePerformanceBreakdownAnalytics(
  trades: Trade[],
  Expenses: number
): PerformanceBreakdownData {

  const longPnL =
    calculateLongPnL(
      trades
    );

  const shortPnL =
    calculateShortPnL(
      trades
    );

  const commissions =
    calculateCommissions(
      trades
    );

  const netTradingPnL =
  longPnL +
  shortPnL;

  const realProfit =
    netTradingPnL -
    Expenses;

  return {

    longPnL,

    shortPnL,

    commissions,

    Expenses,

    netTradingPnL,

    realProfit,
  };
}