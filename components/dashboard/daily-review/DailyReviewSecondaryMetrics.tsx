"use client";

import {
  Trade,
} from "@/types/trade";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

interface DailyReviewSecondaryMetricsProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

interface SecondaryMetricCardProps {
  title: string;
  value: string;
  subtitle: string;

  valueColor?:
    | "default"
    | "green"
    | "red"
    | "blue";
}

function SecondaryMetricCard({
  title,
  value,
  subtitle,
  valueColor = "default",
}: SecondaryMetricCardProps) {

  const valueClasses = {
    default:
      "text-slate-100",
    green:
      "text-emerald-400",
    red:
      "text-red-400",
    blue:
      "text-blue-400",
  };

  return (
    <div
      className="
        relative
        h-[80px]
        overflow-hidden
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        px-4
        py-3
        transition-all
        duration-200
        hover:-translate-y-[2px]
        hover:z-10
        hover:border-cyan-500/20
        hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]
      "
    >

      {/* ================================================= */}
      {/* TITLE */}
      {/* ================================================= */}

      <div
        className="
          absolute
          left-0
          right-0
          top-2.5
          translate-x-2.5
        "
      >
        <p
          className="
            text-[10px]
            font-medium
            text-slate-500
          "
        >
          {title}
        </p>
      </div>

      {/* ================================================= */}
      {/* VALUE */}
      {/* ================================================= */}

      <div
        className={`
          absolute
          left-0
          right-0
          top-[34px]
          translate-x-2.5
          truncate
          text-[18px]
          font-bold
          leading-none
          tracking-tight
          ${valueClasses[valueColor]}
        `}
      >
        {value}
      </div>

      {/* ================================================= */}
      {/* SUBTITLE */}
      {/* ================================================= */}

      <div
        className="
          absolute
          bottom-2.5
          left-0
          right-0
          translate-x-2.5
          truncate
          text-[10px]
          leading-none
          text-slate-500
        "
      >
        {subtitle}
      </div>

    </div>
  );
}

function formatCurrency(
  value: number,
  currency: string
) {
  const symbol =
    getCurrencySymbol(
      currency
    );

  return `${value >= 0 ? "+" : "-"}${symbol}${Math.abs(value).toFixed(2)}`;
}

function formatVolume(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    }
  ).format(
    Math.abs(
      value
    )
  );
}

