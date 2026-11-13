
export interface ConsistencyAnalyticsData {
  consistencyScore: number | null;
}

// =================================================
// WINNING DAY PERCENTAGE
// =================================================

export function calculateWinningDayPercentage(
  winningDays: number,
  totalDays: number
): number | null {

  if (
    !Number.isInteger(winningDays) ||
    !Number.isInteger(totalDays) ||
    totalDays <= 0 ||
    winningDays < 0 ||
    winningDays > totalDays
  ) {
    return null;
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
): number | null {

  // At least two observations are required
  // to measure movement between observations.

  if (
    equityCurve.length < 2 ||
    !equityCurve.every(Number.isFinite)
  ) {
    return null;
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
  smoothness: number
): number {

  return Math.round(
    (
      winningDayPercentage * 0.7
    ) +
    (
      smoothness * 0.3
    )
  );
}

// =================================================
// MASTER CONSISTENCY ANALYTICS
// =================================================

export function generateConsistencyAnalytics(
  winningDays: number,
  totalDays: number,
  equityCurve: number[]
): ConsistencyAnalyticsData {

  // The equity curve and daily trading observations
  // must represent the same number of days.

  if (
    equityCurve.length !== totalDays
  ) {
    return {
      consistencyScore: null,
    };
  }

  const winningDayPercentage =
    calculateWinningDayPercentage(
      winningDays,
      totalDays
    );

  const smoothness =
    calculateEquitySmoothness(
      equityCurve
    );

  // Do not interpret missing observations as
  // a genuine consistency score of zero.

  if (
    winningDayPercentage === null ||
    smoothness === null
  ) {
    return {
      consistencyScore: null,
    };
  }

  const consistencyScore =
    calculateConsistencyScore(
      winningDayPercentage,
      smoothness
    );

  return {
    consistencyScore,
  };
}
