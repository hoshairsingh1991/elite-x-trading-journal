"use client";

import {
  DailyReviewPerformanceProps,
} from "./dailyReviewTypes";

export default function DailyReviewPerformance({
  selectedTrades,
}: DailyReviewPerformanceProps) {

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

  const totalTrades =
    selectedTrades.length;

  const winRate =
    totalTrades > 0
      ? Math.round(
          (wins /
            totalTrades) *
            100
        )
      : 0;

  return (
    <div className="mt-6 flex justify-center">

      <div
        className="
          w-full
          rounded-[8px]
          border
          border-white/[0.06]
          bg-white/[0.02]
          p-7
        "
      >

        <div className="flex items-center justify-between">

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
              text-[10px]
              font-bold
              text-slate-400
            "
          >
            {wins}W · {losses}L · {winRate}%
          </p>

        </div>

        <div
          className="
            mt-6
            h-[6px]
            overflow-hidden
            rounded-full
            bg-white/[0.04]
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-emerald-400
              to-blue-400
            "
            style={{
              width: `${winRate}%`,
            }}
          />
        </div>

      </div>

    </div>
  );
}