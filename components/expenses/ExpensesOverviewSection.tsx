"use client";

import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Info,
  RefreshCw,
} from "lucide-react";

export default function ExpensesOverviewSection() {


// =====================================================
// Auto Expense Source Fine Tuning
// =====================================================

const autoIconX = "translate-x-6";
const autoIconY = "translate-y-14";

const autoBadgeX = "-translate-x-3";
const autoBadgeY = "translate-y-0";

const autoTextX = "translate-x-25";
const autoTextY = "-translate-y-4";

const autoButtonX = "translate-x-16";
const autoButtonY = "translate-y-0";

// =====================================================
// Manual Expense Source Fine Tuning
// =====================================================

const manualIconX = "translate-x-6";
const manualIconY = "translate-y-14";

const manualBadgeX = "-translate-x-4";
const manualBadgeY = "translate-y-1";

const manualTextX = "translate-x-25";
const manualTextY = "-translate-y-4";

const manualButtonX = "translate-x-16";
const manualButtonY = "translate-y-0";

  // =====================================================
// Expense Breakdown Fine Tuning
// =====================================================

// Title
const breakdownTitleX = "translate-x-4";
const breakdownTitleY = "translate-y-1";

// Info icon
const breakdownInfoX = "-translate-x-62";
const breakdownInfoY = "translate-y-1";

// Donut chart
const breakdownChartX = "-translate-x-30";
const breakdownChartY = "translate-y-10";

// Legend
const breakdownLegendX = "translate-x-60";
const breakdownLegendY = "-translate-y-28";


// =====================================================
// Recurring Fine Tuning
// =====================================================

// Title
const recurringTitleX = "translate-x-4";
const recurringTitleY = "translate-y-1";

// Info icon
const recurringInfoX = "-translate-x-85";
const recurringInfoY = "translate-y-1";

// Donut
const recurringChartX = "-translate-x-30";
const recurringChartY = "translate-y-10";

// Legend
const recurringLegendX = "translate-x-60";
const recurringLegendY = "-translate-y-24";

  // =====================================================
  // Expenses Over Time Fine Tuning
  // =====================================================

  const titleX = "translate-x-4";
  const titleY = "translate-y-0";

  const controlsX = "-translate-x-5";
  const controlsY = "translate-y-1";

  const legendX = "translate-x-4";
  const legendY = "translate-y-0";

  const chartX = "translate-x-0";
  const chartY = "translate-y-0";

return (

  
  <div className="grid grid-cols-13 gap-5">

    
    {/* ================================================= */}
    {/* Expenses Over Time */}
    {/* ================================================= */}

    <div className="col-span-5 rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
      {/* Top Spacer */}
      <div className="h-2" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={`${titleX} ${titleY}`}>
          <h3 className="text-[18px] font-semibold text-white">
            Expenses Over Time
          </h3>
        </div>

        <div
          className={`flex items-center gap-2 ${controlsX} ${controlsY}`}
        >
<button
  className="
    flex
    h-[32px]          /* <-- Adjust height here */
    w-[32px]          /* <-- Adjust width here */
    items-center
    justify-center
    rounded-[12px]
    bg-white/5
    text-[13px]
    font-medium
    text-slate-300
    transition
    hover:bg-white/10
  "
>
  M
</button>

<button
  className="
    flex
    h-[32px]
    w-[32px]
    items-center
    justify-center
    rounded-[12px]
    bg-white/5
    text-[13px]
    font-medium
    text-slate-300
    transition
    hover:bg-white/10
  "
>
  Q
</button>

<button
  className="
    flex
    h-[32px]
    w-[32px]
    items-center
    justify-center
    rounded-[12px]
    bg-blue-500
    text-[13px]
    font-semibold
    text-white
    transition
    hover:bg-blue-400
  "
>
  Y
</button>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-" />

{/* Legend */}
<div
  className={`flex flex-wrap items-center gap-2 ${legendX} ${legendY}`}
>
<span className="rounded-full px-4 py-2 text-[14px] font-medium text-blue-300">
  ● Manual Expenses
</span>

<span className="rounded-full px-4 py-2 text-[14px] font-medium text-violet-300">
  ● Commissions
</span>

<span className="rounded-full px-4 py-2 text-[14px] font-medium text-emerald-300">
  ● Total Costs
</span>
</div>

      {/* Spacer */}
      <div className="h-2" />

      {/* Chart */}
      <div className={`flex justify-center ${chartX} ${chartY}`}>
        <div className="flex h-[270px] w-[96%] items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <BarChart3 className="h-14 w-14 text-slate-600" />
        </div>
      </div>

      {/* Bottom Spacer */}
      
    </div>

    {/* KEEP THE REST OF YOUR FILE (Expense Breakdown, Recurring, Expense Sources)
        EXACTLY AS IT IS BELOW THIS LINE */}

{/* ================================================= */}
{/* Expense Breakdown */}
{/* ================================================= */}

<div className="col-span-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${breakdownTitleX} ${breakdownTitleY}`}>
      <h3 className="text-[18px] font-semibold text-white">
        Expense Breakdown
      </h3>
    </div>

    <div className={`${breakdownInfoX} ${breakdownInfoY}`}>
      <Info className="h-4 w-4 text-slate-500" />
    </div>
  </div>

  {/* Spacer */}
  <div className="h-6" />

  {/* Donut */}
  <div
    className={`flex justify-center ${breakdownChartX} ${breakdownChartY}`}
  >
    <div className="flex h-[170px] w-[170px] items-center justify-center rounded-full border-[16px] border-blue-500/70">
      <div className="text-center">
        <div className="text-[28px] font-bold text-white">72%</div>
        <div className="mt-1 text-[12px] text-slate-400">
          Total
        </div>
      </div>
    </div>
  </div>

  {/* Spacer */}
  <div className="h-6" />

  {/* Legend */}
  <div
    className={`mx-auto max-w-[200px] space-y-3 text-[15px] ${breakdownLegendX} ${breakdownLegendY}`}
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        Software
      </span>

      <span className="text-white">42%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
        Data
      </span>

      <span className="text-white">28%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        Education
      </span>

      <span className="text-white">18%</span>
    </div>
<div className="h-1" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Other
      </span>

      <span className="text-white">12%</span>
    </div>
  </div>
</div>

{/* ================================================= */}
{/* Recurring */}
{/* ================================================= */}

<div className="col-span-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
  {/* Top Spacer */}
  <div className="h-2" />

  {/* Header */}
  <div className="flex items-center justify-between">
    <div className={`${recurringTitleX} ${recurringTitleY}`}>
      <h3 className="text-[18px] font-semibold text-white">
        Recurring
      </h3>
    </div>

    <div className={`${recurringInfoX} ${recurringInfoY}`}>
      <Info className="h-4 w-4 text-slate-500" />
    </div>
  </div>

  {/* Spacer */}
  <div className="h-6" />

  {/* Donut */}
  <div
    className={`flex justify-center ${recurringChartX} ${recurringChartY}`}
  >
    <div className="flex h-[170px] w-[170px] items-center justify-center rounded-full border-[16px] border-emerald-500/70">
      <div className="text-center">
        <div className="text-[28px] font-bold text-white">
          81%
        </div>

        <div className="mt-1 text-[12px] text-slate-400">
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

      <span className="text-white">81%</span>
    </div>
<div className="h-4" />
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
        One-Time
      </span>

      <span className="text-white">19%</span>
    </div>
  </div>
</div>

{/* ================================================= */}
{/* Expense Sources */}
{/* ================================================= */}

<div className="col-span-2 flex flex-col">
  {/* Header */}
  <div className="mb-5 flex items-center justify-between">
    <h3 className="text-[18px] font-semibold text-white">
      Expense Sources
    </h3>

    <Info className="h-4 w-4 text-slate-500" />
  </div>

  {/* Cards */}
  <div className="flex flex-1 flex-col gap-5">
<div className="h-0" />
 {/* ================================================= */}
{/* Auto Card */}
{/* ================================================= */}

<div className="flex-1 rounded-[20px] border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-5">

  {/* Top Row */}
  <div className="flex items-start justify-between">

<div className={`${autoIconX} ${autoIconY}`}>
  <div className="flex h-[34px] w-[52px] items-center justify-center">
    <RefreshCw className="h-8 w-8 text-violet-300" />
  </div>
</div>

<div className={`${autoBadgeX} ${autoBadgeY}`}>
  <span className="rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
    AUTO
  </span>
</div>

  </div>

  {/* Text Block */}
  <div className={`${autoTextX} ${autoTextY}`}>
    <div className="mt-4 text-[16px] font-medium text-slate-300">
      Auto Calculated
    </div>

    <div className="mt-1 text-[13px] text-slate-400">
      Trade Commissions
    </div>
<div className="h-2" />
    <div className="mt-3 text-[28px] font-bold leading-none text-white">
      C$356.44
    </div>

    <div className="mt-2 text-[14px] text-slate-400">
      This Period
    </div>
  </div>
</div>

{/* ================================================= */}
{/* Manual Card */}
{/* ================================================= */}

<div className="flex-1 rounded-[20px] border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-5">

  {/* Top Row */}
  <div className="flex items-start justify-between">

<div className={`${manualIconX} ${manualIconY}`}>
  <div className="flex h-[34px] w-[52px] items-center justify-center">
    <CircleDollarSign className="h-8 w-8 text-blue-300" />
  </div>
</div>

<div className={`${autoBadgeX} ${autoBadgeY}`}>
  <span className="rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
    MANUAL
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
      C$1,284.17
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