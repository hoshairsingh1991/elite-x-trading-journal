// components/shared/DateRangePicker.tsx

"use client";

import { useState } from "react";

import { Calendar as CalendarIcon } from "lucide-react";

import type { DateRange } from "react-day-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {

  selectedPreset: string;

  onDateRangeChange: (
    preset: string,
    startDate: Date | null,
    endDate: Date | null
  ) => void;

  widthClass?: string;

}

export default function DateRangePicker({

  selectedPreset,
  onDateRangeChange,
  widthClass,

}: DateRangePickerProps) {

const [open, setOpen] =
  useState(false);


const [dateRange, setDateRange] =
  useState<DateRange | undefined>();

    /* =====================================================
   DATE BUTTON CONTENT
   ===================================================== */

const dateIconX = "translate-x-2";
const dateIconY = "translate-y-0";

const dateLabelX = "translate-x-1";
const dateLabelY = "translate-y-0";

const dateValueX = "-translate-x-2";
const dateValueY = "translate-y-0";

/* =====================================================
   DATE BUTTON SIZE
   ===================================================== */

const dateButtonWidth =
  widthClass ??
  "min-w-[140px] w-fit";
const dateButtonHeight = "h-[46px]";


/* =====================================================
   QUICK HEADER
   ===================================================== */

const quickX = "translate-x-4";
const quickY = "translate-y-2";

/* =====================================================
   PRESET LIST
   ===================================================== */

const presetListX = "translate-x-4";
const presetListY = "translate-y-5";

/* =====================================================
   DIVIDER
   ===================================================== */

const dividerX = "translate-x-0";
const dividerY = "-translate-y-38";

/* =====================================================
   RESET
   ===================================================== */

const resetX = "translate-x-4";
const resetY = "translate-y-2";

    /* =====================================================
   SIDEBAR POSITION TUNING
   ===================================================== */

const sidebarX = "translate-x-0";
const sidebarY = "translate-y-0";

/* =====================================================
   SIDEBAR WIDTH
   ===================================================== */

const sidebarWidth = "w-[140px]";

    /* =====================================================
   CALENDAR POSITION TUNING
   ===================================================== */

const calendarAreaX = "-translate-x-4";
const calendarAreaY = "translate-y-2";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >


<PopoverTrigger asChild>

  <button
    className={`
      ${dateButtonWidth}
      ${dateButtonHeight}

inline-flex
items-center
justify-between
gap-6

      rounded-2xl
      border
      border-white/10

      bg-white/[0.03]

      px-5

      text-sm
      text-slate-300

      transition-all
      duration-200

      hover:border-white/20
      hover:bg-white/[0.05]
    `}
  >
<div className="flex items-center gap-3">

  <CalendarIcon
    size={16}
    className={`
      ${dateIconX}
      ${dateIconY}
    `}
  />

  <span
    className={`
      ${dateLabelX}
      ${dateLabelY}
    `}
  >
    Date Range
  </span>

</div>

<span
  className={`
    whitespace-nowrap
    text-slate-500

    ${dateValueX}
    ${dateValueY}
  `}
>
  {selectedPreset}
</span>
        </button>

      </PopoverTrigger>

<PopoverContent
  align="end"
  sideOffset={10}
  className="
  z-[9999]
    w-[480px]
    h-[540px]

    overflow-hidden

    rounded-2xl
    border
    border-white/10

    bg-[#111827]

    p-0

    shadow-[0_25px_80px_rgba(0,0,0,0.65)]
  "
>
  <div
    className="
      grid
      h-full
      grid-cols-[180px_1fr]
    "
  >
    {/* ================================================= */}
    {/* LEFT SIDEBAR */}
    {/* ================================================= */}

<div
  className={`
    flex
    flex-col

    ${sidebarWidth}

    border-r
    border-white/10

    bg-white/[0.02]

    ${sidebarX}
    ${sidebarY}
  `}
>
      {/* Header */}

      <div
  className={`
    px-5
    pt-4

    ${quickX}
    ${quickY}
  `}
>
        <div
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.15em]

            text-slate-500
          "
        >
          Quick
        </div>
      </div>

      {/* Presets */}

      <div
  className={`
    flex-1

    px-3
    py-3

    ${presetListX}
    ${presetListY}
  `}
>
        <div className="space-y-1">
          {[
  "Today",
  "This Week",
  "This Month",
  "Last 30 Days",
  "Last Month",
  "This Quarter",
  "YTD",
  "Last Year",
  "All Time",
].map((item) => (
  <div key={item}>
<button
onClick={() => {

  const today =
    new Date();

  let startDate:
    Date | null = null;

  let endDate:
    Date | null = today;

  switch (item) {

    case "Today":

      startDate =
        new Date(today);

      break;

    case "This Week": {

      startDate =
        new Date(today);

      startDate.setDate(
        today.getDate() -
        today.getDay()
      );

      break;
    }

    case "This Month":

      startDate =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

      break;

   case "Last 30 Days":

  startDate =
    new Date(today);

  startDate.setDate(
    today.getDate() - 30
  );

  startDate.setHours(
    0,
    0,
    0,
    0
  );

  endDate =
    new Date(today);

  endDate.setHours(
    23,
    59,
    59,
    999
  );

  break;

    case "Last Month":

      startDate =
        new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );

      endDate =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );

      break;

    case "This Quarter": {

      const quarterStartMonth =
        Math.floor(
          today.getMonth() / 3
        ) * 3;

      startDate =
        new Date(
          today.getFullYear(),
          quarterStartMonth,
          1
        );

      break;
    }

    case "YTD":

      startDate =
        new Date(
          today.getFullYear(),
          0,
          1
        );

      break;

    case "Last Year":

      startDate =
        new Date(
          today.getFullYear() - 1,
          0,
          1
        );

      endDate =
        new Date(
          today.getFullYear() - 1,
          11,
          31
        );

      break;

    case "All Time":

      startDate = null;
      endDate = null;

      break;
  }

  setDateRange(
  startDate && endDate
    ? {
        from: startDate,
        to: endDate,
      }
    : undefined
);

  onDateRangeChange(
    item,
    startDate,
    endDate
  );

  setOpen(false);

}}
  className="
    text-left
    text-[15px]

    text-slate-300

    transition-all
    duration-200

    hover:text-white
hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.20)]
hover:tracking-[0.01em]
  "
>
      {item}
    </button>

    <div className="h-4" />
  </div>
))}
        </div>
      </div>

      {/* Footer */}

<div
  className={`
    border-t
    border-white/10

    px-4
    py-4

    ${dividerX}
    ${dividerY}
  `}
>
<div
  className={`
    ${resetX}
    ${resetY}
  `}
>
<button
  onClick={() => {

    setDateRange(
      undefined
    );

    onDateRangeChange(
      "All Time",
      null,
      null
    );

  }}
  className="
    text-[14px]
    text-slate-500
    hover:text-white
  "
>
  Reset
</button>
</div>
</div>
    </div>

    {/* ================================================= */}
    {/* CALENDAR AREA */}
    {/* ================================================= */}

<div
  className={`
    flex-1

    px-12
    py-6

    ${calendarAreaX}
    ${calendarAreaY}
  `}
>
     <Calendar
  mode="range"
  numberOfMonths={2}
  selected={dateRange}
onSelect={(range) => {

  setDateRange(
    range
  );

  onDateRangeChange(
    "Custom",
    range?.from ?? null,
    range?.to ?? null
  );

}}
/>
    </div>
  </div>
</PopoverContent>

    </Popover>
  );
}