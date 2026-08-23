"use client";

import {
  Trash2,
} from "lucide-react";

import {
  Trade,
} from "@/types/trade";

import {
  NoteTradeLink,
} from "@/types/note";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  trades: Trade[];

  tradeLinks: NoteTradeLink[];

  onRemoveTrade: (
    tradeId: string
  ) => void;

  onTradeLinkPositionChange: (
    link: NoteTradeLink,
    positionX: number,
    positionY: number
  ) => void;
};


export default function NoteLinkedTrades({
  trades,
  tradeLinks,
  onRemoveTrade,
  onTradeLinkPositionChange,
}: Props) {

  // =====================================================
  // DRAG STATE
  // =====================================================

const dragStateRef =
  useRef<{
    tradeLinkId: string;
    offsetX: number;
    offsetY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const canvasRef =
    useRef<HTMLDivElement | null>(null);

      // =====================================================
  // LOCAL TRADE LINK POSITIONS
  // =====================================================

  const [
    localTradeLinks,
    setLocalTradeLinks,
  ] = useState<NoteTradeLink[]>(
    tradeLinks
  );

  // =====================================================
  // SYNC PARENT TRADE LINKS
  // =====================================================

  useEffect(() => {

    setLocalTradeLinks(
      tradeLinks
    );

  }, [
    tradeLinks,
  ]);

  // =====================================================
  // START TRADE CARD DRAG
  // =====================================================

  function handleTradePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    link: NoteTradeLink
  ) {

    if (
      event.button !== 0
    ) {

      return;
    }

    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {

      return;
    }

    const canvasRect =
      canvas.getBoundingClientRect();

    const pointerX =
      event.clientX -
      canvasRect.left;

    const pointerY =
      event.clientY -
      canvasRect.top;

    dragStateRef.current = {

      tradeLinkId:
        link.id,

      offsetX:
        pointerX -
        link.positionX,

      offsetY:
        pointerY -
        link.positionY,

      currentX:
        link.positionX,

      currentY:
        link.positionY,

    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    event.preventDefault();
    event.stopPropagation();
  }


  // =====================================================
  // DRAG TRADE CARD
  // =====================================================

  function handleTradePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {

    const dragState =
      dragStateRef.current;

    if (
      !dragState
    ) {

      return;
    }

    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {

      return;
    }

    const canvasRect =
      canvas.getBoundingClientRect();

    const pointerX =
      event.clientX -
      canvasRect.left;

    const pointerY =
      event.clientY -
      canvasRect.top;

    const positionX =
      Math.max(
        0,
        pointerX -
          dragState.offsetX
      );

    const positionY =
      Math.max(
        0,
        pointerY -
          dragState.offsetY
      );

    // ===================================================
    // UPDATE DRAG STATE
    // ===================================================

    dragState.currentX =
      positionX;

    dragState.currentY =
      positionY;

    // ===================================================
    // LOCAL UI UPDATE ONLY
    // ===================================================

    setLocalTradeLinks(
      (currentLinks) =>
        currentLinks.map(
          (item) =>
            item.id ===
            dragState.tradeLinkId
              ? {
                  ...item,

                  positionX:
                    positionX,

                  positionY:
                    positionY,
                }
              : item
        )
    );

  }


  // =====================================================
  // END TRADE CARD DRAG
  // =====================================================

  async function handleTradePointerUp(
    event: React.PointerEvent<HTMLDivElement>
  ) {

    const dragState =
      dragStateRef.current;

    if (
      !dragState
    ) {

      return;
    }

    dragStateRef.current =
      null;

    const link =
      localTradeLinks.find(
        (item) =>
          item.id ===
          dragState.tradeLinkId
      );

    if (
      link
    ) {

      await onTradeLinkPositionChange(
        link,
        dragState.currentX,
        dragState.currentY
      );

    }

    try {

      event.currentTarget.releasePointerCapture(
        event.pointerId
      );

    } catch {

      // Pointer capture may already
      // have been released.

    }

  }



  // =====================================================
  // ATTACHED TRADES
  // =====================================================

const attachedTrades =
  localTradeLinks
    .map(
      (link) => {

        const trade =
          trades.find(
            (item) =>
              item.id ===
              link.tradeId
          );

        if (
          !trade
        ) {

          return null;
        }

        return {
          link,
          trade,
        };

      }
    )
    .filter(
      (
        item
      ): item is {
        link: NoteTradeLink;
        trade: Trade;
      } =>
        Boolean(item)
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

  <div
  ref={
    canvasRef
  }
  className="pointer-events-none absolute inset-0"
  onPointerMove={
    handleTradePointerMove
  }
  onPointerUp={
    handleTradePointerUp
  }
  onPointerCancel={
    handleTradePointerUp
  }
>

{attachedTrades.map(
  ({
    link,
    trade,
  }) => (

<div
  key={
    trade.id
  }
  className="pointer-events-auto group absolute cursor-grab rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-3 active:cursor-grabbing"
  style={{
    left:
      link.positionX,

    top:
      link.positionY,

    width:
      link.width,

    height:
      link.height,

    zIndex:
      1000 +
      link.zIndex,

    touchAction:
      "none",
  }}
  onPointerDown={(
    event
  ) =>
    handleTradePointerDown(
      event,
      link
    )
  }
>

{/* ========================================= */}
{/* HEADER */}
{/* ========================================= */}

<div className="relative border-b border-white/[0.06] pb-2">

  <p className="relative left-[8px] text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
    Trade Snapshot
  </p>

  {/* ========================================= */}
  {/* DELETE ACTION */}
  {/* ========================================= */}

  <button
    type="button"
    title="Remove trade"
    aria-label={`Remove ${trade.ticker} trade`}
    onPointerDown={(
      event
    ) => {

      event.preventDefault();
      event.stopPropagation();

    }}
    onClick={(
      event
    ) => {

      event.preventDefault();
      event.stopPropagation();

      onRemoveTrade(
        trade.id
      );

    }}
    className="
      absolute
      right-[2px]
      top-[-4px]
      z-20
      flex
      h-6
      w-6
      items-center
      justify-center
      rounded-[6px]
      text-slate-500
      opacity-0
      transition-all
      group-hover:opacity-100
      hover:bg-red-500/10
      hover:text-red-400
    "
  >

<Trash2
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

<p className="mt-1 whitespace-nowrap text-[12px] font-medium text-slate-300">
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

<p className="mt-1 whitespace-nowrap text-[12px] font-medium text-slate-300">
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