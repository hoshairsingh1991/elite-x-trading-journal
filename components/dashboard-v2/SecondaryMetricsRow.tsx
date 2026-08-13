import {
  PnLAnalyticsData,
} from "@/lib/analytics/pnlAnalytics";

import {
  ConsistencyAnalyticsData,
} from "@/lib/analytics/consistencyAnalytics";

import {
  EquityAnalyticsData,
} from "@/lib/analytics/equityAnalytics";

import {
  SecondaryMetricsAnalyticsData,
} from "@/lib/analytics/secondaryMetricsAnalytics";

import {
  Repeat,
} from "lucide-react";

import { Shield } from "lucide-react";

import { BarChart3 } from "lucide-react";

import { Crosshair } from "lucide-react";

import { Target } from "lucide-react";

import { LocateFixed } from "lucide-react";

import { Activity } from "lucide-react";

import { Flame } from "lucide-react";

import MetricInfoTooltip from "./MetricInfoTooltip";

type SecondaryMetricsRowProps = {
  pnlAnalytics: PnLAnalyticsData;
  consistencyAnalytics: ConsistencyAnalyticsData;
  equityAnalytics: EquityAnalyticsData;
  secondaryMetricsAnalytics: SecondaryMetricsAnalyticsData;
};

export default function SecondaryMetricsRow({
  pnlAnalytics,
  consistencyAnalytics,
  equityAnalytics,
  secondaryMetricsAnalytics,
}: SecondaryMetricsRowProps) {

  const streakLabel =
    pnlAnalytics.streakType === "WINNING"
      ? "Winning Days"
      : "Losing Days";

const streakColor =
  pnlAnalytics.streakType === "WINNING"
    ? "text-emerald-400"
    : "text-red-400";

const consistencyScore =
  consistencyAnalytics.consistencyScore;

const consistencyLabel =
  consistencyScore >= 80
    ? "Excellent"
    : consistencyScore >= 65
    ? "Good"
    : consistencyScore >= 50
    ? "Fair"
    : "Poor";

let consistencyColor =
  "text-red-400";

if (
  consistencyScore >= 80
) {
  consistencyColor =
    "text-emerald-400";
}
else if (
  consistencyScore >= 65
) {
  consistencyColor =
    "text-green-400";
}
else if (
  consistencyScore >= 50
) {
  consistencyColor =
    "text-sky-500";
}

const calmarRatio =
  equityAnalytics.calmarRatio;

const calmarLabel =
  calmarRatio >= 2
    ? "Excellent"
    : calmarRatio >= 1
    ? "Good"
    : calmarRatio >= 0.5
    ? "Fair"
    : "Poor";

let calmarColor =
  "text-red-400";

if (
  calmarRatio >= 2
) {
  calmarColor =
    "text-emerald-400";
}
else if (
  calmarRatio >= 1
) {
  calmarColor =
    "text-green-400";
}
else if (
  calmarRatio >= 0.5
) {
  calmarColor =
    "text-sky-500";
}

    const mostTradedTicker =
  secondaryMetricsAnalytics.mostTradedTicker;

const mostTradedTradeCount =
  secondaryMetricsAnalytics.mostTradedTradeCount;

  const tradeFrequency =
  secondaryMetricsAnalytics.tradeFrequency;

const activeTradingDays =
  secondaryMetricsAnalytics.activeTradingDays;

  const volatility =
  pnlAnalytics.volatility;

  const avgDaily =
  Math.abs(
    pnlAnalytics.avgDaily
  );

const volatilityRatio =
  avgDaily > 0
    ? volatility / avgDaily
    : 0;

let volatilityLabel = "Low";
let volatilityColor =
  "text-emerald-400";

if (
  volatilityRatio >= 4
) {
  volatilityLabel =
    "Very High";

  volatilityColor =
    "text-rose-500";
}
else if (
  volatilityRatio >= 2
) {
  volatilityLabel =
    "High";

  volatilityColor =
    "text-red-400";
}
else if (
  volatilityRatio >= 1
) {
  volatilityLabel =
    "Moderate";

  volatilityColor =
    "text-sky-500";
}

  return (
    <div className="flex justify-center">
      <div className="w-[98%]">

        <div className="grid grid-cols-6 gap-4">

{/* STREAK */}

<div
  className="
    relative
    hover:z-[100]

    h-[90px]
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]
backdrop-blur-xl

    transition-all
    duration-300

    hover:-translate-y-1
    hover:border-white/[0.14]
    hover:bg-[#0b0c1e]
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
  "
>
<div
  className="
    flex
    h-full
    min-w-0
    w-full
    max-w-full
    items-center
    justify-center
    gap-5
    -translate-x-2
  "
>
    {/* ICON */}

    <div className="shrink-0">

      <Flame
        className={`h-7 w-7 ${streakColor}`}
        strokeWidth={2}
      />

    </div>

    {/* TEXT */}

<div
  className="
    min-w-0
    -translate-y-1
    flex
    flex-col
    items-center
    text-center
  "
>

      <p
        className="
          text-[11px]
          translate-x-0
          font-medium
          uppercase
          tracking-[0.12em]
          text-slate-500
        "
      >
        Streak
      </p>

      <div
        className="
          mt-2
          translate-x-0
          translate-y-1
          flex
          flex-col
          items-center
        "
      >

        <p
          className="
            text-[20px]
            font-semibold
            leading-none
            text-white
          "
        >
          {pnlAnalytics.streak}
        </p>

        <p
          className={`
            mt-2
            text-[12px]
            translate-x-0
          translate-y-0
            font-medium
            ${streakColor}
          `}
        >
          {streakLabel}
        </p>

      </div>

    </div>

  </div>
</div>

{/* RISK STATUS */}

{/* VOLATILITY */}

<div
  className="
    relative
    hover:z-[100]

    h-[90px]
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    backdrop-blur-xl

    transition-all
    duration-300

    hover:-translate-y-1
    hover:border-white/[0.14]
    hover:bg-[#0b0c1e]
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
  "
>
<div
  className="
    flex
    h-full
    min-w-0
    w-full
    max-w-full
    items-center
    justify-center
    gap-3
    -translate-x-3
  "
>
    {/* ICON */}

    <div className="shrink-0">
      <Activity
        className={`h-7 w-7 ${volatilityColor}`}
        strokeWidth={2}
      />
    </div>

    {/* TEXT */}

    <div
      className="
        min-w-0
        -translate-y-1
        flex
        flex-col
        items-center
        text-center
      "
    >
      {/* TITLE */}

      <div className="flex items-center gap-1">
        <p
          className="
            translate-x-2
            text-[11px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          Volatility
        </p>

        <MetricInfoTooltip
          className="translate-x-[8px] translate-y-[0px]"
          definition="Measures how much your daily realized P&L fluctuates over the selected period."
          formula="Standard Deviation (σ) of Daily Realized P&L"
          calculation="Calculated from the standard deviation of your daily realized P&L values within the selected date range."
          interpretation="Lower values indicate more stable results. Higher values indicate greater day-to-day variability in trading performance."
        />
      </div>

      {/* VALUE */}

      <div
        className="
          mt-2
          translate-y-1
          flex
          flex-col
          items-center
        "
      >
        <p
          className={`
            text-[20px]
            font-semibold
            leading-none
            ${volatilityColor}
          `}
        >
          {volatilityLabel}
        </p>

        <p
          className="
            mt-2
            translate-y-1
            text-[12px]
            font-medium
            text-slate-400
          "
        >
          σ {volatility.toFixed(0)}
        </p>
      </div>
    </div>
  </div>
</div>

{/* CONSISTENCY */}

<div
  className="
    relative
    hover:z-[100]

    h-[90px]
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    backdrop-blur-xl

    transition-all
    duration-300

    hover:-translate-y-1
    hover:border-white/[0.14]
    hover:bg-[#0b0c1e]
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
  "
>
  <div
    className="
      flex
      h-full
      min-w-0
      w-full
      max-w-full
      items-center
      justify-center
      translate-x-0
    "
  >
    {/* ICON */}

    <div className="shrink-0">
      <LocateFixed
        className={`h-7 w-7 ${consistencyColor}`}
        strokeWidth={2}
      />
    </div>

    {/* TEXT */}

    <div
      className="
        min-w-0
        -translate-y-1
        flex
        flex-col
        items-center
        text-center
      "
    >
      {/* TITLE */}

      <div className="flex items-center gap-1">
        <p
          className="
            text-[11px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          Consistency
        </p>

        <MetricInfoTooltip
          className="translate-x-0 translate-y-0"
          definition="Measures how consistently your trading produces stable results over time."
          formula="Composite Consistency Score (0–100)"
          calculation="Computed from your win/loss distribution and equity curve stability across the selected period."
          interpretation="Higher scores indicate more disciplined and repeatable trading performance."
        />
      </div>

      {/* VALUE */}

      <div
        className="
          mt-2
          translate-y-1
          flex
          flex-col
          items-center
        "
      >
        <p
          className={`
            text-[20px]
            font-semibold
            leading-none
            ${consistencyColor}
          `}
        >
          {consistencyLabel}
        </p>

        <p
          className="
            mt-2
            translate-y-1
            text-[12px]
            font-medium
            text-slate-400
          "
        >
          Score: {consistencyScore}/100
        </p>
      </div>
    </div>
  </div>
</div>

{/* MOST TRADED */}

<div
  className="
    relative
    hover:z-[100]

    h-[90px]
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    backdrop-blur-xl

    transition-all
    duration-300

    hover:-translate-y-1
    hover:border-white/[0.14]
    hover:bg-[#0b0c1e]
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
  "
>
  <div
    className="
      flex
      h-full
      min-w-0
      w-full
      max-w-full
      items-center
      justify-center
      translate-x-0
    "
  >
    {/* ICON */}

    <div className="shrink-0">
      <BarChart3
        className="h-7 w-7 text-cyan-400"
        strokeWidth={2}
      />
    </div>

    {/* TEXT */}

    <div
      className="
        min-w-0
        -translate-y-1
        flex
        flex-col
        items-center
        text-center
      "
    >
      {/* TITLE */}

      <p
        className="
          text-[11px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-slate-500
        "
      >
        Most Traded
      </p>

      {/* VALUE */}

      <div
        className="
          mt-2
          translate-y-1
          flex
          flex-col
          items-center
        "
      >
        <p
          className="
            text-[20px]
            font-semibold
            leading-none
            text-white
          "
        >
          {mostTradedTicker}
        </p>

        <p
          className="
            mt-2
            translate-y-1
            text-[12px]
            font-medium
            text-slate-400
          "
        >
          {mostTradedTradeCount} Trades
        </p>
      </div>
    </div>
  </div>
</div>

{/* TRADE FREQUENCY */}

<div
  className="
    relative
    hover:z-[100]

    h-[90px]
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    backdrop-blur-xl

    transition-all
    duration-300

    hover:-translate-y-1
    hover:border-white/[0.14]
    hover:bg-[#0b0c1e]
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
  "
>
<div
  className="
    flex
    h-full
    min-w-0
    w-full
    max-w-full
    items-center
    justify-center
    translate-x-0
  "
>
    {/* ICON */}

    <div className="shrink-0">
      <Repeat
        className="h-6 w-6 text-cyan-400"
        strokeWidth={2}
      />
    </div>

    {/* TEXT */}

    <div
      className="
        min-w-0
        ml-1
        -translate-y-1
        flex
        flex-col
        items-center
        text-center
      "
    >
      {/* TITLE */}

      <p
        className="
          text-[11px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-slate-500
        "
      >
        Trade Frequency
      </p>

      {/* VALUE */}

      <div
        className="
          mt-2
          translate-y-1
          flex
          flex-col
          items-center
        "
      >
        <p
          className="
            text-[20px]
            font-semibold
            leading-none
            text-white
          "
        >
          {tradeFrequency.toFixed(1)} / Day
        </p>

        <p
          className="
            mt-2
            translate-y-1
            text-[12px]
            font-medium
            text-slate-400
          "
        >
          {activeTradingDays} Trading Days
        </p>
      </div>
    </div>
  </div>
</div>

{/* CALMAR RATIO */}

<div
  className="
    relative
    hover:z-[100]

    h-[90px]
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    backdrop-blur-xl

    transition-all
    duration-300

    hover:-translate-y-1
    hover:border-white/[0.14]
    hover:bg-[#0b0c1e]
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
  "
>
  <div
    className="
      flex
      h-full
      min-w-0
      w-full
      max-w-full
      items-center
      justify-center
      translate-x-0
    "
  >
    {/* ICON */}

    <div className="shrink-0">
      <Shield
        className={`h-7 w-7 ${calmarColor}`}
        strokeWidth={2}
      />
    </div>

    {/* TEXT */}

    <div
      className="
        min-w-0
        -translate-y-1
        flex
        flex-col
        items-center
        text-center
      "
    >
      {/* TITLE */}

      <div className="flex items-center gap-1">
        <p
          className="
            translate-x-0
            text-[11px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          Calmar Ratio
        </p>

        <MetricInfoTooltip
          className="translate-x-[0px] translate-y-[0px]"
          definition="Measures return achieved relative to maximum drawdown."
          formula="Total Return ÷ Maximum Drawdown"
          calculation="Calculated using your realized trading performance and maximum drawdown over the selected period."
          interpretation="Higher values indicate stronger risk-adjusted performance by generating more return for each unit of drawdown."
        />
      </div>

      {/* VALUE */}

      <div
        className="
          mt-2
          translate-y-1
          flex
          flex-col
          items-center
        "
      >
        <p
          className="
            text-[20px]
            font-semibold
            leading-none
            text-white
          "
        >
          {calmarRatio.toFixed(2)}
        </p>

        <p
          className={`
            mt-2
            translate-y-1
            text-[12px]
            font-medium
            ${calmarColor}
          `}
        >
          {calmarLabel}
        </p>
      </div>
    </div>
  </div>
</div>

{/* END OF GRID */}
</div>

</div>

</div>
);
}