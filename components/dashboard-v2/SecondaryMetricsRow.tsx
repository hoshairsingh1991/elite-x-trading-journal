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
    "text-yellow-400";
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
    "text-yellow-400";
}

    const mostTradedTicker =
  secondaryMetricsAnalytics.mostTradedTicker;

const mostTradedTradeCount =
  secondaryMetricsAnalytics.mostTradedTradeCount;

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
    "text-yellow-400";
}

  return (
    <div className="flex justify-center">
      <div className="w-[98%]">

        <div className="grid grid-cols-6 gap-4">

          {/* STREAK */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Streak
              </p>

              <p className="mt-2 text-[28px] font-semibold text-white">
                {pnlAnalytics.streak}
              </p>

              <p className="mt-2 text-[13px] text-slate-400">
                {streakLabel}
              </p>
            </div>
          </div>

          {/* RISK STATUS */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
<p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
  Volatility
</p>

<p className="mt-3 text-[24px] font-semibold text-white">
  <span
  className={
    volatilityColor
  }
>
  {volatilityLabel}
</span>
</p>

<p className="mt-1 text-[13px] text-slate-400">
 σ = {volatility.toFixed(0)}
</p>
            </div>
          </div>

          {/* CONSISTENCY */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Consistency
              </p>

<p
  className={`mt-3 text-[24px] font-semibold ${consistencyColor}`}
>
  {consistencyLabel}
</p>

<p className="mt-1 text-[13px] text-slate-400">
  Score: {consistencyScore}/100
</p>


            </div>
          </div>


          {/* MOST TRADED */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Most Traded
              </p>

<p className="mt-3 text-[24px] font-semibold text-white">
  {mostTradedTicker}
</p>

<p className="mt-1 text-[13px] text-slate-400">
  {mostTradedTradeCount} Trades
</p>
            </div>
          </div>

          {/* AVG R MULTIPLE */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Avg R Multiple
              </p>

              <p className="mt-3 text-[24px] font-semibold text-white">
                1.42R
              </p>

              <p className="mt-1 text-[13px] text-emerald-400">
                --
              </p>
            </div>
          </div>

          {/* CALMAR RATIO */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Calmar Ratio
              </p>

<p className="mt-3 text-[24px] font-semibold text-white">
  {calmarRatio.toFixed(2)}
</p>

<p
  className={`mt-1 text-[13px] ${calmarColor}`}
>
  {calmarLabel}
</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}