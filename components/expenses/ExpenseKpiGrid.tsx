"use client";

import {
  Wallet,
  BarChart3,
  PieChart,
  RefreshCw,
  Receipt,
} from "lucide-react";

import ExpenseKpiCard from "./ExpenseKpiCard";

export default function ExpenseKpiGrid() {
  return (
    <div className="grid grid-cols-5 gap-5">
      <ExpenseKpiCard
        icon={<Wallet className="h-6 w-6 text-white" />}
        iconBg="bg-blue-600/80"
        title="Total Manual Expenses"
        subtitle="This Period"
        value="C$1,284.17"
        trend="↑ 12.4% vs May 1 – May 31"
      />

      <ExpenseKpiCard
        icon={<BarChart3 className="h-6 w-6 text-white" />}
        iconBg="bg-violet-600/80"
        title="Total Commissions"
        subtitle="Auto Calculated"
        value="C$356.44"
        trend="↓ -5.2% vs May 1 – May 31"
        trendColor="red"
        badge="AUTO"
      />

      <ExpenseKpiCard
        icon={<PieChart className="h-6 w-6 text-white" />}
        iconBg="bg-orange-500/80"
        title="Total Trading Costs"
        subtitle="Manual + Commissions"
        value="C$1,640.61"
        trend="↑ 6.7% vs May 1 – May 31"
      />

      <ExpenseKpiCard
        icon={<RefreshCw className="h-6 w-6 text-white" />}
        iconBg="bg-teal-500/80"
        title="Monthly Recurring"
        subtitle="Next 30 Days"
        value="C$842.29"
        trend="↑ 3.1% vs Previous 30 Days"
      />

      <ExpenseKpiCard
        icon={<Receipt className="h-6 w-6 text-white" />}
        iconBg="bg-emerald-600/80"
        title="Tax Deductible Total"
        subtitle="This Period"
        value="C$1,054.66"
        trend="↑ 82.1% of expenses"
      />
    </div>
  );
}