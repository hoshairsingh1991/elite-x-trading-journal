import {
  DailyPnLData,
} from "@/lib/analytics/pnlAnalytics";

export interface EquityAnalyticsData {

  equityCurve: number[];

  maxDrawdown: number;

  currentDrawdown: number;

  calmarRatio: number;
}

// =================================================
// MAX DRAWDOWN
// =================================================

export function calculateMaxDrawdown(
  equityCurve: number[]
): number {

  if (
    equityCurve.length === 0
  ) {
    return 0;
  }

  let peak =
    equityCurve[0];

  let maxDrawdown = 0;

  equityCurve.forEach(
    (equity) => {

      if (
        equity > peak
      ) {

        peak = equity;
      }

      const drawdown =
        peak - equity;

      if (
        drawdown >
        maxDrawdown
      ) {

        maxDrawdown =
          drawdown;
      }
    }
  );

  return maxDrawdown;
}

// =================================================
// CURRENT DRAWDOWN
// =================================================

export function calculateCurrentDrawdown(
  equityCurve: number[]
): number {

  if (
    equityCurve.length === 0
  ) {
    return 0;
  }

  const peak =
    Math.max(
      ...equityCurve
    );

  const current =
    equityCurve[
      equityCurve.length - 1
    ];

  return peak - current;
}

// =================================================
// EQUITY CURVE
// =================================================

export function buildEquityCurve(
  dailyPnL: DailyPnLData[]
): number[] {

  let runningTotal = 0;

  return dailyPnL.map(
    (day) => {

      runningTotal +=
        day.pnl;

      return runningTotal;
    }
  );
}

// =================================================
// PROFIT TO DRAWDOWN RATIO
// =================================================

export function calculateCalmarRatio(
  netPnL: number,
  maxDrawdown: number
): number {

  if (
    maxDrawdown <= 0
  ) {
    return 0;
  }

  return (
    netPnL /
    maxDrawdown
  );
}

// =================================================
// MASTER EQUITY ANALYTICS
// =================================================

export function generateEquityAnalytics(
  dailyPnL: DailyPnLData[],
  netPnL: number
): EquityAnalyticsData {

  const equityCurve =
    buildEquityCurve(
      dailyPnL
    );

  const maxDrawdown =
    calculateMaxDrawdown(
      equityCurve
    );

  const currentDrawdown =
    calculateCurrentDrawdown(
      equityCurve
    );

    const calmarRatio =
  calculateCalmarRatio(
    netPnL,
    maxDrawdown
  );

  return {

  equityCurve,

  maxDrawdown,

  currentDrawdown,

  calmarRatio,
};
}