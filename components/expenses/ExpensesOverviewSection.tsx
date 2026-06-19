"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";

import {
  calculateRecurringBreakdown,
  calculateCategoryBreakdown,
  calculateMonthlyExpenses,
  calculateWeeklyExpenses,
} from "@/lib/analytics/expenseAnalytics";

import type { Expense } from "@/lib/types/expense";

import { Trade } from "@/types/trade";

import {
  BusinessCostAnalyticsData,
} from "@/lib/analytics/businessCostAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import {
  calculateMonthlyCommissions,
} from "@/lib/analytics/businessCostAnalytics";

interface ExpensesOverviewSectionProps {
  expenses: Expense[];

  trades: Trade[];

  businessCostAnalytics:
    BusinessCostAnalyticsData;

  reportingCurrency: string;
}

export default function ExpensesOverviewSection({
  expenses,
  trades,
  businessCostAnalytics,
  reportingCurrency,
}: ExpensesOverviewSectionProps) {

  const [hoveredMonth, setHoveredMonth] =
  useState<string | null>(null);

  const [
  hoveredSeries,
  setHoveredSeries,
] = useState<
  "manual" |
  "commission" |
  null
>(null);

  const [viewMode, setViewMode] =
  useState<"MONTHLY" | "YEARLY">(
    "YEARLY"
  );

  const [animateChart, setAnimateChart] =
  useState(false);

  useEffect(() => {
  setAnimateChart(true);
}, []);

  const recurringData =
  calculateRecurringBreakdown(
    expenses
  );

  

  const categoryData =
  calculateCategoryBreakdown(
    expenses
  );

  const monthlyData =
  calculateMonthlyExpenses(
    expenses
  );

  const monthlyCommissions =
  calculateMonthlyCommissions(
    trades
  );

  const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

  const weeklyData =
  calculateWeeklyExpenses(
    expenses
  );

const chartData =
  viewMode === "MONTHLY"

    ? weeklyData.map(
        (item) => ({

          label:
            item.week,

          manualExpenses:
            item.amount,

          commissions: 0,

          totalCosts:
            item.amount,
        })
      )

    : monthlyData.map(
        (item) => {

          const commissions =
            monthlyCommissions[
              item.month
            ] || 0;

          return {

            label:
              item.month,

            manualExpenses:
              item.amount,

            commissions,

            totalCosts:
              item.amount +
              commissions,
          };
        }
      );

const maxMonthlyExpense =
  Math.max(
    ...chartData.map(
      item => item.totalCosts
    ),
    1
  );

  const chartMax =
  Math.ceil(
    maxMonthlyExpense / 100
  ) * 100;

const hoveredData =
  chartData.find(
    item =>
      item.label ===
      hoveredMonth
  );


  const totalManualExpenses =
  expenses.reduce(
    (total, expense) =>
      total +
      expense.original_amount,
    0
  );

  const software =
  categoryData.find(
    item =>
      item.category ===
      "Software"
  );

const marketData =
  categoryData.find(
    item =>
      item.category ===
      "Market Data"
  );

const brokerageFees =
  categoryData.find(
    item =>
      item.category ===
      "Brokerage Fees"
  );

const education =
  categoryData.find(
    item =>
      item.category ===
      "Education"
  );

const infrastructure =
  categoryData.find(
    item =>
      item.category ===
      "Infrastructure"
  );

const other =
  categoryData.find(
    item =>
      item.category ===
      "Other"
  );

/* =====================================================
   TOOLTIP FINE TUNING
   ===================================================== */

const tooltipX = "translate-x-0";
const tooltipY = "translate-y-0";

const tooltipCardX = "translate-x-0";
const tooltipCardY = "translate-y-0";

const monthX = "translate-x-3";
const monthY = "translate-y-1";

const topDividerX = "translate-x-0";
const topDividerY = "translate-y-1";

const manualRowX = "translate-x-2";
const manualRowY = "translate-y-1";

const manualDotX = "translate-x-0";
const manualDotY = "translate-y-0";

const manualLabelX = "translate-x-0";
const manualLabelY = "translate-y-0";

const manualValueX = "-translate-x-4";
const manualValueY = "translate-y-0";

const commissionRowX = "translate-x-2";
const commissionRowY = "translate-y-1";

const commissionDotX = "translate-x-0";
const commissionDotY = "translate-y-0";

const commissionLabelX = "translate-x-0";
const commissionLabelY = "translate-y-0";

const commissionValueX = "-translate-x-4";
const commissionValueY = "translate-y-0";

const bottomDividerX = "translate-x-0";
const bottomDividerY = "translate-y-1";

const totalRowX = "translate-x-2";
const totalRowY = "translate-y-1";


const totalLabelX = "translate-x-2";
const totalLabelY = "translate-y-0";

const totalValueX = "-translate-x-4";
const totalValueY = "translate-y-0";

// =================================================
// PERIOD TOGGLE
// =================================================

const periodToggleWidth = "w-[130px]";
const periodToggleHeight = "h-[36px]";

const periodTogglePadding = "p-1";

const periodButtonGap = "gap-0";

const activeButtonWidth = "w-[82px]";
const inactiveButtonWidth = "w-[82px]";


// =====================================================
// Expense Sources Fine Tuning
// =====================================================

const sourcesX = "translate-x-2";
const sourcesY = "translate-y-0";

// =====================================================
// Auto Expense Source Fine Tuning
// =====================================================

const autoIconX = "translate-x-6";
const autoIconY = "translate-y-14";

const autoBadgeX = "-translate-x-3";
const autoBadgeY = "translate-y-0";

const autoTextX = "translate-x-22";
const autoTextY = "-translate-y-4";

const autoButtonX = "translate-x-16";
const autoButtonY = "translate-y-0";

// =====================================================
// Manual Expense Source Fine Tuning
// =====================================================

const manualIconX = "translate-x-6";
const manualIconY = "translate-y-14";

const manualBadgeX = "translate-x-60";
const manualBadgeY = "translate-y-2";

const manualTextX = "translate-x-22";
const manualTextY = "-translate-y-4";

const manualButtonX = "translate-x-16";
const manualButtonY = "translate-y-0";



  // =====================================================
// Expense Breakdown Fine Tuning
// =====================================================

// Title
const breakdownTitleX = "translate-x-4";
const breakdownTitleY = "translate-y-0";

// Info icon
const breakdownInfoX = "-translate-x-62";
const breakdownInfoY = "translate-y-0";

// Donut chart
const breakdownChartX = "-translate-x-34";
const breakdownChartY = "translate-y-16";

const breakdownLegendX = "translate-x-52";
const breakdownLegendY = "-translate-y-20";


// =====================================================
// Recurring Fine Tuning
// =====================================================

// Title
const recurringTitleX = "translate-x-4";
const recurringTitleY = "translate-y-0";

// Info icon
const recurringInfoX = "-translate-x-85";
const recurringInfoY = "translate-y-0";

// Donut
const recurringChartX = "-translate-x-30";
const recurringChartY = "translate-y-10";

// Legend
const recurringLegendX = "translate-x-60";
const recurringLegendY = "-translate-y-20";

  // =====================================================
  // Expenses Over Time Fine Tuning
  // =====================================================

  const titleX = "translate-x-4";
  const titleY = "translate-y-0";

  const controlsX = "-translate-x-4";
  const controlsY = "translate-y-2";

  const legendX = "translate-x-4";
  const legendY = "-translate-y-1";

  const chartX = "translate-x-0";
  const chartY = "-translate-y-1";

return (
  <div className="grid grid-cols-13 gap-5">

{/* ================================================= */}
{/* Expenses Over Time */}
{/* ================================================= */}

<div className="col-span-5 rounded-[20px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${titleX} ${titleY}`}>
      <h3 className="text-[18px] font-semibold text-white">
        Expenses Over Time
      </h3>
    </div>

<div
  className={`
    flex

    ${periodToggleWidth}
    ${periodToggleHeight}

    overflow-hidden

    rounded-xl
    border
    border-white/10

    bg-white/[0.03]

    ${controlsX}
    ${controlsY}
  `}
>
<button
  onClick={() =>
    setViewMode("MONTHLY")
  }
  className={`
    flex-1

    text-[12px]

    transition-all
    duration-200

    ${
      viewMode === "MONTHLY"
        ? "bg-blue-500/80 font-semibold text-white"
        : "font-medium text-slate-400"
    }
  `}
>
  Monthly
</button>

<button
  onClick={() =>
    setViewMode("YEARLY")
  }
  className={`
    flex-1

    text-[12px]

    transition-all
    duration-200

    ${
      viewMode === "YEARLY"
        ? "bg-blue-500/80 font-semibold text-white"
        : "font-medium text-slate-400"
    }
  `}
>
  Yearly
</button>
</div>


  </div>

  {/* Legend */}
  <div
    className={`mt-3 flex items-center gap-5 text-[12px] ${legendX} ${legendY}`}
  >
    <div className="flex items-center gap-2 text-blue-300">
      <span className="h-2 w-2 rounded-full bg-blue-400" />
      Manual Expenses
    </div>

    <div className="flex items-center gap-2 text-emerald-500">
      <span className="h-2 w-2 rounded-full bg-emerald-600/80" />
      Commissions
    </div>


  </div>

  {/* Chart */}
  <div className={`mt-5 flex justify-center ${chartX} ${chartY}`}>
    <div className="relative h-[260px] w-[96%] rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">


      {/* Horizontal Grid */}
      <div className="absolute left-14 right-4 top-6 border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[68px] border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[110px] border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[152px] border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[194px] border-t border-white/5" />
      <div className="absolute left-14 right-4 bottom-8 border-t border-white/5" />

      {/* Y Axis */}
      <div className="absolute left-14 top-6 bottom-8 w-px bg-white/5" />

{/* Y Labels */}
<div className="absolute left-4 top-4 flex h-[215px] flex-col justify-between text-[10px] text-slate-500">
  <span>${chartMax.toFixed(0)}</span>
  <span>${(chartMax * 0.8).toFixed(0)}</span>
  <span>${(chartMax * 0.6).toFixed(0)}</span>
  <span>${(chartMax * 0.4).toFixed(0)}</span>
  <span>${(chartMax * 0.2).toFixed(0)}</span>
  <span>$0</span>
</div>

{/* Bottom Axis */}
<div className="absolute left-14 right-4 bottom-8 h-px bg-white/5" />

{/* Bars */}
<div className="absolute bottom-8 left-20 right-8 flex items-end justify-between">
 {chartData.map((item) => (
    <div
  key={item.label}
  className="flex flex-col items-center"
  onMouseEnter={() =>
    setHoveredMonth(item.label)
  }
  onMouseLeave={() =>
    setHoveredMonth(null)
  }
>
      {/* Dot + Bar Group */}
<div className="group relative flex flex-col items-center">

{hoveredMonth === item.label && (
  <div
    className={`
      absolute
      z-20

      -top-20

      ${tooltipX}
      ${tooltipY}
    `}
  >
    <div
      className={`
        rounded-2xl
        border
        border-white/10
        bg-black/75
        backdrop-blur-xl
        shadow-[0_10px_40px_rgba(0,0,0,0.45)]

        px-5
        py-4

        min-w-[200px]

        ${tooltipCardX}
        ${tooltipCardY}
      `}
    >
      {/* Month */}
      <div
        className={`
          mb-3
          text-[18px]
          font-semibold
          text-white

          ${monthX}
          ${monthY}
        `}
      >
        {item.label}
      </div>

      {/* Divider */}
      <div
        className={`
          mb-3
          border-t
          border-white/10

          ${topDividerX}
          ${topDividerY}
        `}
      />

      {/* Content */}
      <div className="space-y-3">

        {/* Manual */}
        <div
          className={`
            flex
            items-center
            justify-between

            ${manualRowX}
            ${manualRowY}
          `}
        >
          <div className="flex items-center gap-2">
            <div
              className={`
                h-3
                w-3
                rounded-full
                bg-blue-500

                ${manualDotX}
                ${manualDotY}
              `}
            />

<span
  className={`
    text-[14px]

    transition-all
    duration-200

    ${
      hoveredSeries === "manual"
        ? "text-blue-300"
        : "text-slate-300"
    }

    ${manualLabelX}
    ${manualLabelY}
  `}
>
              Manual
            </span>
          </div>

<span
  className={`
    font-medium

    transition-all
    duration-200

    ${
      hoveredSeries === "manual"
        ? "text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.55)]"
        : "text-white"
    }

    ${manualValueX}
    ${manualValueY}
  `}
>
            {currencySymbol}
            {item.manualExpenses.toFixed(2)}
          </span>
        </div>

        {/* Commissions */}
        <div
          className={`
            flex
            items-center
            justify-between

            ${commissionRowX}
            ${commissionRowY}
          `}
        >
          <div className="flex items-center gap-2">
            <div
              className={`
                h-3
                w-3
                rounded-full
                bg-emerald-500

                ${commissionDotX}
                ${commissionDotY}
              `}
            />

            <span
              className={`
                text-[14px]
                ${
  hoveredSeries === "commission"
    ? "text-emerald-300"
    : "text-slate-300"
}

                ${commissionLabelX}
                ${commissionLabelY}
              `}
            >
              Commissions
            </span>
          </div>

          <span
            className={`
              font-medium
              ${
  hoveredSeries === "commission"
    ? "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.55)]"
    : "text-white"
}

              ${commissionValueX}
              ${commissionValueY}
            `}
          >
            {currencySymbol}
            {item.commissions.toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div
          className={`
            my-2
            border-t
            border-white/10

            ${bottomDividerX}
            ${bottomDividerY}
          `}
        />

        {/* Total */}
        <div
          className={`
            flex
            items-center
            justify-between

            ${totalRowX}
            ${totalRowY}
          `}
        >
          <div className="flex items-center gap-2">


            <span
              className={`
                text-[15px]
                font-medium
                text-white

                ${totalLabelX}
                ${totalLabelY}
              `}
            >
              Total
            </span>
          </div>

          <span
            className={`
              text-[18px]
              font-semibold
              text-white

              ${totalValueX}
              ${totalValueY}
            `}
          >
            {currencySymbol}
            {item.totalCosts.toFixed(2)}
          </span>
          
        </div>
        <div className="h-2" />
      </div>
    </div>
  </div>
)}



        {/* Stacked bars */}
        <div className="flex flex-col">
<div
  onMouseEnter={() =>
    setHoveredSeries("commission")
  }
  onMouseLeave={() =>
    setHoveredSeries(null)
  }
  className="
    w-7
    rounded-t

    bg-emerald-600/80

    transition-all
    duration-200

    hover:bg-emerald-500/90
    hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]
  "
  style={{
    height: animateChart
      ? `${Math.max(
          (
            item.commissions /
            maxMonthlyExpense
          ) * 180,
          0
        )}px`
      : "0px",
  }}
/>

<div
  onMouseEnter={() =>
    setHoveredSeries("manual")
  }
  onMouseLeave={() =>
    setHoveredSeries(null)
  }
  className="
    w-7
    bg-blue-700/75
    transition-all
duration-700

    transition-all
    duration-200

    hover:bg-blue-500/90
    hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]
  "
            style={{
  height: animateChart
    ? `${Math.max(
        (item.manualExpenses / maxMonthlyExpense) * 180,
        4
      )}px`
    : "0px",
}}
          />
        </div>
        
      </div>

      {/* Month */}
      <span className="mt-3 text-[11px] text-slate-500">
        {item.label}
      </span>
      
    </div>
    
  ))}
  
</div>
  
    </div>
    
  </div>
  
</div>


{/* KEEP THE REST OF YOUR FILE (Expense Breakdown, Recurring, Expense Sources)
    EXACTLY AS IT IS BELOW THIS LINE */}

{/* ================================================= */}
{/* Expense Breakdown */}
{/* ================================================= */}

<div className="col-span-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${breakdownTitleX} ${breakdownTitleY}`}>
      <h3 className="text-[18px] font-semibold text-white">
        Expense Breakdown
      </h3>
    </div>

  </div>

  {/* Spacer */}
  <div className="h-0" />

  {/* Donut */}
  <div
    className={`flex justify-center ${breakdownChartX} ${breakdownChartY}`}
  >
    <div
      className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full"
      style={{
        background: `
          conic-gradient(
            #2563eb 0% 34%,
            #7c3aed 34% 56%,
            #f97316 56% 72%,
            #fbbf24 72% 82%,
            #10b981 82% 93%,
            #64748b 93% 100%
          )
        `,
      }}
    >
      {/* Inner Cutout */}
      <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-[#061325]">
        <div className="text-[34px] font-bold leading-none text-white">
          {
  categoryData[0]
    ?.percentage
    .toFixed(0) ?? "0"
}%
        </div>

        <div className="mt-2 text-[12px] text-slate-400">
          Total
        </div>
      </div>
    </div>
  </div>

  {/* Spacer */}


  {/* Legend */}
  <div
    className={`mx-auto max-w-[220px] space-y-2 text-[14px] ${breakdownLegendX} ${breakdownLegendY}`}
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        Software
      </span>
      <span className="text-white">{software?.percentage.toFixed(0) ?? 0}%</span>
    </div>
  {/* Top Spacer */}
  <div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
        Market Data
      </span>
      <span className="text-white">{marketData?.percentage.toFixed(0) ?? 0}%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        Brokerage Fees
      </span>
      <span className="text-white">{brokerageFees?.percentage.toFixed(0) ?? 0}%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        Education
      </span>
      <span className="text-white">{education?.percentage.toFixed(0) ?? 0}%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Infrastructure
      </span>
      <span className="text-white">{infrastructure?.percentage.toFixed(0) ?? 0}%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
        Other
      </span>
      <span className="text-white">{other?.percentage.toFixed(0) ?? 0}%</span>
    </div>
  </div>
</div>

{/* ================================================= */}
{/* Recurring */}
{/* ================================================= */}

<div className="col-span-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${recurringTitleX} ${recurringTitleY}`}>
      <h3 className="text-[18px] font-semibold text-white">
        Recurring
      </h3>
    </div>
  </div>

  {/* Spacer */}
  <div className="h-6" />

{/* Donut */}
<div
  className={`flex justify-center ${recurringChartX} ${recurringChartY}`}
>
  <div
    className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full"
style={{
  background: `
    conic-gradient(
      #10b981 0% ${
        animateChart
          ? recurringData.recurringPercent
          : 0
      }%,
      #64748b ${
        animateChart
          ? recurringData.recurringPercent
          : 0
      }% 100%
    )
  `,
  transition: "all 700ms ease",
}}
  >
    {/* Inner Cutout */}
    <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-[#061325]">
      <div className="text-[34px] font-bold leading-none text-white">
        {(
  animateChart
    ? recurringData.recurringPercent
    : 0
).toFixed(0)}%
      </div>

      <div className="mt-2 text-[12px] text-slate-400">
        Active
      </div>
    </div>
  </div>
</div>

  {/* Spacer */}
  <div className="h-6" />

  {/* Legend */}
  <div
    className={`mx-auto max-w-[180px] space-y-3 text-[15px] ${recurringLegendX} ${recurringLegendY}`}
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Recurring
      </span>

      <span className="text-white">{recurringData.recurringPercent.toFixed(0)}%</span>
    </div>
<div className="h-2" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
        One-Time
      </span>

      <span className="text-white">{recurringData.oneTimePercent.toFixed(0)}%</span>
    </div>
  </div>
</div>

{/* ================================================= */}
{/* Expense Sources */}
{/* ================================================= */}

<div className="col-span-2 flex flex-col">
  {/* Header */}
  <div className={`mb-5 flex items-center justify-between ${sourcesX} ${sourcesY}`}>
    <h3 className="text-[18px] font-semibold text-white">
      Expense Sources
    </h3>

  </div>

  {/* Cards */}
  <div className="flex flex-1 flex-col gap-4">

 {/* ================================================= */}
{/* Auto Card */}
{/* ================================================= */}

<div className="flex-1 rounded-[20px] border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-violet-500/3 to-transparent p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-violet-400/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.10)]">

  {/* Top Row */}
  <div className="relative flex items-start justify-between">

<div className={`${autoIconX} ${autoIconY}`}>
  <div className="flex h-[34px] w-[52px] items-center justify-center">
    <RefreshCw className="h-7 w-7 text-violet-300" />
  </div>
</div>

<div className="absolute right-4 top-2">
  <span className="flex h-5 w-11 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.03em] text-slate-300">
    <span className="translate-y-[1px]">
      AUTO
    </span>
  </span>
</div>

  </div>

  {/* Text Block */}
  <div className={`${autoTextX} ${autoTextY}`}>
<div className="mt-4 text-[16px] font-medium text-slate-300">
  Broker Commissions
</div>

<div className="mt-1 text-[13px] text-slate-400">
  Imported From Trade History
</div>

<div className="h-2" />

<div className="mt-3 text-[28px] font-bold leading-none text-white">
  {currencySymbol}
  {businessCostAnalytics.commissions.toFixed(2)}
</div>

<div className="mt-2 text-[14px] text-slate-400">
  Auto Calculated
</div>
  </div>
</div>

{/* ================================================= */}
{/* Manual Card */}
{/* ================================================= */}

<div className="flex-1 rounded-[20px] border border-blue-500/20 bg-gradient-to-br from-blue-500/8 via-blue-500/3 to-transparent p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-blue-400/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.10)]">

  {/* Top Row */}
  <div className="relative flex items-start justify-between">

<div className={`${manualIconX} ${manualIconY}`}>
  <div className="flex h-[34px] w-[52px] items-center justify-center">
    <CircleDollarSign className="h-7 w-7 text-blue-300" />
  </div>
</div>

<div className={`absolute ${manualBadgeX} ${manualBadgeY}`}>
  <span className="flex h-5 w-13 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.03em] text-slate-300">
    <span className="translate-y-[1px]">
      MANUAL
    </span>
  </span>
</div>

  </div>

  {/* Text Block */}
  <div className={`${manualTextX} ${manualTextY}`}>
    <div className="mt-4 text-[16px] font-medium text-slate-300">
      Manual Expenses
    </div>

    <div className="mt-1 text-[13px] text-slate-400">
      Total Manual Expenses
    </div>
<div className="h-2" />
    <div className="mt-3 text-[28px] font-bold leading-none text-white">
      {currencySymbol}
{totalManualExpenses.toFixed(2)}
    </div>

    <div className="mt-2 text-[14px] text-slate-400">
      This Period
    </div>
  </div>
</div>
  </div>
</div>
</div>
  );
}