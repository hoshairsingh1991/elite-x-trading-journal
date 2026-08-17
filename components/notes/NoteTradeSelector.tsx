"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import { Trade } from "@/types/trade";
import { NoteTradeLink } from "@/types/note";

type Props = {
  trades: Trade[];

  tradeLinks: NoteTradeLink[];

  onAddTrade: (
    tradeId: string
  ) => void;

  onRemoveTrade: (
    tradeId: string
  ) => void;

  isOpen?: boolean;

  onOpenChange?: (
    open: boolean
  ) => void;

  hideTrigger?: boolean;
};

export default function NoteTradeSelector({
  trades,
  tradeLinks,
  onAddTrade,
  onRemoveTrade,
  isOpen: controlledIsOpen,
  onOpenChange,
  hideTrigger = false,
}: Props) {

  const [
    search,
    setSearch,
  ] = useState("");

const [
  internalIsOpen,
  setInternalIsOpen,
] = useState(false);

const isOpen =
  controlledIsOpen ??
  internalIsOpen;

function setIsOpen(
  open: boolean
) {

  if (
    controlledIsOpen === undefined
  ) {

    setInternalIsOpen(
      open
    );
  }

  onOpenChange?.(
    open
  );
}

  const pickerRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // ATTACHED TRADE IDS
  // =====================================================

  const attachedTradeIds =
    useMemo(() => {

      return new Set(
        tradeLinks.map(
          (link) =>
            link.tradeId
        )
      );

    }, [
      tradeLinks,
    ]);



  // =====================================================
  // CLOSE PICKER WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent
    ) {

      const target =
        event.target as Node;

      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          target
        )
      ) {

        setIsOpen(false);

        setSearch("");
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {

      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };

  }, [
    isOpen,
  ]);

  // =====================================================
  // FILTER + SORT TRADES
  // NEWEST → OLDEST
  // =====================================================

  const filteredTrades =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return [...trades]
        .filter(
          (trade) => {

            if (!query) {
              return true;
            }

            return (
              trade.ticker
                ?.toLowerCase()
                .includes(query) ||

              trade.contract
                ?.toLowerCase()
                .includes(query) ||

              trade.account
                ?.toLowerCase()
                .includes(query)
            );
          }
        )
        .sort(
          (a, b) => {

            const dateA =
              new Date(
                a.closedAt ||
                a.openedAt ||
                a.date
              ).getTime();

            const dateB =
              new Date(
                b.closedAt ||
                b.openedAt ||
                b.date
              ).getTime();

            return dateB - dateA;
          }
        );

    }, [
      trades,
      search,
    ]);

  // =====================================================
  // ADD TRADE
  // =====================================================

