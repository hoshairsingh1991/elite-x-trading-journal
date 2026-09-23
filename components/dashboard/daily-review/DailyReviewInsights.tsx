"use client";

import {
  DailyReviewInsightsProps,
} from "./dailyReviewTypes";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

/*
 * ================================================================
 * DATE / TIME HELPERS
 * ================================================================
 */

function parseDateTime(
  value?: string | null
) {

  if (!value) {
    return null;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
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

/*
 * ================================================================
 * CURRENCY
 * ================================================================
 */

function formatCurrency(
  value: number,
  currency: string
) {

  const symbol =
    getCurrencySymbol(
      currency
    );

  if (
    value === 0
  ) {
    return `${symbol}0.00`;
  }

  return `${value > 0 ? "+" : "-"}${symbol}${Math.abs(value).toFixed(2)}`;
}

/*
 * ================================================================
 * INSIGHT ICON
 * ================================================================
 */

function InsightIcon({
  type,
}: {
  type:
    | "positive"
    | "warning"
    | "negative"
    | "active"
    | "neutral";
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

    neutral: {
      wrapper:
        "bg-slate-500 text-[#07111d]",
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

/*
 * ================================================================
 * DAILY REVIEW INSIGHTS
 *
 * Important architectural rule:
 *
 * This component is an analytical/read-only presentation layer.
 * It does not modify canonical trade data.
 *
 * Realized-performance calculations use CLOSED trades.
 * Activity calculations may use OPEN trades because they describe
 * when trading activity occurred rather than realized performance.
 * ================================================================
 */

export default function DailyReviewInsights({
  selectedTrades,
  reportingCurrency,
}: DailyReviewInsightsProps) {

  /*
   * ================================================================
   * CLOSED TRADES
   *
   * OPEN trades are excluded from realized P&L, win rate, symbol
   * performance, and loss analysis.
   * ================================================================
   */

  const closedTrades =
    selectedTrades.filter(
      (
        trade
      ) =>
        trade.status !==
        "OPEN"
    );

  /*
   * ================================================================
   * CORE REALIZED PERFORMANCE
   * ================================================================
   */

  const totalPnL =
    closedTrades.reduce(
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
    closedTrades.reduce(
      (
        sum,
        trade
      ) =>
        sum +
        Math.abs(
          Number(
            trade.fees || 0
          )
        ),
      0
    );

  /*
   * pnl is treated as canonical NET P&L.
   *
   * Therefore:
   *
   * Gross P&L = Net P&L + Fees
   *
   * This assumes trade.fees represents positive fee magnitude.
   */

  const grossPnL =
    totalPnL +
    totalFees;

  /*
   * ================================================================
   * WIN / LOSS CLASSIFICATION
   *
   * Only explicitly classified WIN and LOSS trades participate in
   * win-rate calculations.
   *
   * This prevents unknown statuses from silently becoming losses.
   * ================================================================
   */

  const wins =
    closedTrades.filter(
      (
        trade
      ) =>
        trade.status ===
        "WIN"
    ).length;

  const losses =
    closedTrades.filter(
      (
        trade
      ) =>
        trade.status ===
        "LOSS"
    ).length;

  const classifiedTrades =
    wins +
    losses;

  const winRate =
    classifiedTrades > 0
      ? (
          wins /
          classifiedTrades
        ) *
        100
      : 0;

  /*
   * ================================================================
   * SYMBOL PERFORMANCE
   *
   * Aggregate realized NET P&L by ticker.
   * ================================================================
   */

  const symbolStats =
    new Map<
      string,
      {
        pnl: number;
        trades: number;
      }
    >();

  closedTrades.forEach(
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

      current.trades +=
        1;

      symbolStats.set(
        symbol,
        current
      );
    }
  );

  /*
   * ================================================================
   * TOP PERFORMER
   *
   * Only a symbol with positive realized P&L qualifies.
   *
   * If every symbol lost money, we do NOT incorrectly call the
   * least-negative symbol the "top performer."
   * ================================================================
   */

  const topSymbol =
    Array.from(
      symbolStats.entries()
    )
      .filter(
        (
          [
            ,
            stats,
          ]
        ) =>
          stats.pnl > 0
      )
      .sort(
        (
          a,
          b
        ) => {

          const pnlDifference =
            b[1].pnl -
            a[1].pnl;

          if (
            pnlDifference !==
            0
          ) {
            return pnlDifference;
          }

          const tradeDifference =
            b[1].trades -
            a[1].trades;

          if (
            tradeDifference !==
            0
          ) {
            return tradeDifference;
          }

          return a[0].localeCompare(
            b[0]
          );
        }
      )[0] ??
    null;

  /*
   * ================================================================
   * BIGGEST DRAG
   *
   * Only a symbol with negative realized P&L qualifies.
   * ================================================================
   */

  const biggestDrag =
    Array.from(
      symbolStats.entries()
    )
      .filter(
        (
          [
            ,
            stats,
          ]
        ) =>
          stats.pnl < 0
      )
      .sort(
        (
          a,
          b
        ) => {

          const pnlDifference =
            a[1].pnl -
            b[1].pnl;

          if (
            pnlDifference !==
            0
          ) {
            return pnlDifference;
          }

          const tradeDifference =
            b[1].trades -
            a[1].trades;

          if (
            tradeDifference !==
            0
          ) {
            return tradeDifference;
          }

          return a[0].localeCompare(
            b[0]
          );
        }
      )[0] ??
    null;

  /*
   * ================================================================
   * LOSS ANALYSIS
   *
   * Average loss is calculated only from losing closed trades.
   * ================================================================
   */

  const losingTradePnLs =
    closedTrades
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

  const largestLoss =
    losingTradePnLs.length > 0
      ? Math.max(
          ...losingTradePnLs.map(
            (
              pnl
            ) =>
              Math.abs(
                pnl
              )
          )
        )
      : 0;

  const largestLossMultiple =
    averageLoss > 0
      ? largestLoss /
        averageLoss
      : 0;

  /*
   * ================================================================
   * MOST ACTIVE PERIOD
   *
   * This is intentionally different from realized performance.
   *
   * Entry time is preferred because this answers:
   *
   * "When was I most active?"
   *
   * Open trades are allowed here because they still represent
   * actual trading activity.
   * ================================================================
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

      const hourStart =
        new Date(
          timestamp
        );

      hourStart.setMinutes(
        0,
        0,
        0
      );

      const hourKey =
        hourStart.getTime();

      hourlyActivity.set(
        hourKey,
        (
          hourlyActivity.get(
            hourKey
          ) ?? 0
        ) +
        1
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
      ) => {

        const activityDifference =
          b[1] -
          a[1];

        if (
          activityDifference !==
          0
        ) {
          return activityDifference;
        }

        /*
         * Deterministic tie-break:
         * earlier hour first.
         */

        return a[0] -
          b[0];
      }
    )[0] ??
    null;

  const mostActiveDate =
    mostActivePeriod
      ? new Date(
          mostActivePeriod[0]
        )
      : null;

  /*
   * ================================================================
   * COST IMPACT
   *
   * Fees are shown relative to GROSS P&L only when gross P&L is
   * positive.
   *
   * Example:
   *
   * Gross P&L = $500
   * Fees      = $50
   * Fee ratio = 10%
   *
   * For a losing or flat day, a percentage can be misleading.
   * In that case we display the absolute fee amount only.
   * ================================================================
   */

  const feeToGrossProfitRatio =
    grossPnL > 0
      ? (
          totalFees /
          grossPnL
        ) *
        100
      : null;

  /*
   * ================================================================
   * EMPTY DAY
   * ================================================================
   */

  if (
    selectedTrades.length ===
    0
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
    translate-x-[10px]
    translate-y-[4px]
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

  /*
   * ================================================================
   * DAY STATE
   * ================================================================
   */

  const dayState =
    totalPnL > 0
      ? "positive"
      : totalPnL < 0
        ? "negative"
        : "flat";

  const dayInsight =
    dayState === "positive"
      ? "Positive day (net profit)"
      : dayState === "negative"
        ? "Negative day (net loss)"
        : "Flat day (no net P&L)";

  const dayIcon =
    dayState === "positive"
      ? "positive"
      : dayState === "negative"
        ? "negative"
        : "neutral";

  /*
   * ================================================================
   * DISPLAY COPY
   * ================================================================
   */

  const winRateText =
    classifiedTrades > 0
      ? `${winRate.toFixed(1)}% win rate`
      : "Win rate unavailable";

  const winLossText =
    classifiedTrades > 0
      ? `${wins}W / ${losses}L`
      : "No classified trades";

  const costText =
    feeToGrossProfitRatio !==
    null
      ? `Fees ${formatCurrency(
          totalFees,
          reportingCurrency
        )} (${feeToGrossProfitRatio.toFixed(
          1
        )}% of gross P&L)`
      : `Fees ${formatCurrency(
          totalFees,
          reportingCurrency
        )}`;

  const lossInsight =
    largestLoss > 0 &&
    averageLoss > 0
      ? `Largest loss ${formatCurrency(
          -largestLoss,
          reportingCurrency
        )} (${largestLossMultiple.toFixed(
          1
        )}× avg loss)`
      : "No losing trades";

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

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

          {/* ================================================= */}
          {/* DAY RESULT */}
          {/* ================================================= */}

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
                dayIcon
              }
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {dayInsight}
            </span>

            {closedTrades.length >
              0 && (
              <span
                className="
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
              >
                {formatCurrency(
                  totalPnL,
                  reportingCurrency
                )}
              </span>
            )}

          </div>

          {/* ================================================= */}
          {/* WIN RATE */}
          {/* ================================================= */}

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
                classifiedTrades >
                0
                  ? "positive"
                  : "neutral"
              }
            />

            <span
              className="
                text-[11px]
                font-medium
                text-slate-300
              "
            >
              {winRateText}
            </span>

            <span
              className="
                text-[10px]
                font-semibold
                text-slate-500
              "
            >
              · {winLossText}
            </span>

          </div>

          {/* ================================================= */}
          {/* TRADING COSTS */}
          {/* ================================================= */}

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
                totalFees > 0
                  ? "neutral"
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
              {costText}
            </span>

          </div>

          {/* ================================================= */}
          {/* TOP PERFORMER */}
          {/* ================================================= */}

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
                topSymbol
                  ? "positive"
                  : "neutral"
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
                : "No profitable symbol"}
            </span>

            {topSymbol && (
              <span
                className="
                  text-[10px]
                  font-semibold
                  text-emerald-400
                "
              >
                {formatCurrency(
                  topSymbol[1].pnl,
                  reportingCurrency
                )}
              </span>
            )}

          </div>

          {/* ================================================= */}
          {/* BIGGEST DRAG */}
          {/* ================================================= */}

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
                biggestDrag
                  ? "negative"
                  : "neutral"
              }
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
                : "No losing symbol"}
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

          {/* ================================================= */}
          {/* LOSS ANALYSIS */}
          {/* ================================================= */}

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
                largestLoss > 0
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
              {lossInsight}
            </span>

          </div>

          {/* ================================================= */}
          {/* MOST ACTIVE PERIOD */}
          {/* ================================================= */}

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