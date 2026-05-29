"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Trade } from "@/types/trade";

interface PositionsTradesPanelProps {
  trades: Trade[];
}

type TabType =
  | "OPEN"
  | "RECENT";

export default function PositionsTradesPanel({
  trades,
}: PositionsTradesPanelProps) {

  const [activeTab, setActiveTab] =
    useState<TabType>("OPEN");

  // =================================================
  // OPEN POSITIONS
  // =================================================

  const openTrades =
    useMemo(() => {

      return trades.filter(
        (trade) =>
          trade.status === "OPEN"
      );

    }, [trades]);

  // =================================================
  // RECENT TRADES
  // =================================================

  const recentTrades =
    useMemo(() => {

      return [...trades]
        .filter(
          (trade) =>
            trade.status !== "OPEN"
        )
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        )
        .slice(0, 12);

    }, [trades]);

  const displayedTrades =
    activeTab === "OPEN"
      ? openTrades
      : recentTrades;

  return (

    <div className="rounded-[28px] bg-[#071427] p-5 shadow-[0_0_40px_rgba(0,0,0,0.18)]">

      {/* ================================================= */}
      {/* PANEL BODY */}
      {/* ================================================= */}

      <div className="flex h-[805px] flex-col overflow-hidden rounded-[24px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)]">

        {/* ================================================= */}
        {/* SAFE ZONE */}
        {/* ================================================= */}

        <div className="flex h-full flex-col px-7 pt-7 pb-6">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="relative left-2">

            <h2 className="text-[30px] font-black tracking-tight text-slate-400">
              Positions & Trades
            </h2>

            <p className="mt-2 text-[14px] text-slate-500">
              Active positions and recent execution activity
            </p>
          </div>

          {/* ================================================= */}
          {/* SPACING */}
          {/* ================================================= */}

          <div className="h-7 shrink-0" />

          {/* ================================================= */}
          {/* TABS */}
          {/* ================================================= */}

          <div className="flex items-center">

            {/* LEFT INVISIBLE SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

            <div className="flex-1 rounded-[18px] border border-white/[0.05] bg-[#091426] p-1.5">

              <div className="grid grid-cols-2 gap-2">

                {/* OPEN */}

                <button
                  onClick={() =>
                    setActiveTab("OPEN")
                  }
                  className={`h-[48px] rounded-[14px] text-[13px] font-bold transition-all ${
                    activeTab === "OPEN"
                      ? "bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.25)]"
                      : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Open Positions (
                  {openTrades.length})
                </button>

                {/* RECENT */}

                <button
                  onClick={() =>
                    setActiveTab("RECENT")
                  }
                  className={`h-[48px] rounded-[14px] text-[13px] font-bold transition-all ${
                    activeTab === "RECENT"
                      ? "bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.25)]"
                      : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Recent Trades
                </button>
              </div>
            </div>

            {/* RIGHT INVISIBLE SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>
          </div>

          {/* ================================================= */}
          {/* SPACING */}
          {/* ================================================= */}

          <div className="h-7 shrink-0" />

          {/* ================================================= */}
          {/* SCROLL CONTAINER */}
          {/* ================================================= */}

          <div className="flex-1 overflow-hidden rounded-[20px] border border-white/[0.025] bg-black/10">

            {/* ================================================= */}
            {/* MAIN SCROLL WRAPPER */}
            {/* ================================================= */}

            <div className="flex h-full overflow-x-hidden">

              {/* ================================================= */}
              {/* INVISIBLE LEFT SCROLLBAR SPACER */}
              {/* ================================================= */}

              <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                spacer
              </div>

              {/* ================================================= */}
              {/* SCROLL AREA */}
              {/* ================================================= */}

              <div className="h-full flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 pr-5">

                {/* ================================================= */}
                {/* SCROLLBAR */}
                {/* ================================================= */}

                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 18px;
                    height: 0px;
                  }

                  div::-webkit-scrollbar-track {
                    background: transparent;
                  }

                  div::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.16);
                    border-radius: 999px;
                    border: 3px solid transparent;
                    background-clip: padding-box;
                  }

                  div::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.24);
                    border: 3px solid transparent;
                    background-clip: padding-box;
                  }

                  div::-webkit-scrollbar-horizontal {
                    height: 0px;
                    display: none;
                  }
                `}</style>

                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {displayedTrades.length === 0 ? (

                  <div className="flex h-[220px] items-center justify-center rounded-[22px] border border-dashed border-white/[0.06] bg-white/[0.015]">

                    <p className="text-[15px] font-medium text-slate-500">
                      No trades available
                    </p>
                  </div>

                ) : (

                  <div className="space-y-2.5">

                    {displayedTrades.map(
                      (trade, index) => {

                        const isProfit =
                          trade.pnl >= 0;

                        return (

                          <div
                            key={`${trade.id}-${index}`}
                            className="flex justify-center"
                          >

                            {/* ================================================= */}
                            {/* CARD WRAPPER */}
                            {/* ================================================= */}

                            <div className="w-full px-8">

                              {/* ================================================= */}
                              {/* CARD */}
                              {/* ================================================= */}

                              <div
                                className="rounded-[16px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(15,23,42,0.82)_0%,rgba(7,18,35,0.88)_100%)] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-all hover:border-white/[0.12]"
                              >

                                {/* ===================================== */}
                                {/* TOP SAFE-ZONE COMPENSATION */}
                                {/* ===================================== */}

                                <div className="opacity-0 pointer-events-none select-none text-[9px] leading-none">
                                  spacer
                                </div>

                                {/* ===================================== */}
                                {/* TOP */}
                                {/* ===================================== */}

                                <div className="grid grid-cols-2 items-start">

                                  {/* ===================================== */}
                                  {/* LEFT */}
                                  {/* ===================================== */}

                                  <div className="relative right-12 flex flex-col items-center">

                                    <div className="opacity-0 pointer-events-none select-none text-[9px] leading-none">
                                      spacer
                                    </div>

                                    <div className="flex items-center justify-center gap-1.5">

                                      <h3 className="truncate text-[16px] font-black tracking-tight text-slate-400">
                                        {trade.ticker || "NQ"}
                                      </h3>

                                      <div
                                        className={`flex items-center gap-1 rounded-full px-2 py-[4px] text-[8px] font-black uppercase tracking-[0.08em] ${
                                          trade.side ===
                                          "LONG"
                                            ? "bg-emerald-500/15 text-emerald-400"
                                            : "bg-red-500/15 text-red-400"
                                        }`}
                                      >

                                        {trade.side === "LONG" ? (
                                          <ArrowUpRight className="h-2.5 w-2.5" />
                                        ) : (
                                          <ArrowDownRight className="h-2.5 w-2.5" />
                                        )}

                                        {trade.side || "LONG"}
                                      </div>
                                    </div>

                                    <p className="mt-1.5 text-[10px] text-slate-400">
                                      {trade.assetType?.toLowerCase() || "futures"}
                                    </p>
                                  </div>

                                  {/* ===================================== */}
                                  {/* RIGHT */}
                                  {/* ===================================== */}

                                  <div className="relative left-10 flex justify-center gap-5">

                                    <div className="text-center">

                                      <div className="opacity-0 pointer-events-none select-none text-[9px] leading-none">
                                        spacer
                                      </div>

                                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Volume
                                      </p>

                                      <p className="mt-1 text-[14px] font-black text-slate-400">
                                        {trade.quantity || 1}
                                      </p>
                                    </div>

                                    <div className="text-center">

                                      <div className="opacity-0 pointer-events-none select-none text-[9px] leading-none">
                                        spacer
                                      </div>

                                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Position
                                      </p>

                                      <p className="mt-1 text-[14px] font-black text-slate-400">
                                        1
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* ===================================== */}
                                {/* SPACING */}
                                {/* ===================================== */}

                                <div className="h-3" />

                                {/* ===================================== */}
                                {/* ENTRY */}
                                {/* ===================================== */}

                                <div className="grid grid-cols-2 items-center border-b border-white/[0.07] pb-2.5">

                                  <div className="relative right-12 text-center">

                                    <p className="text-[11px] text-slate-400">
                                      Entry
                                    </p>
                                  </div>

                                  <div className="relative left-10 text-center">

                                    <p className="text-[14px] font-black text-slate-400">
                                      $
                                      {trade.entryPrice?.toFixed(
                                        2
                                      ) || "0.00"}
                                    </p>
                                  </div>
                                </div>

                                {/* ===================================== */}
                                {/* SPACING */}
                                {/* ===================================== */}

                                <div className="h-2.5" />

                                {/* ===================================== */}
                                {/* PNL */}
                                {/* ===================================== */}

                                <div className="grid grid-cols-2 items-center">

                                  <div className="relative right-12 text-center">

                                    <p className="text-[11px] text-slate-400">
                                      P&L
                                    </p>

                                    <div className="opacity-0 pointer-events-none select-none text-[9px] leading-none">
                                      spacer
                                    </div>
                                  </div>

                                  <div className="relative left-10 text-center">

                                    <p
                                      className={`text-[18px] font-black tracking-tight ${
                                        isProfit
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {isProfit
                                        ? "+"
                                        : "-"}
                                      $
                                      {Math.abs(
                                        trade.pnl
                                      ).toFixed(2)}
                                    </p>

                                    <div className="opacity-0 pointer-events-none select-none text-[9px] leading-none">
                                      spacer
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="opacity-0 pointer-events-none select-none py-[1px]">
                                spacer
                              </div>

                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* INVISIBLE RIGHT BALANCER */}
              {/* ================================================= */}

              <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                spacer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}