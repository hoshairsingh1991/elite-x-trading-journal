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