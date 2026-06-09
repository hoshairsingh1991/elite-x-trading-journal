import { Trade } from "@/types/trade";

export interface SecondaryMetricsAnalyticsData {
  mostTradedTicker: string;
  mostTradedTradeCount: number;
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

  return {
    mostTradedTicker: ticker,
    mostTradedTradeCount: tradeCount,
  };
}