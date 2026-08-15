"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  X,
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
};

export default function NoteTradeSelector({
  trades,
  tradeLinks,
  onAddTrade,
  onRemoveTrade,
}: Props) {

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

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
  // ATTACHED TRADES
  // =====================================================

  const attachedTrades =
    useMemo(() => {

      return tradeLinks
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

    }, [
      trades,
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

    /*
     * Keep picker open so multiple
     * trades can be attached.
     */
    setIsOpen(true);
  }

  // =====================================================
  // REMOVE TRADE
  // =====================================================

  function handleRemoveTrade(
    tradeId: string
  ) {

    onRemoveTrade(
      tradeId
    );
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
  // HOLDING TIME
  // =====================================================

  function getHoldingTime(
    trade: Trade
  ) {

    if (
      !trade.openedAt ||
      !trade.closedAt
    ) {

      return "—";
    }

    const opened =
      new Date(
        trade.openedAt
      ).getTime();

    const closed =
      new Date(
        trade.closedAt
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
        minutes /
        1440
      );

    const hours =
      Math.floor(
        (minutes % 1440) /
        60
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

  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      ref={pickerRef}
      className="relative"
    >

      {/* ================================================= */}
      {/* ATTACHED TRADES */}
      {/* ================================================= */}

      {attachedTrades.length > 0 && (

        <div className="space-y-3">

          {attachedTrades.map(
            (trade) => (

              <div
                key={trade.id}
                className="rounded-[20px] border border-white/[0.05] bg-[#0b1730] px-5 py-4"
              >

                {/* TRADE HEADER */}

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Trade Review
                    </p>

                    <div className="mt-2 flex items-center gap-3">

                      <p className="text-sm font-bold text-white">
                        {trade.ticker}
                      </p>

                      <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[10px] font-semibold text-slate-400">
                        {trade.side}
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveTrade(
                        trade.id
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Remove ${trade.ticker} trade`}
                  >

                    <X size={16} />

                  </button>

                </div>

                {/* TRADE DATA */}

                <div className="mt-4 grid grid-cols-3 gap-3">

                  <div className="rounded-xl border border-white/[0.04] bg-[#09111d] px-3 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Date
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {formatDate(
                        trade.date
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/[0.04] bg-[#09111d] px-3 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Entry
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {formatPrice(
                        trade.entryPrice
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/[0.04] bg-[#09111d] px-3 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Exit
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {formatPrice(
                        trade.exitPrice
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/[0.04] bg-[#09111d] px-3 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Entry Time
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {formatTime(
                        trade.openedAt
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/[0.04] bg-[#09111d] px-3 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Exit Time
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {formatTime(
                        trade.closedAt
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/[0.04] bg-[#09111d] px-3 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Holding
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {getHoldingTime(
                        trade
                      )}
                    </p>

                  </div>

                </div>

                {/* P&L */}

                <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">

                  <span className="text-xs text-slate-500">
                    P&L
                  </span>

                  <span
                    className={`text-sm font-semibold ${
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
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      )}

      {/* ================================================= */}
      {/* ADD TRADE BUTTON */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            !isOpen
          )
        }
        className={`flex w-full items-center justify-between rounded-[20px] border border-dashed border-white/[0.08] bg-[#09111d] px-5 py-4 text-left transition-all hover:border-blue-400/20 hover:bg-[#0b1730] ${
          attachedTrades.length > 0
            ? "mt-3"
            : ""
        }`}
      >

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Trade
          </p>

          <p className="mt-1 text-sm font-medium text-slate-400">
            {attachedTrades.length > 0
              ? "Add another trade to this note"
              : "Attach a trade to this note"}
          </p>

        </div>

        <span className="text-lg text-blue-400">
          +
        </span>

      </button>

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

                            {trade.side}

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