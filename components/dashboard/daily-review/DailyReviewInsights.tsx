"use client";

import {
  DailyReviewInsightsProps,
} from "./dailyReviewTypes";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

function parseDateTime(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
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

function formatHour(
  date: Date
) {
  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatHourRange(
  date: Date
) {
  const start =
    new Date(
      date
    );

  const end =
    new Date(
      start
    );

  end.setHours(
    end.getHours() + 1
  );

  return `${formatHour(start)} – ${formatHour(end)}`;
}

function InsightIcon({
  type,
}: {
  type:
    | "positive"
    | "warning"
    | "negative"
    | "active";
}) {

  const config = {
    positive: {
      wrapper:
        "bg-emerald-500 text-[#07111d]",
      symbol:
        "✓",
    },
    warning: {
      wrapper:
        "bg-amber-400 text-[#07111d]",
      symbol:
        "!",
    },
    negative: {
      wrapper:
        "bg-red-500 text-white",
      symbol:
        "!",
    },
    active: {
      wrapper:
        "bg-violet-500 text-white",
      symbol:
        "•",
    },
  }[type];

  return (
    <span
      className={`
        flex
        h-[13px]
        w-[13px]
        shrink-0
        items-center
        justify-center
        rounded-full
        text-[9px]
        font-black
        ${config.wrapper}
      `}
    >
      {config.symbol}
    </span>
  );
}

export default function DailyReviewInsights({
  selectedTrades,
  reportingCurrency,
}: DailyReviewInsightsProps) {

  const totalPnL =
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

  const wins =
    selectedTrades.filter(
      (
        trade
      ) =>
        trade.status ===
        "WIN"
    ).length;

  const losses =
    selectedTrades.filter(
      (
        trade
      ) =>
        trade.status ===
        "LOSS"
    ).length;

  const closedTrades =
    selectedTrades.filter(
      (
        trade
      ) =>
        trade.status !==
        "OPEN"
    );

  const winRate =
    closedTrades.length > 0
      ? (
          wins /
          closedTrades.length
        ) * 100
      : 0;

  /*
   * -----------------------------------------------
   * SYMBOL PERFORMANCE
   * -----------------------------------------------
   */

  const symbolStats =
    new Map<
      string,
      {
        pnl: number;
        trades: number;
      }
    >();

  selectedTrades.forEach(
    (
      trade
    ) => {

      const symbol =
        trade.ticker ||
        "Unknown";

      const current =
        symbolStats.get(
          symbol
        ) ?? {
          pnl: 0,
          trades: 0,
        };

      current.pnl +=
        Number(
          trade.pnl || 0
        );

      current.trades += 1;

      symbolStats.set(
        symbol,
        current
      );
    }
  );

  const sortedSymbols =
    Array.from(
      symbolStats.entries()
    ).sort(
      (
        a,
        b
      ) =>
        b[1].pnl -
        a[1].pnl
    );

  const topSymbol =
    sortedSymbols[0] ??
    null;

  const biggestDrag =
    [...sortedSymbols]
      .sort(
        (
          a,
          b
        ) =>
          a[1].pnl -
          b[1].pnl
      )[0] ??
    null;

  /*
   * -----------------------------------------------
   * LOSING TRADE ANALYSIS
   * -----------------------------------------------
   */

  const losingTradePnLs =
    selectedTrades
      .map(
        (
          trade
        ) =>
          Number(
            trade.pnl || 0
          )
      )
      .filter(
        (
          pnl
        ) =>
          pnl < 0
      );

  const averageLoss =
    losingTradePnLs.length > 0
      ? losingTradePnLs.reduce(
          (
            sum,
            pnl
          ) =>
            sum +
            Math.abs(
              pnl
            ),
          0
        ) /
        losingTradePnLs.length
      : 0;

  const tradesExceedingAverageLoss =
    averageLoss > 0
      ? losingTradePnLs.filter(
          (
            pnl
          ) =>
            Math.abs(
              pnl
            ) >
            averageLoss
        ).length
      : 0;

  /*
   * -----------------------------------------------
   * MOST ACTIVE PERIOD
   *
   * Uses each trade's entry time and groups activity
   * into one-hour buckets.
   * -----------------------------------------------
   */

  const hourlyActivity =
    new Map<
      number,
      number
    >();

  selectedTrades.forEach(
    (
      trade
    ) => {

      const timestamp =
        parseDateTime(
          trade.openedAt
        ) ??
        parseDateTime(
          trade.closedAt
        );

      if (!timestamp) {
        return;
      }

      const hour =
        new Date(
          timestamp.getFullYear(),
          timestamp.getMonth(),
          timestamp.getDate(),
          timestamp.getHours()
        ).getTime();

      hourlyActivity.set(
        hour,
        (
          hourlyActivity.get(
            hour
          ) ?? 0
        ) + 1
      );
    }
  );

  const mostActivePeriod =
    Array.from(
      hourlyActivity.entries()
    ).sort(
      (
        a,
        b
      ) =>
        b[1] -
        a[1]
    )[0] ??
    null;

  const mostActiveDate =
    mostActivePeriod
      ? new Date(
          mostActivePeriod[0]
        )
      : null;

  /*
   * -----------------------------------------------
   * COST IMPACT
   * -----------------------------------------------
   */

  const feeRatio =
    Math.abs(
      totalPnL
    ) > 0
      ? (
          totalFees /
          Math.abs(
            totalPnL
          )
        ) * 100
      : 0;

  /*
   * -----------------------------------------------
   * EMPTY DAY
   * -----------------------------------------------
   */

  if (
    selectedTrades.length === 0
  ) {
    return (
      <section
        className="
          h-[180px]
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          p-4
        "
      >

        <div
          className="
            w-[96%]
            translate-x-[1%]
          "
        >

          <h2
            className="
              translate-x-2.5
              translate-y-1
              text-[13px]
              font-bold
              text-slate-200
            "
          >
            Day Insights
          </h2>

          <div
            className="
              mt-8
              flex
              items-center
              gap-2
              text-[11px]
              text-slate-600
            "
          >
            No trading activity is available for this day.
          </div>

        </div>

      </section>
    );
  }

  const positiveDay =
    totalPnL >= 0;

  const topSymbolPositive =
    topSymbol
      ? topSymbol[1].pnl >= 0
      : false;

  const highTradingCosts =
    feeRatio >= 20;

  return (
    <section
      className="
        h-[180px]
        overflow-hidden
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        p-4
      "
    >

      <div
        className="
          w-[96%]
          translate-x-[1%]
        "
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <h2
          className="
            translate-x-2.5
            translate-y-1
            text-[13px]
            font-bold
            text-slate-200
          "
        >
          Day Insights
        </h2>

        {/* ================================================= */}
        {/* INSIGHTS */}
        {/* ================================================= */}

<div
  className="
    mt-4
    ml-2
    grid
    translate-x-[6px]
    translate-y-[7px]
    gap-[5px]
  "
>

          {/* POSITIVE / NEGATIVE DAY */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type={
                positiveDay
                  ? "positive"
                  : "negative"
              }
            />

            <span
              className={`
                text-[11px]
                font-medium
                ${
                  positiveDay
                    ? "text-slate-300"
                    : "text-slate-300"
                }
              `}
            >
              {positiveDay
                ? "Positive day (net profit)"
                : "Negative day (net loss)"}
            </span>

          </div>

          {/* WIN RATE */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type="positive"
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {winRate.toFixed(
                1
              )}% win rate
            </span>

          </div>

          {/* TRADING COSTS */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type={
                highTradingCosts
                  ? "warning"
                  : "positive"
              }
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {highTradingCosts
                ? "High trading costs"
                : "Trading costs"}
              {" "}
              (
              {feeRatio.toFixed(
                1
              )}% of P&L)
            </span>

          </div>

          {/* TOP PERFORMER */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type={
                topSymbolPositive
                  ? "positive"
                  : "negative"
              }
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {topSymbol
                ? `${topSymbol[0]} was the top performer`
                : "No top performer available"}
            </span>

            {topSymbol && (
              <span
                className={`
                  text-[10px]
                  font-semibold
                  ${
                    topSymbolPositive
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                `}
              >
                {formatCurrency(
                  topSymbol[1].pnl,
                  reportingCurrency
                )}
              </span>
            )}

          </div>

          {/* BIGGEST DRAG */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type="negative"
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {biggestDrag
                ? `${biggestDrag[0]} was the biggest drag`
                : "No biggest drag available"}
            </span>

            {biggestDrag && (
              <span
                className="
                  text-[10px]
                  font-semibold
                  text-red-400
                "
              >
                {formatCurrency(
                  biggestDrag[1].pnl,
                  reportingCurrency
                )}
              </span>
            )}

          </div>

          {/* TRADES EXCEEDING AVERAGE LOSS */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type={
                tradesExceedingAverageLoss >
                0
                  ? "warning"
                  : "positive"
              }
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {tradesExceedingAverageLoss > 0
                ? `${tradesExceedingAverageLoss} ${
                    tradesExceedingAverageLoss ===
                    1
                      ? "trade"
                      : "trades"
                  } exceeded avg loss`
                : "No trades exceeded avg loss"}
            </span>

          </div>

          {/* MOST ACTIVE PERIOD */}

          <div
            className="
              flex
              min-h-[16px]
              items-center
              gap-2
            "
          >

            <InsightIcon
              type="active"
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {mostActiveDate &&
              mostActivePeriod
                ? `Most active period: ${formatHourRange(
                    mostActiveDate
                  )}`
                : "Most active period: N/A"}
            </span>

            {mostActivePeriod && (
              <span
                className="
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
              >
                · {mostActivePeriod[1]} trades
              </span>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}