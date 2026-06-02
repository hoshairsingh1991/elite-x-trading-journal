export type RiskStatus =
  | "LOW"
  | "MODERATE"
  | "ELEVATED"
  | "HIGH";

export interface RiskAnalyticsData {

  riskStatus: RiskStatus;

  consistencyScore: number;

  tradingScore: number;
}

// =================================================
// RISK STATUS
// =================================================

export function calculateRiskStatus(
  currentDrawdown: number,
  profitFactor: number
): RiskStatus {

  if (
    currentDrawdown === 0 &&
    profitFactor >= 1.5
  ) {
    return "LOW";
  }

  if (
    profitFactor >= 1.25
  ) {
    return "MODERATE";
  }

  if (
    profitFactor >= 1.0
  ) {
    return "ELEVATED";
  }

  return "HIGH";
}

// =================================================
// MASTER RISK ANALYTICS
// =================================================

export function generateRiskAnalytics(
  currentDrawdown: number,
  profitFactor: number
): RiskAnalyticsData {

  const riskStatus =
    calculateRiskStatus(
      currentDrawdown,
      profitFactor
    );

  return {

    riskStatus,

    consistencyScore: 0,

    tradingScore: 0,
  };
}