"use client";

import Image from "next/image";

import type { Expense } from "@/lib/types/expense";

import {
  calculateUpcomingRenewals,
} from "@/lib/analytics/expenseAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import MetricInfoTooltip from "@/components/dashboard-v2/MetricInfoTooltip";

import { CalendarSync } from "lucide-react";



import {
  CalendarClock,
  Flame,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import type {
  BusinessIntelligenceMetrics,
} from "@/lib/analytics/businessCostAnalytics";

interface ExpensesIntelligenceSectionProps {
  expenses: Expense[];
  metrics: BusinessIntelligenceMetrics;
  reportingCurrency: string;
}

export default function ExpensesIntelligenceSection({
  expenses,
  metrics,
  reportingCurrency,
}: ExpensesIntelligenceSectionProps) {

  const upcomingRenewals =
    calculateUpcomingRenewals(
      expenses
    );

const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

  const retentionPercentage =
  Math.min(
    100,
    Math.max(
      0,
      metrics.profitRetention
    )
  );

const retentionDegrees =
  (retentionPercentage / 100) *
  360;

    const vendorIcons: Record<string, string> = {
  
  TradingView:
    "/icons/expenses/tradingview.png",

  DigitalOcean:
    "/icons/expenses/digitalocean.png",

  NinjaTrader:
    "/icons/expenses/ninjatrader.png",

  CME:
    "/icons/expenses/cme.png",
};

const getRenewalColor = (
  daysRemaining: number
) => {

  if (daysRemaining <= 14) {
    return "text-red-400";
  }

  if (daysRemaining <= 30) {
    return "text-orange-400";
  }

  if (daysRemaining <= 90) {
    return "text-yellow-400";
  }

  return "text-slate-400";
};

    /* =====================================================
   PROFIT RETENTION FINE TUNING
   ===================================================== */

const profitHeaderX = "translate-x-2";
const profitHeaderY = "translate-y-2";

const profitValueX = "translate-x-4";
const profitValueY = "translate-y-4";

const profitSubtitleX = "translate-x-0";
const profitSubtitleY = "translate-y-2";

const profitMetricsX = "translate-x-4";
const profitMetricsY = "translate-y-9";
const profitMetricsWidth = "w-[90%]";


/* =====================================================
   PROJECTED ANNUAL FINE TUNING
   ===================================================== */

const projectedHeaderX = "translate-x-2";
const projectedHeaderY = "translate-y-2";

const projectedValueX = "translate-x-5";
const projectedValueY = "translate-y-4";

const projectedMetricsX = "translate-x-4";
const projectedMetricsY = "translate-y-14";
const projectedMetricsWidth = "w-[90%]";

const projectedSubtitleX = "translate-x-0";
const projectedSubtitleY = "translate-y-2";


/* =====================================================
   MONTHLY BURN FINE TUNING
   ===================================================== */

const burnHeaderX = "translate-x-2";
const burnHeaderY = "translate-y-2";

const burnValueX = "translate-x-5";
const burnValueY = "translate-y-4";

const burnTrendX = "translate-x-0";
const burnTrendY = "translate-y-2";

const burnChartX = "translate-x-54";
const burnChartY = "-translate-y-7";

const burnMetricsX = "translate-x-4";
const burnMetricsY = "translate-y-9";
const burnMetricsWidth = "w-[90%]";




/* =====================================================
   UPCOMING RENEWALS FINE TUNING
   ===================================================== */

const renewalsHeaderX = "translate-x-2";
const renewalsHeaderY = "translate-y-2";

const renewalsButtonX = "-translate-x-4";
const renewalsButtonY = "translate-y-0";

const renewalsListX = "translate-x-4";
const renewalsListY = "translate-y-4";

const renewalsWidth = "w-[90%]";

const renewalIconX = "-translate-x-0.6";
const renewalIconY = "translate-y-0";

const renewalIconSize = 24;

const renewalNameX = "translate-x-3";
const renewalNameY = "translate-y-0";

const renewalDateX = "translate-x-4";
const renewalDateY = "translate-y-0";

const renewalDaysX = "-translate-x-5";
const renewalDaysY = "translate-y-0";

  /* =====================================================
   AVG COST PER TRADE FINE TUNING
   ===================================================== */

const avgHeaderX = "translate-x-2";
const avgHeaderY = "translate-y-2";

const avgTrendX = "-translate-x-2";
const avgTrendY = "translate-y-2";

const avgValueX = "translate-x-6";
const avgValueY = "translate-y-5";

const avgMetricsX = "translate-x-4";
const avgMetricsY = "translate-y-9";
const avgMetricsWidth = "w-[90%]";

    /* =====================================================
   EXPENSE EFFICIENCY FINE TUNING
   ===================================================== */

// Header (icon + title)
const headerX = "translate-x-2";
const headerY = "translate-y-2";

// Status badge ("Excellent")
const statusX = "-translate-x-4";
const statusY = "translate-y-2";


const scoreX = "translate-x-4";
const scoreY = "translate-y-5";

const scoreTrendX = "translate-x-0";
const scoreTrendY = "translate-y-1";

// Sparkline
const sparklineX = "translate-x-2";
const sparklineY = "translate-y-3";

// Metrics section
const metricsX = "translate-x-4";
const metricsY = "translate-y-9";
const metricsWidth = "w-[90%]";


 const cardClass =
  "group flex h-[200px] flex-col rounded-[22px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-200 hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.045]";

const renewalBoxSize = "h-6 w-6"; // try h-7 w-7, h-8 w-8, h-9 w-9

 return (
  <>
    <svg
      width="0"
      height="0"
      className="absolute"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="renewalGradient"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
    </svg>

    return (
  <div className=" -translate-y-2 grid grid-cols-6 gap-5">



<div className={`${cardClass} px-6 py-6`}>
  {/* ============================================= */}
  {/* Header */}
  {/* ============================================= */}

  <div className="flex items-start justify-between">
   <div
  className={`
    flex items-center gap-2

    ${headerX}
    ${headerY}
  `}
>
  <Gauge className="h-4 w-4 text-cyan-400" />

  <span className="text-[12px] font-semibold text-white">
    Expense Efficiency
  </span>

<MetricInfoTooltip
  definition="Measures how much trading profit was generated for every $1 spent on business expenses."
  formula="Net Trading P&L ÷ Total Expenses"
  calculation={`${currencySymbol}${metrics.netTradingPnL.toFixed(2)} ÷ ${currencySymbol}${metrics.totalExpenses.toFixed(2)} = ${metrics.expenseEfficiency.toFixed(1)}x`}
  interpretation={`Every $1 spent on the trading business generated ${metrics.expenseEfficiency.toFixed(1)}x in trading profit.`}
  className="translate-x-0 translate-y-0"
/>
</div>

    <span
      className={`
        text-[12px]
        font-medium
        text-emerald-400

        ${statusX}
        ${statusY}
      `}
    >
      Excellent
    </span>
  </div>

  {/* ============================================= */}
{/* Main Value */}
{/* ============================================= */}

<div
  className={`
    mt-6

    ${scoreX}
    ${scoreY}
  `}
>
  <div className="text-[33px] font-bold leading-none text-white">
    {metrics.expenseEfficiency.toFixed(1)}x
  </div>

  <p
  className={`
    mt-2
    text-[12px]
    text-slate-400

    ${scoreTrendX}
    ${scoreTrendY}
  `}
>
  Profit generated per $1 spent
</p>
</div>

{/* ============================================= */}
{/* Metrics */}
{/* ============================================= */}

<div
  className={`
    mt-5
    mx-auto

    ${metricsWidth}
    ${metricsX}
    ${metricsY}
  `}
>
  <div className="flex justify-between text-[11px] text-slate-400">
    <span>Net Trading P&amp;L</span>
    <span>
      {currencySymbol}
      {metrics.netTradingPnL.toFixed(2)}
    </span>
  </div>

  <div className="h-[6px]" />

  <div className="flex justify-between text-[11px] text-slate-400">
    <span>Business Profit</span>
    <span>
      {currencySymbol}
      {metrics.netBusinessProfit.toFixed(2)}
    </span>
  </div>

  <div className="h-[6px]" />

  <div className="flex justify-between text-[11px] text-slate-400">
    <span>Total Expenses</span>
    <span>
      {currencySymbol}
      {metrics.totalExpenses.toFixed(2)}
    </span>
  </div>

  <div className="my-3 h-px bg-white/10" />

  <div className="h-[6px]" />

  <div className="flex justify-between text-[11px] font-semibold text-white">
    <span>Return On Expenses</span>
    <span>
      {metrics.expenseEfficiency.toFixed(1)}x
    </span>
  </div>

</div>
</div>

{/* ================================================= */}
{/* Average Cost / Trade */}
{/* ================================================= */}

<div className={`${cardClass} px-6 py-6`}>
  {/* Header */}
  <div className="flex items-center gap-2">
    <div
  className={`
    flex items-center gap-2

    ${avgHeaderX}
    ${avgHeaderY}
  `}
>
  <Target className="h-4 w-4 text-emerald-400" />

  <span className="text-[12px] font-semibold text-white">
    Avg Cost / Trade
  </span>

  <MetricInfoTooltip
  definition="Average business cost incurred for every closed trade."
  formula="(Commissions + Manual Expenses) ÷ Total Trades"
  calculation={`${currencySymbol}${metrics.avgCostPerTrade.toFixed(2)} per trade across ${metrics.totalTrades} closed trades`}
  interpretation={`Each closed trade costs an average of ${currencySymbol}${metrics.avgCostPerTrade.toFixed(2)} in commissions and operating expenses.`}
  className="translate-x-0 translate-y-0"
/>
</div>
  </div>

  {/* Value */}
  <div
    className={`
      mt-5

      ${avgValueX}
      ${avgValueY}
    `}
  >
    <div className="text-[32px] font-bold leading-none text-white">
  {currencySymbol}
  {metrics.avgCostPerTrade.toFixed(2)}
</div>

   <p
  className={`
    mt-2
    text-[12px]
    text-slate-400

    ${avgTrendX}
    ${avgTrendY}
  `}
>
  Business cost per closed trade
</p>
  </div>

  {/* Metrics */}
  <div
    className={`
      mt-6
      mx-auto

      ${avgMetricsWidth}
      ${avgMetricsX}
      ${avgMetricsY}
    `}
  >
    <div className="flex justify-between text-[11px] text-slate-400">
    <span>Commission / Trade</span>
<span>
  {currencySymbol}
  {metrics.commissionPerTrade.toFixed(2)}
</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Expense / Trade</span>
<span>
  {currencySymbol}
  {metrics.expensePerTrade.toFixed(2)}
</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
     <span>Total Trades</span>
<span>
  {metrics.totalTrades}
</span>
    </div>

    <div className="my-3 h-px bg-white/10" />
 <div className="h-[6px]" />
    <div className="flex justify-between text-[11px] font-semibold text-white">
      <span>Total Cost</span>
<span>
  {currencySymbol}
  {metrics.avgCostPerTrade.toFixed(2)}
</span>
    </div>
  </div>
</div>

{/* ================================================= */}
{/* Profit Retention */}
{/* ================================================= */}

<div className={`${cardClass} px-6 py-6`}>
  {/* Header */}
  <div className="flex items-center justify-between">
   <div
  className={`
    flex items-center gap-2

    ${profitHeaderX}
    ${profitHeaderY}
  `}
>
  <ShieldCheck className="h-4 w-4 text-violet-400" />

  <span className="text-[12px] font-semibold text-white">
    Profit Retention
  </span>

  <MetricInfoTooltip
    definition="Shows the percentage of trading profits retained after business expenses."
    formula="(Net Business Profit ÷ Net Trading P&L) × 100"
    calculation={`(${currencySymbol}${metrics.netBusinessProfit.toFixed(2)} ÷ ${currencySymbol}${metrics.netTradingPnL.toFixed(2)}) × 100 = ${metrics.profitRetention.toFixed(1)}%`}
    interpretation={`${metrics.profitRetention.toFixed(1)}% of trading profits were retained after business expenses.`}
    className="translate-x-0 translate-y-0"
  />
</div>

    {/* Donut Placeholder */}

  </div>

  {/* Main Value */}
  <div
    className={`
      ${profitValueX}
      ${profitValueY}
    `}
  >
    <div className="text-[32px] font-bold leading-none text-white">
  {metrics.profitRetention.toFixed(1)}%
</div>

    <p
  className={`
    mt-2
    text-[12px]
    text-slate-400

    ${profitSubtitleX}
    ${profitSubtitleY}
  `}
>
  Percent of profit retained after expenses
</p>
  </div>

  {/* Metrics */}
  <div
    className={`
      mt-5
      mx-auto

      ${profitMetricsWidth}
      ${profitMetricsX}
      ${profitMetricsY}
    `}
  >
    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Net P&amp;L</span>
      <span className="text-white">
  {currencySymbol}
  {(
    metrics.netBusinessProfit +
    metrics.totalExpenses
  ).toFixed(2)}
</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Expenses</span>
      <span className="text-red-400">
  {currencySymbol}
  {metrics.totalExpenses.toFixed(2)}
</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Net Retained</span>
      <span className="text-emerald-400">
  {currencySymbol}
  {metrics.netBusinessProfit.toFixed(2)}
</span>
    </div>

    <div className="my-3 h-px bg-white/10" />
<div className="h-[6px]" />
    <div className="flex justify-between text-[11px] font-semibold text-white">
      <span>Retention Rate</span>
      <span>
  {metrics.profitRetention.toFixed(1)}%
</span>
    </div>
  </div>
</div>

  {/* ================================================= */}
{/* Projected Annual */}
{/* ================================================= */}

<div className={`${cardClass} px-6 py-6`}>
  {/* Header */}
  <div className="flex items-center gap-2">
    <div
  className={`
    flex items-center gap-2

    ${projectedHeaderX}
    ${projectedHeaderY}
  `}
>
  <TrendingUp className="h-4 w-4 text-orange-400" />

  <span className="text-[12px] font-semibold text-white">
    Projected Annual
  </span>

  <MetricInfoTooltip
    definition="Estimated recurring business costs over the next 12 months based on active subscriptions."
    formula="Monthly Recurring Expenses × 12"
    calculation={`${currencySymbol}${metrics.monthlyRecurringExpenses.toFixed(2)} × 12 = ${currencySymbol}${metrics.projectedAnnualBurn.toFixed(2)}`}
    interpretation={`Based on current recurring subscriptions, projected annual spending is ${currencySymbol}${metrics.projectedAnnualBurn.toFixed(2)}.`}
    className="translate-x-0 translate-y-0"
  />
</div>
  </div>

  {/* Value */}
  <div
    className={`
      ${projectedValueX}
      ${projectedValueY}
    `}
  >
    <div className="text-[32px] font-bold leading-none text-white">
  {currencySymbol}
  {metrics.projectedAnnualBurn.toFixed(0)}
</div>

    <p
  className={`
    mt-2
    text-[12px]
    text-slate-400

    ${projectedSubtitleX}
    ${projectedSubtitleY}
  `}
>
  Based on current run rate
</p>
  </div>

  {/* Breakdown */}
  <div
    className={`
      mt-5
      mx-auto

      ${projectedMetricsWidth}
      ${projectedMetricsX}
      ${projectedMetricsY}
    `}
  >
    <div className="flex justify-between text-[11px] text-slate-400">
  <span>Monthly Burn</span>
  <span>
    {currencySymbol}
    {metrics.monthlyBurn.toFixed(2)}
  </span>
</div>

<div className="h-[6px]" />

<div className="flex justify-between text-[11px] text-slate-400">
  <span>Active Months</span>
  <span>
    {metrics.activeMonths}
  </span>
</div>

<div className="h-[6px]" />

<div className="flex justify-between text-[11px] text-slate-400">
  <span>Method</span>
  <span>
    Monthly Avg × 12
  </span>
</div>
  </div>
</div>

 {/* ================================================= */}
{/* Monthly Burn */}
{/* ================================================= */}

<div className={`${cardClass} px-6 py-6`}>
  {/* Header */}
  <div className="flex items-center gap-2">
   <div
  className={`
    flex items-center gap-2

    ${burnHeaderX}
    ${burnHeaderY}
  `}
>
  <Flame className="h-4 w-4 text-red-400" />

  <span className="text-[12px] font-semibold text-white">
    Monthly Burn
  </span>

  <MetricInfoTooltip
    definition="Average monthly operating cost since expense tracking began."
    formula="Total Expenses ÷ Active Months"
    calculation={`${currencySymbol}${metrics.totalExpenses.toFixed(2)} ÷ ${metrics.activeMonths} = ${currencySymbol}${metrics.monthlyBurn.toFixed(2)}`}
    interpretation={`The business spends an average of ${currencySymbol}${metrics.monthlyBurn.toFixed(2)} per month since expense tracking began.`}
    className="translate-x-0 translate-y-0"
  />
</div>
  </div>

  {/* Value */}
  <div
    className={`
      ${burnValueX}
      ${burnValueY}
    `}
  >
    <div className="text-[32px] font-bold leading-none text-white">
  {currencySymbol}
  {metrics.monthlyBurn.toFixed(2)}
</div>

   <p
  className={`
    mt-2
    text-[12px]
    text-slate-400

    ${burnTrendX}
    ${burnTrendY}
  `}
>
  Average monthly operating cost
</p>
  </div>


  {/* Footer Metrics */}
  <div
    className={`
      mt-5
      mx-auto

      ${burnMetricsWidth}
      ${burnMetricsX}
      ${burnMetricsY}
    `}
  >
   <div className="flex justify-between text-[11px] text-slate-400">
  <span>Business Started</span>
  <span>
    {metrics.businessStartDate}
  </span>
</div>

<div className="h-[6px]" />

<div className="flex justify-between text-[11px] text-slate-400">
  <span>Active Months</span>
  <span>
    {metrics.activeMonths}
  </span>
</div>

<div className="h-[6px]" />

<div className="flex justify-between text-[11px] text-slate-400">
  <span>Method</span>
  <span>
    Total Expenses ÷ Active Months
  </span>
</div>

<div className="my-3 h-px bg-white/10" />
<div className="h-[6px]" />

<div className="flex justify-between text-[11px] font-semibold text-white">
  <span>Monthly Average</span>
  <span>
    {currencySymbol}
    {metrics.monthlyBurn.toFixed(2)}
  </span>
</div>
  </div>
</div>

{/* ================================================= */}
{/* Upcoming Renewals */}
{/* ================================================= */}

<div className={`${cardClass} px-6 py-6`}>
  {/* Header */}
  <div
    className={`
      flex items-center justify-between

      ${renewalsHeaderX}
      ${renewalsHeaderY}
    `}
  >
    <div className="flex items-center gap-2">
      <CalendarClock className="h-4 w-4 text-slate-400" />

      <span className="text-[12px] font-semibold text-white">
        Upcoming Renewals
      </span>
    </div>

  </div>

{/* Body */}
<div
  className={`
    mt-6

    max-h-[145px]
    overflow-y-auto

    pr-2

    ${renewalsWidth}
    ${renewalsListX}
    ${renewalsListY}
  `}
>
{upcomingRenewals.map(
  (renewal, index) => (

    <div
  key={`${renewal.expenseName}-${index}`}
>
  <div
    className="
      rounded-xl
      px-2
      py-2
      transition-colors
      hover:bg-white/[0.03]
    "
  >
    <div className="flex items-center justify-between">

        <div className="flex items-center">

          <div
           className={`
  flex
  ${renewalBoxSize}
  items-center
  justify-center
  rounded-lg
  border border-violet-500/20
  bg-[#16233A]

  ${renewalIconX}
  ${renewalIconY}
`}
          >
            {vendorIcons[
              renewal.vendor
            ] ? (
<Image
  src={
    vendorIcons[
      renewal.vendor
    ]
  }
  alt={
    renewal.vendor
  }
  width={
    renewalIconSize
  }
  height={
    renewalIconSize
  }
  className="h-[12px] w-[12px] object-contain"
/>
            ) : (
              <CalendarClock
  className="
    h-[16px]
    w-[16px]
    stroke-[2]
    text-transparent
  "
  style={{
    stroke: "url(#renewalGradient)",
  }}
/>
            )}
          </div>

          <span
            className={`
              ml-3
              text-[12px]
              font-medium
              text-white

              ${renewalNameX}
              ${renewalNameY}
            `}
          >
            {renewal.expenseName}
          </span>

        </div>

        <div className="flex items-center gap-4">

         <span
  className={`
    whitespace-nowrap
    text-[11px]
    text-slate-400

    ${renewalDateX}
    ${renewalDateY}
  `}
>
            {new Date(
              renewal.renewalDate
            ).toLocaleDateString(
  "en-US",
  {
  month: "short",
  day: "numeric",
}
)}
          </span>

<span
  className={`
    min-w-[60px]
    text-right
    text-[11px]
    font-semibold

    ${getRenewalColor(
      renewal.daysRemaining
    )}

    ${renewalDaysX}
    ${renewalDaysY}
  `}
>
            {renewal.daysRemaining}d
          </span>

        </div>

              </div>
      </div>

      {index < upcomingRenewals.length - 1 && (
        <div className="my-3 h-px bg-white/[0.05]" />
      )}
    </div>
  )
)}
</div>
    </div>
       </div>
  </>
);
}