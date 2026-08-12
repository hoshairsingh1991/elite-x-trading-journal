"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Trade } from "@/types/trade";

import { supabase }
from "@/lib/supabase";

import EditTradeModal
from "@/components/trades/EditTradeModal";

import {
  formatCurrency,
} from "@/lib/utils/formatCurrency";

interface BrokerConnection {
  broker_account_id: string;
  account_alias: string;
}

interface TradesTableProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  brokerConnections: BrokerConnection[];
}

// =====================================================
// LOCAL DATE PARSER
// FIXES UTC DATE DRIFT
// =====================================================

function parseLocalDate(
  dateString: string
) {

  const cleanDate =
    dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

  const [
    year,
    month,
    day,
  ] = cleanDate
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

export default function TradesTable({
  trades,
  onSelectTrade,
  brokerConnections,
}: TradesTableProps) {

const accountMap = new Map(
  brokerConnections.map((broker) => [
    broker.broker_account_id,
    broker.account_alias,
  ])
);

  const [
  editingTrade,
  setEditingTrade,
] = useState<Trade | null>(
  null
);

// =================================================
// PAGINATION
// =================================================

const TRADES_PER_PAGE = 50;

const [
  currentPage,
  setCurrentPage,
] = useState(1);

  // =================================================
  // SAFETY
  // =================================================

const handleDeleteTrade =
  async (
    trade: Trade
  ) => {

    if (
      !trade.contractKey
    ) {

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this trade lifecycle?"
      );

    if (!confirmed) {

      return;
    }

    const {
      error,
    } = await supabase
      .from("executions")
      .delete()
      .eq(
        "contract_key",
        trade.contractKey
      );

    if (error) {

      console.error(
        "FAILED TO DELETE TRADE:",
        error
      );

      return;
    }

    window.location.reload();
  };

// =================================================
// MODAL SAFETY
// =================================================

const handleSelectTrade =
  (
    trade: Trade
  ) => {

    if (
      !trade.contractKey?.startsWith(
        "MANUAL-"
      )
    ) {

      return;
    }

    onSelectTrade(
      trade
    );
  };

  const safeTrades =
    Array.isArray(trades)
      ? trades
      : [];

  // =================================================
  // SORT TRADES
  // NEWEST → OLDEST
  // =================================================

  const sortedTrades = [
    ...safeTrades,
  ].sort((a, b) => {

    const dateA =
      parseLocalDate(
        a.date
      ).getTime();

    const dateB =
      parseLocalDate(
        b.date
      ).getTime();

    return dateB - dateA;
  });

// =================================================
// PAGINATION CALCULATION
// =================================================

const totalPages = Math.max(
  1,
  Math.ceil(
    sortedTrades.length /
      TRADES_PER_PAGE
  )
);

const paginatedTrades = useMemo(() => {
  const startIndex =
    (currentPage - 1) *
    TRADES_PER_PAGE;

  const endIndex =
    startIndex +
    TRADES_PER_PAGE;

  return sortedTrades.slice(
    startIndex,
    endIndex
  );
}, [
  sortedTrades,
  currentPage,
]);

useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }
}, [
  currentPage,
  totalPages,
]);

  return (

    <>
    

{/* ================================================= */}
{/* TABLE WRAPPER */}
{/* ================================================= */}

<div className="mr-10">

  <div
    className="
      overflow-hidden
      rounded-[8px]
      border
      border-white/[0.06]
      bg-[#0b1220]
    "
  >

<div className="px-4 pb-4 pt-4">

<div
  className="
    grid
    [--trade-row-height:50px]
    [--trade-content-y:0px]
    grid-cols-[0.90fr_0.82fr_0.9fr_0.65fr_0.85fr_0.8fr_0.75fr_0.8fr_0.8fr_60px_1fr_0.9fr_0.95fr]
  "
  style={{
    gridAutoRows:
      "var(--trade-row-height)",
  }}
>

  {[
    "Symbol",
    "Open Date",
    "Close Date",
    "Holding",
    "Account",
    "Type",
    "Side",
    "Entry",
    "Exit",
    "Qty",
    "Net P&L",
    "Commission",
    "Status",
  ].map((header) => (

    <div
      key={header}
      className="
        flex
        h-[36px]
        items-center
        translate-y-[5px]
        justify-center
        border-b
        border-white/[0.05]
        px-3
        text-center
        text-[12px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-slate-500
      "
    >
      {header}
    </div>

  ))}

</div>

{/* ================================================= */}
{/* SCROLLABLE TRADE BODY */}
{/* ================================================= */}

<div
  className="
    h-[calc(100vh-300px)]
    min-h-[500px]
    overflow-y-auto
    scrollbar-thin
    scrollbar-track-transparent
    scrollbar-thumb-white/[0.10]
  "
>
  <div
    className="
      grid
      [--trade-row-height:50px]
      [--trade-content-y:0px]
      grid-cols-[0.90fr_0.82fr_0.9fr_0.65fr_0.85fr_0.8fr_0.75fr_0.8fr_0.8fr_60px_1fr_0.9fr_0.95fr]
    "
    style={{
      gridAutoRows:
        "var(--trade-row-height)",
    }}
  >

    {paginatedTrades.map(
      (
        trade,
        index
      ) => {

        

                  const isWinner =
                    trade.status ===
                    "WIN";

                  const isOpen =
                    trade.status ===
                    "OPEN";



                  const formattedDate =
                    parseLocalDate(
                      trade.date
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    );

                  return (

                    <React.Fragment
                      key={
                        trade.id ||
                        `trade-${index}`
                      }
                    >

{/* SYMBOL */}

<div
  onClick={() =>
    handleSelectTrade(
      trade
    )
  }
  className="
    flex
    h-[var(--trade-row-height)]
    cursor-pointer
    flex-col
    items-center
    justify-center
    border-b
    border-white/[0.04]
    px-5
    transition-all
    hover:bg-white/[0.02]
  "
>
  {/* TICKER */}

  <span
    className="
      text-[14px]
      font-bold
      tracking-wide
      text-slate-200
    "
  >
    {trade.ticker}
  </span>

  {/* EXCHANGE */}

  <span
    className="
      text-[10px]
      font-medium
      uppercase
      tracking-[0.08em]
      text-slate-500
    "
  >
    {trade.executions?.find(
      (execution) =>
        execution.exchange &&
        execution.exchange.trim() !== ""
    )?.exchange || "--"}
  </span>
</div>

{/* OPEN DATE */}

<div
  onClick={() =>
    handleSelectTrade(
      trade
    )
  }
  className="flex h-[var(--trade-row-height)] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[13px] font-medium text-slate-400 transition-all hover:bg-white/[0.02]"
>
  {trade.openedAt
    ? (() => {
        const openedDate =
          new Date(
            trade.openedAt
          );

return (
  <div className="flex flex-col items-center justify-center">
    <span className="text-[13px] font-medium text-slate-300">
      {openedDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )}
    </span>

<span className="mt-[4px] text-[11px] font-medium text-slate-500">
  {trade.openedAt?.includes("T")
    ? openedDate.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "--"}
</span>
  </div>
);
      })()
    : "--"}
</div>


{/* CLOSE DATE */}

<div
  onClick={() =>
    handleSelectTrade(
      trade
    )
  }
  className="flex h-[var(--trade-row-height)] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[13px] font-medium text-slate-400 transition-all hover:bg-white/[0.02]"
>
  {trade.closedAt
    ? (() => {
        const closedDate =
          new Date(
            trade.closedAt
          );

{/* CLOSE DATE */}

return (
  <div className="flex flex-col items-center justify-center">
    <span className="text-[13px] font-medium text-slate-300">
      {closedDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )}
    </span>

<span className="mt-[4px] text-[11px] font-medium text-slate-500">
  {trade.closedAt?.includes("T")
    ? closedDate.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "--"}
</span>
  </div>
);
})()
: "--"}
</div>



{/* HOLDING */}

{trade.openedAt ? (
  (() => {

    // =================================================
    // DETERMINE TIMESTAMP PRECISION
    // =================================================
    
    const hasExactTimestamps =
      trade.openedAt.includes("T") &&
      !!trade.closedAt &&
      trade.closedAt.includes("T");

    let holding = "";

    // =================================================
    // NEW DATA
    // EXACT EXECUTION TIMESTAMPS AVAILABLE
    // =================================================

    if (hasExactTimestamps) {

      const openedTime =
        new Date(
          trade.openedAt
        ).getTime();

      const endTime =
        trade.closedAt
          ? new Date(
              trade.closedAt
            ).getTime()
          : Date.now();

      const totalMinutes =
        Math.max(
          0,
          Math.floor(
            (endTime - openedTime) /
              (1000 * 60)
          )
        );

      const totalHours =
        Math.floor(
          totalMinutes / 60
        );

      const days =
        Math.floor(
          totalHours / 24
        );

      const hours =
        totalHours % 24;

      holding =
        days > 0
          ? `${days}d ${hours}h`
          : totalHours > 0
          ? `${totalHours}h`
          : `${totalMinutes}m`;

    }

    // =================================================
    // LEGACY DATA
    // DATE ONLY — NO EXECUTION TIMESTAMP
    // =================================================

    else {

      const openDate =
        trade.openedAt.split("T")[0];

      const closeDate =
        trade.closedAt
          ? trade.closedAt.split("T")[0]
          : null;

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

        holding =
          calendarDays === 0
            ? "1d"
            : `${calendarDays}d`;

      } else {

        // =================================================
        // LEGACY OPEN TRADE
        // DATE ONLY — CALCULATE THROUGH TODAY
        // =================================================

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

        holding =
          calendarDays === 0
            ? "1d"
            : `${calendarDays}d`;

      }

    }

    return (
      <div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5">

        {trade.status === "OPEN" ? (

          <div className="group relative flex items-center justify-center">

            {/* LIVE DOT */}


  <div className="h-[8px] w-[8px] shrink-0 rounded-full bg-emerald-400" />

  {/* EXPLICIT GAP */}

  <span className="w-[6px]" />

  {/* HOLDING */}

  <span className="text-[13px] font-medium text-cyan-400">
    {holding}
  </span>

  

{/* TOOLTIP */}

<div className="pointer-events-none absolute bottom-[135%] hidden whitespace-nowrap text-[12px] font-semibold tracking-[0.03em] text-slate-400 group-hover:block">
  Position still open for{" "}
  {holding}
</div>

</div>

        ) : (

          <span className="ml-[6px] text-[13px] font-medium text-cyan-400">
  {holding}
</span>

        )}

      </div>
    );
  })()
) : (
  <div className="flex h-[40px] items-center justify-center border-b border-white/[0.04] px-5">
    <span className="text-[13px] font-medium text-slate-500">
      --
    </span>
  </div>
)}

{/* ACCOUNT */}

<div
  onClick={() =>
    handleSelectTrade(
      trade
    )
  }
  className="
    flex
    h-[var(--trade-row-height)]
    cursor-pointer
    flex-col
    items-center
    justify-center
    border-b
    border-white/[0.04]
    px-5
    text-center
    transition-all
    hover:bg-white/[0.02]
  "
>
  <span className="text-[13px] font-medium text-slate-300">
    {accountMap.get(
      trade.account || ""
    ) || "Account"}
  </span>

  <span className="mt-[4px] text-[11px] font-medium tracking-wide text-slate-500">
    ••{trade.account?.slice(-4) || "----"}
  </span>
</div>


{/* TYPE */}

<div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5">
  <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-sky-400">
    {trade.assetType || "TRADE"}
  </span>
</div>

{/* SIDE */}

<div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5">

  <span
className={`text-[12px] font-bold uppercase tracking-[0.10em] ${
  trade.assetType === "Options"
    ? trade.contractKey?.endsWith("_C")
      ? "text-cyan-400"
      : trade.contractKey?.endsWith("_P")
      ? "text-amber-400"
      : "text-slate-400"
    : trade.side === "LONG"
    ? "text-emerald-400"
    : "text-red-400"
}`}
  >
    {trade.assetType === "Options"
      ? trade.contractKey?.endsWith("_C")
        ? "CALL"
        : trade.contractKey?.endsWith("_P")
        ? "PUT"
        : "OPTION"
      : trade.side}
  </span>

</div>

{/* ENTRY */}

<div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[14px] font-medium text-slate-400">
  {trade.entryPrice > 0
    ? formatCurrency(
        Number(trade.entryPrice),
        trade.currency
      )
    : "--"}
</div>

{/* EXIT */}

<div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[14px] font-medium text-slate-400">

  {trade.exitPrice != null ? (

    trade.exitPrice === 0 &&
    trade.status === "LOSS"

      ? (
          <span className="text-[12px] font-bold tracking-[0.02em] text-red-400">
            Expired Worthless
          </span>
        )

      : (
          formatCurrency(
            Number(trade.exitPrice),
            trade.currency
          )
        )

  ) : "--"}

</div>

{/* QTY */}

                      <div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-1 text-center text-[14px] font-medium text-slate-400">

                        {trade.quantity}
                      </div>

{/* PNL */}

<div
  className={`flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[14px] font-semibold tracking-tight ${
    isWinner
      ? "text-emerald-300"
      : isOpen
      ? "text-slate-300"
      : "text-red-300"
  }`}
>
  {trade.pnl >= 0 ? "+" : "-"}

  {formatCurrency(
    Math.abs(
      Number(
        trade.pnl
      )
    ),
    trade.currency
  )}
</div>

{/* COMMISSION */}

<div className="flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[14px] font-medium text-slate-500">

  {formatCurrency(
    Number(trade.fees),
    trade.feeCurrency ||
      trade.currency
  )}

</div>

{/* STATUS */}

<div className="relative left-[-10px] flex h-[var(--trade-row-height)] items-center justify-center border-b border-white/[0.04] px-5">

  <span
    className={`text-[12px] font-bold uppercase tracking-[0.12em] ${
      isOpen
        ? "text-amber-400"
        : "text-slate-400"
    }`}
  >
    {isOpen
      ? "OPEN"
      : "CLOSED"}
  </span>

  {/* EDIT BUTTON */}

{trade.contractKey?.startsWith(
  "MANUAL-"
) && (

  <button
    onClick={(
      event
    ) => {

      event.stopPropagation();

      setEditingTrade(
        trade
      );
    }}
    className="absolute right-0 flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-blue-500/20 bg-blue-500/10 text-[13px] text-blue-400 transition-all hover:bg-blue-500/20"
  >
    ✎
  </button>

)}

                      </div>

                                    </React.Fragment>
              );
            }
          )}
        </div>
 </div>
        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        <div className="flex h-[56px] items-center justify-between border-t border-white/[0.05] px-5">

          {/* RESULT COUNT */}

          <div className="translate-x-[20px] text-[12px] font-medium tracking-[0.02em] text-slate-500">
            {sortedTrades.length === 0 ? (
              "No trades"
            ) : (
              <>
                Showing{" "}
                <span className="text-slate-400">
                  {(currentPage - 1) *
                    TRADES_PER_PAGE +
                    1}
                </span>
                {"–"}
                <span className="text-slate-400">
                  {Math.min(
                    currentPage *
                      TRADES_PER_PAGE,
                    sortedTrades.length
                  )}
                </span>
                {" of "}
                <span className="text-slate-400">
                  {sortedTrades.length}
                </span>
              </>
            )}
          </div>

          {/* PAGE CONTROLS */}

          {totalPages > 1 && (
            <div className="flex items-center gap-1">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="
                  flex
                  h-[30px]
                  w-[30px]
                  items-center
                  justify-center
                  rounded-[8px]
                  text-[14px]
                  text-slate-500
                  transition-all
                  hover:bg-white/[0.04]
                  hover:text-slate-300
                  disabled:pointer-events-none
                  disabled:opacity-30
                "
              >
                ‹
              </button>

              {/* PAGE NUMBERS */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`
                    flex
                    h-[30px]
                    min-w-[30px]
                    items-center
                    justify-center
                    rounded-[8px]
                    px-2
                    text-[12px]
                    font-semibold
                    transition-all
                    ${
                      currentPage === page
                        ? "bg-white/[0.08] text-slate-200"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                    }
                  `}
                >
                  {page}
                </button>
              ))}

              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                  )
                }
                disabled={
                  currentPage === totalPages
                }
                className="
                  flex
                  h-[30px]
                  w-[30px]
                  items-center
                  justify-center
                  rounded-[8px]
                  text-[14px]
                  text-slate-500
                  transition-all
                  hover:bg-white/[0.04]
                  hover:text-slate-300
                  disabled:pointer-events-none
                  disabled:opacity-30
                "
              >
                ›
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
        </div>

  <EditTradeModal
          
        
            
        open={
          !!editingTrade
        }
        trade={
          editingTrade
        }
        onClose={() =>
          setEditingTrade(
            null
          )
        }
      />

    </>
  );
}