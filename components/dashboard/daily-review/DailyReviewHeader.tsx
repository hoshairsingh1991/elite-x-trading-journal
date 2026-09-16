"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  X,
} from "lucide-react";

import {
  DailyReviewHeaderProps,
} from "./dailyReviewTypes";

function parseDateTime(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

export default function DailyReviewHeader({
  selectedDay,
  currentMonth,
  monthName,
  currentYear,
  selectedTrades,
  onClose,
}: DailyReviewHeaderProps) {

  const tradingStart =
    selectedTrades.reduce(
      (
        earliest,
        trade
      ) => {

        const candidate =
          parseDateTime(
            trade.openedAt
          );

        if (!candidate) {
          return earliest;
        }

        if (!earliest) {
          return candidate;
        }

        return candidate < earliest
          ? candidate
          : earliest;
      },
      null as Date | null
    );

  const tradingEnd =
    selectedTrades.reduce(
      (
        latest,
        trade
      ) => {

        const candidate =
          parseDateTime(
            trade.closedAt
          );

        if (!candidate) {
          return latest;
        }

        if (!latest) {
          return candidate;
        }

        return candidate > latest
          ? candidate
          : latest;
      },
      null as Date | null
    );

  const date =
    new Date(
      currentYear,
      currentMonth,
      selectedDay
    );

  const weekday =
    date.toLocaleDateString(
      undefined,
      {
        weekday: "long",
      }
    );

  const sessionStart =
    tradingStart
      ? tradingStart.toLocaleTimeString(
          undefined,
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "—";

  const sessionEnd =
    tradingEnd
      ? tradingEnd.toLocaleTimeString(
          undefined,
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "—";

  return (
    <header
      className="
        flex
        min-h-[76px]
        w-full
        min-w-0
        items-center
        justify-between
        gap-4
      "
    >

      {/* ================================================= */}
      {/* LEFT SIDE */}
      {/* ================================================= */}

      <div
        className="
          flex
          min-w-0
          shrink
          items-center
          gap-3
        "
      >

        {/* BACK */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="Close daily review"
        >
          <ChevronLeft size={16} />
        </button>

        {/* CALENDAR */}

        <button
          type="button"
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="Calendar"
        >
          <CalendarDays size={16} />
        </button>

        {/* DATE */}

        <div className="min-w-0 shrink">
          <h1
            className="
              truncate
              text-[20px]
              font-black
              tracking-tight
              text-slate-100
            "
          >
            {monthName} {selectedDay}, {currentYear}
          </h1>

          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              font-medium
              text-slate-500
            "
          >
            {weekday}
          </p>
        </div>

      </div>

      {/* ================================================= */}
      {/* RIGHT SIDE */}
      {/* ================================================= */}

      <div
        className="
          flex
          min-w-0
          shrink
          items-center
          justify-end
          gap-2
        "
      >

        {/* TRADING DAY */}

        <div
          className="
            hidden
            h-[34px]
            w-[108px]
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            lg:flex
          "
        >
          <span
            className="
              h-[6px]
              w-[6px]
              rounded-full
              bg-emerald-400
            "
          />

          <span
            className="
              text-[12px]
              font-semibold
              text-emerald-400
            "
          >
            Trading Day
          </span>
        </div>

        {/* US MARKETS */}

        <div
          className="
            hidden
            h-[34px]
            w-[92px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            lg:flex
          "
        >
          <span
            className="
              text-[12px]
              font-semibold
              text-slate-400
            "
          >
            US Markets
          </span>
        </div>

        {/* SESSION */}

        <div
          className="
            hidden
            h-[34px]
            w-[148px]
            shrink-0
            items-center
            justify-center
            gap-1.5
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            xl:flex
          "
        >
          <Clock3
            size={12}
            className="text-slate-500"
          />

          <span
            className="
              truncate
              text-[12px]
              font-semibold
              text-slate-400
            "
          >
            {sessionStart} – {sessionEnd}
          </span>
        </div>

        {/* ACCOUNT */}

        <button
          type="button"
          className="
            hidden
            h-[34px]
            w-[100px]
            shrink-0
            items-center
            justify-center
            gap-1
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-[12px]
            font-semibold
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
            xl:flex
          "
        >
          All Accounts

          <ChevronRight
            size={12}
            className="rotate-90"
          />
        </button>

        {/* REPLAY */}

        <button
          type="button"
          className="
            hidden
            h-[34px]
            w-[90px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-[12px]
            font-semibold
            text-violet-300
            transition-all
            hover:border-violet-500/20
            hover:bg-[#0d1426]
            xl:flex
          "
        >
          Replay Day
        </button>

        {/* MORE */}

        <button
          type="button"
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-slate-400
            transition-all
            hover:border-white/[0.12]
            hover:text-slate-200
          "
          aria-label="Close"
        >
          <X size={16} />
        </button>

      </div>

    </header>
  );
}