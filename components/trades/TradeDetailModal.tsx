"use client";

import { X } from "lucide-react";

import { Trade } from "@/types/trade";

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TradeDetailModal({
  trade,
  isOpen,
  onClose,
}: TradeDetailModalProps) {

  if (!isOpen || !trade) return null;

  const pnl =
    Number(trade.pnl) || 0;

  const isWinner = pnl >= 0;

  return (
    <>
      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      {/* ================================================= */}
      {/* SLIDE PANEL */}
      {/* ================================================= */}

      <div className="fixed right-0 top-0 z-50 flex h-screen w-[520px] flex-col border-l border-white/[0.05] bg-[#06101f] shadow-[-20px_0_60px_rgba(0,0,0,0.45)]">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-start justify-between border-b border-white/[0.05] px-8 py-7">

          <div>

            {/* SYMBOL */}

            <div className="flex items-center gap-4">

              <h2 className="text-[34px] font-black tracking-tight text-white">
                {trade.symbol}
              </h2>

              {/* SIDE */}

              <div
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                  trade.side === "LONG"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {trade.side}
              </div>
            </div>

            {/* DATE */}

            <p className="mt-3 text-sm text-slate-500">
              {trade.date}
            </p>
          </div>

          {/* CLOSE BUTTON */}

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="flex-1 overflow-y-auto px-8 py-8">

          {/* ================================================= */}
          {/* PNL CARD */}
          {/* ================================================= */}

          <div className="rounded-[24px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-7">

            <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-slate-500">
              Trade Result
            </p>

            <h1
              className={`mt-5 text-[58px] font-black leading-none tracking-tight ${
                isWinner
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {isWinner ? "+" : "-"}$
              {Math.abs(pnl).toLocaleString()}
            </h1>

            <p className="mt-4 text-sm font-medium text-slate-400">
              Net profit after execution fees
            </p>
          </div>

          {/* ================================================= */}
          {/* TRADE DETAILS */}
          {/* ================================================= */}

          <div className="mt-8 rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-7">

            <h3 className="text-[18px] font-bold tracking-tight text-white">
              Trade Details
            </h3>

            <div className="mt-7 space-y-5">

              {[
                {
                  label: "Setup",
                  value: trade.setup,
                },

                {
                  label: "Entry",
                  value: `$${trade.entry}`,
                },

                {
                  label: "Exit",
                  value: `$${trade.exit}`,
                },

                {
                  label: "Fees",
                  value: `$${trade.fees}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-white/[0.04] pb-4"
                >
                  <span className="text-sm text-slate-500">
                    {item.label}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ================================================= */}
          {/* TRADE NOTES */}
          {/* ================================================= */}

          <div className="mt-8 rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-7">

            <h3 className="text-[18px] font-bold tracking-tight text-white">
              Execution Notes
            </h3>

            <p className="mt-5 text-[15px] leading-8 text-slate-400">
              Placeholder for detailed execution review,
              emotional state, trade management notes,
              mistakes made, and lessons learned.
            </p>
          </div>

          {/* ================================================= */}
          {/* LESSONS */}
          {/* ================================================= */}

          <div className="mt-8 rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-7">

            <h3 className="text-[18px] font-bold tracking-tight text-white">
              Lessons Learned
            </h3>

            <div className="mt-5 space-y-4">

              {[
                "Wait for confirmation before entry",
                "Respect predefined stop placement",
                "Avoid emotional scaling",
              ].map((lesson, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >

                  <div className="mt-[7px] h-2 w-2 rounded-full bg-blue-400" />

                  <p className="text-[15px] leading-7 text-slate-400">
                    {lesson}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}