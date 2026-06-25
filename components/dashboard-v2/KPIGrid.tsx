import KPICard from "./KPICard";
import KPITradingScoreCard from "./KPITradingScoreCard";
import KPISparkline from "./KPISparkline";
import KPIHistogram from "./KPIHistogram";
import MetricInfoTooltip from "./MetricInfoTooltip";
import NetPnLSparkline from "./NetPnLSparkline";
import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";


type KPIGridProps = {

  reportingCurrency: string;

  dashboardMetrics: {
    netPnL: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    expectancy: number;

    bestDay: number;
    bestDayDate: string;

    worstDay: number;
    worstDayDate: string;

    averageTradeDurationMinutes: number;
  };

  equityAnalytics: {
  maxDrawdown: number;
  equityCurve: number[];
};

  tradingScoreAnalytics: {
    profitabilityScore: number;
    calmarScore: number;
    reliabilityScore: number;
    tradingScore: number;
  };

consistencyScore: number;

netPnLSparklineData: {
  date: string;
  pnl: number;
}[];

sparklineData: number[];
winRateTrend: number[];
profitFactorTrend: number[];
expectancyTrend: number[];
bestDayTrend: number[];
worstDayTrend: number[];
avgWinLossTrend: number[];
drawdownTrend: number[];

};

