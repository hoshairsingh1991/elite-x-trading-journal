"use client";

import { Trade } from "@/types/trade";

interface TradeDetailModalProps {
  selectedDate: string;
  trades?: Trade[];
  onClose: () => void;
}

export default function TradeDetailModal({
  selectedDate,
  trades = [],
  onClose,
}: TradeDetailModalProps) {

  const totalPnL =
    trades.reduce(
      (sum, trade) =>
        sum + trade.pnl,
      0
    );

  const totalCommission =
    trades.reduce(
      (sum, trade) =>
        sum + trade.fees,
      0
    );

  const winningTrades =
    trades.filter(
      (trade) =>
        trade.status === "WIN"
    ).length;

  const closedTrades =
    trades.filter(
      (trade) =>
        trade.status !== "OPEN"
    ).length;

  const winRate =
    closedTrades > 0
      ? Math.round(
          (winningTrades /
            closedTrades) *
            100
        )
      : 0;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[6px]">

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <div className="relative w-[940px] overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0b1730] shadow-[0_0_80px_rgba(0,0,0,0.55)]">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="border-b border-white/[0.05] px-8 pb-5 pt-7">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-[52px] font-black tracking-tight text-white">
                {selectedDate}
              </h2>

              <p className="mt-1 text-[16px] text-slate-400">
                Institutional Trade Review
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-[24px] text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* KPI ROW */}
        {/* ================================================= */}

        <div className="grid grid-cols-4 gap-4 px-8 pb-6 pt-6">

          {/* NET PNL */}

          <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/[0.05] bg-white/[0.03] p-5 text-center">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Net P&L
            </p>

            <h3
              className={`mt-3 text-[42px] font-black tracking-tight ${
                totalPnL >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {totalPnL >= 0 ? "+" : "-"}$
              {Math.abs(
                totalPnL
              ).toFixed(2)}
            </h3>
          </div>

          {/* TOTAL TRADES */}

          <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/[0.05] bg-white/[0.03] p-5 text-center">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Total Trades
            </p>

            <h3 className="mt-3 text-[42px] font-black tracking-tight text-white">
              {trades.length}
            </h3>
          </div>

          {/* COMMISSION */}

          <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/[0.05] bg-white/[0.03] p-5 text-center">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Commission
            </p>

            <h3 className="mt-3 text-[42px] font-black tracking-tight text-white">
              $
              {totalCommission.toFixed(
                2
              )}
            </h3>
          </div>

          {/* WIN RATE */}

          <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/[0.05] bg-white/[0.03] p-5 text-center">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Win Rate
            </p>

            <h3 className="mt-3 text-[42px] font-black tracking-tight text-blue-400">
              {winRate}%
            </h3>
          </div>
        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="px-8 pb-8">

          <div className="overflow-hidden rounded-[22px] border border-white/[0.05]">

            {/* TABLE HEADER */}

            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/[0.05] bg-white/[0.03] px-4 py-4">

              {[
                "Ticker",
                "Side",
                "Entry",
                "Exit",
                "Net P&L",
                "Commission",
                "Status",
              ].map((header) => (

                <div
                  key={header}
                  className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
                >
                  {header}
                </div>
              ))}
            </div>

            {/* TABLE ROWS */}

            <div>

              {trades.map((trade) => {

                const isWinner =
                  trade.status === "WIN";

                const isOpen =
                  trade.status === "OPEN";

                return (

                  <div
                    key={trade.id}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/[0.04] px-4 py-4 last:border-none"
                  >

                    <div className="text-center text-[16px] font-semibold text-white">
                      {trade.ticker}
                    </div>

                    <div className="text-center text-[15px] font-bold text-emerald-400">
                      {trade.side}
                    </div>

                    <div className="text-center text-[15px] text-slate-300">

                      {trade.entryPrice
                        ? `$${Number(
                            trade.entryPrice
                          ).toFixed(2)}`
                        : "--"}
                    </div>

                    <div className="text-center text-[15px] text-slate-300">

                      {trade.exitPrice
                        ? `$${Number(
                            trade.exitPrice
                          ).toFixed(2)}`
                        : "--"}
                    </div>

                    <div
                      className={`text-center text-[15px] font-bold ${
                        isWinner
                          ? "text-emerald-400"
                          : isOpen
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {trade.pnl >= 0
                        ? "+"
                        : "-"}
                      $
                      {Math.abs(
                        trade.pnl
                      ).toFixed(2)}
                    </div>

                    <div className="text-center text-[15px] font-semibold text-slate-300">

                      $
                      {Number(
                        trade.fees
                      ).toFixed(2)}
                    </div>

                    <div
                      className={`text-center text-[13px] font-black uppercase tracking-[0.12em] ${
                        isWinner
                          ? "text-emerald-400"
                          : isOpen
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {trade.status}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}