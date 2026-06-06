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

{/* ================================================= */}
{/* KPI STRIP */}
{/* ================================================= */}

<div className="mt-6 flex justify-center">
  <div className="relative left-6 w-[95%]">
    <div className="grid grid-cols-6 gap-6">
      {[
        "Starting",
        "Ending",
        "Net Change",
        "% Change",
        "High",
        "Low",
      ].map((label) => (
        <div key={label}>
          <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>

          <div className="mt-3 h-5 w-20 rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  );
}