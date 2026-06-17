"use client";

import Image from "next/image";

import type { Expense } from "@/lib/types/expense";

import {
  CalendarClock,
  Flame,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

interface ExpensesIntelligenceSectionProps {
  expenses: Expense[];
}

export default function ExpensesIntelligenceSection({
  expenses,
}: ExpensesIntelligenceSectionProps) {

    /* =====================================================
   PROFIT RETENTION FINE TUNING
   ===================================================== */

const profitHeaderX = "translate-x-2";
const profitHeaderY = "-translate-y-4";

const profitValueX = "translate-x-6";
const profitValueY = "-translate-y-8";

const profitDonutX = "-translate-x-3";
const profitDonutY = "translate-y-4";

const profitMetricsX = "translate-x-4";
const profitMetricsY = "-translate-y-2";
const profitMetricsWidth = "w-[90%]";


/* =====================================================
   PROJECTED ANNUAL FINE TUNING
   ===================================================== */

const projectedHeaderX = "translate-x-2";
const projectedHeaderY = "translate-y-2";

const projectedValueX = "translate-x-5";
const projectedValueY = "translate-y-4";

const projectedMetricsX = "translate-x-4";
const projectedMetricsY = "translate-y-6";
const projectedMetricsWidth = "w-[90%]";


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
const burnMetricsY = "translate-y-6";
const burnMetricsWidth = "w-[90%]";




/* =====================================================
   UPCOMING RENEWALS FINE TUNING
   ===================================================== */

const renewalsHeaderX = "translate-x-2";
const renewalsHeaderY = "translate-y-2";

const renewalsButtonX = "-translate-x-4";
const renewalsButtonY = "translate-y-0";

const renewalsListX = "translate-x-4";
const renewalsListY = "translate-y-7";

const renewalsWidth = "w-[90%]";

const renewalIconX = "translate-x-0";
const renewalIconY = "translate-y-0";

const renewalIconSize = 25;

const renewalNameX = "translate-x-2";
const renewalNameY = "translate-y-0";

const renewalDateX = "-translate-x-1";
const renewalDateY = "translate-y-0";

const renewalDaysX = "-translate-x-3";
const renewalDaysY = "translate-y-0";

  /* =====================================================
   AVG COST PER TRADE FINE TUNING
   ===================================================== */

const avgHeaderX = "translate-x-2";
const avgHeaderY = "translate-y-2";

const avgTrendX = "translate-x-0";
const avgTrendY = "translate-y-2";

const avgValueX = "translate-x-6";
const avgValueY = "translate-y-5";

const avgMetricsX = "translate-x-4";
const avgMetricsY = "translate-y-12";
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

// Main score block (94/100 + Excellent)
const scoreX = "translate-x-8";
const scoreY = "translate-y-5";

// Sparkline
const sparklineX = "translate-x-2";
const sparklineY = "translate-y-3";

// Metrics section
const metricsX = "translate-x-4";
const metricsY = "translate-y-6";
const metricsWidth = "w-[90%]";


 const cardClass =
  "group flex h-[220px] flex-col rounded-[22px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-200 hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.045]";

const renewalBoxSize = "h-7 w-7"; // try h-7 w-7, h-8 w-8, h-9 w-9

  return (
    <div className="grid grid-cols-6 gap-5">


        

{/* ================================================= */}
{/* Expense Efficiency */}
{/* ================================================= */}


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

      <span className="text-[13px] font-semibold text-white">
        Expense Efficiency
      </span>
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
  {/* Score + Sparkline */}
  {/* ============================================= */}

  <div className="mt-6 flex items-end justify-between">
    <div
      className={`
        ${scoreX}
        ${scoreY}
      `}
    >
      <div className="text-[42px] font-bold leading-none text-white">
        94
        <span className="text-[22px] text-slate-500">
          /100
        </span>
      </div>

      <p className="mt-2 text-[13px] font-medium text-emerald-400">
        Excellent
      </p>
    </div>

    {/* Sparkline */}
    <div
      className={`
        flex
        h-14
        w-20
        items-end
        gap-1
        opacity-70

        ${sparklineX}
        ${sparklineY}
      `}
    >
      <div className="h-3 w-1 rounded bg-emerald-500" />
      <div className="h-5 w-1 rounded bg-emerald-500" />
      <div className="h-4 w-1 rounded bg-emerald-500" />
      <div className="h-7 w-1 rounded bg-emerald-500" />
      <div className="h-6 w-1 rounded bg-emerald-500" />
      <div className="h-9 w-1 rounded bg-emerald-500" />
      <div className="h-8 w-1 rounded bg-emerald-500" />
      <div className="h-12 w-1 rounded bg-emerald-500" />
    </div>
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
  {/* Tax Efficiency */}
  <div className="flex items-center justify-between text-[11px] text-slate-400">
    <span>Tax Efficiency</span>
    <span>92/100</span>
  </div>

  <div className="mt-1 h-1.5 rounded-full bg-white/5">
    <div className="h-1.5 w-[88%] rounded-full bg-emerald-400" />
  </div>

  <div className="h-[4px]" />

  {/* Recurring Ratio */}
  <div className="flex items-center justify-between text-[11px] text-slate-400">
    <span>Recurring Ratio</span>
    <span>88/100</span>
  </div>

  <div className="mt-1 h-1.5 rounded-full bg-white/5">
    <div className="h-1.5 w-[84%] rounded-full bg-emerald-400" />
  </div>

  <div className="h-[4px]" />

  {/* Commission Impact */}
  <div className="flex items-center justify-between text-[11px] text-slate-400">
    <span>Commission Impact</span>
    <span>90/100</span>
  </div>

  <div className="mt-1 h-1.5 rounded-full bg-white/5">
    <div className="h-1.5 w-[86%] rounded-full bg-emerald-400" />
  </div>

  <div className="h-[4px]" />

  {/* Vendor Diversification */}
  <div className="flex items-center justify-between text-[11px] text-slate-400">
    <span>Vendor Diversification</span>
    <span>96/100</span>
  </div>

  <div className="mt-1 h-1.5 rounded-full bg-white/5">
    <div className="h-1.5 w-[92%] rounded-full bg-emerald-400" />
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

      <span className="text-[13px] font-semibold text-white">
        Avg Cost / Trade
      </span>
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
    <div className="text-[38px] font-bold leading-none text-white">
      C$3.42
    </div>

    <p
      className={`
        mt-2
        text-[13px]
        font-medium
        text-emerald-400

        ${avgTrendX}
        ${avgTrendY}
      `}
    >
      ↓ 5.2% vs last month
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
      <span>C$1.19</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Software / Trade</span>
      <span>C$1.28</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Other / Trade</span>
      <span>C$0.95</span>
    </div>

    <div className="my-3 h-px bg-white/10" />
 <div className="h-[6px]" />
    <div className="flex justify-between text-[11px] font-semibold text-white">
      <span>Total Business Cost</span>
      <span>C$3.42</span>
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

      <span className="text-[13px] font-semibold text-white">
        Profit Retention
      </span>
    </div>

    {/* Donut Placeholder */}
    <div
      className={`
        h-18
        w-18
        rounded-full
        border-[6px]
        border-emerald-400/80
        border-r-emerald-400/20

        ${profitDonutX}
        ${profitDonutY}
      `}
    />
  </div>

  {/* Main Value */}
  <div
    className={`
      ${profitValueX}
      ${profitValueY}
    `}
  >
    <div className="text-[38px] font-bold leading-none text-white">
      92.8%
    </div>

    <p className="mt-2 text-[13px] font-medium text-emerald-400">
      ↑ 2.4% vs last 30 days
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
      <span>Gross P&amp;L</span>
      <span className="text-white">C$22.6k</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Expenses</span>
      <span className="text-red-400">C$1.6k</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Net Retained</span>
      <span className="text-emerald-400">C$21.0k</span>
    </div>

    <div className="my-3 h-px bg-white/10" />
<div className="h-[6px]" />
    <div className="flex justify-between text-[11px] font-semibold text-white">
      <span>Retention Rate</span>
      <span>92.8%</span>
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

      <span className="text-[13px] font-semibold text-white">
        Projected Annual
      </span>
    </div>
  </div>

  {/* Value */}
  <div
    className={`
      ${projectedValueX}
      ${projectedValueY}
    `}
  >
    <div className="text-[38px] font-bold leading-none text-white">
      C$5,873
    </div>

    <p className="mt-2 text-[13px] text-slate-400">
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
      <span>Software</span>
      <span>C$2,100</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Market Data</span>
      <span>C$1,050</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Commissions</span>
      <span>C$1,420</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Other</span>
      <span>C$1,303</span>
    </div>

    <div className="my-3 h-px bg-white/10" />
<div className="h-[6px]" />
    <div className="flex justify-between text-[11px] font-semibold text-white">
      <span>Projected Total</span>
      <span>C$5,873</span>
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

      <span className="text-[13px] font-semibold text-white">
        Monthly Burn
      </span>
    </div>
  </div>

  {/* Value */}
  <div
    className={`
      ${burnValueX}
      ${burnValueY}
    `}
  >
    <div className="text-[38px] font-bold leading-none text-white">
      C$273
    </div>

    <p
      className={`
        mt-2
        text-[13px]
        font-medium
        text-emerald-400

        ${burnTrendX}
        ${burnTrendY}
      `}
    >
      Stable over last 90 days
    </p>
  </div>

  {/* Mini Burn Chart */}
  <div
    className={`
      mt-5
      flex
      h-12
      items-end
      gap-1

      ${burnChartX}
      ${burnChartY}
    `}
  >
    <div className="h-3 w-2 rounded bg-red-500/60" />
    <div className="h-5 w-2 rounded bg-red-500/60" />
    <div className="h-7 w-2 rounded bg-orange-500/70" />
    <div className="h-6 w-2 rounded bg-orange-500/70" />
    <div className="h-8 w-2 rounded bg-yellow-500/70" />
    <div className="h-9 w-2 rounded bg-yellow-500/70" />
    <div className="h-10 w-2 rounded bg-emerald-500/70" />
    <div className="h-11 w-2 rounded bg-emerald-500/80" />
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
      <span>Daily Avg</span>
      <span>C$9.10</span>
    </div>

    <div className="h-[6px]" />

    <div className="flex justify-between text-[11px] text-slate-400">
      <span>30-Day Total</span>
      <span>C$273</span>
    </div>

    <div className="my-3 h-px bg-white/10" />
<div className="h-[6px]" />
    <div className="flex justify-between text-[11px] font-semibold text-white">
      <span>Projected Month-End</span>
      <span>C$281</span>
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

      <span className="text-[13px] font-semibold text-white">
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
    {/* TradingView */}
    <div className="flex items-center justify-between">
      <div className="flex items-center">


<div
  className={`
    flex
    ${renewalBoxSize}
    items-center
    justify-center
    rounded-lg
    bg-white

    ${renewalIconX}
    ${renewalIconY}
  `}
>


<Image
  src="/icons/expenses/tradingview.png"
  alt="TradingView"
width={renewalIconSize}
height={renewalIconSize}
/>
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
          TradingView
        </span>
      </div>

      <div className="flex items-center gap-5">
        <span
          className={`
            text-[11px]
            text-slate-400

            ${renewalDateX}
            ${renewalDateY}
          `}
        >
          Jun 18, 2026
        </span>

        <span
          className={`
            min-w-[55px]
            text-right
            text-[11px]
            font-semibold
            text-orange-400

            ${renewalDaysX}
            ${renewalDaysY}
          `}
        >
          7 days
        </span>
      </div>
    </div>

    <div className="h-[12px]" />

{/* CME */}
<div className="flex items-center justify-between">
  <div className="flex items-center">

   <div
  className={`
    flex
    ${renewalBoxSize}
    items-center
    justify-center
    rounded-lg
    bg-white

    ${renewalIconX}
    ${renewalIconY}
  `}
>
      <span className="text-[10px] font-bold tracking-tight text-sky-700">
        CME
      </span>
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
  CME Market Data
</span>
  </div>

  <div className="flex items-center gap-5">
    <span className="text-[11px] text-slate-400">
      Jun 25, 2026
    </span>

    <span className="min-w-[55px] text-right text-[11px] font-semibold text-orange-400">
      14 days
    </span>
  </div>
</div>

<div className="h-[12px]" />

{/* DigitalOcean */}
<div className="flex items-center justify-between">
  <div className="flex items-center">
<div
  className={`
    flex
    ${renewalBoxSize}
    items-center
    justify-center
    rounded-lg
    bg-[#0069FF]
    p-1

    ${renewalIconX}
    ${renewalIconY}
  `}
>
<Image
  src="/icons/expenses/digitalocean.png"
  alt="DigitalOcean"
  width={renewalIconSize}
  height={renewalIconSize}
  className="h-auto w-auto object-contain"
/>
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
      DigitalOcean VPS
    </span>
  </div>

  <div className="flex items-center gap-5">
    <span
      className={`
        text-[11px]
        text-slate-400

        ${renewalDateX}
        ${renewalDateY}
      `}
    >
      Jul 2, 2026
    </span>

    <span
      className={`
        min-w-[55px]
        text-right
        text-[11px]
        font-semibold
        text-orange-400

        ${renewalDaysX}
        ${renewalDaysY}
      `}
    >
      21 days
    </span>
  </div>
</div>

<div className="h-[12px]" />

{/* NinjaTrader */}
<div className="flex items-center justify-between">
  <div className="flex items-center">
<div
  className={`
    flex
    ${renewalBoxSize}
    items-center
    justify-center
    rounded-lg
    bg-[#0069FF]
    p-1

    ${renewalIconX}
    ${renewalIconY}
  `}
>
      <Image
        src="/icons/expenses/ninjatrader.png"
        alt="NinjaTrader"
        width={renewalIconSize}
        height={renewalIconSize}
        className="object-contain"
      />
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
      NinjaTrader
    </span>
  </div>

  <div className="flex items-center gap-5">
    <span
      className={`
        text-[11px]
        text-slate-400

        ${renewalDateX}
        ${renewalDateY}
      `}
    >
      Jul 6, 2026
    </span>

    <span
      className={`
        min-w-[55px]
        text-right
        text-[11px]
        font-semibold
        text-orange-400

        ${renewalDaysX}
        ${renewalDaysY}
      `}
    >
      25 days
    </span>
  </div>
</div>
  </div>
</div>
    </div>
       
  );
}