export interface TradingScoreAnalyticsData {

  profitabilityScore: number;

  calmarScore: number;

  reliabilityScore: number;

  tradingScore: number;
}

// =================================================
// PROFIT FACTOR SCORE
// =================================================

export function calculateProfitFactorScore(
  profitFactor: number
): number {

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
): number {

  return calculateProfitFactorScore(
    profitFactor
  );
}

// =================================================
// CALMAR SCORE
// =================================================

export function calculateCalmarScore(
  calmarRatio: number
): number {

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
  calmarRatio: number,
  totalTrades: number,
  consistencyScore: number
): TradingScoreAnalyticsData {

  const profitabilityScore =
    calculateProfitabilityScore(
      profitFactor
    );

  const calmarScore =
    calculateCalmarScore(
      calmarRatio
    );

  const reliabilityScore =
    calculateReliabilityScore(
      totalTrades
    );

  const tradingScore =
    calculateTradingScore(
      profitabilityScore,
      consistencyScore,
      calmarScore,
      reliabilityScore
    );

  return {

    profitabilityScore,

    calmarScore,

    reliabilityScore,

    tradingScore,
  };
}