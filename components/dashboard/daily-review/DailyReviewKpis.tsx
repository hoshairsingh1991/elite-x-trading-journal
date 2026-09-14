"use client";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import {
  DailyReviewKpisProps,
} from "./dailyReviewTypes";

export default function DailyReviewKpis({
  selectedTrades,
  reportingCurrency,
}: DailyReviewKpisProps) {

  const totalPnL =
    selectedTrades.reduce(
      (sum, trade) =>
        sum +
        Number(trade.pnl || 0),
      0
    );

  const totalCommission =
    selectedTrades.reduce(
      (sum, trade) =>
        sum +
        Number(trade.fees || 0),
      0
    );

  const wins =
    selectedTrades.filter(
      (trade) =>
        trade.status === "WIN"
    ).length;

  const losses =
    selectedTrades.filter(
      (trade) =>
        trade.status === "LOSS"
    ).length;

  const totalTradesDay =
    selectedTrades.length;

  const winRate =
    totalTradesDay > 0
      ? Math.round(
          (wins /
            totalTradesDay) *
            100
        )
      : 0;

  return (
    <div className="grid grid-cols-4 gap-6">

      {/* NET P&L */}

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-[8px]
          border
          border-white/[0.05]
          bg-white/[0.02]
          p-6
          text-center
        "
      >
        <p
          className="
            text-[11px]
            font-black
            tracking-[0.18em]
            text-slate-500
          "
        >
          NET P&L
        </p>

        <p
          className={`mt-4 text-[18px] font-black tracking-tight ${
            totalPnL >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {getCurrencySymbol(
            reportingCurrency
          )}
          {totalPnL.toFixed(2)}
        </p>
      </div>

      {/* TOTAL TRADES */}

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-[8px]
          border
          border-white/[0.05]
          bg-white/[0.02]
          p-6
          text-center
        "
      >
        <p
          className="
            text-[11px]
            font-black
            tracking-[0.18em]
            text-slate-500
          "
        >
          TOTAL TRADES
        </p>

        <p
          className="
            mt-4
            text-[18px]
            font-black
            tracking-tight
            text-slate-400
          "
        >
          {totalTradesDay}
        </p>
      </div>

      {/* COMMISSION */}

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-[8px]
          border
          border-white/[0.05]
          bg-white/[0.02]
          p-6
          text-center
        "
      >
        <p
          className="
            text-[11px]
            font-black
            tracking-[0.18em]
            text-slate-500
          "
        >
          COMMISSION
        </p>

        <p
          className="
            mt-4
            text-[18px]
            font-black
            tracking-tight
            text-slate-400
          "
        >
          {totalCommission > 0
            ? `${getCurrencySymbol(
                reportingCurrency
              )}${totalCommission.toFixed(2)}`
            : "--"}
        </p>
      </div>

      {/* WIN RATE */}

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-[8px]
          border
          border-white/[0.05]
          bg-white/[0.02]
          p-6
          text-center
        "
      >
        <p
          className="
            text-[11px]
            font-black
            tracking-[0.18em]
            text-slate-500
          "
        >
          WIN RATE
        </p>

        <p
          className="
            mt-4
            text-[18px]
            font-black
            tracking-tight
            text-blue-400
          "
        >
          {winRate}%
        </p>
      </div>

    </div>
  );
}