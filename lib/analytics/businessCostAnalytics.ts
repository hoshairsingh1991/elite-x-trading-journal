import { Trade } from "@/types/trade";
import { Expense } from "@/lib/types/expense";

import {
  calculateTotalExpenses,
} from "./expenseAnalytics";

export interface BusinessCostAnalyticsData {

  commissions: number;

  totalBusinessCosts: number;

  netBusinessProfit: number;
}

export interface BusinessIntelligenceMetrics {

  expenseEfficiency: number;

  avgCostPerTrade: number;

  commissionPerTrade: number;

  expensePerTrade: number;

  profitRetention: number;

  monthlyBurn: number;

  projectedAnnualBurn: number;

  totalTrades: number;

  monthsCovered: number;
}

// =================================================
// COMMISSIONS
// =================================================

export function calculateTotalCommissions(
  trades: Trade[]
): number {

return trades.reduce(
  (
    total,
    trade
  ) =>
    total + Math.abs(trade.fees),
  0
);
}

// =================================================
// MONTHLY COMMISSIONS
// =================================================

export function calculateMonthlyCommissions(
  trades: Trade[]
): Record<string, number> {

  const grouped:
    Record<string, number> = {};

  trades.forEach((trade) => {

    const date =
      new Date(
        trade.date +
        "T12:00:00"
      );

    const month =
      date.toLocaleString(
        "en-US",
        {
          month: "short",
        }
      );

    grouped[month] =
      (grouped[month] || 0) +
      Math.abs(trade.fees);
  });

  return grouped;
}

// =================================================
// WEEKLY COMMISSIONS
// =================================================

export function calculateWeeklyCommissions(
  trades: Trade[]
): Record<string, number> {

  const grouped:
    Record<string, number> = {};

  trades.forEach((trade) => {

    const date =
      new Date(
        trade.date +
        "T12:00:00"
      );

    const week =
      Math.ceil(
        date.getDate() / 7
      );

    const key = `W${week}`;

    grouped[key] =
      (grouped[key] || 0) +
      Math.abs(trade.fees);
  });

  return grouped;
}

// =================================================
// TOTAL BUSINESS COSTS
// =================================================

export function calculateTotalBusinessCosts(
  expenses: Expense[],
  trades: Trade[]
): number {

  return (
    calculateTotalExpenses(
      expenses
    ) +
    calculateTotalCommissions(
      trades
    )
  );
}

// =================================================
// NET BUSINESS PROFIT
// =================================================

export function calculateNetBusinessProfit(
  expenses: Expense[],
  netTradingPnL: number
): number {

  return (
    netTradingPnL -
    calculateTotalExpenses(
      expenses
    )
  );
}

// =================================================
// MASTER ANALYTICS
// =================================================

export function generateBusinessCostAnalytics(
  expenses: Expense[],
  trades: Trade[],
  netTradingPnL: number
): BusinessCostAnalyticsData {

  const commissions =
    calculateTotalCommissions(
      trades
    );

  const totalBusinessCosts =
    calculateTotalBusinessCosts(
      expenses,
      trades
    );

  const netBusinessProfit =
    calculateNetBusinessProfit(
      expenses,
      netTradingPnL
    );

  return {

    commissions,

    totalBusinessCosts,

    netBusinessProfit,
  };
}

// =================================================
// BUSINESS INTELLIGENCE METRICS
// =================================================

export function generateBusinessIntelligenceMetrics(
  expenses: Expense[],
  trades: Trade[],
  netTradingPnL: number
): BusinessIntelligenceMetrics {

  const totalExpenses =
    calculateTotalExpenses(
      expenses
    );

  const totalCommissions =
    calculateTotalCommissions(
      trades
    );

  const totalTrades =
    trades.length;

  const netBusinessProfit =
    calculateNetBusinessProfit(
      expenses,
      netTradingPnL
    );

  const expenseEfficiency =
    totalExpenses > 0
      ? netTradingPnL /
        totalExpenses
      : 0;

  const commissionPerTrade =
    totalTrades > 0
      ? totalCommissions /
        totalTrades
      : 0;

  const expensePerTrade =
    totalTrades > 0
      ? totalExpenses /
        totalTrades
      : 0;

  const avgCostPerTrade =
    totalTrades > 0
      ? (
          totalCommissions +
          totalExpenses
        ) /
        totalTrades
      : 0;

  const profitRetention =
    netTradingPnL > 0
      ? (
          netBusinessProfit /
          netTradingPnL
        ) * 100
      : 0;

  let monthsCovered = 1;

  if (expenses.length > 0) {

    const dates =
      expenses.map(
        (expense) =>
          new Date(
            expense.expense_date +
            "T12:00:00"
          )
      );

    const earliest =
      new Date(
        Math.min(
          ...dates.map(
            (date) =>
              date.getTime()
          )
        )
      );

    const latest =
      new Date(
        Math.max(
          ...dates.map(
            (date) =>
              date.getTime()
          )
        )
      );

    monthsCovered =
      (
        latest.getFullYear() -
        earliest.getFullYear()
      ) *
        12 +
      (
        latest.getMonth() -
        earliest.getMonth()
      ) +
      1;

    monthsCovered =
      Math.max(
        1,
        monthsCovered
      );
  }

  const monthlyBurn =
    totalExpenses /
    monthsCovered;

  const projectedAnnualBurn =
    monthlyBurn * 12;

  return {

    expenseEfficiency,

    avgCostPerTrade,

    commissionPerTrade,

    expensePerTrade,

    profitRetention,

    monthlyBurn,

    projectedAnnualBurn,

    totalTrades,

    monthsCovered,
  };
}