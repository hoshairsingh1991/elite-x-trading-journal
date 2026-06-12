import {
  Trade,
} from "@/types/trade";

export interface PerformanceBreakdownData {
  longPnL: number;
  shortPnL: number;

  commissions: number;

  netTradingPnL: number;
  grossPnL: number;

  longTrades: number;
  shortTrades: number;

  longPercentage: number;
  shortPercentage: number;
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
  trades: Trade[]
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

const grossPnL =
  netTradingPnL +
  Math.abs(commissions);


    const longTrades =
  trades.filter(
    trade => trade.side === "LONG"
  ).length;

const shortTrades =
  trades.filter(
    trade => trade.side === "SHORT"
  ).length;

const totalDirectionalTrades =
  longTrades +
  shortTrades;

const longPercentage =
  totalDirectionalTrades > 0
    ? (longTrades / totalDirectionalTrades) * 100
    : 0;

const shortPercentage =
  totalDirectionalTrades > 0
    ? (shortTrades / totalDirectionalTrades) * 100
    : 0;

return {

  longPnL,

  shortPnL,

  commissions,


  grossPnL,

  netTradingPnL,


  longTrades,

  shortTrades,

  longPercentage,

  shortPercentage,
};
}