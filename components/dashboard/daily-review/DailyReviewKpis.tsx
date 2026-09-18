"use client";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import {
  DailyReviewKpisProps,
} from "./dailyReviewTypes";

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

function formatDuration(
  minutes: number | null
) {
  if (
    minutes == null ||
    !Number.isFinite(minutes)
  ) {
    return "—";
  }

  const rounded =
    Math.max(
      0,
      Math.round(minutes)
    );

  const hours =
    Math.floor(
      rounded / 60
    );

  const mins =
    rounded % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}

interface DailyReviewKpiCardProps {
  title: string;
  value: string;
  subtitle: string;

  valueColor?:
    | "default"
    | "green"
    | "red"
    | "blue";

  subtitleColor?:
    | "default"
    | "green"
    | "red"
    | "yellow";
}

function DailyReviewKpiCard({
  title,
  value,
  subtitle,
  valueColor = "default",
  subtitleColor = "default",
}: DailyReviewKpiCardProps) {

  const valueClasses = {
    default: "text-slate-100",
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };

  const subtitleClasses = {
    default: "text-slate-500",
    green: "text-emerald-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
  };

  return (
    <div
      className="
        relative
        h-[106px]
        overflow-hidden
        rounded-[10px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        px-4
        py-3.5
        transition-all
        duration-200
        hover:-translate-y-[2px]
        hover:z-10
        hover:border-cyan-500/20
        hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]
      "
    >

      {/* TITLE */}

      <div
        className="
          absolute
          left-0
          right-0
          top-3
          translate-x-2.5
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          {title}
        </p>
      </div>

      {/* VALUE */}

      <div
        className={`
          absolute
          left-0
          right-0
          top-1/2
          -translate-y-1/2
          translate-x-2.5
          truncate
          text-[21px]
          font-bold
          leading-none
          tracking-tight
          ${valueClasses[valueColor]}
        `}
      >
        {value}
      </div>

      {/* SUBTITLE */}

      <div
        className={`
          absolute
          bottom-3
          left-0
          right-0
          translate-x-2.5
          min-h-[10px]
          text-[11px]
          leading-none
          ${subtitleClasses[subtitleColor]}
        `}
      >
        {subtitle}
      </div>

    </div>
  );
}

export default function DailyReviewKpis({
  selectedTrades,
  reportingCurrency,
}: DailyReviewKpisProps) {

const closedTrades =
  selectedTrades.filter(
    (
      trade
    ) =>
      trade.status !==
      "OPEN"
  );

const totalTrades =
  closedTrades.length;

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
   * Existing trade.pnl is used as the canonical trade result.
   * Fees are added back here to display the gross result.
   */
  const grossPnL =
    netPnL +
    totalFees;

  const wins =
    selectedTrades.filter(
      (
        trade
      ) =>
        trade.status ===
        "WIN"
    );

  const losses =
    selectedTrades.filter(
      (
        trade
      ) =>
        trade.status ===
        "LOSS"
    );

  const winCount =
    wins.length;

  const lossCount =
    losses.length;

  const winRate =
    totalTrades > 0
      ? (
          winCount /
          totalTrades
        ) * 100
      : 0;

  /*
   * Daily Profit Factor
   *
   * Gross winning P&L /
   * absolute gross losing P&L
   */
  const grossProfit =
    wins.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        Math.max(
          0,
          Number(
            trade.pnl || 0
          )
        ),
      0
    );

  const grossLoss =
    Math.abs(
      losses.reduce(
        (
          sum,
          trade
        ) =>
          sum +
          Math.min(
            0,
            Number(
              trade.pnl || 0
            )
          ),
        0
      )
    );

  const profitFactor =
    grossLoss > 0
      ? grossProfit /
        grossLoss
      : grossProfit > 0
        ? Infinity
        : 0;

  /*
   * Average hold time uses closed trades only.
   */
  const holdTimes =
    selectedTrades
      .filter(
        (
          trade
        ) =>
          trade.openedAt &&
          trade.closedAt
      )
      .map(
        (
          trade
        ) => {

          const entryTime =
            new Date(
              trade.openedAt!
            ).getTime();

          const exitTime =
            new Date(
              trade.closedAt!
            ).getTime();

          const minutes =
            (
              exitTime -
              entryTime
            ) / 60000;

          return Number.isFinite(
            minutes
          ) && minutes >= 0
            ? minutes
            : null;
        }
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  const averageHoldTime =
    holdTimes.length > 0
      ? holdTimes.reduce(
          (
            sum,
            value
          ) =>
            sum + value,
          0
        ) /
        holdTimes.length
      : null;

  const cards = [
    {
      title: "Net P&L",
      value:
        formatCurrency(
          netPnL,
          reportingCurrency
        ),
      subtitle:
        "Daily result",
      valueColor:
        netPnL >= 0
          ? "green"
          : "red",
      subtitleColor:
        "default",
    },

    {
      title: "Gross P&L",
      value:
        formatCurrency(
          grossPnL,
          reportingCurrency
        ),
      subtitle:
        "Before fees",
      valueColor:
        grossPnL >= 0
          ? "default"
          : "red",
      subtitleColor:
        "default",
    },

    {
      title: "Total Trades",
      value:
        String(
          totalTrades
        ),
      subtitle:
        `${winCount}W / ${lossCount}L`,
      valueColor:
        "default",
      subtitleColor:
        "default",
    },

    {
      title: "Win Rate",
      value:
        `${winRate.toFixed(1)}%`,
      subtitle:
        `${winCount}W / ${lossCount}L`,
      valueColor:
        "blue",
      subtitleColor:
        "default",
    },

    {
      title: "Profit Factor",
      value:
        Number.isFinite(
          profitFactor
        )
          ? profitFactor.toFixed(2)
          : grossProfit > 0
            ? "∞"
            : "—",
      subtitle:
        "Gross profit / loss",
      valueColor:
        "default",
      subtitleColor:
        profitFactor >= 1.5
          ? "green"
          : profitFactor >= 1
            ? "yellow"
            : profitFactor > 0
              ? "red"
              : "default",
    },

    {
      title: "Total Fees",
      value:
        `${getCurrencySymbol(
          reportingCurrency
        )}${totalFees.toFixed(2)}`,
      subtitle:
        "Trading costs",
      valueColor:
        "default",
      subtitleColor:
        "default",
    },

    {
      title: "Avg Hold Time",
      value:
        formatDuration(
          averageHoldTime
        ),
      subtitle:
        "Closed trades",
      valueColor:
        "default",
      subtitleColor:
        "default",
    },
  ] as const;

  return (
    <div className="flex justify-center">

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
              <DailyReviewKpiCard
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
                  card.valueColor
                }
                subtitleColor={
                  card.subtitleColor
                }
              />
            )
          )}

        </div>

      </div>

    </div>
  );
}