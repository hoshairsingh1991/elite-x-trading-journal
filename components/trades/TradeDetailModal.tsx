"use client";

import { useState } from "react";

import { Trade } from "@/types/trade";

import EditTradeModal from "@/components/trades/EditTradeModal";

interface TradeDetailModalProps {
  selectedDate: string;
  trades?: Trade[];
  onClose: () => void;
}

export default function TradeDetailModal({
  trades = [],
  onClose,
}: TradeDetailModalProps) {

  // =================================================
  // SAFETY
  // =================================================

  if (
    !trades ||
    trades.length === 0
  ) {

    return null;
  }

  // =================================================
  // EDIT STATE
  // =================================================

  const [
    editingTrade,
    setEditingTrade,
  ] = useState<Trade | null>(
    null
  );

  // =================================================
  // DAILY TOTALS
  // =================================================

  const totalPnl =
    trades.reduce(
      (
        total,
        trade
      ) =>
        total +
        Number(
          trade.pnl || 0
        ),
      0
    );

  const pnlColor =
    totalPnl >= 0
      ? "text-emerald-400"
      : "text-red-400";

  return (

    <>
    
      {/* ================================================= */}
      {/* EDIT MODAL */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[6px]">

        {/* ================================================= */}
        {/* MODAL */}
        {/* ================================================= */}

        <div className="relative w-[980px] overflow-hidden rounded-[34px] border border-white/[0.06] bg-[#0b1730] shadow-[0_0_90px_rgba(0,0,0,0.60)]">

          {/* ================================================= */}
          {/* TOP SAFE ZONE */}
          {/* ================================================= */}

          <div className="h-7 opacity-0">
            spacing
          </div>

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="flex items-start justify-between">

            {/* LEFT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0">
              spacing
            </div>

            {/* CONTENT */}

            <div className="flex flex-1 items-start justify-between">

              {/* LEFT */}

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                  Daily Trade Review
                </p>

                <h2 className="mt-4 text-[42px] font-black tracking-tight text-white">
                  {trades[0].date}
                </h2>

                <p className="mt-3 text-[14px] text-slate-500">
                  Institutional execution review & reconciliation
                </p>
              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-3">

                {/* CLOSE */}

                <button
                  onClick={onClose}
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-[15px] border border-white/[0.06] bg-white/[0.03] text-[22px] text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            {/* RIGHT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0">
              spacing
            </div>
          </div>

          {/* ================================================= */}
          {/* GAP */}
          {/* ================================================= */}

          <div className="h-8 opacity-0">
            spacing
          </div>

          {/* ================================================= */}
          {/* DAILY PNL */}
          {/* ================================================= */}

          <div className="flex">

            <div className="w-[18px] shrink-0 opacity-0">
              spacing
            </div>

            <div className="flex-1">

              <div className="rounded-[28px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(17,24,39,0.70)_0%,rgba(9,24,45,0.55)_100%)] px-7 py-6">

                <div className="flex flex-col items-center text-center">

                  <p className="opacity-0 text-[10px] font-black uppercase tracking-[0.20em]">
                    spacing
                  </p>

                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.20em] text-slate-500">
                    Daily Net Profit & Loss
                  </p>

                  <h3
                    className={`mt-4 text-[58px] font-black leading-none tracking-tight ${pnlColor}`}
                  >
                    {totalPnl >= 0
                      ? "+"
                      : "-"}
                    $
                    {Math.abs(
                      totalPnl
                    ).toLocaleString()}
                  </h3>

                  <p className="mt-3 text-[13px] text-slate-500">
                    Combined realized execution performance for selected session.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-[18px] shrink-0 opacity-0">
              spacing
            </div>
          </div>

          {/* ================================================= */}
          {/* GAP */}
          {/* ================================================= */}

          <div className="h-6 opacity-0">
            spacing
          </div>

          {/* ================================================= */}
          {/* TRADES LIST */}
          {/* ================================================= */}

          <div className="flex">

            <div className="w-[18px] shrink-0 opacity-0">
              spacing
            </div>

            <div className="flex-1">

              <div className="overflow-hidden rounded-[26px] border border-white/[0.05] bg-[#071427]">

                {/* ================================================= */}
                {/* TABLE HEADER */}
                {/* ================================================= */}

                <div className="grid h-[58px] grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_80px] border-b border-white/[0.05]">

                  {[
                    "Ticker",
                    "Side",
                    "Status",
                    "Quantity",
                    "P&L",
                    "Account",
                    "",
                  ].map((header) => (

                    <div
                      key={header}
                      className="flex items-center justify-center text-center text-[12px] font-black uppercase tracking-[0.14em] text-slate-500"
                    >
                      {header}
                    </div>
                  ))}
                </div>

                {/* ================================================= */}
                {/* TRADE ROWS */}
                {/* ================================================= */}

                {trades.map(
                  (
                    trade,
                    index
                  ) => {

                    const isOpen =
                      trade.status ===
                      "OPEN";

                    const isWinner =
                      trade.pnl >= 0;

                    return (

                      <div
                        key={
                          trade.id ||
                          index
                        }
                        className="grid h-[72px] grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_80px] border-b border-white/[0.04] last:border-b-0"
                      >

                        {/* TICKER */}

                        <div className="flex items-center justify-center">

                          <p className="text-[18px] font-black tracking-tight text-white">
                            {trade.ticker}
                          </p>
                        </div>

                        {/* SIDE */}

                        <div className="flex items-center justify-center">

                          <div
                            className={`flex h-[38px] items-center justify-center rounded-full px-6 ${
                              trade.side ===
                              "LONG"
                                ? "border border-emerald-500/20 bg-emerald-500/10"
                                : "border border-red-500/20 bg-red-500/10"
                            }`}
                          >

                            <span
                              className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                                trade.side ===
                                "LONG"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {trade.side}
                            </span>
                          </div>
                        </div>

                        {/* STATUS */}

                        <div className="flex items-center justify-center">

                          <div
                            className={`flex h-[38px] items-center justify-center rounded-full px-6 ${
                              isOpen
                                ? "border border-yellow-500/20 bg-yellow-500/10"
                                : "border border-slate-500/20 bg-slate-500/10"
                            }`}
                          >

                            <span
                              className={`text-[10px] font-black uppercase tracking-[0.16em] ${
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

                        {/* QUANTITY */}

                        <div className="flex items-center justify-center">

                          <p className="text-[17px] font-semibold text-white">
                            {trade.quantity}
                          </p>
                        </div>

                        {/* PNL */}

                        <div className="flex items-center justify-center">

                          <p
                            className={`text-[20px] font-black tracking-tight ${
                              isWinner
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {trade.pnl >= 0
                              ? "+"
                              : "-"}
                            $
                            {Math.abs(
                              Number(
                                trade.pnl
                              )
                            ).toLocaleString()}
                          </p>
                        </div>

                        {/* ACCOUNT */}

                        <div className="flex items-center justify-center">

                          <p className="text-[15px] font-medium text-slate-300">
                            {trade.account ||
                              "N/A"}
                          </p>
                        </div>

                        {/* EDIT */}

                        <div className="flex items-center justify-center">

                          <button
                            onClick={() =>
                              setEditingTrade(
                                trade
                              )
                            }
                            className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-blue-500/20 bg-blue-500/10 text-[14px] text-blue-400 transition-all hover:bg-blue-500/20"
                          >
                            ✎
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="w-[18px] shrink-0 opacity-0">
              spacing
            </div>
          </div>

          {/* ================================================= */}
          {/* BOTTOM SAFE ZONE */}
          {/* ================================================= */}

          <div className="h-7 opacity-0">
            spacing
          </div>
        </div>
      </div>
    </>
  );
}