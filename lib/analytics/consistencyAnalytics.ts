export interface ConsistencyAnalyticsData {

  consistencyScore: number;
}

// =================================================
// WINNING DAY PERCENTAGE
// =================================================

export function calculateWinningDayPercentage(
  winningDays: number,
  totalDays: number
): number {

  if (
    totalDays === 0
  ) {
    return 0;
  }

  return (
    winningDays /
    totalDays
  ) * 100;
}

// =================================================
// EQUITY SMOOTHNESS
// =================================================

export function calculateEquitySmoothness(
  equityCurve: number[]
): number {

  if (
    equityCurve.length < 2
  ) {
    return 0;
  }

  let positiveMoves = 0;

  for (
    let i = 1;
    i < equityCurve.length;
    i++
  ) {

    if (
      equityCurve[i] >
      equityCurve[i - 1]
    ) {

      positiveMoves++;
    }
  }

  return (
    positiveMoves /
    (equityCurve.length - 1)
  ) * 100;
}

// =================================================
// CONSISTENCY SCORE
// =================================================

export function calculateConsistencyScore(
  winningDayPercentage: number,
  volatility: number,
  smoothness: number
): number {

  let volatilityAdjustment = 0;

  if (
    volatility <= 75
  ) {

    volatilityAdjustment = 10;
  }
  else if (
    volatility <= 150
  ) {

    volatilityAdjustment = 0;
  }
  else {

    volatilityAdjustment = -10;
  }

  let smoothnessAdjustment = 0;

  if (
    smoothness >= 60
  ) {

    smoothnessAdjustment = 5;
  }

  const score =
    winningDayPercentage +
    volatilityAdjustment +
    smoothnessAdjustment;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );
}

// =================================================
// MASTER CONSISTENCY ANALYTICS
// =================================================

export function generateConsistencyAnalytics(
  winningDays: number,
  totalDays: number,
  volatility: number,
  equityCurve: number[]
): ConsistencyAnalyticsData {

  const winningDayPercentage =
    calculateWinningDayPercentage(
      winningDays,
      totalDays
    );

  const smoothness =
    calculateEquitySmoothness(
      equityCurve
    );

  const consistencyScore =
    calculateConsistencyScore(
      winningDayPercentage,
      volatility,
      smoothness
    );

  return {

    consistencyScore,
  };
}