
import { useId } from "react";
import type { ReactNode } from "react";

import type {
  PnLAnalyticsData,
} from "@/lib/analytics/pnlAnalytics";

import type {
  ConsistencyAnalyticsData,
} from "@/lib/analytics/consistencyAnalytics";

import type {
  EquityAnalyticsData,
} from "@/lib/analytics/equityAnalytics";

import type {
  SecondaryMetricsAnalyticsData,
} from "@/lib/analytics/secondaryMetricsAnalytics";

import MetricInfoTooltip from "./MetricInfoTooltip";

type SecondaryMetricsRowProps = {
  pnlAnalytics: PnLAnalyticsData;
  consistencyAnalytics: ConsistencyAnalyticsData;
  equityAnalytics: EquityAnalyticsData;
  secondaryMetricsAnalytics: SecondaryMetricsAnalyticsData;
};

type KpiAccent = "emerald" | "cyan" | "red" | "slate";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
  accent: KpiAccent;
  valueClassName?: string;
  detailClassName?: string;
  tooltip?: ReactNode;
};

const ACCENT_COLORS: Record<KpiAccent, string> = {
  emerald: "#10B981",
  cyan: "#0EA5E9",
  red: "#EF4444",
  slate: "#64748B",
};

/**
 * Shared secondary KPI card.
 *
 * Card height is intentionally fixed at 90px.
 * Do not replace with aspect-ratio-based sizing.
 */
