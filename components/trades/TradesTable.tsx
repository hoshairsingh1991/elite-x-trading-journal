"use client";

import React from "react";

import { Trade } from "@/types/trade";

interface TradesTableProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

export default function TradesTable({
  trades,
  onSelectTrade,
}: TradesTableProps) {

  return (
    <div className="mr-10 rounded-[34px] bg-[#071427] p-7 shadow-[0_0_60px_rgba(0,0,0,0.28)]">

      <div className="overflow-hidden rounded-[28px] border border-white/[0.05] bg-[#0b1220]">

        <div className="flex items-center justify-between border-b border-white/[0.05] px-8 py-7">

          <div className="relative left-4">

            <h2 className="text-[34px] font-black tracking-tight text-white">
              Trade History
            </h2>

            <p className="mt-2 text-[15px] text-slate-500">
              Institutional execution journal
            </p>
          </div>

          <div className="rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-3">

            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
              {trades.length} Trades
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">

          <div className="grid auto-rows-[50px] grid-cols-[1.1fr_1.5fr_0.9fr_1fr_0.9fr_0.6fr_1fr_1fr_0.9fr_0.9fr]">

            {[
              "Date",
              "Account",
              "Symbol",
              "Type",
              "Side",
              "Qty",
              "Net P&L",
              "Commission",
              "Result",
              "Status",
            ].map((header) => (

              <div
                key={header}
                className="flex h-[50px] items-center justify-center border-b border-white/[0.05] px-5 text-center text-[22px] font-black tracking-tight text-slate-300"
              >
                {header}
              </div>
            ))}

            {trades.map((trade, index) => {

              const isWinner =
                trade.status === "WIN";

              const isOpen =
                trade.status === "OPEN";

              return (

                <React.Fragment key={trade.id || index}>

                  <div
                    onClick={() =>
                      onSelectTrade(trade)
                    }
                    className="flex h-[50px] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[18px] font-medium text-slate-300 transition-all hover:bg-white/[0.02]"
                  >
                    {trade.date}
                  </div>

                  <div
                    onClick={() =>
                      onSelectTrade(trade)
                    }
                    className="flex h-[50px] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-medium text-slate-200 transition-all hover:bg-white/[0.02]"
                  >
                    {trade.account || "N/A"}
                  </div>

                  <div
                    onClick={() =>
                      onSelectTrade(trade)
                    }
                    className="flex h-[50px] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-medium tracking-wide text-white transition-all hover:bg-white/[0.02]"
                  >
                    {trade.ticker}
                  </div>

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div className="inline-flex items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-[8px]">

                      <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-blue-400">
                        {trade.assetType || "TRADE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div
                      className={`inline-flex items-center justify-center rounded-full px-4 py-[8px] ${
                        trade.side === "LONG"
                          ? "border border-emerald-500/20 bg-emerald-500/10"
                          : "border border-red-500/20 bg-red-500/10"
                      }`}
                    >

                      <span
                        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
                          trade.side === "LONG"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.side}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-medium text-slate-300">

                    {trade.quantity}
                  </div>

                  <div
                    className={`flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[18px] font-black tracking-tight ${
                      isWinner
                        ? "text-emerald-400"
                        : isOpen
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : "-"}$
                    {Math.abs(
                      Number(trade.pnl)
                    ).toLocaleString()}
                  </div>

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-semibold text-orange-400">

                    $
                    {Number(
                      trade.fees
                    ).toFixed(2)}
                  </div>

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div
                      className={`inline-flex items-center justify-center rounded-full px-4 py-[8px] ${
                        isWinner
                          ? "border border-emerald-500/20 bg-emerald-500/10"
                          : isOpen
                          ? "border border-yellow-500/20 bg-yellow-500/10"
                          : "border border-red-500/20 bg-red-500/10"
                      }`}
                    >

                      <span
                        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
                          isWinner
                            ? "text-emerald-400"
                            : isOpen
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div
                      className={`inline-flex items-center justify-center rounded-full px-4 py-[8px] ${
                        isOpen
                          ? "border border-yellow-500/20 bg-yellow-500/10"
                          : "border border-slate-500/20 bg-slate-500/10"
                      }`}
                    >

                      <span
                        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
                          isOpen
                            ? "text-yellow-400"
                            : "text-slate-300"
                        }`}
                      >
                        {isOpen
                          ? "OPEN"
                          : "CLOSED"}
                      </span>
                    </div>
                  </div>

                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}