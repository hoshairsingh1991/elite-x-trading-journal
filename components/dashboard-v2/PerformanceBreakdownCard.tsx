import {
  PerformanceBreakdownData,
} from "@/lib/analytics/performanceBreakdownAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import { useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


type PerformanceBreakdownCardProps = {
  performanceBreakdownAnalytics: PerformanceBreakdownData;
  reportingCurrency: string;
};

export default function PerformanceBreakdownCard({
  performanceBreakdownAnalytics,
  reportingCurrency,
}: PerformanceBreakdownCardProps) {

  const [activeIndex, setActiveIndex] =
  useState<number | null>(null);

const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

const donutData = [
  {
    name: "Long P&L",
    value: Math.abs(
      performanceBreakdownAnalytics.longPnL
    ),
    color: "#41855a",
  },
  {
    name: "Short P&L",
    value: Math.abs(
      performanceBreakdownAnalytics.shortPnL
    ),
    color: "#4b19c0",
  },
  {
    name: "Commissions",
    value: Math.abs(
      performanceBreakdownAnalytics.commissions
    ),
    color: "#124eaf",
  },
];

return (
<div
  className="
    h-[400px]
    overflow-hidden
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]
backdrop-blur-xl

    transition-all
    duration-300

bg-[#0b1220]

hover:-translate-y-1
hover:border-white/[0.12]
hover:bg-[#0b0c1e]
hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
  "
>
      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[10px]" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-7 pt-5">
        <div className="relative left-3">
          <h3 className="text-[15px] font-semibold text-white">
            Performance Breakdown
          </h3>

          <p className="mt-1.5 text-[14px] text-slate-500">
            Trading distribution analysis
          </p>
        </div>
      </div>

{/* ================================================= */}
{/* DONUT + LEGEND */}
{/* ================================================= */}

<div className="mt-8 flex justify-center">
  <div className="w-[95%]">

    <div className="relative top-10 flex items-center justify-center gap-7">

      {/* DONUT PLACEHOLDER */}

      <div className="relative -left-3 h-[165px] w-[165px]">

        <ResponsiveContainer
          width={165}
          height={165}
        >

          <PieChart>

            <Pie
              data={donutData}
              dataKey="value"
              innerRadius={60}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
              onMouseEnter={(_, index) =>
                setActiveIndex(index)
              }
              onMouseLeave={() =>
                setActiveIndex(null)
              }
            >

{donutData.map(
  (entry, index) => (
    <Cell
  key={entry.name}
  fill={entry.color}
  fillOpacity={
    activeIndex === null ||
    activeIndex === index
      ? 1
      : 0.30
  }
  style={{
    transition: "all 200ms ease",
    filter:
      activeIndex === index
        ? "drop-shadow(0 0 4px rgba(65,133,90,0.40))"
        : "none",
  }}
/>
  )
)}

            </Pie>

          </PieChart>

        </ResponsiveContainer>

        {/* CENTER LABEL */}

        <div
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            pointer-events-none
          "
        >

          <div className="text-[20px] font-bold text-slate-300">
            {currencySymbol}
            {performanceBreakdownAnalytics.netTradingPnL.toFixed(2)}
          </div>

          <div
            className="
              mt-1
              text-[9px]
              uppercase
              tracking-[0.14em]
              text-slate-400
            "
          >
            Net P&amp;L
          </div>

        </div>

      </div>

{/* LEGEND */}

<div className="relative left-0 w-[200px] flex flex-col gap-5">

{/* LONG */}

<div className="flex items-center justify-between">

  <div
    className={`
      flex items-center gap-2.5
      transition-all duration-200
      ${
        activeIndex === 0
          ? "translate-x-1"
          : ""
      }
    `}
  >
<div
  className={`
    rounded-full
    transition-all duration-200
    ${
      activeIndex === 0
        ? "h-2.5 w-2.5"
        : "h-2 w-2"
    }
  `}
  style={{ backgroundColor: "#41855a" }}
/>

    <span
      className={`
        text-[14px]
        transition-all duration-200
        ${
          activeIndex === 0
            ? "text-white"
            : "text-slate-400"
        }
      `}
    >
      Long P&amp;L
    </span>
  </div>

  <span
    className={`
      text-[14px]
      font-medium
      transition-all duration-200
      ${
        activeIndex === 0
          ? "-translate-x-1 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.18)]"
          : "text-slate-300"
      }
    `}
  >
    {currencySymbol}
    {performanceBreakdownAnalytics.longPnL.toFixed(2)}
  </span>

</div>

{/* SHORT */}

<div className="flex items-center justify-between">

  <div
    className={`
      flex items-center gap-2.5
      transition-all duration-200
      ${
        activeIndex === 1
          ? "translate-x-1"
          : ""
      }
    `}
  >
<div
  className={`
    rounded-full
    transition-all
    duration-200
    ${
      activeIndex === 1
        ? "h-2.5 w-2.5"
        : "h-2 w-2"
    }
  `}
  style={{
    backgroundColor: "#4b19c0",
  }}
/>

    <span
      className={`
        text-[14px]
        transition-all duration-200
        ${
          activeIndex === 1
            ? "text-white"
            : "text-slate-400"
        }
      `}
    >
      Short P&amp;L
    </span>
  </div>

  <span
    className={`
      text-[14px]
      font-medium
      transition-all duration-200
      ${
        activeIndex === 1
          ? "-translate-x-1 text-white drop-shadow-[0_0_6px_rgba(75,25,192,0.30)]"
          : "text-slate-300"
      }
    `}
  >
    {currencySymbol}
    {performanceBreakdownAnalytics.shortPnL.toFixed(2)}
  </span>

</div>

{/* COMMISSIONS */}

<div className="flex items-center justify-between">

  <div
    className={`
      flex items-center gap-2.5
      transition-all duration-200
      ${
        activeIndex === 2
          ? "translate-x-1"
          : ""
      }
    `}
  >
<div
  className={`
    rounded-full
    transition-all
    duration-200
    ${
      activeIndex === 2
        ? "h-2.5 w-2.5"
        : "h-2 w-2"
    }
  `}
  style={{
    backgroundColor: "#124eaf",
  }}
/>

    <span
      className={`
        text-[14px]
        transition-all duration-200
        ${
          activeIndex === 2
            ? "text-white"
            : "text-slate-400"
        }
      `}
    >
      Commissions
    </span>
  </div>

  <span
    className={`
      text-[14px]
      font-medium
      transition-all duration-200
      ${
        activeIndex === 2
          ? "-translate-x-1 text-white drop-shadow-[0_0_6px_rgba(59,130,246,0.30)]"
          : "text-slate-300"
      }
    `}
  >
    {currencySymbol}
    {Math.abs(
      performanceBreakdownAnalytics.commissions
    ).toFixed(2)}
  </span>

</div>

</div>

</div>

</div>
</div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

      <div className="h-[120px]" />

{/* ================================================= */}
{/* BOTTOM METRICS */}
{/* ================================================= */}

<div className="flex justify-center">
  <div className="w-[92%]">

    <div className="grid grid-cols-3 gap-5">

      {/* LONG TRADES */}

      <div className="flex flex-col items-center">

        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
          Long Trades
        </p>

        <p className="mt-2.5 text-[18px] font-semibold text-white">
          {performanceBreakdownAnalytics.longTrades}
        </p>

      </div>

      {/* SHORT TRADES */}

      <div className="flex flex-col items-center">

        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
          Short Trades
        </p>

        <p className="mt-2.5 text-[18px] font-semibold text-white">
          {performanceBreakdownAnalytics.shortTrades}
        </p>

      </div>

      {/* GROSS P&L */}

      <div className="flex flex-col items-center">

        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
          Gross P&amp;L
        </p>

        <p className="mt-2.5 text-[18px] font-semibold text-emerald-400">
          {currencySymbol}
          {performanceBreakdownAnalytics.grossPnL.toFixed(2)}
        </p>

      </div>

    </div>

  </div>
</div>

    </div>
  );
}