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

import ExpenseKpiCard from "./ExpenseKpiCard";

interface ExpenseKpiGridProps {
  expenses: Expense[];
}

export default function ExpenseKpiGrid({
  expenses,
}: ExpenseKpiGridProps) {
  
  return (
    <div className="grid grid-cols-6 gap-5">
      <ExpenseKpiCard
        icon={<Wallet className="h-6 w-6 text-blue-300" />}
        iconBg="bg-blue-500/15 border border-blue-400/15"
        title="Manual Expenses"
        subtitle="This Period"
        value="C$1,284.17"
        trend="↑ 12.4% vs May 1 – May 31"
      />

      <ExpenseKpiCard
        icon={<BarChart3 className="h-6 w-6 text-violet-300" />}
        iconBg="bg-violet-500/15 border border-violet-400/15"
        title="Commissions"
        subtitle="Auto Calculated"
        value="C$356.44"
        trend="↓ 5.2% vs May 1 – May 31"
        trendColor="red"
        badge="AUTO"
      />

      <ExpenseKpiCard
        icon={<PieChart className="h-6 w-6 text-orange-300" />}
        iconBg="bg-orange-500/15 border border-orange-400/15"
        title="Trading Costs"
        subtitle="Manual + Brokerage"
        value="C$1,640.61"
        trend="↑ 6.7% vs Previous Period"
      />

      <ExpenseKpiCard
        icon={<RefreshCw className="h-6 w-6 text-teal-300" />}
        iconBg="bg-teal-500/15 border border-teal-400/15"
        title="Recurring Costs"
        subtitle="Next 30 Days"
        value="C$842.29"
        trend="↑ 3.1% vs Previous 30 Days"
      />

      <ExpenseKpiCard
        icon={<Receipt className="h-6 w-6 text-emerald-300" />}
        iconBg="bg-emerald-500/15 border border-emerald-400/15"
        title="Tax Deductible"
        subtitle="Eligible Expenses"
        value="C$1,054.66"
        trend="82.1% of Total Expenses"
      />

      <ExpenseKpiCard
        icon={<TrendingUp className="h-6 w-6 text-cyan-300" />}
        iconBg="bg-cyan-500/15 border border-cyan-400/15"
        title="Net P&L After Costs"
        subtitle="Trading Performance"
        value="C$18,472.39"
        trend="↑ 11.2% vs Previous Period"
      />
    </div>
  );
}