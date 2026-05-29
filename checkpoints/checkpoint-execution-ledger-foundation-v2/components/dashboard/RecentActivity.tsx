"use client";

import Link from "next/link";

import { Trade } from "@/types/trade";

interface RecentActivityProps {

  trades: Trade[];
}

export default function RecentActivity({

  trades,

}: RecentActivityProps) {

  // =================================================
  // RECENT TRADES
  // =================================================

  const recentTrades =
    [...trades]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);

  return (

    <div className="rounded-[28px] bg-[#071427] p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]">

      <div className="h-[420px] rounded-[24px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-white/[0.05] pb-5">

          <div className="relative left-3">

            <h2 className="text-[26px] font-black tracking-tight text-white">
              Recent Activity
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Latest execution activity
            </p>
          </div>

          <Link
            href="/trades"
            className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-blue-400 transition-all hover:bg-blue-500/15"
          >
            View All
          </Link>
        </div>

        {/* ================================================= */}
        {/* ACTIVITY LIST */}
        {/* ================================================= */}

        <div className="mt-6 space-y-3">

          {recentTrades.map(
            (trade, index) => (

              <div
                key={index}
                className="flex items-center justify-between rounded-[18px] border border-white/[0.04] bg-[#0b1220]/70 px-5 py-4 transition-all hover:border-white/[0.08]"
              >

                {/* ================================================= */}
                {/* LEFT */}
                {/* ================================================= */}

                <div className="flex items-center gap-4">

                  {/* STATUS DOT */}

                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      trade.pnl >= 0
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    }`}
                  />

                  {/* INFO */}

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="text-[15px] font-bold text-white">
                        {trade.ticker}
                      </span>

                      <span className="rounded-full bg-white/[0.05] px-2.5 py-[4px] text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                        {trade.side}
                      </span>
                    </div>

                    <p className="mt-1 text-[12px] text-slate-500">
                      {trade.date}
                    </p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* RIGHT */}
                {/* ================================================= */}

                <div className="text-right">

                  <p
                    className={`text-[16px] font-black tracking-tight ${
                      trade.pnl >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    ${trade.pnl.toLocaleString()}
                  </p>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {trade.status}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}