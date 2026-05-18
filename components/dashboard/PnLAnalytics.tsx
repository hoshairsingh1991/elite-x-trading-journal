"use client";

import {
  generatePnLAnalytics,
} from "@/lib/analytics/pnlAnalytics";

import { Trade } from "@/types/trade";

interface PnLAnalyticsProps {
  trades?: Trade[];
}

export default function PnLAnalytics({
  trades = [],
}: PnLAnalyticsProps) {

  const analytics =
    generatePnLAnalytics(
      trades
    );

  const dailyPnL =
    analytics.dailyPnL;

  const maxBarValue =
    Math.max(
      ...dailyPnL.map(
        (day) =>
          Math.abs(day.pnl)
      ),
      1
    );

  const yAxisLevels = [
    maxBarValue,
    maxBarValue * 0.5,
    0,
    -maxBarValue * 0.5,
    -maxBarValue,
  ];

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const weekdayStats =
    weekdays.map((day) => {

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

      const pnl =
        dayTrades.reduce(
          (sum, trade) =>
            sum + trade.pnl,
          0
        );

      return {
        day,
        pnl,
        trades:
          dayTrades.length,
      };
    });

  const maxBehaviorPnL =
    Math.max(
      ...weekdayStats.map(
        (day) =>
          Math.abs(day.pnl)
      ),
      1
    );

  const stats = [
    {
      label: "BEST DAY",
      value:
        `$${analytics.bestDay.toFixed(2)}`,
      sub:
        "highest pnl",
      color:
        "text-emerald-400",
    },

    {
      label: "WORST DAY",
      value:
        `$${analytics.worstDay.toFixed(2)}`,
      sub:
        "largest drawdown",
      color:
        "text-red-400",
    },

    {
      label: "AVG DAILY",
      value:
        `$${analytics.avgDaily.toFixed(2)}`,
      sub:
        "per session",
      color:
        analytics.avgDaily >= 0
          ? "text-emerald-400"
          : "text-red-400",
    },

    {
      label: "STREAK",
      value:
        `${analytics.streak}D`,
      sub:
        analytics.streakType,
      color:
        analytics.streakType ===
        "WINNING"
          ? "text-emerald-400"
          : "text-red-400",
    },

    {
      label: "VOLATILITY",
      value:
        `$${analytics.volatility.toFixed(2)}`,
      sub:
        "std deviation",
      color:
        "text-slate-300",
    },
  ];

  return (

    <div className="overflow-hidden rounded-[28px] border border-white/[0.035] bg-[linear-gradient(180deg,rgba(10,18,32,0.98)_0%,rgba(4,10,18,1)_100%)] shadow-[0_0_40px_rgba(0,0,0,0.18)]">

      {/* HEADER */}

      <div className="border-b border-white/[0.035] px-14 py-7">

        <div className="relative left-4">

          <h2 className="text-[34px] font-black tracking-tight text-white">
            P&L Analytics
          </h2>

          <p className="mt-2 text-[14px] text-slate-500">
            Performance distribution and behavioral analytics
          </p>

        </div>
      </div>

      {/* MAIN */}

      <div className="grid grid-cols-2 gap-0 px-14 pt-9 pb-8">

        {/* DAILY PNL */}

        <div className="flex flex-col">

          {/* TOP INVISIBLE SAFE ZONE */}

          <div className="h-[15px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

          <div className="flex items-stretch h-full">

            {/* LEFT INVISIBLE SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

            <div className="flex-1 rounded-[22px] border border-white/[0.03] bg-white/[0.015] pl-[74px] pr-12 pt-7 pb-10">

              <div className="mb-8 flex items-center justify-between">

                <div className="relative left-4">

                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Daily P&L Distribution
                  </p>

                  <p className="mt-2 text-[8px] font-black uppercase tracking-[0.18em] opacity-0 pointer-events-none select-none">
                    Daily P&L Distribution
                  </p>

                </div>

                <div className="relative right-2">

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    {dailyPnL.length} sessions
                  </p>

                  <p className="mt-2 text-[5px] font-bold uppercase tracking-[0.14em] opacity-0 pointer-events-none select-none">
                    {dailyPnL.length} sessions
                  </p>

                </div>
              </div>

              {/* CHART */}

              <div className="relative h-[365px]">

                {/* GRID */}

                <div className="absolute left-[70px] right-[22px] top-[24px] bottom-[64px]">

                  {yAxisLevels.map(
                    (level, index) => (

                      <div
                        key={index}
                        className={`absolute left-0 right-0 border-t ${
                          level === 0
                            ? "border-white/[0.22]"
                            : "border-white/[0.050]"
                        }`}
                        style={{
                          top:
                            `${index * 25}%`,
                        }}
                      >

                        <span className="absolute -left-[62px] -top-[10px] text-[11px] text-slate-500">
                          {level > 0
                            ? `+$${Math.round(level)}`
                            : level < 0
                            ? `-$${Math.round(Math.abs(level))}`
                            : "$0"}
                        </span>

                      </div>
                    )
                  )}
                </div>

                {/* BARS */}

                <div className="absolute left-[84px] right-[22px] top-[33px] bottom-[64px] flex gap-[8px]">

                  {dailyPnL.map(
                    (day, index) => {

                      const normalizedHeight =
                        Math.max(
                          (
                            Math.abs(day.pnl) /
                            maxBarValue
                          ) * 148,
                          10
                        );

                      const positive =
                        day.pnl >= 0;

                      return (

                        <div
                          key={index}
                          className="group relative flex flex-1"
                        >

                          {/* TOOLTIP */}

                          <div className="pointer-events-none absolute left-1/2 top-[18%] z-20 w-[130px] -translate-x-1/2 rounded-[14px] border border-white/[0.06] bg-[#08111f]/95 px-4 py-3 opacity-0 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 group-hover:opacity-100">

                            <p className="text-center text-[11px] font-bold text-slate-400">
                              {new Date(
                                day.date
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>

                            <p
                              className={`mt-2 text-center text-[18px] font-black ${
                                positive
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {positive ? "+" : "-"}$
                              {Math.abs(
                                day.pnl
                              ).toFixed(2)}
                            </p>

                          </div>

                          {/* BAR */}

                          <div
                            className={`absolute left-1/2 w-[20px] -translate-x-1/2 rounded-[4px] transition-all duration-200 group-hover:w-[18px] ${
                              positive
                                ? "bg-[linear-gradient(180deg,#34d399_0%,#059669_100%)]"
                                : "bg-[linear-gradient(180deg,#fb7185_0%,#dc2626_100%)]"
                            }`}
                            style={{
                              height:
                                `${normalizedHeight}px`,

                              bottom:
                                positive
                                  ? "50%"
                                  : undefined,

                              top:
                                !positive
                                  ? "50%"
                                  : undefined,
                            }}
                          />

                        </div>
                      );
                    }
                  )}
                </div>

                {/* X AXIS */}

                <div className="absolute bottom-2 left-[84px] right-[22px] flex gap-[8px]">

                  {dailyPnL.map(
                    (day, index) => (

                      <div
                        key={index}
                        className="flex flex-1 justify-center"
                      >

                        <p className="text-[10px] text-slate-500">
                          {new Date(
                            day.date
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>

                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT INVISIBLE SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>
          </div>
        </div>

        {/* TRADING BEHAVIOR */}

        <div className="flex flex-col">

          {/* TOP INVISIBLE SAFE ZONE */}

          <div className="h-[15px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

          <div className="flex flex-1 items-stretch h-full">

            <div className="flex-1 rounded-[22px] border border-white/[0.03] bg-white/[0.015] px-12 pt-7 pb-10">

              {/* HEADER */}

              <div className="mb-8 flex items-start justify-between">

                <div className="relative left-4">

                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Trading Behavior
                  </p>

                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] opacity-0 pointer-events-none select-none">
                    Trading Behavior
                  </p>

                </div>

                <div className="relative right-2 flex flex-col items-end">

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    weekday performance
                  </p>

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] opacity-0 pointer-events-none select-none">
                    weekday performance
                  </p>

                </div>
              </div>

              {/* CONTENT */}

              <div className="pl-5 pr-5">

                <div className="flex">

                  {/* LEFT INVISIBLE SAFE ZONE */}

                  <div className="w-[15px] shrink-0 opacity-0 pointer-events-none select-none">
                    spacer
                  </div>

                  {/* MAIN CONTENT */}

                  <div className="flex-1">

                    <div className="space-y-5">

                      {weekdayStats.map((day, index) => {

                        const pnlPositive =
                          day.pnl >= 0;

                        const normalizedWidth =
                          (
                            Math.abs(day.pnl) /
                            maxBehaviorPnL
                          ) * 80;

                        return (

                          <div key={day.day}>

                            <div
                              className="rounded-[18px] border border-white/[0.03] bg-white/[0.015] px-5 py-5"
                            >

                              <div className="mb-4 flex items-center justify-between gap-6">

                                {/* LEFT SIDE */}

                                <div className="relative left-3">

                                  <p className="text-[15px] font-bold text-white">
                                    {day.day}
                                  </p>

                                  <p className="mt-1 text-[11px] text-slate-500">
                                    {day.trades} trades
                                  </p>

                                </div>

                                {/* RIGHT SIDE */}

                                <div className="relative right-1 flex items-center gap-1">

                                  <p
                                    className={`shrink-0 text-[16px] font-black ${
                                      pnlPositive
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    ${day.pnl.toFixed(2)}
                                  </p>

                                  <div className="opacity-0 pointer-events-none select-none text-[16px] font-black">
                                    0
                                  </div>

                                </div>

                              </div>

                              {/* BAR */}

                              <div className="relative left-2 right-2 h-[10px] overflow-hidden rounded-full bg-white/[0.04]">

                                <div
                                  className={`h-full rounded-full ${
                                    pnlPositive
                                      ? "bg-[linear-gradient(90deg,#34d399_0%,#10b981_100%)]"
                                      : "bg-[linear-gradient(90deg,#fb7185_0%,#ef4444_100%)]"
                                  }`}
                                  style={{
                                    width:
                                      `${normalizedWidth}%`,
                                  }}
                                />

                              </div>
                            </div>

                            {/* INVISIBLE SEPARATOR */}

                            {index !== weekdayStats.length - 1 && (

                              <p className="py-2 text-[12px] opacity-0 pointer-events-none select-none">
                                separator
                              </p>

                            )}
                          </div>
                        );
                      })}

                      {/* BOTTOM INVISIBLE SAFE ZONE */}

                      <div className="h-[15px] shrink-0 opacity-0 pointer-events-none select-none">
                        spacer
                      </div>
                    </div>
                  </div>

                  {/* RIGHT INVISIBLE SAFE ZONE FOR DAY CARDS */}

                  <div className="w-[15px] shrink-0 opacity-0 pointer-events-none select-none">
                    spacer
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT INVISIBLE SAFE ZONE FOR ENTIRE TRADING BEHAVIOR CARD */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>
          </div>
        </div>
      </div>

      {/* TOP SPACER */}

      <div className="opacity-0 select-none pointer-events-none px-16">
        <p className="py-8 text-[14px]">
          Performance distribution and behavioral analytics
        </p>
      </div>

      {/* METRICS */}

      <div className="px-16">

        <div className="flex justify-center">

          <div className="grid w-[94%] grid-cols-5 gap-7">

            {stats.map((item) => {

              const isCenter =
                item.label === "AVG DAILY";

              return (

                <div
                  key={item.label}
                  className={`rounded-[22px] border border-white/[0.03] bg-white/[0.015] px-8 py-7 text-center ${
                    isCenter
                      ? "scale-[1.03]"
                      : ""
                  }`}
                >

                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>

                  <h3 className={`mt-4 text-[28px] font-black tracking-tight ${item.color}`}>
                    {item.value}
                  </h3>

                  <p className="mt-3 text-[12px] text-slate-500">
                    {item.sub}
                  </p>

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SPACER */}

      <div className="opacity-0 select-none pointer-events-none px-16">
        <p className="py-10 text-[14px]">
          Performance distribution and behavioral analytics
        </p>
      </div>
    </div>
  );
}