export default function DailyReviewSecondaryMetrics({
  selectedTrades,
  reportingCurrency,
}: DailyReviewSecondaryMetricsProps) {

  /*
   * -------------------------------------------------------
   * BASIC PERFORMANCE
   * -------------------------------------------------------
   */

  const totalTrades =
    selectedTrades.length;

  const netPnL =
    selectedTrades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        Number(
          trade.pnl || 0
        ),
      0
    );

  const totalFees =
    selectedTrades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        Number(
          trade.fees || 0
        ),
      0
    );

  /*
   * Existing trade.pnl is treated as the canonical
   * net trade result, matching DailyReviewKpis.
   */
  const grossPnL =
    netPnL +
    totalFees;

  /*
   * -------------------------------------------------------
   * BEST / WORST TRADE
   * -------------------------------------------------------
   */

  const sortedTrades =
    [...selectedTrades].sort(
      (
        a,
        b
      ) =>
        Number(
          b.pnl || 0
        ) -
        Number(
          a.pnl || 0
        )
    );

  const bestTrade =
    sortedTrades[0] ??
    null;

  const worstTrade =
    sortedTrades[
      sortedTrades.length - 1
    ] ??
    null;

  /*
   * -------------------------------------------------------
   * WINNERS / LOSERS
   * -------------------------------------------------------
   */

  const winningTrades =
    selectedTrades.filter(
      (
        trade
      ) =>
        Number(
          trade.pnl || 0
        ) > 0
    );

  const losingTrades =
    selectedTrades.filter(
      (
        trade
      ) =>
        Number(
          trade.pnl || 0
        ) < 0
    );

  const averageWinner =
    winningTrades.length > 0
      ? winningTrades.reduce(
          (
            sum,
            trade
          ) =>
            sum +
            Number(
              trade.pnl || 0
            ),
          0
        ) /
        winningTrades.length
      : null;

  const averageLoser =
    losingTrades.length > 0
      ? losingTrades.reduce(
          (
            sum,
            trade
          ) =>
            sum +
            Number(
              trade.pnl || 0
            ),
          0
        ) /
        losingTrades.length
      : null;

  /*
   * -------------------------------------------------------
   * TOTAL VOLUME
   * -------------------------------------------------------
   */

  const totalVolume =
    selectedTrades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        Math.abs(
          Number(
            trade.quantity || 0
          )
        ),
      0
    );

  /*
   * -------------------------------------------------------
   * FEE / GROSS P&L
   * -------------------------------------------------------
   */

  const feeGrossRatio =
    Math.abs(
      grossPnL
    ) > 0
      ? (
          Math.abs(
            totalFees
          ) /
          Math.abs(
            grossPnL
          )
        ) * 100
      : 0;

  /*
   * -------------------------------------------------------
   * EXPECTANCY
   *
   * DailyReview-level expectancy:
   * total net P&L / total trades.
   * -------------------------------------------------------
   */

  const expectancy =
    totalTrades > 0
      ? netPnL /
        totalTrades
      : null;

  const cards: SecondaryMetricCardProps[] = [
    {
      title:
        "Best Trade",

      value:
        bestTrade
          ? bestTrade.ticker
          : "—",

      subtitle:
        bestTrade
          ? formatCurrency(
              Number(
                bestTrade.pnl || 0
              ),
              reportingCurrency
            )
          : "No trades",

valueColor:
  "default",
    },

    {
      title:
        "Worst Trade",

      value:
        worstTrade
          ? worstTrade.ticker
          : "—",

      subtitle:
        worstTrade
          ? formatCurrency(
              Number(
                worstTrade.pnl || 0
              ),
              reportingCurrency
            )
          : "No trades",

valueColor:
  "default",
    },

    {
      title:
        "Avg. Winner",

      value:
        averageWinner != null
          ? formatCurrency(
              averageWinner,
              reportingCurrency
            )
          : "—",

      subtitle:
        winningTrades.length > 0
          ? `${winningTrades.length} winners`
          : "No winners",

valueColor:
  "green",
    },

    {
      title:
        "Avg. Loser",

      value:
        averageLoser != null
          ? formatCurrency(
              averageLoser,
              reportingCurrency
            )
          : "—",

      subtitle:
        losingTrades.length > 0
          ? `${losingTrades.length} losers`
          : "No losers",

      valueColor:
        "red",
    },

    {
      title:
        "Total Volume",

      value:
        formatVolume(
          totalVolume
        ),

      subtitle:
        "shares/contracts",

      valueColor:
        "default",
    },

    {
      title:
        "Fee / Gross P&L",

      value:
        `${feeGrossRatio.toFixed(1)}%`,

      subtitle:
        "trading cost ratio",

      valueColor:
        feeGrossRatio >= 20
          ? "red"
          : "default",
    },

    {
      title:
        "Expectancy",

      value:
        expectancy != null
          ? formatCurrency(
              expectancy,
              reportingCurrency
            )
          : "—",

      subtitle:
        "per trade",

      valueColor:
        expectancy == null
          ? "default"
          : expectancy >= 0
            ? "green"
            : "red",
    },
  ];

  return (
    <div
      className="
        flex
        justify-center
      "
    >

      <div
        className="
          w-[98%]
        "
      >

        <div
          className="
            grid
            grid-cols-7
            gap-3.5
          "
        >

          {cards.map(
            (
              card
            ) => (
              <SecondaryMetricCard
                key={
                  card.title
                }
                title={
                  card.title
                }
                value={
                  card.value
                }
                subtitle={
                  card.subtitle
                }
valueColor={
  card.valueColor ??
  "default"
}
              />
            )
          )}

        </div>

      </div>

    </div>
  );
}