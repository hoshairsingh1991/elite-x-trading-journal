import KPICard from "./KPICard";

import KPITradingScoreCard from "./KPITradingScoreCard";

type KPIGridProps = {
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
  };

  tradingScoreAnalytics: {
    profitabilityScore: number;
    calmarScore: number;
    reliabilityScore: number;
    tradingScore: number;
  };

  consistencyScore: number;
};

function formatDate(
  dateString: string
) {
  if (!dateString) {
    return "";
  }

  return new Date(
    dateString
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
  equityAnalytics,
  tradingScoreAnalytics,
  consistencyScore,
}: KPIGridProps) {


  const topCards = [
  {
  title: "Net P&L",
  value: `$${dashboardMetrics.netPnL.toFixed(2)}`,
  subtitle: "",
  size: "large" as const,
  color:
    dashboardMetrics.netPnL >= 0
      ? "green"
      : "red",
},

  {
    title: "Win Rate",
    value: `${dashboardMetrics.winRate.toFixed(1)}%`,
    subtitle: `${dashboardMetrics.winningTrades}W / ${dashboardMetrics.losingTrades}L`,
    size: "large" as const,
    color: "default" as const,
  },

  {
  title: "Profit Factor",

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

  size: "large" as const,

  color: "blue" as const,
},

  {
    title: "Expectancy",
    value: `$${dashboardMetrics.expectancy.toFixed(2)}`,
    subtitle: "Average per trade",
    size: "large" as const,
    color:
      dashboardMetrics.expectancy >= 0
        ? "green"
        : "red",
  },

  {
  title: "Avg Win / Avg Loss",
  value: `$${dashboardMetrics.avgWin.toFixed(2)} / $${dashboardMetrics.avgLoss.toFixed(2)}`,
  subtitle: "",
  size: "large" as const,
  color: "default" as const,
},

  {
    title: "Max Drawdown",
    value: `$${equityAnalytics.maxDrawdown.toFixed(2)}`,
    subtitle: "Peak-to-valley loss",
    size: "large" as const,
    color: "red" as const,
  },
];

const bottomCards = [
  {
    title: "Total Trades",
    value: String(
      dashboardMetrics.totalTrades
    ),
  },

  {
    title: "Winning Trades",
    value: String(
      dashboardMetrics.winningTrades
    ),
  },

  {
    title: "Losing Trades",
    value: String(
      dashboardMetrics.losingTrades
    ),
  },

  {
  title: "Best Day",

  value:
    `$${dashboardMetrics.bestDay.toFixed(2)}`,

  subtitle:
  formatDate(
    dashboardMetrics.bestDayDate
  ),

  color:
    dashboardMetrics.bestDay >= 0
      ? "green"
      : "red",
},

{
  title: "Worst Day",

  value:
    `$${dashboardMetrics.worstDay.toFixed(2)}`,

  subtitle:
  formatDate(
    dashboardMetrics.worstDayDate
  ),

  color:
    dashboardMetrics.worstDay >= 0
      ? "green"
      : "red",
},

 {
  title: "Avg Hold",

  value: `${(
    dashboardMetrics.averageTradeDurationMinutes /
    60 /
    24
  ).toFixed(1)} Days`,
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

       <div className="h-2" />

      <div className="mb-8 translate-x-3 flex items-center gap-3">

        

        <h2
          className="
            text-[22px]
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
          Base Currency: USD
        </div>

      </div>

      <div className="h-2" />

{/* ================================================= */}
{/* TOP ROW */}
{/* ================================================= */}

<div className="flex justify-center">

  <div className="w-[99%]">

    <div
  className="
    grid
    grid-cols-[1fr_1fr_1fr_1fr_1.25fr_1.25fr]
    gap-5
  "
>

      {topCards.map((card) => (

  <KPICard
    key={card.title}
    title={card.title}
    value={card.value}
    subtitle={card.subtitle}
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

<div className="h-5" />

{/* ================================================= */}
{/* BOTTOM ROW */}
{/* ================================================= */}

<div className="flex justify-center">

  <div className="w-[99%]">

    <div
      className="
        grid
        grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_2fr]
        gap-5
      "
    >

      {bottomCards.map((card) => (

        <KPICard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
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