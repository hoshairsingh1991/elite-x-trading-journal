import EquityCurveChart
from "./EquityCurveChart";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import { EquityAnalyticsData }

from "@/lib/analytics/equityAnalytics";

import { DailyPnLData }
from "@/lib/analytics/pnlAnalytics";

type EquityCurveCardProps = {
  equityAnalytics: EquityAnalyticsData;
  dailyPnL: DailyPnLData[];
  reportingCurrency: string;
};

export default function EquityCurveCard({
  equityAnalytics,
  dailyPnL,
  reportingCurrency,
}: EquityCurveCardProps) {

  const chartData = [
  {
    date: "Start",
    equity: 0,
  },

  ...equityAnalytics.equityCurve.map(
    (equity, index) => ({
      date:
        dailyPnL[index]?.date ??
        `${index + 1}`,
      equity,
    })
  ),
];
const equityValues =
  equityAnalytics.equityCurve;

const starting =
  equityValues.length > 0
    ? equityValues[0]
    : 0;

const ending =
  equityValues.length > 0
    ? equityValues[
        equityValues.length - 1
      ]
    : 0;

const netChange =
  ending - starting;

const percentChange =
  Math.abs(starting) > 0.01
    ? (
        (netChange /
          Math.abs(starting)) *
        100
      )
    : 0;

const high =
  equityValues.length > 0
    ? Math.max(...equityValues)
    : 0;

const low =
  equityValues.length > 0
    ? Math.min(...equityValues)
    : 0;

const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );


function formatCurrency(
  value: number
) {
  return value >= 0
    ? `+${currencySymbol}${Math.abs(
        value
      ).toFixed(2)}`
    : `-${currencySymbol}${Math.abs(
        value
      ).toFixed(2)}`;
}


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

    hover:-translate-y-1

    hover:border-white/[0.12]
    hover:bg-[#0b0c1e]

    hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)]
  "
>
{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[8px]" />


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-7 pt-5">
        <div className="relative left-3">
          <h3 className="text-[15px] font-semibold text-white">
            Equity Curve
          </h3>

          <p className="mt-1.5 text-[14px] text-slate-500">
            Net Account Value ({reportingCurrency})
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* CONTROLS */}
      {/* ================================================= */}

<div className="mt-5 flex justify-end px-10">
  <div className="relative bottom-8 right-5">

    <button
      className="
        h-[32px]
        min-w-[74px]
        rounded-[12px]
        border
        border-cyan-400/20
        bg-cyan-500/10
        px-4
        text-[13px]
        font-semibold
        text-cyan-300

        transition-all
        duration-200

        hover:bg-cyan-500/15
      "
    >
      Linear
    </button>

  </div>
</div>

{/* ================================================= */}
{/* CHART PLACEHOLDER */}
{/* ================================================= */}

<div className="relative bottom-5 mt-5 px-10">
  <div className="flex justify-center">
    <div
      className="
        h-[275px]
        w-[95%]
        overflow-hidden
        rounded-[8px]
        border
        border-white/[0.05]
        bg-white/[0.02]
      "
    >

<EquityCurveChart
  data={chartData}
  reportingCurrency={
    reportingCurrency
  }
/>

    </div>
  </div>
</div>

{/* ================================================= */}
{/* KPI STRIP */}
{/* ================================================= */}

<div className="relative -top-2 mt-5 flex justify-center">
  <div className="w-[95%]">

    <div className="grid grid-cols-6 gap-2 min-[1600px]:gap-4">

      {/* STARTING */}

      <div className="flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 min-[1400px]:max-[1599px]:whitespace-nowrap">
          Starting
        </p>

        <p className="mt-3 text-[16px] font-bold text-white">
          {formatCurrency(starting)}
        </p>
      </div>

      {/* ENDING */}

      <div className="flex flex-col items-center">
       <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 min-[1400px]:max-[1599px]:whitespace-nowrap">
          Ending
        </p>

        <p
          className={`mt-3 text-[16px] font-bold ${
            ending >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {formatCurrency(ending)}
        </p>
      </div>

      {/* NET CHANGE */}

      <div className="flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 min-[1400px]:max-[1599px]:whitespace-nowrap">
          Net Change
        </p>

        <p
          className={`mt-3 text-[16px] font-bold ${
            netChange >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {formatCurrency(netChange)}
        </p>
      </div>

      {/* PERCENT CHANGE */}

      <div className="flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 min-[1400px]:max-[1599px]:whitespace-nowrap">
          % Change
        </p>

        <p
          className={`mt-3 text-[16px] font-bold ${
            percentChange >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {percentChange.toFixed(1)}%
        </p>
      </div>

      {/* HIGH */}

      <div className="flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 min-[1400px]:max-[1599px]:whitespace-nowrap">
          High
        </p>

        <p className="mt-3 text-[16px] font-bold text-emerald-400">
          {formatCurrency(high)}
        </p>
      </div>

      {/* LOW */}

      <div className="flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 min-[1400px]:max-[1599px]:whitespace-nowrap">
          Low
        </p>

        <p className="mt-3 text-[16px] font-bold text-red-400">
          {formatCurrency(low)}
        </p>
      </div>

    </div>

  </div>
</div>
    </div>
  );
}