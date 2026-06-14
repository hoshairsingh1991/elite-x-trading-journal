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
const breakdownTitleY = "translate-y-1";

// Info icon
const breakdownInfoX = "-translate-x-62";
const breakdownInfoY = "translate-y-1";

// Donut chart
const breakdownChartX = "-translate-x-30";
const breakdownChartY = "translate-y-10";

// Legend
const breakdownLegendX = "translate-x-56";
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
const recurringLegendY = "-translate-y-20";

  // =====================================================
  // Expenses Over Time Fine Tuning
  // =====================================================

  const titleX = "translate-x-4";
  const titleY = "translate-y-0";

  const controlsX = "-translate-x-4";
  const controlsY = "translate-y-2";

  const legendX = "translate-x-2";
  const legendY = "translate-y-1";

  const chartX = "translate-x-0";
  const chartY = "translate-y-3";

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

    <div className={`flex items-center gap-2 ${controlsX} ${controlsY}`}>
      <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[12px] font-medium text-slate-300">
        M
      </button>

      <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[12px] font-medium text-slate-300">
        Q
      </button>

      <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-[12px] font-semibold text-white">
        Y
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

    <div className="flex items-center gap-2 text-violet-300">
      <span className="h-2 w-2 rounded-full bg-violet-400" />
      Commissions
    </div>

    <div className="flex items-center gap-2 text-emerald-300">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      Total Costs
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
      <div className="absolute left-3 top-2 flex h-[215px] flex-col justify-between text-[10px] text-slate-500">
        <span>C$2.5K</span>
        <span>C$2.0K</span>
        <span>C$1.5K</span>
        <span>C$1.0K</span>
        <span>C$500</span>
        <span>C$0</span>
      </div>

{/* Bottom Axis */}
<div className="absolute left-14 right-4 bottom-8 h-px bg-white/5" />

{/* Bars */}
<div className="absolute bottom-8 left-20 right-8 flex items-end justify-between">
  {[
    { month: "Jan", manual: 55, comm: 18 },
    { month: "Feb", manual: 70, comm: 22 },
    { month: "Mar", manual: 50, comm: 16 },
    { month: "Apr", manual: 82, comm: 24 },
    { month: "May", manual: 96, comm: 30 },
    { month: "Jun", manual: 78, comm: 22 },
  ].map((item) => (
    <div key={item.month} className="flex flex-col items-center">
      {/* Dot + Bar Group */}
      <div className="relative flex flex-col items-center">
        {/* Floating dot */}
        <div className="absolute -top-5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />

        {/* Stacked bars */}
        <div className="flex flex-col">
          <div
            className="w-7 rounded-t bg-violet-700/70"
            style={{ height: `${item.comm}px` }}
          />

          <div
            className="w-7 bg-blue-700/75"
            style={{ height: `${item.manual}px` }}
          />
        </div>
      </div>

      {/* Month */}
      <span className="mt-3 text-[11px] text-slate-500">
        {item.month}
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

    <div className={`${breakdownInfoX} ${breakdownInfoY}`}>
      <Info className="h-4 w-4 text-slate-500" />
    </div>
  </div>

  {/* Spacer */}
  <div className="h-4" />

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
          72%
        </div>

        <div className="mt-2 text-[12px] text-slate-400">
          Total
        </div>
      </div>
    </div>
  </div>

  {/* Spacer */}
  <div className="h-6" />

  {/* Legend */}
  <div
    className={`mx-auto max-w-[220px] space-y-2 text-[14px] ${breakdownLegendX} ${breakdownLegendY}`}
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        Software
      </span>
      <span className="text-white">34%</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
        Market Data
      </span>
      <span className="text-white">22%</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        Brokerage Fees
      </span>
      <span className="text-white">16%</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        Education
      </span>
      <span className="text-white">10%</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Infrastructure
      </span>
      <span className="text-white">11%</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
        Other
      </span>
      <span className="text-white">7%</span>
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
  <div
    className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full"
    style={{
      background: `
        conic-gradient(
          #10b981 0% 81%,
          #64748b 81% 100%
        )
      `,
    }}
  >
    {/* Inner Cutout */}
    <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-[#061325]">
      <div className="text-[34px] font-bold leading-none text-white">
        81%
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

      <span className="text-white">81%</span>
    </div>
<div className="h-2" />
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