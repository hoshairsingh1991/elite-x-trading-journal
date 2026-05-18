"use client";

import { Trade } from "@/types/trade";

interface TradingBehaviorProps {

  trades?: Trade[];
}

export default function TradingBehavior({

  trades = [],

}: TradingBehaviorProps) {

  // =================================================
  // WEEKDAY STRUCTURE
  // =================================================

  const weekdayOrder = [

    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // =================================================
  // GROUP DATA
  // =================================================

  const weekdayStats =
    weekdayOrder.map((day) => {

      const dayTrades =
        trades.filter((trade) => {

          const tradeDate =
            new Date(
              trade.date
            );

          const weekday =
            tradeDate.toLocaleDateString(
              "en-US",
              {
                weekday: "long",
              }
            );

          return weekday === day;
        });

      const totalPnL =
        dayTrades.reduce(
          (sum, trade) =>
            sum + trade.pnl,
          0
        );

      const wins =
        dayTrades.filter(
          (trade) =>
            trade.pnl > 0
        ).length;

      const winRate =
        dayTrades.length > 0
          ? (
              (wins /
                dayTrades.length) *
              100
            ).toFixed(0)
          : "0";

      return {

        day,

        trades:
          dayTrades.length,

        pnl:
          totalPnL,

        winRate:
          Number(winRate),
      };
    });

  // =================================================
  // BEST / WORST
  // =================================================

  const bestDay =
    [...weekdayStats].sort(
      (a, b) =>
        b.pnl - a.pnl
    )[0];

  const worstDay =
    [...weekdayStats].sort(
      (a, b) =>
        a.pnl - b.pnl
    )[0];

  return (

    <div className="rounded-[32px] bg-[#071427] p-7 shadow-[0_0_60px_rgba(0,0,0,0.22)]">

      <div className="rounded-[30px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(19,31,52,0.96)_0%,rgba(7,20,39,0.98)_100%)] p-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-[30px] font-black tracking-tight text-white">
              Trading Behavior
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Weekly execution patterns and behavioral tendencies
            </p>
          </div>

          {/* ================================================= */}
          {/* INSIGHT BADGES */}
          {/* ================================================= */}

          <div className="flex items-center gap-3">

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400">
                Best Day
              </p>

              <p className="mt-2 text-[18px] font-black text-white">
                {bestDay?.day || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3">

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-400">
                Worst Day
              </p>

              <p className="mt-2 text-[18px] font-black text-white">
                {worstDay?.day || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* WEEKDAY ANALYTICS */}
        {/* ================================================= */}

        <div className="mt-10 space-y-5">

          {weekdayStats.map((day) => {

            const pnlPositive =
              day.pnl >= 0;

            const normalizedWidth =
              Math.min(
                Math.abs(day.pnl) / 10,
                100
              );

            return (

              <div
                key={day.day}
                className="rounded-[24px] border border-white/[0.04] bg-[#0b1220]/70 p-6"
              >

                {/* ================================================= */}
                {/* TOP */}
                {/* ================================================= */}

                <div className="flex items-center justify-between">

                  {/* LEFT */}

                  <div>

                    <h3 className="text-[22px] font-black text-white">
                      {day.day}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {day.trades} trades executed
                    </p>
                  </div>

                  {/* RIGHT */}

                  <div className="text-right">

                    <p
                      className={`text-[26px] font-black tracking-tight ${
                        pnlPositive
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      ${day.pnl.toFixed(2)}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {day.winRate}% win rate
                    </p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* HEAT BAR */}
                {/* ================================================= */}

                <div className="mt-6">

                  <div className="h-[14px] overflow-hidden rounded-full bg-white/[0.04]">

                    <div
                      className={`h-full rounded-full ${
                        pnlPositive
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                          : "bg-gradient-to-r from-red-500 to-red-300"
                      }`}
                      style={{
                        width:
                          `${normalizedWidth}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}