"use client";

import {
  X,
} from "lucide-react";

import {
  Trade,
} from "@/types/trade";

import {
  NoteTradeLink,
} from "@/types/note";


type Props = {
  trades: Trade[];

  tradeLinks: NoteTradeLink[];

  onRemoveTrade: (
    tradeId: string
  ) => void;
};


export default function NoteLinkedTrades({
  trades,
  tradeLinks,
  onRemoveTrade,
}: Props) {

  // =====================================================
  // ATTACHED TRADES
  // =====================================================

  const attachedTrades =
    tradeLinks
      .map(
        (link) =>
          trades.find(
            (trade) =>
              trade.id ===
              link.tradeId
          )
      )
      .filter(
        (
          trade
        ): trade is Trade =>
          Boolean(trade)
      );


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    value: string
  ) {

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;
    }

    return date.toLocaleDateString(
      undefined,
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",
      }
    );
  }


  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatTime(
    value?: string | null
  ) {

    if (!value) {
      return "—";
    }

    // Legacy trades contain only YYYY-MM-DD.
    if (!value.includes("T")) {
      return "—";
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

      return "—";
    }

    return date.toLocaleTimeString(
      undefined,
      {
        hour:
          "numeric",

        minute:
          "2-digit",
      }
    );
  }


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatPrice(
    value?: number | null
  ) {

    if (
      value === null ||
      value === undefined
    ) {

      return "—";
    }

    return value.toFixed(
      2
    );
  }


  // =====================================================
  // FORMAT P&L
  // =====================================================

  function formatPnL(
    value: number
  ) {

    return `${
      value >= 0
        ? "+"
        : ""
    }${value.toFixed(2)}`;
  }

  // =====================================================
// DISPLAY SIDE
// MATCHES TRADE PICKER
// =====================================================

