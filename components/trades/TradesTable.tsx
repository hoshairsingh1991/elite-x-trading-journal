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

      {/* ================================================= */}
      {/* INNER CONTAINER */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-[28px] border border-white/[0.05] bg-[#0b1220]">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="px-6 pb-6 pt-5">

          {/* ================================================= */}
          {/* MASTER GRID */}
          {/* ================================================= */}

          <div className="grid auto-rows-[50px] grid-cols-[1.1fr_1.5fr_0.9fr_1fr_0.9fr_0.6fr_1fr_1fr_0.9fr_0.9fr]">

            {/* ================================================= */}
            {/* TABLE HEADER */}
            {/* ================================================= */}

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

            {/* ================================================= */}
            {/* ROWS */}
            {/* ================================================= */}

            {trades.map((trade, index) => {

              const isWinner =
                trade.result === "Win";

              return (

                <React.Fragment key={index}>

                  {/* DATE */}

                  <div
                    onClick={() =>
                      onSelectTrade(trade)
                    }
                    className="flex h-[50px] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[18px] font-medium text-slate-300 transition-all hover:bg-white/[0.02]"
                  >
                    {trade.date}
                  </div>

                  {/* ACCOUNT */}

                  <div
                    onClick={() =>
                      onSelectTrade(trade)
                    }
                    className="flex h-[50px] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-medium text-slate-200 transition-all hover:bg-white/[0.02]"
                  >
                    {(trade as any).account}
                  </div>

                  {/* SYMBOL */}

                  <div
                    onClick={() =>
                      onSelectTrade(trade)
                    }
                    className="flex h-[50px] cursor-pointer items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-medium tracking-wide text-white transition-all hover:bg-white/[0.02]"
                  >
                    {trade.symbol}
                  </div>

                  {/* TYPE */}

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div className="inline-flex items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-[8px]">

                      <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-blue-400">
                        {(trade as any).tradeType}
                      </span>
                    </div>
                  </div>

                  {/* SIDE */}

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

                  {/* QTY */}

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-medium text-slate-300">

                    {(trade as any).quantity}
                  </div>

                  {/* NET PNL */}

                  <div
                    className={`flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[18px] font-black tracking-tight ${
                      isWinner
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {isWinner ? "+" : "-"}$
                    {Math.abs(Number(trade.pnl)).toLocaleString()}
                  </div>

                  {/* COMMISSION */}

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5 text-center text-[17px] font-semibold text-orange-400">

                    ${trade.fees}
                  </div>

                  {/* RESULT */}

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div
                      className={`inline-flex items-center justify-center rounded-full px-4 py-[8px] ${
                        isWinner
                          ? "border border-emerald-500/20 bg-emerald-500/10"
                          : "border border-red-500/20 bg-red-500/10"
                      }`}
                    >

                      <span
                        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
                          isWinner
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.result}
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="flex h-[50px] items-center justify-center border-b border-white/[0.04] px-5">

                    <div
                      className={`inline-flex items-center justify-center rounded-full px-4 py-[8px] ${
                        trade.status === "Open"
                          ? "border border-yellow-500/20 bg-yellow-500/10"
                          : "border border-slate-500/20 bg-slate-500/10"
                      }`}
                    >

                      <span
                        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${
                          trade.status === "Open"
                            ? "text-yellow-400"
                            : "text-slate-300"
                        }`}
                      >
                        {trade.status}
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