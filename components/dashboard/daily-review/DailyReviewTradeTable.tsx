"use client";

import {
  Fragment,
} from "react";

import {
  Pencil,
} from "lucide-react";

import { Trade } from "@/types/trade";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

interface DailyReviewTradeTableProps {
  selectedTrades: Trade[];
  allTrades: Trade[];
  reportingCurrency: string;
  onEditTrade: (trade: Trade) => void;
}

export default function DailyReviewTradeTable({
  selectedTrades,
  allTrades,
  reportingCurrency,
  onEditTrade,
}: DailyReviewTradeTableProps) {
  const totalTradesDay =
    selectedTrades.length;

  return (
    <div
      className="
        mt-6
        rounded-[8px]
        border
        border-white/[0.05]
        bg-white/[0.02]
        p-7
      "
    >
      {/* TABLE HEADER */}

      <div className="flex items-center justify-between">

        <p
          className="
            text-[11px]
            font-black
            tracking-[0.18em]
            text-slate-500
          "
        >
          TRADES
        </p>

        <p
          className="
            text-sm
            text-slate-500
          "
        >
          {totalTradesDay} Trades
        </p>

      </div>

      {/* TABLE SCROLL AREA */}

      <div
        className="
          mt-7
          max-h-[420px]
          overflow-y-auto
          overflow-x-hidden
          pr-[6px]
        "
      >

        <table
          className="
            w-full
            table-fixed
            border-collapse
          "
        >

          <thead>

            <tr
              className="
                border-b
                border-white/[0.05]
              "
            >

              {[
                "Ticker",
                "Account",
                "Side",
                "Entry",
                "Exit",
                "Net P&L",
                "Commission",
                "Status",
                "",
              ].map(
                (header) => (

                  <th
                    key={header}
                    className="
                      pb-5
                      text-left
                      text-[11px]
                      font-black
                      tracking-[0.18em]
                      text-slate-500
                    "
                  >
                    {header}
                  </th>

                )
              )}

            </tr>

          </thead>

          <tbody>

            {/* TOP SPACER */}

            <tr
              className="
                opacity-0
                pointer-events-none
                select-none
              "
            >
              <td
                colSpan={9}
                className="
                  h-[10px]
                  p-0
                "
              >
                spacer
              </td>
            </tr>

            {selectedTrades.map(
              (
                trade,
                index
              ) => (

                <Fragment
                  key={
                    trade.id ||
                    index
                  }
                >

                  <tr
                    className="
                      border-b
                      border-white/[0.08]
                    "
                  >

                    {/* TICKER */}

                    <td
                      className="
                        h-[12px]
                        text-center
                      "
                    >

                      <div
                        className="
                          flex
                          h-full
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-slate-400
                        "
                      >

                        {trade.ticker}

                        {/* OPEN */}

                        {trade.status === "OPEN" && (

                          <div
                            className="
                              group
                              relative
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <div
                              className="
                                h-[10px]
                                w-[10px]
                                rounded-full
                                bg-emerald-400
                              "
                            />

                            <div
                              className="
                                pointer-events-none
                                absolute
                                bottom-[140%]
                                left-1/2
                                hidden
                                -translate-x-1/2
                                whitespace-nowrap
                                rounded-xl
                                border
                                border-white/[0.06]
                                bg-[#07111d]
                                px-4
                                py-2
                                text-[12px]
                                font-semibold
                                tracking-[0.03em]
                                text-slate-300
                                shadow-[0_0_30px_rgba(0,0,0,0.35)]
                                group-hover:block
                              "
                            >
                              Position still open
                            </div>

                          </div>

                        )}

                        {/* MULTI-DAY */}

                        {trade.status !== "OPEN" &&
                          trade.holdingDays != null && (

                            <div
                              className="
                                group
                                relative
                                flex
                                items-center
                                justify-center
                              "
                            >

                              <div
                                className={`h-[10px] w-[10px] rounded-full ${
                                  trade.holdingDays === 0
                                    ? "bg-slate-500"
                                    : "bg-cyan-400"
                                }`}
                              />

                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  bottom-[140%]
                                  left-1/2
                                  hidden
                                  -translate-x-1/2
                                  whitespace-nowrap
                                  rounded-xl
                                  border
                                  border-white/[0.06]
                                  bg-[#07111d]
                                  px-4
                                  py-2
                                  text-[12px]
                                  font-semibold
                                  tracking-[0.03em]
                                  text-slate-300
                                  shadow-[0_0_30px_rgba(0,0,0,0.35)]
                                  group-hover:block
                                "
                              >
                                Held for{" "}
                                {trade.holdingDays}{" "}
                                {trade.holdingDays === 1
                                  ? "Day"
                                  : "Days"}
                              </div>

                            </div>

                          )}

                      </div>

                    </td>

                    {/* ACCOUNT */}

                    <td
                      className="
                        py-6
                        text-sm
                        font-medium
                        text-slate-300
                      "
                    >
                      {trade.account || "--"}
                    </td>

                    {/* SIDE */}

                    <td
                      className={`h-[10px] align-middle text-sm font-bold ${
                        trade.side === "LONG"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {trade.side}
                    </td>

                    {/* ENTRY */}

                    <td
                      className="
                        py-6
                        text-sm
                        text-slate-400
                      "
                    >
                      {trade.entryPrice > 0
                        ? `$${trade.entryPrice}`
                        : "--"}
                    </td>

                    {/* EXIT */}

                    <td
                      className="
                        py-6
                        text-sm
                        text-slate-400
                      "
                    >
                      {trade.exitPrice != null ? (

                        trade.exitPrice === 0 &&
                        trade.status === "LOSS"
                          ? (
                            <span
                              className="
                                text-[12px]
                                font-bold
                                tracking-[0.04em]
                                text-red-400
                              "
                            >
                              Expired Worthless
                            </span>
                          )
                          : (
                            `$${trade.exitPrice}`
                          )

                      ) : "--"}
                    </td>

                    {/* NET P&L */}

                    <td
                      className={`py-6 text-sm font-bold ${
                        Number(
                          trade.pnl
                        ) >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {Number(
                        trade.pnl
                      ) >= 0
                        ? "+"
                        : ""}
                      {getCurrencySymbol(
                        reportingCurrency
                      )}
                      {Number(
                        trade.pnl
                      ).toFixed(2)}
                    </td>

                    {/* COMMISSION */}

                    <td
                      className="
                        py-6
                        text-sm
                        text-slate-400
                      "
                    >
                      {trade.fees > 0
                        ? `${getCurrencySymbol(
                            reportingCurrency
                          )}${trade.fees.toFixed(2)}`
                        : "--"}
                    </td>

                    {/* STATUS */}

                    <td
                      className="
                        py-6
                        text-center
                      "
                    >

                      <span
                        className={`text-[11px] font-bold tracking-[0.04em] ${
                          trade.status === "OPEN"
                            ? "text-yellow-400"
                            : trade.status === "WIN"
                            ? "text-emerald-400"
                            : trade.status === "LOSS"
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {trade.status}
                      </span>

                    </td>

                    {/* EDIT */}

                    <td
                      className="
                        py-6
                      "
                    >

                      {trade.contractKey?.startsWith(
                        "MANUAL-"
                      ) &&
                        !(
                          trade.status === "OPEN" &&
                          allTrades.some(
                            (
                              otherTrade
                            ) =>
                              otherTrade.id !==
                                trade.id &&
                              otherTrade.contractKey ===
                                trade.contractKey &&
                              otherTrade.status !==
                                "OPEN"
                          )
                        ) && (

                          <button
                            type="button"
                            onClick={() =>
                              onEditTrade(
                                trade
                              )
                            }
                            className="
                              flex
                              h-[34px]
                              w-[34px]
                              items-center
                              justify-center
                              text-[15px]
                              text-red-400
                              transition-all
                              duration-150
                              hover:scale-110
                              hover:text-red-300
                              hover:drop-shadow-[0_0_6px_rgba(248,113,113,0.55)]
                            "
                          >
                            <Pencil size={14} />
                          </button>

                        )}

                    </td>

                  </tr>

                  {/* ROW SPACER */}

                  <tr
                    className="
                      opacity-0
                      pointer-events-none
                      select-none
                    "
                  >
                    <td
                      colSpan={9}
                      className="
                        h-[18px]
                        p-0
                      "
                    >
                      spacer
                    </td>
                  </tr>

                </Fragment>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}