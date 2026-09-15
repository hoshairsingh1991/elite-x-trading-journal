"use client";

import {
  DailyReviewPerformanceProps,
} from "./dailyReviewTypes";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

interface PerformancePoint {
  time: Date;
  cumulativePnL: number;
  tradePnL: number;
}

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

function formatTime(
  value: Date
) {
  return value.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatAxisCurrency(
  value: number,
  currency: string
) {
  const symbol =
    getCurrencySymbol(
      currency
    );

  if (value === 0) {
    return `${symbol}0`;
  }

  return `${value > 0 ? "" : "-"}${symbol}${Math.abs(value).toFixed(0)}`;
}

function formatValue(
  value: number,
  currency: string
) {
  const symbol =
    getCurrencySymbol(
      currency
    );

  return `${value >= 0 ? "+" : "-"}${symbol}${Math.abs(value).toFixed(2)}`;
}

function buildPerformancePoints(
  selectedTrades: DailyReviewPerformanceProps["selectedTrades"]
) {
  const chronologicalTrades =
    selectedTrades
      .map(
        (
          trade,
          index
        ) => {

          /*
           * Realized daily P&L is plotted when a trade closes.
           * Open trades are excluded from the realized curve.
           */
          const timestamp =
            parseDateTime(
              trade.closedAt
            );

          if (!timestamp) {
            return null;
          }

          return {
            trade,
            timestamp,
            index,
          };
        }
      )
      .filter(
        (
          value
        ): value is {
          trade: DailyReviewPerformanceProps["selectedTrades"][number];
          timestamp: Date;
          index: number;
        } =>
          value !== null
      )
      .sort(
        (
          a,
          b
        ) => {

          const timeDifference =
            a.timestamp.getTime() -
            b.timestamp.getTime();

          if (
            timeDifference !== 0
          ) {
            return timeDifference;
          }

          return (
            a.index -
            b.index
          );
        }
      );

  let cumulativePnL = 0;

  const points: PerformancePoint[] =
    chronologicalTrades.map(
      (
        item
      ) => {

        const tradePnL =
          Number(
            item.trade.pnl || 0
          );

        cumulativePnL +=
          tradePnL;

        return {
          time:
            item.timestamp,
          cumulativePnL,
          tradePnL,
        };
      }
    );

  return points;
}

function getNiceStep(
  range: number
) {
  if (range <= 25) {
    return 5;
  }

  if (range <= 50) {
    return 10;
  }

  if (range <= 100) {
    return 20;
  }

  if (range <= 250) {
    return 50;
  }

  if (range <= 500) {
    return 100;
  }

  if (range <= 1000) {
    return 200;
  }

  return 500;
}

export default function DailyReviewPerformance({
  selectedTrades,
  reportingCurrency,
}: DailyReviewPerformanceProps) {

  const points =
    buildPerformancePoints(
      selectedTrades
    );

  const finalPnL =
    points.length > 0
      ? points[
          points.length - 1
        ].cumulativePnL
      : 0;

  /*
   * Keep a zero point so the curve has a
   * natural starting position.
   */
  const chartPoints =
    points.length > 0
      ? [
          {
            time:
              points[0].time,
            cumulativePnL: 0,
            tradePnL: 0,
          },
          ...points,
        ]
      : [];

  const minPnL =
    chartPoints.length > 0
      ? Math.min(
          0,
          ...chartPoints.map(
            (
              point
            ) =>
              point.cumulativePnL
          )
        )
      : 0;

  const maxPnL =
    chartPoints.length > 0
      ? Math.max(
          0,
          ...chartPoints.map(
            (
              point
            ) =>
              point.cumulativePnL
          )
        )
      : 0;

  const rawRange =
    maxPnL -
    minPnL;

  const chartRange =
    rawRange > 0
      ? rawRange
      : 100;

  const padding =
    chartRange * 0.10;

  const chartMin =
    minPnL -
    padding;

  const chartMax =
    maxPnL +
    padding;

  const visibleRange =
    chartMax -
    chartMin;

  const step =
    getNiceStep(
      visibleRange / 4
    );

  const firstTick =
    Math.ceil(
      chartMin /
        step
    ) * step;

  const yTicks: number[] = [];

  for (
    let value = firstTick;
    value <= chartMax;
    value += step
  ) {
    yTicks.push(
      Number(
        value.toFixed(6)
      )
    );
  }

  if (
    yTicks.length === 0
  ) {
    yTicks.push(
      0
    );
  }

  /*
   * Compact chart geometry.
   *
   * The surrounding card is intentionally 180px tall.
   * The SVG therefore needs to stay compact as well.
   */
const chartWidth = 620;
const chartHeight = 200;

  const leftPadding = 46;
  const rightPadding = 8;
  const topPadding = 6;
  const bottomPadding = 24;

  const plotWidth =
    chartWidth -
    leftPadding -
    rightPadding;

  const plotHeight =
    chartHeight -
    topPadding -
    bottomPadding;

  const firstTime =
    chartPoints.length > 0
      ? chartPoints[0].time.getTime()
      : 0;

  const lastTime =
    chartPoints.length > 0
      ? chartPoints[
          chartPoints.length - 1
        ].time.getTime()
      : firstTime + 1;

  const timeRange =
    Math.max(
      1,
      lastTime -
        firstTime
    );

  const getX =
    (
      point: PerformancePoint
    ) => {

      const ratio =
        (
          point.time.getTime() -
          firstTime
        ) /
        timeRange;

      return (
        leftPadding +
        ratio *
          plotWidth
      );
    };

  const getY =
    (
      value: number
    ) => {

      const ratio =
        (
          chartMax -
          value
        ) /
        visibleRange;

      return (
        topPadding +
        ratio *
          plotHeight
      );
    };

  const svgPoints =
    chartPoints.map(
      (
        point
      ) => ({
        ...point,
        x: getX(
          point
        ),
        y: getY(
          point.cumulativePnL
        ),
      })
    );

  const zeroY =
    getY(0);

  const areaPoints =
    svgPoints.length > 0
      ? [
          `${svgPoints[0].x},${zeroY}`,
          ...svgPoints.map(
            (
              point
            ) =>
              `${point.x},${point.y}`
          ),
          `${
            svgPoints[
              svgPoints.length - 1
            ].x
          },${zeroY}`,
        ].join(" ")
      : "";

  /*
   * Keep a limited number of time labels
   * so the compact chart does not become crowded.
   */
  const xLabelCount =
    Math.min(
      7,
      Math.max(
        2,
        svgPoints.length
      )
    );

  const xLabels =
    svgPoints.length > 0
      ? Array.from(
          {
            length:
              xLabelCount,
          },
          (
            _,
            index
          ) => {

            if (
              xLabelCount ===
              1
            ) {
              return svgPoints[0];
            }

            const position =
              Math.round(
                index *
                  (
                    (
                      svgPoints.length -
                      1
                    ) /
                    (
                      xLabelCount -
                      1
                    )
                  )
              );

            return svgPoints[
              Math.min(
                position,
                svgPoints.length -
                  1
              )
            ];
          }
        )
      : [];

  /*
   * Build short line segments so positive movement
   * remains green and negative movement remains red.
   */
  const lineSegments =
    svgPoints.slice(
      1
    ).map(
      (
        point,
        index
      ) => {

        const previous =
          svgPoints[
            index
          ];

        const positive =
          point.cumulativePnL >=
          previous.cumulativePnL;

        return {
          x1:
            previous.x,
          y1:
            previous.y,
          x2:
            point.x,
          y2:
            point.y,
          positive,
        };
      }
    );

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

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
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
          P&L Over Time
        </h2>

        <div
          className="
            flex
            translate-y-1
            items-center
            gap-2
          "
        >

          <span
            className="
              text-[10px]
              font-medium
              text-slate-500
            "
          >
            Cumulative P&L
          </span>

          <span
            className={`
              text-[13px]
              font-black
              ${
                finalPnL >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            `}
          >
            {formatValue(
              finalPnL,
              reportingCurrency
            )}
          </span>

        </div>

      </div>

      {/* ================================================= */}
      {/* CHART */}
      {/* ================================================= */}

      <div
        className="
          mt-2
          w-full
          overflow-hidden
        "
      >

        {svgPoints.length === 0 ? (

          <div
            className="
              flex
              h-[128px]
              items-center
              justify-center
              text-[11px]
              text-slate-600
            "
          >
            No realized P&L data available for this day.
          </div>

        ) : (

          <div
            className="
              w-full
              overflow-hidden
            "
          >

            <svg
              viewBox={`
                0
                0
                ${chartWidth}
                ${chartHeight}
              `}
              className="
                block
                h-[128px]
                w-full
              "
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Cumulative daily P&L chart"
            >

              {/* ================================================= */}
              {/* GRID */}
              {/* ================================================= */}

              {yTicks.map(
                (
                  tick
                ) => {

                  const y =
                    getY(
                      tick
                    );

                  return (
                    <g
                      key={
                        `y-${tick}`
                      }
                    >

                      <line
                        x1={
                          leftPadding
                        }
                        x2={
                          chartWidth -
                          rightPadding
                        }
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />

                      <text
                        x={
                          leftPadding -
                          8
                        }
                        y={
                          y + 3
                        }
                        textAnchor="end"
                        fill="rgba(148,163,184,0.70)"
                        fontSize="9"
                      >
                        {formatAxisCurrency(
                          tick,
                          reportingCurrency
                        )}
                      </text>

                    </g>
                  );
                }
              )}

              {/* ZERO LINE */}

              <line
                x1={
                  leftPadding
                }
                x2={
                  chartWidth -
                  rightPadding
                }
                y1={zeroY}
                y2={zeroY}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
              />

              {/* AREA */}

              <polygon
                points={
                  areaPoints
                }
                fill="rgba(52,211,153,0.07)"
              />

              {/* LINE SEGMENTS */}

              {lineSegments.map(
                (
                  segment,
                  index
                ) => (
                  <line
                    key={
                      `segment-${index}`
                    }
                    x1={
                      segment.x1
                    }
                    y1={
                      segment.y1
                    }
                    x2={
                      segment.x2
                    }
                    y2={
                      segment.y2
                    }
                    stroke={
                      segment.positive
                        ? "#34d399"
                        : "#ef4444"
                    }
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                )
              )}

              {/* START POINT */}

              {svgPoints.length > 0 && (
                <circle
                  cx={
                    svgPoints[0].x
                  }
                  cy={
                    svgPoints[0].y
                  }
                  r="2.5"
                  fill="#34d399"
                />
              )}

              {/* TRADE POINTS */}

              {svgPoints
                .slice(1)
                .map(
                  (
                    point,
                    index
                  ) => (
                    <circle
                      key={
                        `point-${index}`
                      }
                      cx={
                        point.x
                      }
                      cy={
                        point.y
                      }
                      r="2"
                      fill={
                        point.tradePnL >=
                        0
                          ? "#34d399"
                          : "#ef4444"
                      }
                    />
                  )
                )}

              {/* X LABELS */}

              {xLabels.map(
                (
                  point,
                  index
                ) => (
                  <text
                    key={
                      `x-${index}`
                    }
                    x={
                      point.x
                    }
                    y={
                      chartHeight -
                      7
                    }
                    textAnchor="middle"
                    fill="rgba(148,163,184,0.70)"
                    fontSize="9"
                  >
                    {formatTime(
                      point.time
                    )}
                  </text>
                )
              )}

            </svg>

          </div>

        )}

      </div>

    </section>
  );
}