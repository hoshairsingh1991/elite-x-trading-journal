"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

import TradingCalendarNotes from "./TradingCalendarNotes";

import { Trade } from "@/types/trade";


import {
  loadDailyNotesFromSupabase,
} from "@/lib/storage/supabaseDailyNotesStorage";

import DailyReviewModal
from "@/components/dashboard/daily-review/DailyReviewModal";

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
  allTrades?: Trade[];
  startDate?: Date | null;
  endDate?: Date | null;
  reportingCurrency: string;
  onTradesChanged: () => Promise<void>;
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

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export default function TradingCalendar({
  trades,
  allTrades = trades,
  startDate = null,
  endDate = null,
  reportingCurrency,
}: TradingCalendarProps) {

  const [currentDate, setCurrentDate] =
    useState(new Date());

const [selectedDate, setSelectedDate] =
  useState<string | null>(null);

const [
  selectedNoteDate,
  setSelectedNoteDate,
] = useState<string | null>(
  null
);

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


  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

      // =====================================================
  // DASHBOARD DATE RANGE
  // =====================================================

  const hasValidDateRange =
    Boolean(
      startDate &&
      endDate &&
      Number.isFinite(startDate.getTime()) &&
      Number.isFinite(endDate.getTime()) &&
      startDate.getTime() <= endDate.getTime()
    );

  const rangeStartDate =
    hasValidDateRange && startDate
      ? new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        )
      : null;

  const rangeEndDate =
    hasValidDateRange && endDate
      ? new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        )
      : null;

const dateRangeKey =
  `${startDate?.getTime() ?? "none"}:${endDate?.getTime() ?? "none"}`;

const [
  previousDateRangeKey,
  setPreviousDateRangeKey,
] = useState<string | null>(null);

if (previousDateRangeKey !== dateRangeKey) {
  setPreviousDateRangeKey(dateRangeKey);

  const targetDate =
    rangeEndDate ?? new Date();

  setCurrentDate(
    new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    )
  );

  setSelectedDate(null);
}

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

  // =====================================================
  // VISIBLE CALENDAR RANGE
  // =====================================================

  const monthStartDate =
    new Date(
      currentYear,
      currentMonth,
      1
    );


  const visibleStartDate =
    monthStartDate;

  const firstVisibleDayOfWeek =
    firstDayOfMonth;

  const visibleDayCount =
    daysInMonth;

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    );

function goToPreviousMonth() {

  const previousMonth =
    new Date(
      currentYear,
      currentMonth - 1,
      1
    );

  const firstAllowedMonth =
    rangeStartDate
      ? new Date(
          rangeStartDate.getFullYear(),
          rangeStartDate.getMonth(),
          1
        )
      : null;

  if (
    firstAllowedMonth &&
    previousMonth < firstAllowedMonth
  ) {
    return;
  }

  setCurrentDate(previousMonth);
}

function goToNextMonth() {

  const nextMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      1
    );

  const lastAllowedMonth =
    rangeEndDate
      ? new Date(
          rangeEndDate.getFullYear(),
          rangeEndDate.getMonth(),
          1
        )
      : null;

  if (
    lastAllowedMonth &&
    nextMonth > lastAllowedMonth
  ) {
    return;
  }

  setCurrentDate(nextMonth);
}

function moveSelectedDate(direction: number) {
  if (!selectedDate) {
    return;
  }

  const nextDate = parseLocalDate(selectedDate);

  nextDate.setDate(
    nextDate.getDate() + direction
  );

  setCurrentDate(
    new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      1
    )
  );

  setSelectedDate(
    formatDateKey(nextDate)
  );
}

  // =====================================================
  // MONTH TRADES
  // =====================================================



// =====================================================
// TRADES BY DAY
// =====================================================

const tradesByDate: Record<
  string,
  {
    pnl: number;
    trades: number;
  }
> = {};

trades.forEach((trade) => {
  const isOpenTrade =
    trade.isOpen ||
    trade.status === "OPEN";

  const effectiveDate =
    isOpenTrade
      ? (trade.openedAt || trade.date)
      : (trade.closedAt || trade.date);

  const tradeDate =
    parseLocalDate(effectiveDate);

  const dateKey =
    formatDateKey(tradeDate);

  if (!tradesByDate[dateKey]) {
    tradesByDate[dateKey] = {
      pnl: 0,
      trades: 0,
    };
  }

  // Count both open and closed trades.
  tradesByDate[dateKey].trades += 1;

  // Only closed trades contribute to realized P&L.
  if (!isOpenTrade) {
    tradesByDate[dateKey].pnl +=
      Number(trade.pnl || 0);
  }
});

