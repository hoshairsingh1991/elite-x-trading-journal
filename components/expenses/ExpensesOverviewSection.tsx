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
  calculateVendorBreakdown,
  calculateMonthlyExpenses,
  calculateWeeklyExpenses,
} from "@/lib/analytics/expenseAnalytics";

import type { ReportingExpense } from "@/lib/types/expense";

import { Trade } from "@/types/trade";

import {
  BusinessCostAnalyticsData,
} from "@/lib/analytics/businessCostAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import {
  calculateMonthlyCommissions,
calculateWeeklyCommissions,
} from "@/lib/analytics/businessCostAnalytics";

interface ExpensesOverviewSectionProps {
  expenses: ReportingExpense[];

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

  const vendorData =
  calculateVendorBreakdown(
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

  const weeklyCommissions =
  calculateWeeklyCommissions(
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
    (item) => {

      const commissions =
        weeklyCommissions[
          item.week
        ] || 0;

      return {

        label:
          item.week,

        manualExpenses:
          item.amount,

        commissions,

        totalCosts:
          item.amount +
          commissions,
      };
    }
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

const plotHeight = 156;

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
      expense.reporting_amount,
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


// =================================================
// SORTED EXPENSE BREAKDOWN
// =================================================

const expenseRows = [
  {
    name: "Market Data",
    amount: marketData?.amount ?? 0,
    percentage: marketData?.percentage ?? 0,
    color: "bg-violet-500",
  },
  {
    name: "Software",
    amount: software?.amount ?? 0,
    percentage: software?.percentage ?? 0,
    color: "bg-blue-600",
  },
  {
    name: "Brokerage Fees",
    amount: brokerageFees?.amount ?? 0,
    percentage: brokerageFees?.percentage ?? 0,
    color: "bg-orange-500",
  },
  {
    name: "Education",
    amount: education?.amount ?? 0,
    percentage: education?.percentage ?? 0,
    color: "bg-amber-400",
  },
  {
    name: "Infrastructure",
    amount: infrastructure?.amount ?? 0,
    percentage: infrastructure?.percentage ?? 0,
    color: "bg-emerald-500",
  },
  {
    name: "Other",
    amount: other?.amount ?? 0,
    percentage: other?.percentage ?? 0,
    color: "bg-slate-500",
  },
];

const sortedExpenseRows =
  [...expenseRows].sort(
    (a, b) =>
      b.amount - a.amount
  );

  const vendorRows = [
  ...vendorData.slice(0, 6),

  ...Array(
    Math.max(
      0,
      6 - vendorData.length
    )
  ).fill({
    vendor: "—",
    amount: 0,
    percentage: 0,
  }),
].slice(0, 6);

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

const periodToggleWidth = "w-[120px]";
const periodToggleHeight = "h-[30px]";

const periodTogglePadding = "p-1";

const periodButtonGap = "gap-0";

const activeButtonWidth = "w-[82px]";
const inactiveButtonWidth = "w-[82px]";

// =================================================
// Vednor Breakdwon
// =================================================

const vendorTitleX = "translate-x-[14px]";
const vendorTitleY = "translate-y-[0px]";

const vendorListX = "translate-x-[20px]";
const vendorListY = "translate-y-[0px]";

const vendorRowSpacing = "h-2";

const vendorAmountWidth = "w-[70px]";
const vendorPercentWidth = "w-[40px]";

  // =====================================================
// Expense Breakdown Fine Tuning
// =====================================================

// Title
const breakdownTitleX = "translate-x-4";
const breakdownTitleY = "translate-y-0";

const breakdownListX = "translate-x-[16px]";
const breakdownListY = "translate-y-[0px]";

const breakdownRowGap = "space-y-2";

const breakdownRowSpacing = "h-2";

const breakdownAmountWidth = "w-[70px]";
const breakdownPercentWidth = "w-[40px]";


// =====================================================
// Recurring Fine Tuning
// =====================================================

const recurringTitleX = "translate-x-[14px]";
const recurringTitleY = "translate-y-[0px]";

const recurringListX = "translate-x-[20px]";
const recurringListY = "-translate-y-[2px]";

const recurringRowSpacing = "h-2";

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
  const chartY = "-translate-y-0";

return (
  <div
  className="grid gap-5"
  style={{
    gridTemplateColumns: "3.8fr 2fr 2fr 2fr",
  }}
>

{/* ================================================= */}
{/* Expenses Over Time */}
{/* ================================================= */}

<div className="-translate-y-0 rounded-[20px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
  <div className="flex items-center justify-between">
    <div className={`${titleX} ${titleY}`}>
      <h3 className="text-[14px] font-semibold text-white">
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
    <div className="relative h-[220px] w-[96%]  rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">


      {/* Horizontal Grid */}
      <div className="absolute left-14 right-4 top-6 border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[46px] border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[78px] border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[110px] border-t border-white/5" />
      <div className="absolute left-14 right-4 top-[142px] border-t border-white/5" />
      <div className="absolute left-14 right-4 bottom-6 border-t border-white/5" />

      {/* Y Axis */}
      <div className="absolute left-14 top-6  bottom-6 w-px bg-white/5" />

{/* Y Labels */}
<div className="absolute left-4 top-6 flex h-[175px] flex-col justify-between text-[10px] text-slate-500">
  <span>${chartMax.toFixed(0)}</span>
  <span>${(chartMax * 0.8).toFixed(0)}</span>
  <span>${(chartMax * 0.6).toFixed(0)}</span>
  <span>${(chartMax * 0.4).toFixed(0)}</span>
  <span>${(chartMax * 0.2).toFixed(0)}</span>
  <span>$0</span>
</div>

{/* Bottom Axis */}
<div className="absolute left-14 right-4 bottom-12 h-px bg-white/5" />

{/* Bars */}
<div className="absolute bottom-2 left-20 right-8 flex items-end justify-between">
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
          text-[14px]
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
    text-[12px]

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
text-[14px]
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
                text-[12px]
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
              text-[14px]
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
                text-[14px]
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
              text-[14px]
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
          chartMax
        ) * plotHeight,
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
        (
          item.manualExpenses /
          chartMax
        ) * plotHeight,
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

<div className="rounded-[20px] -translate-y-0 border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">

  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${breakdownTitleX} ${breakdownTitleY}`}>
      <h3 className="text-[14px] font-semibold text-white">
        Expense Breakdown
      </h3>
    </div>
  </div>

  {/* Spacer */}
  <div className="h-4" />

  {/* Category List */}
  <div
    className={`
      w-[90%]
      mx-auto
      ${breakdownListX}
      ${breakdownListY}
    `}
  >

    {sortedExpenseRows.map((row, index) => (

      <div key={row.name}>

        <div className="flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-3">

            <span
              className={`h-3 w-3 rounded-full ${row.color}`}
            />

            <span className="text-[13px] text-slate-300">
              {row.name}
            </span>

          </div>

          {/* Right */}
          <div className="flex items-center gap-5">

            <span
              className={`${breakdownAmountWidth} text-right text-[13px] -translate-x-6 text-white`}
            >
              {currencySymbol}
              {row.amount.toFixed(0)}
            </span>

            <span
              className={`${breakdownPercentWidth} text-right text-[13px] -translate-x-2 text-slate-400`}
            >
              {row.percentage.toFixed(0)}%
            </span>

          </div>

        </div>

        {index < 5 && (
          <>
            <div className={breakdownRowSpacing} />
            <div className="border-t border-white/[0.03]" />
            <div className={breakdownRowSpacing} />
          </>
        )}

      </div>

    ))}

  </div>

</div>

{/* ================================================= */}
{/* Vendor Breakdown */}
{/* ================================================= */}

<div className="rounded-[20px] -translate-y-0 border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">

  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${vendorTitleX} ${vendorTitleY}`}>
      <h3 className="text-[14px] font-semibold text-white">
        Vendor Breakdown
      </h3>
    </div>
  </div>

  {/* Spacer */}
  <div className="h-4" />

  {/* Vendor List */}
  <div
    className={`
      w-[90%]
      mx-auto
      ${vendorListX}
      ${vendorListY}
    `}
  >

   {vendorRows.map(
  (vendor, index) => (

        <div key={`${vendor.vendor}-${index}`}>

          <div className="flex items-center justify-between">

            {/* Left */}
            <div className="flex items-center gap-3">

              <span
                className={`h-2 w-2 rounded-full ${
                  vendor.amount > 0
                    ? "bg-blue-500"
                    : "bg-slate-600"
                }`}
              />

              <span
                className={`text-[13px] ${
                  vendor.amount > 0
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {vendor.vendor}
              </span>

            </div>

            {/* Right */}
            <div className="flex items-center gap-4">

              <span
                className={`${vendorAmountWidth} text-right -translate-x-8 text-[13px] ${
                  vendor.amount > 0
                    ? "text-white"
                    : "text-slate-500"
                }`}
              >
                {currencySymbol}
                {vendor.amount.toFixed(0)}
              </span>

              <span
                className={`${vendorPercentWidth} text-right -translate-x-4 text-[13px] ${
                  vendor.amount > 0
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                {vendor.percentage.toFixed(0)}%
              </span>

            </div>

          </div>

          {index < 5 && (
            <>
              <div className={vendorRowSpacing} />
              <div className="border-t border-white/[0.03]" />
              <div className={vendorRowSpacing} />
            </>
          )}

        </div>

      ))}

  </div>

</div>

{/* ================================================= */}
{/* Recurring Costs */}
{/* ================================================= */}

<div className="rounded-[20px] -translate-y-0 border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">

  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${recurringTitleX} ${recurringTitleY}`}>
      <h3 className="text-[14px] font-semibold text-white">
        Recurring Costs
      </h3>
    </div>
  </div>

  {/* Spacer */}
  <div className="h-4" />

  <div
    className={`
      w-[92%]
      mx-auto
      ${recurringListX}
      ${recurringListY}
    `}
  >

    {/* Recurring Spend */}
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
        <RefreshCw className="h-5 w-5 text-emerald-400" />
      </div>

      <div>
        <div className="text-[12px] text-slate-400">
          Recurring Spend
        </div>

        <div className="text-[14px] font-semibold text-emerald-400">
          {currencySymbol}
          {recurringData.recurringAmount.toFixed(2)}
        </div>
      </div>
    </div>

    <div className={recurringRowSpacing} />
    <div className="border-t border-white/[0.04]" />
    <div className={recurringRowSpacing} />

    {/* One-Time Spend */}
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
        <CircleDollarSign className="h-5 w-5 text-slate-300" />
      </div>

      <div>
        <div className="text-[12px] text-slate-400">
          One-Time Spend
        </div>

        <div className="text-[14px] font-semibold text-white">
          {currencySymbol}
          {recurringData.oneTimeAmount.toFixed(2)}
        </div>
      </div>
    </div>

    <div className={recurringRowSpacing} />
    <div className="border-t border-white/[0.04]" />
    <div className={recurringRowSpacing} />

    {/* Active Subscriptions */}
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
        <BarChart3 className="h-5 w-5 text-slate-300" />
      </div>

      <div>
        <div className="text-[12px] text-slate-400">
          Active Subscriptions
        </div>

        <div className="text-[14px] font-semibold text-white">
          {expenses.filter(
  (expense) =>
    expense.is_recurring &&
    !expense.is_generated &&
    !expense.is_deleted &&
    expense.is_active
).length}
        </div>
      </div>
    </div>

    <div className={recurringRowSpacing} />
    <div className="border-t border-white/[0.04]" />
    <div className={recurringRowSpacing} />

    {/* Monthly Commitment */}
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
        <ArrowRight className="h-5 w-5 text-slate-300" />
      </div>

      <div>
        <div className="text-[12px] text-slate-400">
          Monthly Commitment
        </div>

        <div className="text-[14px] font-semibold text-emerald-400">
          {currencySymbol}
          {recurringData.recurringAmount.toFixed(2)}
          <span className="ml-1 text-[14px] text-slate-400">
            /mo
          </span>
        </div>
      </div>
    </div>

  </div>

</div>


  </div>

  );
}
