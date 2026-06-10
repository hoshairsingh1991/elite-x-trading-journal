import { Trade } from "@/types/trade";

export interface SecondaryMetricsAnalyticsData {

  mostTradedTicker: string;

  mostTradedTradeCount: number;

  tradeFrequency: number;

  activeTradingDays: number;
}

// =================================================
// MOST TRADED TICKER
// =================================================

export function calculateMostTradedTicker(
  trades: Trade[]
): {
  ticker: string;
  tradeCount: number;
} {

  if (trades.length === 0) {
    return {
      ticker: "--",
      tradeCount: 0,
    };
  }

  const counts: Record<string, number> = {};

  trades.forEach((trade) => {

    const ticker =
      trade.ticker || "--";

    counts[ticker] =
      (counts[ticker] || 0) + 1;
  });

  const [ticker, tradeCount] =
    Object.entries(counts)
      .sort(
        (a, b) => b[1] - a[1]
      )[0];

  return {
    ticker,
    tradeCount,
  };
}

// =================================================
// ACTIVE TRADING DAYS
// =================================================

export function calculateActiveTradingDays(
  trades: Trade[]
): number {

  return new Set(
    trades.map(
      (trade) =>
        trade.closedAt ||
        trade.date
    )
  ).size;
}

// =================================================
// TRADE FREQUENCY
// =================================================

export function calculateTradeFrequency(
  totalTrades: number,
  activeTradingDays: number
): number {

  if (
    activeTradingDays === 0
  ) {
    return 0;
  }

  return (
    totalTrades /
    activeTradingDays
  );
}

// =================================================
// MASTER ANALYTICS
// =================================================

export function generateSecondaryMetricsAnalytics(
  trades: Trade[]
): SecondaryMetricsAnalyticsData {

  const {
    ticker,
    tradeCount,
  } =
    calculateMostTradedTicker(
      trades
    );

  const activeTradingDays =
    calculateActiveTradingDays(
      trades
    );

  const tradeFrequency =
    calculateTradeFrequency(
      trades.length,
      activeTradingDays
    );

  return {

    mostTradedTicker:
      ticker,

    mostTradedTradeCount:
      tradeCount,

    tradeFrequency,

    activeTradingDays,
  };
}