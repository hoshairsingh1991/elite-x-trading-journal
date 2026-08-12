"use client";

import {
Fragment,
useEffect,
useMemo,
useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Pencil,
} from "lucide-react";

import { Trade } from "@/types/trade";

import { supabase }
from "@/lib/supabase";

import {
  loadDailyNotesFromSupabase,
  getDailyNoteFromSupabase,
  upsertDailyNoteInSupabase,
} from "@/lib/storage/supabaseDailyNotesStorage";

import EditTradeModal
from "@/components/trades/EditTradeModal";

import { getCurrencySymbol } from "@/lib/fx/currencyFormatting";


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
  reportingCurrency: string;
}
// =====================================================
// LOCAL DATE PARSER
// FIXES UTC DATE DRIFT
// =====================================================

function parseLocalDate(
  dateString: string
) {

  // =================================================
  // SUPPORTS:
  // 1. YYYY-MM-DD
  // 2. ISO TIMESTAMPS
  // =================================================

  const cleanDate =
    dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

  const [
    year,
    month,
    day,
  ] = cleanDate
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

export default function TradingCalendar({
  trades,
  reportingCurrency,
}: TradingCalendarProps) {

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDay, setSelectedDay] =
  useState<number | null>(null);

const [
  selectedNoteDate,
  setSelectedNoteDate,
] = useState<string | null>(
  null
);

const [
  noteInput,
  setNoteInput,
] = useState("");
const [mounted, setMounted] =
  useState(false);

  const [noteDates, setNoteDates] =
  useState<Set<string>>(new Set());

  useEffect(() => {
  async function loadNoteDates() {
    const notes =
      await loadDailyNotesFromSupabase();

    setNoteDates(
      new Set(
        notes.map((note) => note.date)
      )
    );
  }

  loadNoteDates();
}, []);

  const [
  editingTrade,
  setEditingTrade,
] = useState<Trade | null>(
  null
);


useEffect(() => {

  setMounted(true);

}, []);

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

          const effectiveDate =
  trade.isOpen
    ? (
        trade.openedAt ||
        trade.date
      )
    : (
        trade.closedAt ||
        trade.date
      );

const tradeDate =
  parseLocalDate(
    effectiveDate
  );

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

      const effectiveDate =
  trade.isOpen
    ? (
        trade.openedAt ||
        trade.date
      )
    : (
        trade.closedAt ||
        trade.date
      );

const tradeDate =
  parseLocalDate(
    effectiveDate
  );

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

        const effectiveDate =
  trade.isOpen
    ? (
        trade.openedAt ||
        trade.date
      )
    : (
        trade.closedAt ||
        trade.date
      );

const tradeDate =
  parseLocalDate(
    effectiveDate
  );

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

    return "border-white/[0.06] bg-[#0b1220]";
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
      const formattedDay =
  `${currentYear}-${String(
    currentMonth + 1
  ).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

const hasNote =
  noteDates.has(formattedDay);

    calendarCells.push(

      <button
        key={day}
        onClick={() =>
          setSelectedDay(day)
        }
        className={`relative flex h-[90px] flex-col justify-between rounded-[8px] border p-4 text-left transition-all hover:scale-[1.01] hover:border-blue-500/40 ${
          dayData
            ? getDayIntensity(
                dayData.pnl
              )
            : "border-white/[0.06] bg-[#0b1220]"
        }`}
      >

        <span className="relative left-[8px] top-[4px] text-[11px] font-bold text-slate-400">
          {day}
        </span>
        <div
  role="button"
  tabIndex={0}
  onClick={async (event) => {

  event.stopPropagation();

setNoteInput("");

const existingNote =
  await getDailyNoteFromSupabase(
    formattedDay
  );

setNoteInput(existingNote);
setSelectedNoteDate(formattedDay);
}}
  className={`absolute right-2 top-0 flex h-[20px] w-[20px] items-center justify-center rounded-[7px] transition-all ${
    hasNote
  ? "border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]"
  : "text-slate-600 hover:text-slate-400"
  }`}
>
  <FileText size={12} />
</div>
  

        {dayData ? (

        <div className="relative -top-1 left-[6px]">

          <p
              className={`text-[13px] font-black tracking-tight ${
                dayData.pnl >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {dayData.pnl >= 0 ? "+" : ""}
{getCurrencySymbol(reportingCurrency)}
{dayData.pnl.toFixed(2)}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-slate-300">
              {dayData.trades} Trades
            </p>
          </div>

        ) : (

          <div />
        )}
      </button>
    );
  }

  // =====================================================
