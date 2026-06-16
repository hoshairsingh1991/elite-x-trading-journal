"use client";

import {
  Wallet,
  BarChart3,
  PieChart,
  RefreshCw,
  Receipt,
  TrendingUp,
} from "lucide-react";

import type { Expense } from "@/lib/types/expense";

import {
  generateExpenseAnalytics,
} from "@/lib/analytics/expenseAnalytics";

import ExpenseKpiCard from "./ExpenseKpiCard";

interface ExpenseKpiGridProps {
  expenses: Expense[];
}

export default function ExpenseKpiGrid({
  expenses,
}: ExpenseKpiGridProps) {

  const analytics =
    generateExpenseAnalytics(
      expenses
    );

  return (
    <div className="grid grid-cols-6 gap-5">
      <ExpenseKpiCard
        icon={<Wallet className="h-6 w-6 text-blue-300" />}
        iconBg="bg-blue-500/15 border border-blue-400/15"
        title="Manual Expenses"
        subtitle="This Period"
        value={`$${analytics.totalExpenses.toFixed(2)}`}
trend={`${expenses.length} expense records`}
      />

      <ExpenseKpiCard
        icon={<BarChart3 className="h-6 w-6 text-violet-300" />}
        iconBg="bg-violet-500/15 border border-violet-400/15"
        title="Commissions"
        subtitle="Auto Calculated"
        value="Coming Soon"
        trend="↓"
        trendColor="red"
        badge="AUTO"
      />

     <ExpenseKpiCard
  icon={<PieChart className="h-6 w-6 text-orange-300" />}
  iconBg="bg-orange-500/15 border border-orange-400/15"
  title="Trading Costs"
  subtitle="Manual + Brokerage"
  value="Coming Soon"
  trend="Expense + Trade Analytics"
/>

      <ExpenseKpiCard
        icon={<RefreshCw className="h-6 w-6 text-teal-300" />}
        iconBg="bg-teal-500/15 border border-teal-400/15"
        title="Recurring Costs"
        subtitle="Next 30 Days"
        value={`$${analytics.recurringExpenses.toFixed(2)}`}
trend="Recurring Expense Total"
      />

      <ExpenseKpiCard
        icon={<Receipt className="h-6 w-6 text-emerald-300" />}
        iconBg="bg-emerald-500/15 border border-emerald-400/15"
        title="Tax Deductible"
        subtitle="Eligible Expenses"
        value={`$${analytics.taxDeductibleAmount.toFixed(2)}`}
trend={`${analytics.deductiblePercent.toFixed(1)}% of Total Expenses`}
      />

      <ExpenseKpiCard
        icon={<TrendingUp className="h-6 w-6 text-cyan-300" />}
        iconBg="bg-cyan-500/15 border border-cyan-400/15"
        title="Net P&L After Costs"
        subtitle="Trading Performance"
         value="Coming Soon"
        trend="↑"
      />
    </div>
  );
}