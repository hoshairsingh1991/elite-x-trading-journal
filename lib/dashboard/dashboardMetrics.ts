import { Trade } from "@/types/trade";

import {
  generatePnLAnalytics,
} from "@/lib/analytics/pnlAnalytics";

export interface DashboardMetrics {
  netPnL: number;

  totalTrades: number;

  winningTrades: number;

  losingTrades: number;

  winRate: number;

  avgWin: number;

  avgLoss: number;

  profitFactor: number;

  expectancy: number;

  bestDay: number;

  worstDay: number;

  streak: number;

  streakType: "WINNING" | "LOSING";

  volatility: number;

  mostTradedSymbol: string;

  averageTradeDurationMinutes: number;
}

// =================================================
// HELPERS
// =================================================

function calculateWinningTrades(
  trades: Trade[]
): number {

  return trades.filter(
    (trade) =>
      trade.status === "WIN"
  ).length;
}

function calculateLosingTrades(
  trades: Trade[]
): number {

  return trades.filter(
    (trade) =>
      trade.status === "LOSS"
  ).length;
}

function calculateAverageLoss(
  trades: Trade[]
): number {

  const losingTrades =
    trades.filter(
      (trade) =>
        trade.status === "LOSS"
    );

  if (
    losingTrades.length === 0
  ) {
    return 0;
  }

  const totalLoss =
    losingTrades.reduce(
      (sum, trade) =>
        sum + Math.abs(trade.pnl),
      0
    );

  return (
    totalLoss /
    losingTrades.length
  );
}

function calculateProfitFactor(
  trades: Trade[]
): number {

  const grossProfit =
    trades
      .filter(
        (trade) =>
          trade.status === "WIN"
      )
      .reduce(
        (sum, trade) =>
          sum + trade.pnl,
        0
      );

  const grossLoss =
    trades
      .filter(
        (trade) =>
          trade.status === "LOSS"
      )
      .reduce(
        (sum, trade) =>
          sum + Math.abs(trade.pnl),
        0
      );

  if (grossLoss === 0) {
    return 0;
  }

  return grossProfit / grossLoss;
}

function calculateExpectancy(
  trades: Trade[]
): number {

  const winningTrades =
    calculateWinningTrades(
      trades
    );

  const losingTrades =
    calculateLosingTrades(
      trades
    );

  const totalClosedTrades =
    winningTrades +
    losingTrades;

  if (
    totalClosedTrades === 0
  ) {
    return 0;
  }

  const grossProfit =
    trades
      .filter(
        (trade) =>
          trade.status === "WIN"
      )
      .reduce(
        (sum, trade) =>
          sum + trade.pnl,
        0
      );

  const avgWin =
    winningTrades > 0
      ? grossProfit /
        winningTrades
      : 0;

  const avgLoss =
    calculateAverageLoss(
      trades
    );

  const winRate =
    winningTrades /
    totalClosedTrades;

  const lossRate =
    losingTrades /
    totalClosedTrades;

  return (
    (winRate * avgWin) -
    (lossRate * avgLoss)
  );
}

function calculateMostTradedSymbol(
  trades: Trade[]
): string {

  if (trades.length === 0) {
    return "";
  }

  const counts:
    Record<string, number> = {};

  trades.forEach((trade) => {

    const ticker =
      trade.ticker;

    counts[ticker] =
      (counts[ticker] || 0) + 1;
  });

  let mostTraded = "";
  let highestCount = 0;

  Object.entries(counts)
    .forEach(([ticker, count]) => {

      if (
        count > highestCount
      ) {

        highestCount = count;
        mostTraded = ticker;
      }
    });

  return mostTraded;
}

function calculateAverageTradeDuration(
  trades: Trade[]
): number {

  const durations: number[] = [];

  trades.forEach((trade) => {

    if (
      trade.openedAt &&
      trade.closedAt
    ) {

      const opened =
        new Date(
          trade.openedAt
        ).getTime();

      const closed =
        new Date(
          trade.closedAt
        ).getTime();

      const minutes =
        (closed - opened) /
        (1000 * 60);

      if (
        minutes > 0
      ) {

        durations.push(
          minutes
        );
      }

      return;
    }

    if (
      trade.holdingDays &&
      trade.holdingDays > 0
    ) {

      durations.push(
        trade.holdingDays *
        24 *
        60
      );
    }
  });

  if (
    durations.length === 0
  ) {
    return 0;
  }

  const total =
    durations.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return (
    total /
    durations.length
  );
}

// =================================================
// MASTER DASHBOARD METRICS
// =================================================

export function getDashboardMetrics(
  trades: Trade[] = []
): DashboardMetrics {

  const analytics =
    generatePnLAnalytics(
      trades,
      "ALL"
    );

  const winningTrades =
    calculateWinningTrades(
      trades
    );

  const losingTrades =
    calculateLosingTrades(
      trades
    );

  const totalTrades =
    trades.filter(
      (trade) =>
        !trade.isOpen
    ).length;

  const netPnL =
    trades.reduce(
      (sum, trade) =>
        sum + (trade.pnl || 0),
      0
    );

  const avgWin =
    winningTrades > 0
      ? trades
          .filter(
            (trade) =>
              trade.status === "WIN"
          )
          .reduce(
            (sum, trade) =>
              sum + trade.pnl,
            0
          ) /
        winningTrades
      : 0;

  const avgLoss =
    calculateAverageLoss(
      trades
    );

  const winRate =
    totalTrades > 0
      ? (
          winningTrades /
          totalTrades
        ) * 100
      : 0;

  return {

    netPnL,

    totalTrades,

    winningTrades,

    losingTrades,

    winRate,

    avgWin,

    avgLoss,

    profitFactor:
      calculateProfitFactor(
        trades
      ),

    expectancy:
      calculateExpectancy(
        trades
      ),

    bestDay:
      analytics.bestDay,

    worstDay:
      analytics.worstDay,

    streak:
      analytics.streak,

    streakType:
      analytics.streakType,

    volatility:
      analytics.volatility,

    mostTradedSymbol:
      calculateMostTradedSymbol(
        trades
      ),

    averageTradeDurationMinutes:
      calculateAverageTradeDuration(
        trades
      ),
  };
}