// DELETE MANUAL TRADE
// =====================================================

const handleDeleteTrade =
  async (
    trade: Trade
  ) => {

    if (
      !trade.contractKey?.startsWith(
        "MANUAL-"
      )
    ) {

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this manual trade lifecycle?"
      );

    if (!confirmed) {

      return;
    }

    const {
      error,
    } = await supabase
      .from("executions")
      .delete()
      .eq(
        "contract_key",
        trade.contractKey
      );

    if (error) {

      console.error(
        "FAILED TO DELETE MANUAL TRADE:",
        error
      );

      return;
    }

    window.location.reload();
  };


  return (
    <>
{/* ===================================================== */}
{/* CALENDAR */}
{/* ===================================================== */}

<div
  className="
    h-auto
    w-full
    rounded-[32px]

    bg-transparent

    p-4

    shadow-[0_0_60px_rgba(0,0,0,0.30)]

    transition-all
    duration-300

    hover:-translate-y-1
  "
>

  <div
    className="
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]

      p-8

      transition-all
      duration-300

      hover:border-white/[0.08]
      hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
    "
  >

{/* HEADER */}

<div className="flex items-start justify-between">

  {/* LEFT */}

  <div
    className="
      relative
      left-4
      top-1
      flex
      items-center
      gap-5
    "
  >

    <button
      onClick={goToPreviousMonth}
      className="
        flex
        h-[34px]
        w-[34px]
        items-center
        justify-center
        rounded-[14px]
        border
        border-white/[0.05]
        bg-[#0b1730]
        text-slate-400
        transition-all
        hover:border-blue-500/30
        hover:text-slate-300
      "
    >
      <ChevronLeft size={18} />
    </button>

    <div>

      <h2
        className="
          text-[18px]
          font-bold
          tracking-tight
          text-slate-300
        "
      >
        {monthName} {currentYear}
      </h2>

      <p
        className="
          mt-1
          text-[12px]
          font-medium
          text-blue-400
        "
      >
        Trading Performance
      </p>

      <div className="h-[0px]" />

    </div>

    <button
      onClick={goToNextMonth}
      className="
        flex
        h-[34px]
        w-[34px]
        items-center
        justify-center
        rounded-[14px]
        border
        border-white/[0.05]
        bg-[#0b1730]
        text-slate-400
        transition-all
        hover:border-blue-500/30
        hover:text-slate-300
      "
    >
      <ChevronRight size={18} />
    </button>

  </div>

  {/* KPI */}

            <div className="relative right-6 top-2 flex items-center gap-4">

              {[
  {
    label: "Trading Days",
    value: tradingDays,
  },

  {
    label: "Total Trades",
    value: totalTrades,
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
                    className="flex items-center gap-4"
                  >

                    <div>

                      <p className="text-[11px] font-semibold text-slate-500">
                        {stat.label}
                      </p>

                     <p className="mt-2 text-[20px] translate-x-3 font-black tracking-tight text-slate-400">
  {stat.value}
</p>
                    </div>

                    {index !== 1 && (
  <div className="h-10 w-px bg-white/[0.06]" />
)}
                  </div>
                )
              )}
            </div>
          </div>
<div className="h-[22px]" />
          {/* CALENDAR BODY */}

          <div className="mt-16 rounded-[42px] border border-white/[0.00] bg-[#081526]/00 px-12 pt-12 pb-[72px]">

            <div className="w-[calc(100%-36px)] translate-x-[18px] translate-y-[-12px] rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-12 pt-12 pb-[48px]">

              <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                spacer
              </div>

              <div className="grid grid-cols-7 gap-3 pb-8">

                {days.map(
                  (day) => (

                    <div
                      key={day}
                      className="text-center text-[10px] font-black tracking-[0.18em] text-slate-500"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="flex items-start">

                <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                  spacer
                </div>

                <div className="flex-1">

                  <div className="grid grid-cols-7 gap-3 mb-[18px]">

                    {calendarCells}
                  </div>

                  <p className="invisible text-[18px] leading-[18px]">
                    spacing
                  </p>
                </div>

                <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                  spacer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}

      {/* ===================================================== */}
{/* DAILY NOTES MODAL */}
{/* ===================================================== */}

{selectedNoteDate && (

  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

    <div className="w-full max-w-[560px] rounded-[32px] border border-blue-500/15 bg-[linear-gradient(180deg,#13213a_0%,#0a162d_100%)] p-8 shadow-[0_0_90px_rgba(0,0,0,0.60)]">

      <div className="rounded-[8px] border border-white/[0.05] bg-[#0c1a31]/92 px-[28px] pt-[28px] pb-[28px]">
      <div className="flex">

  <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
    spacer
  </div>

  <div className="flex-1">

{/* HEADER */}

        <div className="relative top-[6px] flex items-start justify-between">

          <div>

            <h2 className="text-[22px] font-black tracking-tight text-slate-400">
              Session Notes
            </h2>

            <p className="mt-2 text-[12px] text-slate-400">
              {selectedNoteDate}
            </p>
          </div>

          <button
            onClick={async () => {

              setSelectedNoteDate(
                null
              );

              setNoteInput("");
            }}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-[14px] border border-white/[0.05] bg-white/[0.03] text-slate-400 transition-all hover:text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* SPACER */}

        <div className="h-[10px] opacity-0 select-none">
          spacer
        </div>

        {/* TEXTAREA */}

        <textarea
  style={{
    WebkitAppearance: "none",
  }}
  value={noteInput}
  onChange={(event) =>
    setNoteInput(
      event.target.value
    )
  }
          placeholder="Add trading session notes..."
          className="min-h-[220px] w-full resize-none rounded-[10px] border border-white/[0.06] bg-[#081526]/110 px-[26px] pt-[30px] pb-6 text-sm leading-7 tracking-[0.01em] text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/30"
        />

        {/* SPACER */}

        <div className="h-[08px] opacity-0 select-none">
          spacer
        </div>

        {/* ACTIONS */}

        <div className="flex items-center justify-end gap-4">

          <button
            onClick={async () => {

              setSelectedNoteDate(
                null
              );

              setNoteInput("");
            }}
            className="
  h-[30px]
  w-[60px]

  translate-x-0
  translate-y-0

  rounded-[14px]
  border
  border-white/[0.05]
  bg-white/[0.03]

  text-[12px]
  font-semibold
  text-slate-300

  transition-all
  duration-200

  hover:text-slate-400
"
          >
            Cancel
          </button>

          <button
            onClick={async () => {

              if (
                !selectedNoteDate
              ) {
                return;
              }

              await upsertDailyNoteInSupabase(
              selectedNoteDate,
              noteInput
              );

              setNoteDates((prev) => {
  const next = new Set(prev);

  if (noteInput.trim()) {
    next.add(selectedNoteDate);
  } else {
    next.delete(selectedNoteDate);
  }

  return next;
});

              setSelectedNoteDate(
                null
              );
            }}
                        className="
  h-[30px]
  w-[80px]

  translate-x-0
  translate-y-0

  rounded-[14px]
  border
  border-blue-500/20
  bg-blue-500/10

  text-[12px]
  font-semibold
  text-blue-400

  transition-all
  duration-200

  hover:bg-blue-500/20
"
          >
            Save Notes
          </button>
        </div>
      </div>

      <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
        spacer
      </div>

    </div>

    <p className="invisible text-[16px] leading-[18px]">
      spacing
    </p>

      </div>
    </div>
  </div>
)}
      {selectedDay && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-8 backdrop-blur-sm">

         <div className="w-full max-w-[980px] rounded-[8px] border border-white/[0.06] bg-[#0b1220] p-10 shadow-[0_0_90px_rgba(0,0,0,0.60)]">

           <div className="rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-[28px] pt-[28px] pb-[28px]">

              <div className="flex">

                <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                  spacer
                </div>

                <div className="flex-1">

                  {/* HEADER */}

                  <div className="flex items-start justify-between">

                    <div>

                      <h2 className="text-[24px] font-black tracking-tight text-slate-400">
                        {monthName}{" "}
                        {selectedDay},{" "}
                        {currentYear}
                      </h2>

                      <p className="mt-2 text-[12px] text-slate-400">
                        Institutional Trade Review
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedDay(
                          null
                        )
                      }
                      className="flex h-[40px] w-[40px] items-center translate-y-2 justify-center rounded-[14px] border border-white/[0.05] bg-white/[0.03] text-slate-400 transition-all hover:text-slate-400"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* SAFE ZONE */}

                  <div className="mt-10 rounded-[8px] border border-white/[0.04] bg-[#081526]/70 p-8">
<div className="h-[8px]" />
                    {/* KPI */}

                    <div className="grid grid-cols-5 gap-6">

                      <div className="flex flex-col items-center translate-x-12 justify-center rounded-[8px] border border-white/[0.05] bg-white/[0.02] p-6 text-center">

                        <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                          NET P&L
                        </p>

                        <p
                          className={`mt-4 text-[18px] font-black tracking-tight ${
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

                      <div className="flex flex-col items-center translate-x-18  justify-center rounded-[8px] border border-white/[0.05] bg-white/[0.02] p-6 text-center">

                        <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                          TOTAL TRADES
                        </p>

                        <p className="mt-4 text-[18px] font-black tracking-tight text-slate-400">
                          {
                            totalTradesDay
                          }
                        </p>
                      </div>

                      <div className="flex flex-col items-center translate-x-22  justify-center rounded-[8px] border border-white/[0.05] bg-white/[0.02] p-6 text-center">

                        <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                          COMMISSION
                        </p>

                        <p className="mt-4 text-[18px] font-black tracking-tight text-slate-400">

                          {totalCommission > 0
                            ? `$${totalCommission.toFixed(
                                2
                              )}`
                            : "--"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center translate-x-30  justify-center rounded-[8px] border border-white/[0.05] bg-white/[0.02] p-6 text-center">

                        <p className="text-[11px] font-black tracking-[0.18em] text-slate-500">
                          WIN RATE
                        </p>

                        <p className="mt-4 text-[18px] font-black tracking-tight text-blue-400">
                          {winRate}%
                        </p>
                      </div>
                    </div>

{/* ===================================================== */}
{/* INVISIBLE 18PX SPACER */}
{/* ===================================================== */}

<div className="h-[10px] shrink-0 opacity-0 pointer-events-none select-none">
  spacer
</div>
                    {/* WIN RATE BAR */}

<div className="mt-6 flex justify-center">

  <div className="w-[900px] rounded-[8px] border border-white/[0.06] bg-white/[0.02] p-7">

    <div className="flex items-center justify-between">

      <p className="relative left-4 text-[11px] font-black tracking-[0.18em] text-slate-500">
        WIN RATE
      </p>

      <p className="text-[10px] -translate-x-4 font-bold text-slate-400">
        {wins}W · {losses}L · {winRate}%
      </p>

    </div>

    <div className="mt-6 h-[6px] overflow-hidden rounded-full bg-white/[0.04]">

      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
        style={{
          width: `${winRate}%`,
        }}
      />

    </div>

  </div>

</div>

{/* ===================================================== */}
{/* INVISIBLE 18PX SPACER */}
{/* ===================================================== */}

<div className="h-[10px] shrink-0 opacity-0 pointer-events-none select-none">
  spacer
</div>

<style jsx>{`
  div::-webkit-scrollbar {
    width: 18px;
  }

  div::-webkit-scrollbar-track {
    background: transparent;
  }

  div::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.14);
    border-radius: 999px;
    border: 3px solid transparent;
    background-clip: padding-box;
  }

  div::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.22);
    border: 3px solid transparent;
    background-clip: padding-box;
  }
