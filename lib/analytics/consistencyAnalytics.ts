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
      smoothness
    );

  return {

    consistencyScore,
  };
}