function getDisplaySide(
  trade: Trade
) {

  if (
    trade.assetType === "Options"
  ) {

    if (
      trade.contractKey?.endsWith(
        "_C"
      )
    ) {

      return "CALL";
    }

    if (
      trade.contractKey?.endsWith(
        "_P"
      )
    ) {

      return "PUT";
    }

    return "OPTION";
  }

  return trade.side;
}

  // =====================================================
  // HOLDING TIME
  // =====================================================

  function getHoldingTime(
    trade: Trade
  ) {

    if (
      !trade.openedAt
    ) {

      return "—";
    }

    const hasExactTimestamps =
      trade.openedAt.includes("T") &&
      !!trade.closedAt &&
      trade.closedAt.includes("T");


    // ===================================================
    // NEW TRADE
    // EXACT EXECUTION TIMESTAMPS
    // ===================================================

    if (
      hasExactTimestamps
    ) {

      const opened =
        new Date(
          trade.openedAt
        ).getTime();

      const closed =
        new Date(
          trade.closedAt!
        ).getTime();

      if (
        Number.isNaN(
          opened
        ) ||
        Number.isNaN(
          closed
        ) ||
        closed < opened
      ) {

        return "—";
      }

      const minutes =
        Math.floor(
          (
            closed -
            opened
          ) /
          60000
        );

      const days =
        Math.floor(
          minutes /
          1440
        );

      const hours =
        Math.floor(
          (
            minutes %
            1440
          ) /
          60
        );

      const remainingMinutes =
        minutes %
        60;

      if (
        days > 0
      ) {

        return `${days}d ${hours}h`;
      }

      if (
        hours > 0
      ) {

        return `${hours}h ${remainingMinutes}m`;
      }

      return `${remainingMinutes}m`;
    }


    // ===================================================
    // LEGACY TRADE
    // DATE ONLY
    // ===================================================

    const openDate =
      trade.openedAt
        .split("T")[0];

    const closeDate =
      trade.closedAt
        ? trade.closedAt.split(
            "T"
          )[0]
        : null;


    // ---------------------------------------------------
    // LEGACY CLOSED TRADE
    // ---------------------------------------------------

    if (
      closeDate
    ) {

      const [
        openYear,
        openMonth,
        openDay,
      ] =
        openDate
          .split("-")
          .map(
            Number
          );

      const [
        closeYear,
        closeMonth,
        closeDay,
      ] =
        closeDate
          .split("-")
          .map(
            Number
          );

      const openCalendarDate =
        new Date(
          openYear,
          openMonth - 1,
          openDay
        );

      const closeCalendarDate =
        new Date(
          closeYear,
          closeMonth - 1,
          closeDay
        );

      const calendarDays =
        Math.floor(
          (
            closeCalendarDate.getTime() -
            openCalendarDate.getTime()
          ) /
          (
            1000 *
            60 *
            60 *
            24
          )
        );

      if (
        calendarDays < 0
      ) {

        return "—";
      }

      return calendarDays === 0
        ? "1d"
        : `${calendarDays}d`;
    }


    // ---------------------------------------------------
    // LEGACY OPEN TRADE
    // DATE ONLY — CALCULATE THROUGH TODAY
    // ---------------------------------------------------

    const [
      openYear,
      openMonth,
      openDay,
    ] =
      openDate
        .split("-")
        .map(
          Number
        );

    const openCalendarDate =
      new Date(
        openYear,
        openMonth - 1,
        openDay
      );

    const today =
      new Date();

    const todayCalendarDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

    const calendarDays =
      Math.floor(
        (
          todayCalendarDate.getTime() -
          openCalendarDate.getTime()
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      );

    if (
      calendarDays < 0
    ) {

      return "—";
    }

    return calendarDays === 0
      ? "1d"
      : `${calendarDays}d`;
  }


  // =====================================================
  // EMPTY
  // =====================================================

  if (
    attachedTrades.length === 0
  ) {

    return null;
  }

  // =====================================================
  // UI
  // =====================================================

return (

  <div className="relative left-[20px] translate-y-[20px] flex flex-col gap-3">

    {attachedTrades.map(
        (trade) => (

<div
  key={
    trade.id
  }
  className="relative h-[130px] w-[clamp(280px,32vw,360px)] rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-3"
>

{/* ========================================= */}
{/* HEADER */}
{/* ========================================= */}

<div className="relative border-b border-white/[0.06] pb-2">

<p className="relative left-[8px] text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
  Trade Snapshot
</p>

  <button
    type="button"
    onClick={() =>
      onRemoveTrade(
        trade.id
      )
    }
    className="absolute right-[2px] top-[-4px] flex h-6 w-6 items-center justify-center rounded-[6px] text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
    aria-label={`Remove ${trade.ticker} trade`}
  >

    <X
      size={14}
      strokeWidth={1.8}
    />

  </button>

</div>


            {/* ========================================= */}
            {/* TRADE IDENTITY */}
            {/* ========================================= */}

            <div className="relative translate-x-[10px] translate-y-[8px]">

           <div className="flex items-center gap-2 pt-3">

              <p className="text-[13px] font-semibold text-white">
                {trade.ticker}
              </p>
<span
  className={`flex h-[18px] w-[36px] items-center justify-center rounded-[4px] text-[10px] font-medium ${
    ["LONG", "CALL"].includes(
      getDisplaySide(
        trade
      )
    )
      ? "bg-emerald-500/10 text-emerald-400"
      : ["SHORT", "PUT"].includes(
          getDisplaySide(
            trade
          )
        )
        ? "bg-red-500/10 text-red-400"
        : "bg-[#0b0c1e] text-slate-500"
  }`}
>
  {getDisplaySide(
    trade
  )}
</span>

            </div>


            {/* ========================================= */}
            {/* TRADE DATA */}
            {/* ========================================= */}

            <div className="relative top-[6px] grid grid-cols-4 gap-x-4 gap-y-2">

              {/* ENTRY DATE */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Entry Date
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {formatDate(
                    trade.openedAt ||
                    trade.date
                  )}
                </p>

              </div>


              {/* ENTRY */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Entry
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {formatPrice(
                    trade.entryPrice
                  )}
                </p>

              </div>


              {/* EXIT DATE */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Exit Date
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {formatDate(
                    trade.closedAt ||
                    ""
                  )}
                </p>

              </div>


              {/* EXIT */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Exit
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {formatPrice(
                    trade.exitPrice
                  )}
                </p>

              </div>


              {/* ENTRY TIME */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Entry Time
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {formatTime(
                    trade.openedAt
                  )}
                </p>

              </div>


              {/* EXIT TIME */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Exit Time
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {formatTime(
                    trade.closedAt
                  )}
                </p>

              </div>


              {/* HOLDING */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Holding
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-300">
                  {getHoldingTime(
                    trade
                  )}
                </p>

              </div>


              {/* P&L */}

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  P&L
                </p>

                <p
                  className={`mt-1 text-[12px] font-semibold ${
                    trade.pnl > 0
                      ? "text-emerald-400"
                      : trade.pnl < 0
                        ? "text-red-400"
                        : "text-slate-400"
                  }`}
                >
                  {formatPnL(
                    trade.pnl
                  )}
                </p>

              </div>

            </div>
</div>
          </div>

        )
      )}

    </div>
  );
  
}