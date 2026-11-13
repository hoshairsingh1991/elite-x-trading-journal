
import type {
  DailyPnLData,
} from "@/lib/analytics/pnlAnalytics";

export interface EquityAnalyticsData {
  equityCurve: number[];
  maxDrawdown: number;
  currentDrawdown: number;
  calmarRatio: number | null;
}

// =================================================
// MAX DRAWDOWN
// =================================================

export function calculateMaxDrawdown(
  equityCurve: number[]
): number {

  // Initial equity is zero.
  // Drawdown must include losses from this baseline,
  // even when the first observed P&L is negative.

  let peak = 0;
  let maxDrawdown = 0;

  for (const equity of equityCurve) {

    if (equity > peak) {
      peak = equity;
    }

    const drawdown =
      peak - equity;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

// =================================================
// CURRENT DRAWDOWN
// =================================================

export function calculateCurrentDrawdown(
  equityCurve: number[]
): number {

  if (equityCurve.length === 0) {
    return 0;
  }

  // Include initial equity of zero when finding
  // the historical high-water mark.

  let peak = 0;

  for (const equity of equityCurve) {

    if (equity > peak) {
      peak = equity;
    }
  }

  const current =
    equityCurve[equityCurve.length - 1];

  return Math.max(
    peak - current,
    0
  );
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

      runningTotal += day.pnl;

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
): number | null {

  // A zero or invalid denominator makes this
  // ratio unavailable, not zero.

  if (
    !Number.isFinite(netPnL) ||
    !Number.isFinite(maxDrawdown) ||
    maxDrawdown <= 0
  ) {
    return null;
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
    buildEquityCurve(dailyPnL);

  const maxDrawdown =
    calculateMaxDrawdown(equityCurve);

  const currentDrawdown =
    calculateCurrentDrawdown(equityCurve);

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
