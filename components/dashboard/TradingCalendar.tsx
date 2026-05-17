"use client";

import { useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { Trade } from "@/types/trade";

const days = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

interface TradingCalendarProps {
  trades: Trade[];
}

export default function TradingCalendar({
  trades,
}: TradingCalendarProps) {

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDay, setSelectedDay] =
    useState<number | null>(null);

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

  const firstDayOfMonth =
    new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    );

  function goToPreviousMonth() {

    setCurrentDate(
      new Date(
        currentYear,
        currentMonth - 1,
        1
      )
    );
  }

  function goToNextMonth() {

    setCurrentDate(
      new Date(
        currentYear,
        currentMonth + 1,
        1
      )
    );
  }

  // =====================================================
  // MONTH TRADES
  // =====================================================

  const currentMonthTrades =
    useMemo(() => {

      return trades.filter(
        (trade) => {

          const tradeDate =
            new Date(trade.date);

          return (
            tradeDate.getMonth() ===
              currentMonth &&
            tradeDate.getFullYear() ===
              currentYear
          );
        }
      );
    }, [
      trades,
      currentMonth,
      currentYear,
    ]);

  // =====================================================
  // TRADES BY DAY
  // =====================================================

  const tradesByDay:
    Record<
      number,
      {
        pnl: number;
        trades: number;
      }
    > = {};

  currentMonthTrades.forEach(
    (trade) => {

      const tradeDate =
        new Date(trade.date);

      const day =
        tradeDate.getDate();

      if (!tradesByDay[day]) {

        tradesByDay[day] = {
          pnl: 0,
          trades: 0,
        };
      }

      tradesByDay[day].pnl +=
        Number(trade.pnl || 0);

      tradesByDay[day].trades += 1;
    }
  );

  // =====================================================
  // SELECTED DAY TRADES
  // =====================================================

  const selectedTrades =
    currentMonthTrades.filter(
      (trade) => {

        if (!selectedDay) {
          return false;
        }

        const tradeDate =
          new Date(trade.date);

        return (
          tradeDate.getDate() ===
          selectedDay
        );
      }
    );

  // =====================================================
  // STATS
  // =====================================================

  const totalPnL =
    selectedTrades.reduce(
      (sum, trade) =>
        sum +
        Number(trade.pnl || 0),
      0
    );

  const totalFees =
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

  // =====================================================
  // MONTH STATS
  // =====================================================

  const monthlyPnL =
    currentMonthTrades.reduce(
      (sum, trade) =>
        sum +
        Number(trade.pnl || 0),
      0
    );

  const tradingDays =
    Object.keys(
      tradesByDay
    ).length;

  const totalTrades =
    currentMonthTrades.length;

  // =====================================================
  // HEATMAP COLORS
  // =====================================================

  function getDayIntensity(
    pnl: number
  ) {

    if (pnl > 0) {

      if (pnl >= 600) {

        return "border-emerald-500/30 bg-[rgba(6,95,70,0.55)]";
      }

      if (pnl >= 300) {

        return "border-emerald-500/25 bg-[rgba(6,95,70,0.40)]";
      }

      if (pnl >= 100) {

        return "border-emerald-500/20 bg-[rgba(6,95,70,0.28)]";
      }

      return "border-emerald-500/15 bg-[rgba(6,95,70,0.18)]";
    }

    if (pnl < 0) {

      if (pnl <= -600) {

        return "border-red-500/30 bg-[rgba(127,29,29,0.60)]";
      }

      if (pnl <= -300) {

        return "border-red-500/25 bg-[rgba(127,29,29,0.42)]";
      }

      if (pnl <= -100) {

        return "border-red-500/20 bg-[rgba(127,29,29,0.30)]";
      }

      return "border-red-500/15 bg-[rgba(127,29,29,0.18)]";
    }

    return "border-white/[0.05] bg-[#09182d]/90";
  }

  // =====================================================
  // CALENDAR CELLS
  // =====================================================

  const calendarCells = [];

  for (
    let i = 0;
    i < firstDayOfMonth;
    i++
  ) {

    calendarCells.push(
      <div key={`empty-${i}`} />
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const dayData =
      tradesByDay[day];

    calendarCells.push(

      <button
        key={day}
        onClick={() =>
          setSelectedDay(day)
        }
        className={`relative flex h-[92px] flex-col justify-between rounded-[16px] border p-4 text-left transition-all hover:scale-[1.01] hover:border-blue-500/40 ${
          dayData
            ? getDayIntensity(
                dayData.pnl
              )
            : "border-white/[0.05] bg-[#09182d]/90"
        }`}
      >

        <span className="text-[14px] font-bold text-white">
          {day}
        </span>

        {dayData ? (

          <div>

            <p
              className={`text-[16px] font-black tracking-tight ${
                dayData.pnl >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {dayData.pnl >= 0
                ? "+"
                : ""}
              ${dayData.pnl.toFixed(2)}
            </p>

            <p className="mt-1 text-[11px] font-semibold text-slate-300">
              {dayData.trades} Trades
            </p>
          </div>

        ) : (

          <div />
        )}
      </button>
    );
  }

  return (
    <>
      {/* ===================================================== */}
      {/* CALENDAR */}
      {/* ===================================================== */}

      <div className="w-[calc(100%-24px)] rounded-[32px] bg-[#071427] p-5 shadow-[0_0_60px_rgba(0,0,0,0.30)]">

        <div className="rounded-[28px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(20,32,55,0.82)_0%,rgba(9,24,45,0.92)_100%)] p-8">

          {/* HEADER */}

          <div className="flex items-start justify-between">

            <div className="relative left-5 top-1 flex items-center gap-5">

              <button
                onClick={
                  goToPreviousMonth
                }
                className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-white/[0.05] bg-[#0b1730] text-slate-400 transition-all hover:border-blue-500/30 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>

              <div>

                <h2 className="text-[36px] font-black tracking-tight text-white">
                  {monthName}{" "}
                  {currentYear}
                </h2>

                <p className="mt-1 text-sm text-blue-400">
                  Trading Performance
                </p>

                <p className="invisible text-sm">
                  spacing
                </p>
              </div>

              <button
                onClick={
                  goToNextMonth
                }
                className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-white/[0.05] bg-[#0b1730] text-slate-400 transition-all hover:border-blue-500/30 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* KPI */}

            <div className="relative right-4 top-2 flex items-center gap-10">

              {[
                {
                  label:
                    "Monthly P&L",
                  value: `$${monthlyPnL.toFixed(2)}`,
                  negative:
                    monthlyPnL < 0,
                },

                {
                  label:
                    "Trading Days",
                  value:
                    tradingDays,
                },

                {
                  label:
                    "Total Trades",
                  value:
                    totalTrades,
                },
              ].map(
                (
                  stat,
                  index
                ) => (

                  <div
                    key={
                      stat.label
                    }
                    className="flex items-center gap-10"
                  >

                    <div>

                      <p className="text-[11px] font-semibold text-slate-500">
                        {stat.label}
                      </p>

                      <p
                        className={`mt-2 text-[30px] font-black tracking-tight ${
                          stat.negative
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {stat.value}
                      </p>
                    </div>

                    {index !==
                      2 && (
                      <div className="h-10 w-px bg-white/[0.06]" />
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* CALENDAR BODY */}

          <div className="mt-16 rounded-[42px] border border-white/[0.04] bg-[#081526]/35 p-12">

            <div className="rounded-[34px] border border-white/[0.04] bg-[#081526]/85 p-12">

              {/* DAYS */}

              <div className="grid grid-cols-7 gap-3 pb-8">

                {days.map(
                  (day) => (

                    <div
                      key={day}
                      className="text-center text-[11px] font-black tracking-[0.18em] text-slate-500"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* GRID */}

              <div className="grid grid-cols-7 gap-3">

                {calendarCells}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}

      {selectedDay && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-8">

          <div className="w-full max-w-[1280px] rounded-[38px] border border-blue-500/15 bg-[linear-gradient(180deg,#13213a_0%,#0a162d_100%)] p-10 shadow-[0_0_90px_rgba(0,0,0,0.60)]">

            <div className="rounded-[32px] border border-white/[0.04] bg-[#0c1a31]/92 p-10">

              {/* HEADER */}

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-[36px] font-black tracking-tight text-white">
                    {monthName}{" "}
                    {selectedDay},{" "}
                    {currentYear}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Institutional Trade Review
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedDay(
                      null
                    )
                  }
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-white/[0.05] bg-white/[0.03] text-slate-400 transition-all hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* SAFE ZONE */}

              <div className="mt-10 rounded-[28px] border border-white/[0.04] bg-[#081526]/70 p-8">

                {/* KPI */}

                <div className="grid grid-cols-4 gap-5">

                  <div className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] p-6">

                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                      NET P&L
                    </p>

                    <p
                      className={`mt-4 text-[30px] font-black tracking-tight ${
                        totalPnL >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      $
                      {totalPnL.toFixed(
                        2
                      )}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] p-6">

                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                      TOTAL TRADES
                    </p>

                    <p className="mt-4 text-[30px] font-black tracking-tight text-white">
                      {
                        totalTradesDay
                      }
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] p-6">

                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                      FEES
                    </p>

                    <p className="mt-4 text-[30px] font-black tracking-tight text-white">

                      {totalFees > 0
                        ? `$${totalFees.toFixed(
                            2
                          )}`
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-white/[0.05] bg-white/[0.02] p-6">

                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                      WIN RATE
                    </p>

                    <p className="mt-4 text-[30px] font-black tracking-tight text-blue-400">
                      {winRate}%
                    </p>
                  </div>
                </div>

                {/* WIN RATE BAR */}

                <div className="mt-6 rounded-[24px] border border-white/[0.05] bg-white/[0.02] p-7">

                  <div className="flex items-center justify-between">

                    <p className="text-[12px] font-black tracking-[0.18em] text-slate-500">
                      WIN RATE
                    </p>

                    <p className="text-sm font-bold text-white">
                      {wins}W ·{" "}
                      {losses}L ·{" "}
                      {winRate}%
                    </p>
                  </div>

                  <div className="mt-6 h-[12px] overflow-hidden rounded-full bg-white/[0.04]">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                      style={{
                        width: `${winRate}%`,
                      }}
                    />
                  </div>
                </div>

                {/* TABLE */}

                <div className="mt-6 rounded-[24px] border border-white/[0.05] bg-white/[0.02] p-7">

                  <div className="flex items-center justify-between">

                    <p className="text-[12px] font-black tracking-[0.18em] text-slate-500">
                      TRADES
                    </p>

                    <p className="text-sm text-slate-500">
                      {
                        totalTradesDay
                      }{" "}
                      Trades
                    </p>
                  </div>

                  <div className="mt-7 overflow-x-auto">

                    <table className="w-full border-collapse">

                      <thead>

                        <tr className="border-b border-white/[0.05]">

                          {[
                            "Ticker",
                            "Side",
                            "Entry",
                            "Exit",
                            "Net P&L",
                            "Fees",
                            "Status",
                          ].map(
                            (
                              header
                            ) => (

                              <th
                                key={
                                  header
                                }
                                className="pb-5 text-left text-[11px] font-black tracking-[0.18em] text-slate-500"
                              >
                                {
                                  header
                                }
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody>

                        {selectedTrades.map(
                          (
                            trade,
                            index
                          ) => (

                            <tr
                              key={
                                index
                              }
                              className="border-b border-white/[0.03]"
                            >

                              <td className="py-6 text-sm font-semibold text-white">
                                {
                                  trade.ticker
                                }
                              </td>

                              <td
                                className={`py-6 text-sm font-bold ${
                                  trade.side ===
                                  "LONG"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {
                                  trade.side
                                }
                              </td>

                              <td className="py-6 text-sm text-white">

                                {trade.entryPrice >
                                0
                                  ? `$${trade.entryPrice}`
                                  : "--"}
                              </td>

                              <td className="py-6 text-sm text-white">

                                {trade.exitPrice >
                                0
                                  ? `$${trade.exitPrice}`
                                  : "--"}
                              </td>

                              <td
                                className={`py-6 text-sm font-bold ${
                                  Number(
                                    trade.pnl
                                  ) >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {Number(
                                  trade.pnl
                                ) >= 0
                                  ? "+"
                                  : ""}
                                $
                                {Number(
                                  trade.pnl
                                ).toFixed(
                                  2
                                )}
                              </td>

                              <td className="py-6 text-sm text-white">

                                {trade.fees >
                                0
                                  ? `$${trade.fees.toFixed(
                                      2
                                    )}`
                                  : "--"}
                              </td>

                              <td className="py-6">

                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                                    trade.status ===
                                    "OPEN"
                                      ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                                      : trade.status ===
                                        "WIN"
                                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                      : trade.status ===
                                        "LOSS"
                                      ? "border-red-500/20 bg-red-500/10 text-red-400"
                                      : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                                  }`}
                                >
                                  {
                                    trade.status
                                  }
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}