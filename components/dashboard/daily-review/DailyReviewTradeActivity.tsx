"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DailyReviewTradeActivityProps,
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

export default function DailyReviewTradeActivity({
  selectedTrades,
}: DailyReviewTradeActivityProps) {

  const activityRef =
    useRef<HTMLDivElement | null>(
      null
    );

const [
  hoveredTrade,
  setHoveredTrade,
] = useState<{
  ticker: string;
  time: Date;
  side?: string;
  pnl: number;
  currency: string;
} | null>(null);

  const [
    hoverPosition,
    setHoverPosition,
  ] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const activity = useMemo(() => {

    return selectedTrades
      .map(
        (
          trade,
          index
        ) => {

          /*
           * Closed trades use exit time because that is when
           * the realized P&L enters the daily performance.
           *
           * Open trades fall back to entry time so they still
           * appear in the activity timeline.
           */
          const timestamp =
            parseDateTime(
              trade.closedAt
            ) ??
            parseDateTime(
              trade.openedAt
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
          item
        ): item is {
          trade: typeof selectedTrades[number];
          timestamp: Date;
          index: number;
        } =>
          item !== null
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

  }, [
    selectedTrades,
  ]);

  const minTime =
    activity.length > 0
      ? activity[0].timestamp.getTime()
      : 0;

  const maxTime =
    activity.length > 0
      ? activity[
          activity.length - 1
        ].timestamp.getTime()
      : minTime + 1;

  /*
   * Add visual breathing room around the first and last
   * execution so markers do not sit directly on the edges.
   */
  const timeRange =
    Math.max(
      1,
      maxTime -
        minTime
    );

  const paddedMin =
    minTime -
    timeRange * 0.08;

  const paddedMax =
    maxTime +
    timeRange * 0.08;

  const paddedRange =
    Math.max(
      1,
      paddedMax -
        paddedMin
    );

  const getLeft =
    (
      timestamp: Date
    ) => {

      const ratio =
        (
          timestamp.getTime() -
          paddedMin
        ) /
        paddedRange;

      return (
        ratio *
        100
      );
    };

  const absolutePnLs =
    activity.map(
      (
        item
      ) =>
        Math.abs(
          Number(
            item.trade.pnl || 0
          )
        )
    );

  const maxAbsolutePnL =
    Math.max(
      1,
      ...absolutePnLs
    );

  /*
   * Keep the timeline compact.
   */
  const timelineLabels =
    activity.length > 0
      ? Array.from(
          {
            length:
              Math.min(
                6,
                Math.max(
                  2,
                  activity.length
                )
              ),
          },
          (
            _,
            index
          ) => {

            const count =
              Math.min(
                6,
                Math.max(
                  2,
                  activity.length
                )
              );

            const sourceIndex =
              Math.round(
                index *
                  (
                    (
                      activity.length -
                      1
                    ) /
                    (
                      count -
                      1
                    )
                  )
              );

            return activity[
              Math.min(
                sourceIndex,
                activity.length -
                  1
              )
            ].timestamp;
          }
        )
      : [];

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {

    if (
      !activityRef.current
    ) {
      return;
    }

    const rect =
      activityRef.current.getBoundingClientRect();

    setHoverPosition({
      x:
        event.clientX -
        rect.left,
      y:
        event.clientY -
        rect.top,
    });
  };

  const handleMarkerEnter = (
    item: typeof activity[number]
  ) => {

    const pnl =
      Number(
        item.trade.pnl ||
        0
      );

setHoveredTrade({
  ticker:
    item.trade.ticker ||
    "Unknown",
  time:
    item.timestamp,
  side:
    item.trade.side,
  pnl,
  currency:
    item.trade.currency ||
    "USD",
});
  };

  const handleMouseLeave = () => {
    setHoveredTrade(
      null
    );

    setHoverPosition(
      null
    );
  };

  /*
   * Tooltip dimensions.
   */
  const tooltipWidth =
    132;

  const tooltipHeight =
    64;

  let tooltipLeft =
    0;

  let tooltipTop =
    0;

  if (
    hoverPosition &&
    activityRef.current
  ) {

    const containerWidth =
      activityRef.current
        .clientWidth;

    const containerHeight =
      activityRef.current
        .clientHeight;

    const preferredRight =
      hoverPosition.x +
      12;

    const preferredLeft =
      hoverPosition.x -
      tooltipWidth -
      12;

    if (
      preferredRight +
        tooltipWidth <=
      containerWidth
    ) {
      tooltipLeft =
        preferredRight;
    } else {
      tooltipLeft =
        Math.max(
          8,
          preferredLeft
        );
    }

    tooltipTop =
      Math.min(
        Math.max(
          8,
          hoverPosition.y -
            tooltipHeight /
              2
        ),
        Math.max(
          8,
          containerHeight -
            tooltipHeight -
            8
        )
      );
  }

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

        <div>

          <h2
            className="
              translate-x-2.5
              translate-y-1
              text-[14px]
              font-bold
              text-slate-200
            "
          >
            Trade Activity
          </h2>

          <p
            className="
              mt-0.5
              translate-x-2.5
              text-[11px]
              font-medium
              text-slate-600
            "
          >
            Intraday execution activity
          </p>

        </div>

        <span
          className="
            -translate-x-2.5
            translate-y-1
            text-[11px]
            font-medium
            text-slate-500
          "
        >
          {selectedTrades.length} Trades
        </span>

      </div>

      {/* ================================================= */}
      {/* ACTIVITY AREA */}
      {/* ================================================= */}

<div
  ref={activityRef}
  className="
    relative
    mx-auto
    mt-3
    h-[112px]
    w-[96%]
    translate-x-[2%]
  "
>

        {/* BASELINE */}

        <div
          className="
            absolute
            left-0
            right-0
            top-[52px]
            h-px
            bg-white/[0.08]
          "
        />

        {/* SOFT CENTERLINE */}

        <div
          className="
            absolute
            left-0
            right-0
            top-[51px]
            h-[3px]
            bg-white/[0.015]
          "
        />

{/* ================================================= */}
{/* INTRADAY GRID */}
{/* ================================================= */}

<div
  className="
    pointer-events-none
    absolute
    inset-0
  "
>
  {Array.from(
    {
      length: 16,
    }
  ).map(
    (
      _,
      index
    ) => (
      <div
        key={
          `grid-${index}`
        }
        className="
          absolute
          top-0
          bottom-0
          w-px
          bg-white/[0.035]
        "
        style={{
          left: `${
            (
              index +
              1
            ) *
            (
              100 /
              17
            )
          }%`,
        }}
      />
    )
  )}
</div>

        {/* MARKERS */}

        {activity.map(
          (
            item
          ) => {

            const pnl =
              Number(
                item.trade.pnl ||
                0
              );

            const left =
              getLeft(
                item.timestamp
              );

            const size =
              8 +
              Math.min(
                6,
                (
                  Math.sqrt(
                    Math.abs(
                      pnl
                    ) /
                    maxAbsolutePnL
                  ) * 6
                )
              );

            const isOpen =
              item.trade.status ===
              "OPEN";

            const isWinner =
              pnl > 0;

            const isLoser =
              pnl < 0;

            const markerClass =
              isOpen
                ? "border-amber-400 bg-amber-400/20"
                : isWinner
                  ? "border-emerald-400 bg-emerald-400/25"
                  : isLoser
                    ? "border-red-400 bg-red-400/25"
                    : "border-slate-500 bg-slate-500/20";

            const markerY =
              isWinner
                ? 28
                : isLoser
                  ? 66
                  : 48;

            return (
              <div
                key={
                  item.trade.id ||
                  item.index
                }
                className="
                  group
                  absolute
                  -translate-x-1/2
                "
                style={{
                  left: `${left}%`,
                  top: `${markerY}px`,
                }}
onMouseEnter={() =>
  handleMarkerEnter(
    item
  )
}
onMouseMove={(
  event
) => {
  handleMouseMove(
    event
  );
}}
onMouseLeave={() => {
  setHoveredTrade(
    null
  );
  setHoverPosition(
    null
  );
}}
              >



                {/* MARKER */}

                <div
                  className={`
                    relative
                    z-10
                    rounded-full
                    border
                    transition-all
                    duration-150
                    group-hover:scale-125
                    ${markerClass}
                  `}
                  style={{
                    width:
                      `${size}px`,
                    height:
                      `${size}px`,
                    marginLeft:
                      `${-size / 2}px`,
                  }}
                />

              </div>
            );
          }
        )}

        {/* ================================================= */}
        {/* MOUSE-FOLLOWING TOOLTIP */}
        {/* ================================================= */}

        {hoveredTrade &&
          hoverPosition && (
<div
  className="
    pointer-events-none
    absolute
    z-30
    flex
    h-[60px]
    w-[100px]
    flex-col
    items-center
    justify-center
    gap-1.5
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#07111d]
    text-center
    shadow-[0_0_30px_rgba(0,0,0,0.35)]
  "
  style={{
    left:
      `${tooltipLeft}px`,
    top:
      `${tooltipTop}px`,
  }}
>

<div
  className="
    text-[12px]
    font-bold
    leading-[12px]
    text-slate-200
  "
>
                {hoveredTrade.ticker}
              </div>

<div
  className="
    text-[11px]
    font-medium
    leading-[11px]
    text-slate-500
  "
>
                {formatTime(
                  hoveredTrade.time
                )}
                {" · "}
                {hoveredTrade.side ||
                  "N/A"}
              </div>

<div
  className={`
    text-[12px]
    font-bold
    leading-[12px]
    ${
      hoveredTrade.pnl > 0
        ? "text-emerald-400"
        : hoveredTrade.pnl < 0
          ? "text-red-400"
          : "text-slate-400"
    }
  `}
>
{hoveredTrade.pnl > 0
  ? "+"
  : hoveredTrade.pnl < 0
    ? "-"
    : ""}
{getCurrencySymbol(
  hoveredTrade.currency
)}
{Math.abs(
  hoveredTrade.pnl
).toFixed(2)}
              </div>

            </div>
          )}

        {/* EMPTY STATE */}

        {activity.length === 0 && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              text-[11px]
              text-slate-600
            "
          >
            No timed trade activity available.
          </div>
        )}

        {/* ================================================= */}
        {/* TIME LABELS */}
        {/* ================================================= */}

<div
  className="
    absolute
    bottom-[-20px]
    left-0
    right-0
    flex
    items-end
    justify-between
  "
>

          {timelineLabels.map(
            (
              label,
              index
            ) => (
              <span
                key={
                  `${label.getTime()}-${index}`
                }
                className="
                  text-[11px]
                  font-medium
                  text-slate-600
                "
              >
                {formatTime(
                  label
                )}
              </span>
            )
          )}

        </div>

      </div>

    </section>
  );
}