function KpiCard({
  label,
  value,
  detail,
  accent,
  valueClassName = "text-white",
  detailClassName = "text-slate-200",
  tooltip,
}: KpiCardProps) {
  const accentColor = ACCENT_COLORS[accent];

  // Unique, SSR-safe SVG filter ID for each card instance.
  const generatedId = useId();

  const glowFilterId = `secondary-kpi-${generatedId.replace(
    /:/g,
    ""
  )}-glow`;

  return (
    <article
      aria-label={`${label}: ${value}. ${detail}`}
      className="
        group
        relative
        z-0
        h-[90px]
        min-w-0
        rounded-[8px]
        border
        border-white/[0.08]
        bg-[#0b1220]
        transition-all
        duration-300
        ease-out
        hover:z-[100]
        hover:-translate-y-1
        hover:border-white/[0.14]
        hover:bg-[#0b0c1e]
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
        motion-reduce:transition-none
        motion-reduce:hover:translate-y-0
      "
      style={{
        containerType: "inline-size",
      }}
    >
      {/* SUBTLE TOP LIGHTING */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[8px]
          bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,130,180,0.10),transparent_70%)]
        "
      />

{/* CONTENT */}

<div
  className="
    relative
    z-10
    flex
    h-full
    min-w-0
    flex-col
    items-center
    gap-[3px]
    px-2
    pt-[7px]
    translate-y-[8px]
  "
>
        {/* TITLE */}

        <div
          className="
            flex
            h-[14px]
            max-w-full
            shrink-0
            items-center
            justify-center
            gap-[3px]
          "
        >
          <p
            title={label}
            className="
              max-w-full
              truncate
              whitespace-nowrap
              text-center
              font-medium
              uppercase
              leading-none
              tracking-[0.10em]
              text-slate-400
            "
            style={{
              fontSize: "clamp(9px, 8cqi, 11px)",
            }}
          >
            {label}
          </p>

          {tooltip}
        </div>

        {/* PRIMARY VALUE */}

        <div
          className="
            mt-[8px]
            flex
            h-[24px]
            w-full
            shrink-0
            items-center
            justify-center
            text-center
          "
        >
          <p
            title={String(value)}
            className={`
              max-w-full
              truncate
              whitespace-nowrap
              text-center
              font-semibold
              leading-none
              tracking-[-0.035em]
              ${valueClassName}
            `}
            style={{
              fontSize: "clamp(15px, 14cqi, 20px)",
            }}
          >
            {value}
          </p>
        </div>

        {/* DIVIDER */}

        <div
          aria-hidden="true"
          className="
            mt-[6px]
            h-px
            w-[52%]
            shrink-0
            bg-gradient-to-r
            from-transparent
            via-sky-300/25
            to-transparent
          "
        />

        {/* SECONDARY VALUE */}

        <div
          className="
            mt-[7px]
            flex
            h-[15px]
            w-full
            shrink-0
            items-center
            justify-center
            text-center
          "
        >
          <p
            title={detail}
            className={`
              max-w-full
              truncate
              whitespace-nowrap
              text-center
              font-medium
              leading-none
              ${detailClassName}
            `}
            style={{
              fontSize: "clamp(10px, 8.8cqi, 12px)",
            }}
          >
            {detail}
          </p>
        </div>
      </div>

      {/* BOTTOM WAVE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-0
          h-[24px]
          overflow-hidden
          rounded-b-[8px]
        "
      >
        <svg
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            {/* HOVER GLOW FILTER */}

            <filter
              id={glowFilterId}
              x="-30%"
              y="-100%"
              width="160%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* WAVE BACKGROUND */}

          <path
            d="
              M0 43
              C45 34 65 59 112 57
              C165 54 188 30 231 29
              C268 27 286 39 320 43
              L320 80
              L0 80
              Z
            "
            fill={accentColor}
            fillOpacity="0.13"
          />

          {/* ORIGINAL WAVE LINE */}

          <path
            d="
              M0 43
              C45 34 65 59 112 57
              C165 54 188 30 231 29
              C268 27 286 39 320 43
            "
            fill="none"
            stroke={accentColor}
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />

          {/* HOVER GLOW LAYER */}

          <path
            d="
              M0 43
              C45 34 65 59 112 57
              C165 54 188 30 231 29
              C268 27 286 39 320 43
            "
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeOpacity="0.55"
            filter={`url(#${glowFilterId})`}
            className="
              opacity-0
              transition-opacity
              duration-300
              ease-out
              group-hover:opacity-100
            "
          />
        </svg>
      </div>

      {/* BOTTOM ACCENT */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          z-20
          h-[4px]
          rounded-b-[8px]
          opacity-60
        "
        style={{
          backgroundColor: accentColor,
        }}
      />
    </article>
  );
}

export default function SecondaryMetricsRow({
  pnlAnalytics,
  consistencyAnalytics,
  equityAnalytics,
  secondaryMetricsAnalytics,
}: SecondaryMetricsRowProps) {

// ---------------------------------------------
// TRADING ACTIVITY AVAILABILITY
// ---------------------------------------------

const hasTradingActivity =
  pnlAnalytics.dailyPnL.length > 0;

// ---------------------------------------------
// STREAK
// ---------------------------------------------

const streakLabel =
  pnlAnalytics.streakType === "WINNING"
    ? "Winning Days"
    : "Losing Days";

const streakAccent: KpiAccent =
  !hasTradingActivity
    ? "slate"
    : pnlAnalytics.streakType === "WINNING"
      ? "emerald"
      : "red";

const streakDetailColor =
  !hasTradingActivity
    ? "text-slate-400"
    : pnlAnalytics.streakType === "WINNING"
      ? "text-slate-200"
      : "text-red-300";

// ---------------------------------------------
// CONSISTENCY
// ---------------------------------------------

const consistencyScore =
  consistencyAnalytics.consistencyScore;

const hasConsistencyScore =
  consistencyScore !== null &&
  Number.isFinite(consistencyScore);

const consistencyLabel =
  !hasConsistencyScore
    ? "N/A"
    : consistencyScore >= 80
      ? "Excellent"
      : consistencyScore >= 65
        ? "Good"
        : consistencyScore >= 50
          ? "Fair"
          : "Poor";

const consistencyColor =
  !hasConsistencyScore
    ? "text-slate-400"
    : consistencyScore >= 80
      ? "text-emerald-400"
      : consistencyScore >= 65
        ? "text-green-400"
        : consistencyScore >= 50
          ? "text-sky-500"
          : "text-red-400";

const consistencyAccent: KpiAccent =
  !hasConsistencyScore
    ? "slate"
    : consistencyScore >= 65
      ? "emerald"
      : consistencyScore >= 50
        ? "cyan"
        : "red";

// ---------------------------------------------
// CALMAR RATIO
// ---------------------------------------------

const calmarRatio =
  equityAnalytics.calmarRatio;

const hasCalmarRatio =
  hasTradingActivity &&
  calmarRatio !== null &&
  Number.isFinite(calmarRatio);

const calmarLabel =
  !hasCalmarRatio
    ? "N/A"
    : calmarRatio >= 2
      ? "Excellent"
      : calmarRatio >= 1
        ? "Good"
        : calmarRatio >= 0.5
          ? "Fair"
          : "Poor";

const calmarColor =
  !hasCalmarRatio
    ? "text-slate-400"
    : calmarRatio >= 2
      ? "text-emerald-400"
      : calmarRatio >= 1
        ? "text-green-400"
        : calmarRatio >= 0.5
          ? "text-sky-500"
          : "text-red-400";

const calmarAccent: KpiAccent =
  !hasCalmarRatio
    ? "slate"
    : calmarRatio >= 1
      ? "emerald"
      : calmarRatio >= 0.5
        ? "cyan"
        : "red";

const calmarDetail =
  !hasTradingActivity
    ? "No Trades"
    : !hasCalmarRatio
      ? "Not Calculable"
      : calmarLabel;

  // ---------------------------------------------
  // MOST TRADED
  // ---------------------------------------------

  const mostTradedTicker =
    secondaryMetricsAnalytics.mostTradedTicker;

  const mostTradedTradeCount =
    secondaryMetricsAnalytics.mostTradedTradeCount;

  // ---------------------------------------------
  // TRADE FREQUENCY
  // ---------------------------------------------

  const tradeFrequency =
    secondaryMetricsAnalytics.tradeFrequency;

  const activeTradingDays =
    secondaryMetricsAnalytics.activeTradingDays;

// ---------------------------------------------
// VOLATILITY
// ---------------------------------------------

const volatility =
  pnlAnalytics.volatility;

const avgDaily =
  Math.abs(pnlAnalytics.avgDaily);

// At least two daily observations are required
// to evaluate day-to-day P&L variability.

const hasVolatilityObservations =
  hasTradingActivity &&
  equityAnalytics.equityCurve.length >= 2 &&
  Number.isFinite(volatility);

const rawVolatilityRatio =
  hasVolatilityObservations &&
  avgDaily > 0 &&
  Number.isFinite(avgDaily)
    ? volatility / avgDaily
    : null;

const volatilityRatio =
  rawVolatilityRatio !== null &&
  Number.isFinite(rawVolatilityRatio)
    ? rawVolatilityRatio
    : null;

// Default state: classification unavailable.

let volatilityLabel = "N/A";

let volatilityColor =
  "text-slate-400";

let volatilityAccent: KpiAccent =
  "slate";

if (volatilityRatio !== null) {

  if (volatilityRatio >= 4) {
    volatilityLabel = "Very High";
    volatilityColor = "text-rose-500";
    volatilityAccent = "red";

  } else if (volatilityRatio >= 2) {
    volatilityLabel = "High";
    volatilityColor = "text-red-400";
    volatilityAccent = "red";

  } else if (volatilityRatio >= 1) {
    volatilityLabel = "Moderate";
    volatilityColor = "text-sky-500";
    volatilityAccent = "cyan";

  } else {
    volatilityLabel = "Low";
    volatilityColor = "text-emerald-400";
    volatilityAccent = "emerald";
  }
}

  return (
    <div className="w-full min-w-0">
      <div className="secondary-metrics-container w-full min-w-0">
        <div className="secondary-metrics-grid">

          {/* STREAK */}

<KpiCard
  label="Streak"
  value={
    hasTradingActivity
      ? pnlAnalytics.streak
      : "N/A"
  }
  detail={
    hasTradingActivity
      ? streakLabel
      : "No Trades"
  }
  accent={streakAccent}
  detailClassName={streakDetailColor}
/>

          {/* VOLATILITY */}

          <KpiCard
            label="Volatility"
            value={volatilityLabel}
            detail={
            !hasTradingActivity
             ? "No Trades"
             : !hasVolatilityObservations
            ? "Insufficient Data"
             : `σ ${volatility.toFixed(0)}`
            }
            accent={volatilityAccent}
            valueClassName={volatilityColor}
            tooltip={
              <MetricInfoTooltip
                className="shrink-0 translate-x-[2px]"
                definition="Measures how much your daily realized P&L fluctuates over the selected period."
                formula="Standard Deviation (σ) of Daily Realized P&L"
                calculation="Calculated from the standard deviation of your daily realized P&L values within the selected date range."
                interpretation="Lower values indicate more stable results. Higher values indicate greater day-to-day variability in trading performance."
              />
            }
          />

          {/* CONSISTENCY */}

<KpiCard
  label="Consistency"
  value={consistencyLabel}
  detail={
    !hasTradingActivity
      ? "No Trades"
      : hasConsistencyScore
        ? `Score: ${consistencyScore}/100`
        : "Insufficient Data"
  }
  accent={consistencyAccent}
  valueClassName={consistencyColor}
  tooltip={
    <MetricInfoTooltip
      className="shrink-0 translate-x-[2px]"
      definition="Measures how consistently your trading produces stable results over time."
      formula="Composite Consistency Score (0–100)"
      calculation="Computed from the winning-day percentage and positive equity movements across the selected period."
      interpretation="Higher scores indicate more consistent positive trading results."
    />
  }
/>

          {/* MOST TRADED */}

          <KpiCard
            label="Most Traded"
            value={mostTradedTicker}
            detail={`${mostTradedTradeCount} Trades`}
            accent="cyan"
          />

          {/* TRADE FREQUENCY */}

          <KpiCard
            label="Trade Frequency"
            value={`${tradeFrequency.toFixed(1)} / Day`}
            detail={`${activeTradingDays} Trading Days`}
            accent="cyan"
          />

{/* CALMAR RATIO */}

<KpiCard
  label="Calmar Ratio"
  value={
    hasCalmarRatio
      ? calmarRatio.toFixed(2)
      : "N/A"
  }
  detail={calmarDetail}
  accent={calmarAccent}
  valueClassName={calmarColor}
  detailClassName={calmarColor}
  tooltip={
    <MetricInfoTooltip
      className="shrink-0 translate-x-[2px]"
      definition="Measures net profit relative to maximum drawdown."
      formula="Net P&L ÷ Maximum Drawdown"
      calculation="Calculated using realized trading performance and maximum drawdown over the selected period."
      interpretation="Higher values indicate more profit generated for each unit of drawdown. The ratio is unavailable when maximum drawdown is zero."
    />
  }
/>

        </div>
      </div>

      {/* CONTAINER-BASED RESPONSIVE GRID */}

      <style jsx>{`
        .secondary-metrics-container {
          container-type: inline-size;
          container-name: secondary-metrics;
        }

        .secondary-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @container secondary-metrics (max-width: 359px) {
          .secondary-metrics-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @container secondary-metrics (min-width: 520px) {
          .secondary-metrics-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @container secondary-metrics (min-width: 860px) {
          .secondary-metrics-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