`}</style>
                    {/* TABLE */}

                    <div className="mt-6 rounded-[8px] border border-white/[0.05] bg-white/[0.02] p-7">

                      <div className="flex items-center justify-between">

                        <p className="relative left-4 text-[11px] font-black tracking-[0.18em] text-slate-500">
                          TRADES
                        </p>

                        <p className="relative right-12 text-sm text-slate-500">
                          {
                            totalTradesDay
                          }{" "}
                          Trades
                        </p>
                      </div>

                      <div className="mt-7 max-h-[420px] overflow-y-auto overflow-x-hidden pr-[6px]">

                        <table className="relative left-6 w-full table-fixed border-collapse">

                          <thead>

                            <tr className="border-b border-white/[0.05]">

                              {[
  "Ticker",
  "Account",
  "Side",
  "Entry",
  "Exit",
  "Net P&L",
  "Commission",
  "Status",
  "",
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
                          

<tr className="opacity-0 pointer-events-none select-none">

  <td
    colSpan={9}
    className="h-[10px] p-0"
  >
    spacer
  </td>
</tr>

                            {selectedTrades.map(
                              (
                                trade,
                                index
                              ) => (

                                <Fragment
                                  key={
                                    index
                                  }
                                >

                                  <tr className="border-b border-white/[0.08]">

                                    <td className="h-[12px] text-center">

  <div className="flex h-full items-center gap-2 text-sm font-semibold text-slate-400">

  {trade.ticker}

  {/* OPEN POSITION */}

  {trade.status === "OPEN" && (

    <div className="group relative flex items-center justify-center">

      {/* LIVE DOT */}

      <div className="h-[10px] w-[10px] rounded-full bg-emerald-400" />

      {/* TOOLTIP */}

      <div className="pointer-events-none absolute bottom-[140%] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/[0.06] bg-[#071427] px-4 py-2 text-[12px] font-semibold tracking-[0.03em] text-slate-300 shadow-[0_0_30px_rgba(0,0,0,0.35)] group-hover:block">

        Position still open

      </div>
    </div>
  )}

  {/* MULTI-DAY CLOSED TRADE */}

  {trade.status !== "OPEN" &&
  trade.holdingDays != null && (

    <div className="group relative flex items-center justify-center">

      {/* HOLD DOT */}

      <div
  className={`h-[10px] w-[10px] rounded-full ${
    trade.holdingDays === 0
      ? "bg-slate-500"
      : "bg-cyan-400"
  }`}
/>

      {/* TOOLTIP */}

      <div className="pointer-events-none absolute bottom-[140%] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/[0.06] bg-[#071427] px-4 py-2 text-[12px] font-semibold tracking-[0.03em] text-slate-300 shadow-[0_0_30px_rgba(0,0,0,0.35)] group-hover:block">

        Held for {trade.holdingDays}{" "}
        {trade.holdingDays === 1
          ? "Day"
          : "Days"}

      </div>
    </div>
  )}

</div>

</td>
<td className="py-6 text-sm font-medium text-slate-300">

  {trade.account || "--"}

</td>

                                    <td
                                      className={`h-[10px] align-middle text-sm font-bold ${
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

                                    <td className="py-6 text-sm text-slate-400">

                                      {trade.entryPrice > 0
                                        ? `$${trade.entryPrice}`
                                        : "--"}
                                    </td>

                                    <td className="py-6 text-sm text-slate-400">

  {trade.exitPrice != null ? (

    trade.exitPrice === 0 &&
    trade.status === "LOSS"

      ? (

        <div className="relative left-[-45px] flex items-center justify-center">

  <span className="text-[12px] font-bold tracking-[0.04em] text-red-400">

    Expired Worthless

  </span>
</div>

      ) : (

        `$${trade.exitPrice}`
      )

  ) : "--"}
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
                                      {Number(trade.pnl) >= 0 ? "+" : ""}
{getCurrencySymbol(reportingCurrency)}
{Number(trade.pnl).toFixed(2)}
                                    </td>

                                    <td className="py-6 text-sm text-slate-400">

                                      {trade.fees > 0
  ? `${getCurrencySymbol(reportingCurrency)}${trade.fees.toFixed(2)}`
  : "--"}
                                    </td>

                                    <td className="relative right-[50px] py-6 text-center">

  <span
  className={`text-[11px] font-bold tracking-[0.04em] ${
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
    {trade.status}
  </span>

</td>
  <td className="py-6">

  {trade.contractKey?.startsWith(
    "MANUAL-"
  ) && (

    <button
      onClick={() =>
        setEditingTrade(
          trade
        )
      }
      className="relative top-[-10px] flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all hover:bg-blue-500/20"
    >
      <Pencil size={14} />
    </button>

  )}

</td>
                                  </tr>

                                  {/* ===================================================== */}
                                  {/* INVISIBLE 18PX SPACER */}
                                  {/* ===================================================== */}

                                  <tr className="opacity-0 pointer-events-none select-none">

                                    <td
                                      colSpan={9}
                                      className="h-[18px] p-0"
                                    >
                                      spacer
                                    </td>
                                  </tr>

                                </Fragment>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                  spacer
                </div>
              </div>

                            <p className="invisible text-[18px] leading-[18px]">
                spacing
              </p>
            </div>
          </div>
        </div>
      )}
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

    </>
  );
}