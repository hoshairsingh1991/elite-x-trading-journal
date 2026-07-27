"use client";

import {
  Wallet,
  BarChart3,
  PieChart,
  RefreshCw,
  Receipt,
  TrendingUp,
} from "lucide-react";

import type {
  ReportingExpense,
} from "@/lib/types/expense";

import {
  generateExpenseAnalytics,
} from "@/lib/analytics/expenseAnalytics";

import ExpenseKpiCard from "./ExpenseKpiCard";

import {
  BusinessCostAnalyticsData,
} from "@/lib/analytics/businessCostAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

interface ExpenseKpiGridProps {
  expenses: ReportingExpense[];

  businessCostAnalytics:
    BusinessCostAnalyticsData;

  reportingCurrency: string;
}

export default function ExpenseKpiGrid({
  expenses,
  businessCostAnalytics,
  reportingCurrency,
}: ExpenseKpiGridProps) {

  const analytics =
    generateExpenseAnalytics(
      expenses
    );

    const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

  return (
    <div className=" grid grid-cols-6 gap-5">
      <ExpenseKpiCard
        icon={<Wallet className="h-6 w-6 text-blue-300" />}
        iconBg="bg-blue-500/15 border border-blue-400/15"
        title="Manual Expenses"
        subtitle="This Period"
        value={`${currencySymbol}${analytics.totalExpenses.toFixed(2)}`}
trend={`${expenses.length} expense records`}
      />

<ExpenseKpiCard
  icon={<BarChart3 className="h-6 w-6 text-violet-300" />}
  iconBg="bg-violet-500/15 border border-violet-400/15"
  title="Commissions"
  subtitle="Auto Calculated"
  subtitleOffsetY="-translate-y-[5px]"
  value={`${currencySymbol}${businessCostAnalytics.commissions.toFixed(2)}`}
  trend="Imported From Trade History"
  badge="AUTO"
/>

<ExpenseKpiCard
  icon={<PieChart className="h-6 w-6 text-orange-300" />}
  iconBg="bg-orange-500/15 border border-orange-400/15"
  title="Trading Costs"
  subtitle="Manual + Brokerage"
  value={`${currencySymbol}${businessCostAnalytics.totalBusinessCosts.toFixed(2)}`}
  trend="Manual Expenses + Commissions"
/>

      <ExpenseKpiCard
        icon={<RefreshCw className="h-6 w-6 text-teal-300" />}
        iconBg="bg-teal-500/15 border border-teal-400/15"
        title="Recurring Costs"
        subtitle="Next 30 Days"
        value={`${currencySymbol}${analytics.recurringExpenses.toFixed(2)}`}
trend="Recurring Expense Total"
      />

      <ExpenseKpiCard
        icon={<Receipt className="h-6 w-6 text-emerald-300" />}
        iconBg="bg-emerald-500/15 border border-emerald-400/15"
        title="Tax Deductible"
        subtitle="Eligible Expenses"
        value={`${currencySymbol}${analytics.taxDeductibleAmount.toFixed(2)}`}
trend={`${analytics.deductiblePercent.toFixed(1)}% of Total Expenses`}
      />

<ExpenseKpiCard
  icon={<TrendingUp className="h-6 w-6 text-cyan-300" />}
  iconBg="bg-cyan-500/15 border border-cyan-400/15"
  title="Net Business Profit"
  subtitle="After Operating Costs"
  value={`${currencySymbol}${businessCostAnalytics.netBusinessProfit.toFixed(2)}`}
  trend="Trading P&L - Manual Expenses"
/>
    </div>
  );
}