function handleSelectTrade(
  tradeId: string
) {

  if (
    attachedTradeIds.has(
      tradeId
    )
  ) {

    return;
  }

  onAddTrade(
    tradeId
  );

  setSearch("");

  // Close picker after selecting a trade.
  setIsOpen(false);
}



  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    value: string
  ) {

    const date =
      new Date(value);

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
        year: "numeric",
        month: "short",
        day: "numeric",
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
  // There is no real execution time to display.
  if (!value.includes("T")) {
    return "—";
  }

  const date =
    new Date(value);

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
      hour: "numeric",
      minute: "2-digit",
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

    return value.toFixed(2);
  }

  // =====================================================
  // FORMAT P&L
  // =====================================================

  function formatPnL(
    value: number
  ) {

    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
  }

  // =====================================================
  // DISPLAY SIDE
  // MATCHES TRADE HISTORY
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
  // SUPPORTS NEW + LEGACY TRADES
  //
  // NEW TRADE:
  // openedAt / closedAt contain exact timestamps.
  //
  // LEGACY TRADE:
  // openedAt / closedAt contain date only.
  // We calculate calendar-day holding instead of
  // inventing an execution time.
  // =====================================================

  function getHoldingTime(
    trade: Trade
  ) {

    if (!trade.openedAt) {
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

    if (hasExactTimestamps) {

      const opened =
        new Date(
          trade.openedAt
        ).getTime();

      const closed =
        new Date(
          trade.closedAt!
        ).getTime();

      if (
        Number.isNaN(opened) ||
        Number.isNaN(closed) ||
        closed < opened
      ) {
        return "—";
      }

      const minutes =
        Math.floor(
          (closed - opened) /
          60000
        );

      const days =
        Math.floor(
          minutes / 1440
        );

      const hours =
        Math.floor(
          (minutes % 1440) / 60
        );

      const remainingMinutes =
        minutes % 60;

      if (days > 0) {
        return `${days}d ${hours}h`;
      }

      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }

      return `${remainingMinutes}m`;
    }

    // ===================================================
    // LEGACY TRADE
    // DATE ONLY — NO EXECUTION TIMESTAMP
    // ===================================================

    const openDate =
      trade.openedAt.split("T")[0];

    const closeDate =
      trade.closedAt
        ? trade.closedAt.split("T")[0]
        : null;

    // ---------------------------------------------------
    // LEGACY CLOSED TRADE
    // ---------------------------------------------------

    if (closeDate) {

      const [
        openYear,
        openMonth,
        openDay,
      ] = openDate
        .split("-")
        .map(Number);

      const [
        closeYear,
        closeMonth,
        closeDay,
      ] = closeDate
        .split("-")
        .map(Number);

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
          (1000 * 60 * 60 * 24)
        );

      if (calendarDays < 0) {
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
    ] = openDate
      .split("-")
      .map(Number);

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
        (1000 * 60 * 60 * 24)
      );

    if (calendarDays < 0) {
      return "—";
    }

    return calendarDays === 0
      ? "1d"
      : `${calendarDays}d`;
  }

  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      ref={pickerRef}
      className="relative"
    >


{/* ================================================= */}
{/* ADD TRADE BUTTON */}
{/* ================================================= */}

{!hideTrigger && (

  <button
    type="button"
    onClick={() =>
      setIsOpen(
        !isOpen
      )
    }
    className="flex w-full items-center justify-between rounded-[8px] border border-dashed border-white/[0.08] bg-[#09111d] px-4 py-3 text-left transition-all hover:border-blue-400/20 hover:bg-[#0b1730]"
  >

    <div>

      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Trade
      </p>

      <p className="mt-1 text-sm font-medium text-slate-400">
        Attach a trade to this note
      </p>

    </div>

    <span className="text-lg text-blue-400">
      +
    </span>

  </button>

)}

{/* ================================================= */}
{/* TRADE PICKER */}
{/* ================================================= */}

      {isOpen && (

        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#07101a] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

          {/* SEARCH */}

          <div className="border-b border-white/[0.05] p-3">

            <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.05] bg-[#09111d] px-3">

              <Search
                size={16}
                className="shrink-0 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                autoFocus
                placeholder="Search ticker, contract or account..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />

            </div>

          </div>

          {/* RESULTS */}

          <div className="max-h-[320px] overflow-y-auto p-2">

            {filteredTrades.length > 0 ? (

              filteredTrades.map(
                (trade) => {

                  const isAttached =
                    attachedTradeIds.has(
                      trade.id
                    );

                  return (

                    <button
                      key={trade.id}
                      type="button"
                      disabled={
                        isAttached
                      }
                      onClick={() =>
                        handleSelectTrade(
                          trade.id
                        )
                      }
                      className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
                        isAttached
                          ? "cursor-not-allowed opacity-40"
                          : "hover:bg-[#0b1730]"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-sm font-semibold text-white">
                            {trade.ticker}
                          </p>

<p className="mt-1 text-xs text-slate-500">

  {getDisplaySide(
    trade
  )}

  {" · "}

  {trade.quantity}

  {" · "}

  {formatDate(
    trade.date
  )}

</p>

                        </div>

                        <span
                          className={`text-xs font-semibold ${
                            trade.pnl > 0
                              ? "text-emerald-400"
                              : trade.pnl < 0
                                ? "text-red-400"
                                : "text-slate-500"
                          }`}
                        >

                          {isAttached
                            ? "Added"
                            : formatPnL(
                                trade.pnl
                              )}

                        </span>

                      </div>

                    </button>

                  );
                }
              )

            ) : (

              <div className="px-4 py-8 text-center">

                <p className="text-sm text-slate-500">
                  No matching trades
                </p>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}