function formatDate(
  dateString: string
) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default function KPIGrid({
  dashboardMetrics,
  reportingCurrency,
  equityAnalytics,
  tradingScoreAnalytics,
  consistencyScore,
  netPnLSparklineData,
  sparklineData,
  winRateTrend,
  profitFactorTrend,
  expectancyTrend,
  bestDayTrend,
  worstDayTrend,
  avgWinLossTrend,
  drawdownTrend,
}: KPIGridProps) {

  const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

  const topCards = [
{
  title: "Net P&L",
  isNetPnL: true,
  tooltip: undefined,

  titleOffset: "translate-y-3",
  valueOffset: "-translate-y-6",
  subtitleOffset: "-translate-y-13",

  value: `${currencySymbol}${dashboardMetrics.netPnL.toFixed(2)}`,
  subtitle: "",

  sparkline: true,
  sparklineData: sparklineData,

  sparklineColor:
    dashboardMetrics.netPnL >= 0
      ? "#34d399"
      : "#ef4444",

  size: "large" as const,

  color:
    dashboardMetrics.netPnL >= 0
      ? "green"
      : "red",
},

 {
  title: "Win Rate",
   tooltip: undefined,
  value: `${dashboardMetrics.winRate.toFixed(1)}%`,
  subtitle: `${dashboardMetrics.winningTrades}W / ${dashboardMetrics.losingTrades}L`,

  sparkline: true,
  sparklineColor: "#8b5cf6",
  sparklineData: winRateTrend,

  size: "large" as const,
  color: "default" as const,
},

{
  title: "Profit Factor",

  tooltip: (
    <MetricInfoTooltip
      definition="Gross profit divided by gross loss."
      formula="Total Winning P&L ÷ Absolute Total Losing P&L"
      calculation={dashboardMetrics.profitFactor.toFixed(2)}
      interpretation={
        dashboardMetrics.profitFactor >= 2
          ? "Excellent"
          : dashboardMetrics.profitFactor >= 1.5
          ? "Very Good"
          : dashboardMetrics.profitFactor >= 1.25
          ? "Good"
          : dashboardMetrics.profitFactor >= 1
          ? "Average"
          : "Poor"
      }
    />
  ),

  value:
    dashboardMetrics.profitFactor.toFixed(2),

  subtitle:
    dashboardMetrics.profitFactor >= 2.0
      ? "Excellent"
      : dashboardMetrics.profitFactor >= 1.5
      ? "Very Good"
      : dashboardMetrics.profitFactor >= 1.25
      ? "Good"
      : dashboardMetrics.profitFactor >= 1.0
      ? "Average"
      : "Poor",

  subtitleColor:
    dashboardMetrics.profitFactor >= 2.0
      ? "green"
      : dashboardMetrics.profitFactor >= 1.25
      ? "green"
      : dashboardMetrics.profitFactor >= 1.0
      ? "yellow"
      : "red",

  sparkline: true,
sparklineColor: "#3b82f6",
sparklineData: profitFactorTrend,

size: "large" as const,

  color: "blue" as const,
},

{
  title: "Expectancy",

  tooltip: (
    <MetricInfoTooltip
      definition="Average expected profit or loss per trade."

      formula="(Win Rate × Avg Win) − (Loss Rate × Avg Loss)"

      calculation={`$${dashboardMetrics.expectancy.toFixed(2)} per trade`}

      interpretation={
        dashboardMetrics.expectancy >= 10
          ? "Strong Edge"
          : dashboardMetrics.expectancy >= 5
          ? "Good Edge"
          : dashboardMetrics.expectancy >= 0
          ? "Positive Edge"
          : "Negative Edge"
      }
    />
  ),

  value: `${currencySymbol}${dashboardMetrics.expectancy.toFixed(2)}`,

  subtitle: "Average per trade",

  sparkline: true,

  sparklineColor:
    dashboardMetrics.expectancy >= 0
      ? "#34d399"
      : "#ef4444",

  sparklineData: expectancyTrend,

  size: "large" as const,

  color:
    dashboardMetrics.expectancy >= 0
      ? "green"
      : "red",
},



{
  title: "Avg Win / Avg Loss",
   tooltip: undefined,

  value:
`${currencySymbol}${dashboardMetrics.avgWin.toFixed(2)}
 /
${currencySymbol}${dashboardMetrics.avgLoss.toFixed(2)}`,

  subtitle: "",

  histogram: true,

  histogramData: avgWinLossTrend,

  size: "large" as const,

  color: "default" as const,
},

  {
  title: "Max Drawdown",
    tooltip: undefined,
  value:
`${currencySymbol}${equityAnalytics.maxDrawdown.toFixed(2)}`,

  subtitle: "Peak-to-valley loss",

  sparkline: true,

  sparklineColor: "#ef4444",

  sparklineData: drawdownTrend,

  size: "large" as const,

  color: "red" as const,
},

];

const bottomCards = [
{
  title: "Closed Trades",
 tooltip: undefined,
  titleOffset: "translate-y-2",
  valueOffset: "-translate-y-3",
  subtitleOffset: "-translate-y-8",

  value: String(
    dashboardMetrics.totalTrades
  ),

  subtitle: `${dashboardMetrics.winningTrades}W / ${dashboardMetrics.losingTrades}L`,
},

{
  title: "Winning Trades",
 tooltip: undefined,
  titleOffset: "translate-y-2",
  valueOffset: "-translate-y-3",
  subtitleOffset: "-translate-y-8",

  value: String(
    dashboardMetrics.winningTrades
  ),

  subtitle: `${dashboardMetrics.winRate.toFixed(1)}% Win Rate`,
},

{
  title: "Losing Trades",
  tooltip: undefined,
  titleOffset: "translate-y-2",
  valueOffset: "-translate-y-3",
  subtitleOffset: "-translate-y-8",

  value: String(
    dashboardMetrics.losingTrades
  ),

  subtitle: `${(
    100 -
    dashboardMetrics.winRate
  ).toFixed(1)}% Loss Rate`,
},

{
  title: "Best Day",
    tooltip: undefined,
  titleOffset: "translate-y-2",
  valueOffset: "-translate-y-3",
  subtitleOffset: "-translate-y-9",

  value:
`${currencySymbol}${dashboardMetrics.bestDay.toFixed(2)}`,

  subtitle:
    formatDate(
      dashboardMetrics.bestDayDate
    ),

  sparkline: true,

  sparklineColor: "#34d399",

  sparklineData: bestDayTrend,

  color:
    dashboardMetrics.bestDay >= 0
      ? "green"
      : "red",
},

{
  title: "Worst Day",
  tooltip: undefined,
  titleOffset: "translate-y-2",
  valueOffset: "-translate-y-3",
  subtitleOffset: "-translate-y-9",

  value:
`${currencySymbol}${dashboardMetrics.worstDay.toFixed(2)}`,

  subtitle:
    formatDate(
      dashboardMetrics.worstDayDate
    ),

  sparkline: true,

  sparklineColor: "#ef4444",

  sparklineData: [...worstDayTrend].reverse(),

  color:
    dashboardMetrics.worstDay >= 0
      ? "green"
      : "red",
},

{
  title: "Avg Hold",
  tooltip: undefined,
  titleOffset: "translate-y-2",
  valueOffset: "-translate-y-3",
  subtitleOffset: "-translate-y-8", 
  

  value: `${(
    dashboardMetrics.averageTradeDurationMinutes /
    60 /
    24
  ).toFixed(1)} Days`,

  subtitle: `${dashboardMetrics.totalTrades} Closed Trades`,
},

];

  return (
    <div className="flex justify-center">

  <div
    className="
      w-[98%]
      rounded-[24px]
      border
      border-white/[0.05]
      bg-[#081526]
      px-6
      pt-5
      pb-6
    "
  >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6 translate-x-2 flex items-center gap-2">

        <h2
          className="
            text-[21px]
            font-semibold
            text-white
          "
        >
          Account Overview
        </h2>

        <div
          className="
            rounded-full
            border
            border-white/[0.05]
            bg-[#0b1730]
            px-3
            py-1
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-slate-400
          "
        >
        </div>

      </div>

          {/* ================================================= */}
      {/* TOP ROW */}
      {/* ================================================= */}

      <div className="flex justify-center">

        <div className="w-[98%]">

          <div
            className="
              grid
              grid-cols-[1fr_1fr_1fr_1fr_1.25fr_1.25fr]
              gap-4
            "
          >

{topCards.map((card) => (

<KPICard
  key={card.title}
  title={card.title}
  value={card.value}
  subtitle={card.subtitle}
  tooltip={
    "tooltip" in card
      ? card.tooltip
      : undefined
  }

    titleOffset={card.titleOffset}
    valueOffset={card.valueOffset}
    subtitleOffset={card.subtitleOffset}

sparkline={
  card.sparkline ? (

    card.isNetPnL ? (

<NetPnLSparkline
  data={netPnLSparklineData}
  reportingCurrency={
    reportingCurrency
  }
/>

    ) : (

      <KPISparkline
        data={card.sparklineData}
        color={card.sparklineColor}
      />

    )

  ) : undefined
}

histogram={
  card.histogram ? (
    <KPIHistogram
      data={card.histogramData}
    />
  ) : undefined
}


    subtitleColor={
      card.subtitleColor as
        | "default"
        | "green"
        | "red"
        | "yellow"
        | undefined
    }

    size={card.size}

    valueColor={
      card.color as
        | "default"
        | "green"
        | "red"
        | "blue"
        | undefined
    }
  />

))}

    </div>

  </div>

</div>

{/* ================================================= */}
{/* ROW GAP */}
{/* ================================================= */}

<div className="h-4" />

{/* ================================================= */}
{/* BOTTOM ROW */}
{/* ================================================= */}

<div className="flex justify-center">

  <div className="w-[98%]">

    <div
      className="
        grid
        grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_2fr]
        gap-4
      "
    >

      {bottomCards.map((card) => (

<KPICard
  key={card.title}
  title={card.title}
  value={card.value}
  subtitle={card.subtitle}
  tooltip={"tooltip" in card ? card.tooltip : undefined}

  titleOffset={card.titleOffset}
  valueOffset={card.valueOffset}
  subtitleOffset={card.subtitleOffset}

  sparkline={
    card.sparkline ? (
      <KPISparkline
        data={card.sparklineData}
        color={card.sparklineColor}
      />
    ) : undefined
  }

  size="small"

  valueColor={
    card.color as
      | "default"
      | "green"
      | "red"
      | "blue"
      | undefined
  }
/>

      ))}

      <KPITradingScoreCard
        score={
          tradingScoreAnalytics.tradingScore
        }
        profitability={
          tradingScoreAnalytics.profitabilityScore
        }
        consistency={
          consistencyScore
        }
        risk={
          tradingScoreAnalytics.calmarScore
        }
        reliability={
          tradingScoreAnalytics.reliabilityScore
        }
      />

    </div>

  </div>

</div>

<div className="h-4" />

    </div>
  </div>
);
}