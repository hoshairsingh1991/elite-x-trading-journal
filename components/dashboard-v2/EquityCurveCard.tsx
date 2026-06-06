import EquityCurveChart
from "./EquityCurveChart";

import { EquityAnalyticsData }
from "@/lib/analytics/equityAnalytics";

import { DailyPnLData }
from "@/lib/analytics/pnlAnalytics";

type EquityCurveCardProps = {
  equityAnalytics: EquityAnalyticsData;
  dailyPnL: DailyPnLData[];
};

export default function EquityCurveCard({
  equityAnalytics,
  dailyPnL,
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

function formatCurrency(
  value: number
) {
  return value >= 0
    ? `+$${Math.abs(
        value
      ).toFixed(2)}`
    : `-$${Math.abs(
        value
      ).toFixed(2)}`;
}


  return (
    <div
      className="
        h-[500px]
        overflow-hidden
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl
      "
    >
{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[10px]" />


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-8 pt-7">
        <div className="relative left-4">
          <h3 className="text-[16px] font-semibold text-white">
            Equity Curve
          </h3>

          <p className="mt-2 text-[15px] text-slate-500">
            Net Account Value (USD)
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* CONTROLS */}
      {/* ================================================= */}

<div className="mt-7 flex justify-end px-12">
  <div className="relative bottom-10 right-6">

    <button
      className="
        h-[35px]
        min-w-[80px]
        rounded-[14px]
        border
        border-cyan-400/20
        bg-cyan-500/10
        px-5
        text-[14px]
        font-semibold
        text-cyan-300
      "
    >
      Linear
    </button>

  </div>
</div>



      {/* ================================================= */}
      {/* CHART PLACEHOLDER */}
      {/* ================================================= */}

<div className="relative bottom-6 mt-6 px-12">
  <div className="flex justify-center">
    <div
      className="
        h-[320px]
        w-[95%]
        overflow-hidden
        rounded-[20px]
        border
        border-white/[0.05]
        bg-white/[0.02]
      "
    >
      <EquityCurveChart
        data={chartData}
      />
    </div>
  </div>
</div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[8px]" />

{/* ================================================= */}
{/* KPI STRIP */}
{/* ================================================= */}

<div className="mt-6 flex justify-center">
  <div className="relative left-0 w-[95%]">

    <div className="grid grid-cols-6 gap-6">

      {/* STARTING */}

      <div className="flex flex-col items-center">
        <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
          Starting
        </p>

        <p className="mt-4 text-[20px] font-bold text-white">
          {formatCurrency(starting)}
        </p>
      </div>

      {/* ENDING */}

      <div className="flex flex-col items-center">
        <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
          Ending
        </p>

        <p
          className={`mt-4 text-[20px] font-bold ${
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
        <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
          Net Change
        </p>

        <p
          className={`mt-4 text-[20px] font-bold ${
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
        <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
          % Change
        </p>

        <p
          className={`mt-4 text-[20px] font-bold ${
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
        <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
          High
        </p>

        <p className="mt-4 text-[20px] font-bold text-emerald-400">
          {formatCurrency(high)}
        </p>
      </div>

      {/* LOW */}

      <div className="flex flex-col items-center">
        <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
          Low
        </p>

        <p className="mt-4 text-[20px] font-bold text-red-400">
          {formatCurrency(low)}
        </p>
      </div>

    </div>

  </div>
</div>
    </div>
  );
}