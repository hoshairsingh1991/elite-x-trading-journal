
export interface TradingScoreAnalyticsData {
  profitabilityScore: number | null;
  calmarScore: number | null;
  reliabilityScore: number | null;
  tradingScore: number | null;
}

// =================================================
// PROFIT FACTOR SCORE
// =================================================

export function calculateProfitFactorScore(
  profitFactor: number
): number | null {

  // NaN and negative values are invalid.
  // Positive Infinity is allowed: it can represent
  // positive gross profit with no gross losses.

  if (
    Number.isNaN(profitFactor) ||
    profitFactor < 0
  ) {
    return null;
  }

  if (profitFactor >= 2.0) {
    return 100;
  }

  if (profitFactor >= 1.5) {
    return 80;
  }

  if (profitFactor >= 1.25) {
    return 60;
  }

  if (profitFactor >= 1.0) {
    return 40;
  }

  return 20;
}

// =================================================
// PROFITABILITY SCORE
// =================================================

export function calculateProfitabilityScore(
  profitFactor: number
): number | null {

  return calculateProfitFactorScore(
    profitFactor
  );
}

// =================================================
// CALMAR SCORE
// =================================================

export function calculateCalmarScore(
  calmarRatio: number
): number | null {

  if (!Number.isFinite(calmarRatio)) {
    return null;
  }

  if (calmarRatio >= 3.0) {
    return 100;
  }

  if (calmarRatio >= 2.0) {
    return 80;
  }

  if (calmarRatio >= 1.0) {
    return 60;
  }

  if (calmarRatio >= 0.5) {
    return 40;
  }

  return 20;
}

// =================================================
// RELIABILITY SCORE
// =================================================

export function calculateReliabilityScore(
  totalTrades: number
): number {

  if (totalTrades >= 250) {
    return 100;
  }

  if (totalTrades >= 100) {
    return 80;
  }

  if (totalTrades >= 50) {
    return 60;
  }

  if (totalTrades >= 20) {
    return 40;
  }

  return 20;
}

// =================================================
// TRADING SCORE
// =================================================

export function calculateTradingScore(
  profitabilityScore: number,
  consistencyScore: number,
  calmarScore: number,
  reliabilityScore: number
): number {

  return Math.round(
    (
      profitabilityScore +
      consistencyScore +
      calmarScore +
      reliabilityScore
    ) / 4
  );
}

// =================================================
// MASTER TRADING SCORE ANALYTICS
// =================================================

export function generateTradingScoreAnalytics(
  profitFactor: number,
  calmarRatio: number | null,
  totalTrades: number,
  consistencyScore: number | null
): TradingScoreAnalyticsData {

  // =================================================
  // NO TRADING ACTIVITY
  // =================================================

  if (
    !Number.isFinite(totalTrades) ||
    totalTrades <= 0
  ) {
    return {
      profitabilityScore: null,
      calmarScore: null,
      reliabilityScore: null,
      tradingScore: null,
    };
  }

  // =================================================
  // INDIVIDUAL COMPONENT SCORES
  // =================================================

  const profitabilityScore =
    calculateProfitabilityScore(
      profitFactor
    );

  const calmarScore =
    calmarRatio === null
      ? null
      : calculateCalmarScore(
          calmarRatio
        );

  const reliabilityScore =
    calculateReliabilityScore(
      totalTrades
    );

  // Consistency must be a valid score from 0–100.

  const validConsistencyScore =
    consistencyScore !== null &&
    Number.isFinite(consistencyScore) &&
    consistencyScore >= 0 &&
    consistencyScore <= 100
      ? consistencyScore
      : null;

  // =================================================
  // OVERALL TRADING SCORE
  // =================================================

  // Every component has a fixed 25% weight.
  // Missing components must not be treated as zero
  // or cause the remaining weights to be redistributed.

  const hasAllComponents =
    profitabilityScore !== null &&
    validConsistencyScore !== null &&
    calmarScore !== null;

  const tradingScore =
    hasAllComponents
      ? calculateTradingScore(
          profitabilityScore,
          validConsistencyScore,
          calmarScore,
          reliabilityScore
        )
      : null;

  return {
    profitabilityScore,
    calmarScore,
    reliabilityScore,
    tradingScore,
  };
}