// =====================================================
// SELECTED DAY TRADES
// =====================================================

const selectedTrades =
  trades.filter(
    (trade) => {
      if (!selectedDate) {
        return false;
      }

const isOpenTrade =
  trade.isOpen ||
  trade.status === "OPEN";

const effectiveDate =
  isOpenTrade
    ? (trade.openedAt || trade.date)
    : (trade.closedAt || trade.date);

      const tradeDate =
        parseLocalDate(effectiveDate);

      return (
        formatDateKey(tradeDate) ===
        selectedDate
      );
    }
  );

// =====================================================
// MONTH STATS
// =====================================================


// Includes days with either open or closed trades.
const tradingDays =
  Object.keys(tradesByDate).length;

// Includes both open and closed trades.
const totalTrades =
  trades.length;

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
    i < firstVisibleDayOfWeek;
    i++
  ) {
    calendarCells.push(
      <div key={`empty-${i}`} />
    );
  }

  for (
    let offset = 0;
    offset < visibleDayCount;
    offset++
  ) {
    const calendarDate =
      new Date(
        visibleStartDate.getFullYear(),
        visibleStartDate.getMonth(),
        visibleStartDate.getDate() + offset
      );

    const day =
      calendarDate.getDate();

    const formattedDay =
      formatDateKey(calendarDate);

    const dayData =
      tradesByDate[formattedDay];

    const hasNote =
      noteDates.has(formattedDay);

    calendarCells.push(
      <button
        key={formattedDay}
        onClick={() =>
          setSelectedDate(formattedDay)
        }
        className={`relative flex h-[84px] flex-col justify-between rounded-[8px] border p-4 text-left transition-all hover:scale-[1.01] hover:border-blue-500/40 ${
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
          onClick={(event) => {
            event.stopPropagation();
            setSelectedNoteDate(formattedDay);
          }}
          className={`absolute right-0 top-0 flex h-[20px] w-[20px] items-center justify-center rounded-[7px] transition-all ${
            hasNote
              ? "text-blue-400"
              : "text-slate-600 hover:text-slate-400"
          }`}
        >
<FileText
  size={12}
  className={`transition-all duration-200 ease-out hover:scale-110 ${
    hasNote
      ? "drop-shadow-[0_0_5px_rgba(59,130,246,0.85)] hover:drop-shadow-[0_0_7px_rgba(96,165,250,1)]"
      : ""
  }`}
/>
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
// SELECTED DATE DETAILS
// =====================================================

const selectedDateObject =
  selectedDate
    ? parseLocalDate(selectedDate)
    : null;

const selectedModalDay =
  selectedDateObject?.getDate() ?? null;

const selectedModalMonth =
  selectedDateObject?.getMonth() ?? null;

const selectedModalYear =
  selectedDateObject?.getFullYear() ?? null;

const selectedModalMonthName =
  selectedDateObject?.toLocaleString(
    "default",
    {
      month: "long",
    }
  ) ?? "";

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
{/* DAILY NOTES MODAL */}
{/* ===================================================== */}

{selectedNoteDate && (
  <TradingCalendarNotes
    selectedDate={selectedNoteDate}
    onSelectedDateChange={setSelectedNoteDate}
    onNotesChanged={(date, hasNote) => {
      setNoteDates((previous) => {
        const next = new Set(previous);

        if (hasNote) {
          next.add(date);
        } else {
          next.delete(date);
        }

        return next;
      });
    }}
  />
)}


{selectedDate &&
  selectedModalDay !== null &&
  selectedModalMonth !== null &&
  selectedModalYear !== null && (
    <DailyReviewModal
      selectedDay={selectedModalDay}
      currentMonth={selectedModalMonth}
      monthName={selectedModalMonthName}
      currentYear={selectedModalYear}
      selectedTrades={selectedTrades}
      allTrades={allTrades}
      reportingCurrency={reportingCurrency}
      onPreviousDay={() =>
        moveSelectedDate(-1)
      }
      onNextDay={() =>
        moveSelectedDate(1)
      }
      onClose={() =>
        setSelectedDate(null)
      }
    />
  )}

    </>
  );
}