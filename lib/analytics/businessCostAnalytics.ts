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