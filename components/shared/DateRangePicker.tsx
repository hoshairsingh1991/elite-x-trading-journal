// components/shared/DateRangePicker.tsx

"use client";

import { useEffect, useState } from "react";

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

  heightClass?: string;

  variant?: "default" | "tradeHistory";
}

export default function DateRangePicker({

  selectedPreset,
  onDateRangeChange,
  widthClass,
  heightClass,
  variant = "default",

}: DateRangePickerProps) {

const [open, setOpen] =
  useState(false);


const [dateRange, setDateRange] =
  useState<DateRange | undefined>();

  const [calendarMonth, setCalendarMonth] = useState<Date>(
  new Date()
);

const calculatePresetRange = (
  preset: string
): DateRange | undefined => {

  const today = new Date();

  switch (preset) {

    case "Today":
      return {
        from: new Date(today),
        to: new Date(today),
      };


    case "This Week": {

      const start = new Date(today);

      start.setDate(
        today.getDate() - today.getDay()
      );

      return {
        from: start,
        to: new Date(today),
      };
    }


    case "This Month":
      return {
        from: new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        ),
        to: new Date(today),
      };


    case "Last 30 Days": {

      const start = new Date(today);

      start.setDate(
        today.getDate() - 30
      );

      return {
        from: start,
        to: new Date(today),
      };
    }


    case "Last Month":
      return {
        from: new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        ),
        to: new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ),
      };


    case "This Quarter": {

      const quarterStartMonth =
        Math.floor(today.getMonth() / 3) * 3;

      return {
        from: new Date(
          today.getFullYear(),
          quarterStartMonth,
          1
        ),
        to: new Date(today),
      };
    }


    case "YTD":
      return {
        from: new Date(
          today.getFullYear(),
          0,
          1
        ),
        to: new Date(today),
      };


    case "Last Year":
      return {
        from: new Date(
          today.getFullYear() - 1,
          0,
          1
        ),
        to: new Date(
          today.getFullYear() - 1,
          11,
          31
        ),
      };


    case "All Time":
      return undefined;


    default:
      return undefined;
  }
};

const [displayRange, setDisplayRange] =
  useState<DateRange | undefined>(
    calculatePresetRange(selectedPreset)
  );

useEffect(() => {

  setDisplayRange(
    calculatePresetRange(selectedPreset)
  );

}, [selectedPreset]);

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
const dateButtonHeight =
  heightClass ??
  "h-[46px]";

  // =====================================================
// TRADE HISTORY VARIANT
// =====================================================

const dateButtonRadius =
  variant === "tradeHistory"
    ? "rounded-[8px]"
    : "rounded-2xl";

const dateButtonBorder =
  variant === "tradeHistory"
    ? "border-white/[0.06]"
    : "border-white/10";

const dateButtonBackground =
  variant === "tradeHistory"
    ? "bg-[#0b1220]"
    : "bg-white/[0.03]";


/* =====================================================
   QUICK HEADER
   ===================================================== */

const quickX = "translate-x-4";
const quickY = "translate-y-2";

/* =====================================================
   PRESET LIST
   ===================================================== */

const presetListX = "translate-x-5";
const presetListY = "translate-y-5";

const activePresetX = "translate-x-0";
const activePresetWidth = "w-[100px]";
const activePresetHeight = "h-[34px]";

/* =====================================================
   DIVIDER
   ===================================================== */

const dividerX = "translate-x-0";
const dividerY = "translate-y-6";

/* =====================================================
   RESET
   ===================================================== */

const resetX = "translate-x-5";
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
const calendarAreaY = "translate-y-0";

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

${dateButtonRadius}
border
${dateButtonBorder}

${dateButtonBackground}

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
  {
    displayRange?.from &&
    displayRange?.to
      ? `${displayRange.from.toLocaleDateString(
          "en-US",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )} - ${displayRange.to.toLocaleDateString(
          "en-US",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )}`
      : "Date Range"
  }
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
min-h-[520px]
h-auto
overflow-visible

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

  let endDate: Date | null = null;

  switch (item) {

case "Today": {

  startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  break;
}

case "This Week": {

  startDate = new Date(today);

  startDate.setDate(
    today.getDate() -
    today.getDay()
  );

  startDate.setHours(0, 0, 0, 0);

  endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  break;
}

case "This Month":

  startDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

  startDate.setHours(0, 0, 0, 0);

  endDate =
    new Date(today);

  endDate.setHours(
    23,
    59,
    59,
    999
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

  startDate.setHours(
    0,
    0,
    0,
    0
  );

  endDate.setHours(
    23,
    59,
    59,
    999
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

  startDate.setHours(0, 0, 0, 0);

  endDate =
    new Date(today);

  endDate.setHours(
    23,
    59,
    59,
    999
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

  startDate.setHours(0, 0, 0, 0);

  endDate =
    new Date(today);

  endDate.setHours(
    23,
    59,
    59,
    999
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

  startDate.setHours(
    0,
    0,
    0,
    0
  );

  endDate.setHours(
    23,
    59,
    59,
    999
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

setDisplayRange(
  calculatePresetRange(item)
);

  setOpen(false);

}}
className={`
  text-left
  text-[15px]

  rounded-lg

  transition-all
  duration-200

${
  selectedPreset === item
    ? `
      relative
      z-0
      text-white

      before:absolute
      before:-inset-y-1
      before:left-0
      before:h-[30px]
      ${
        item === "YTD"
          ? "before:w-[60px]"
          : "before:w-[112px]"
      }
      before:-translate-x-3
      before:rounded-lg
      before:bg-white/20
      before:content-['']
      before:z-[-1]
    `
    : `
      text-slate-300
      hover:text-white
      hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.20)]
      hover:tracking-[0.01em]
    `
}
`}
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

  setDateRange(undefined);

  setCalendarMonth(new Date());

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
  month={calendarMonth}
  onMonthChange={setCalendarMonth}

classNames={{
  day_button: `
    data-[range-start=true]:bg-white
    data-[range-start=true]:text-black
    data-[range-start=true]:rounded-full

    data-[range-end=true]:bg-white
    data-[range-end=true]:text-black
    data-[range-end=true]:rounded-full
  `,

  range_start:
    "bg-transparent",

  range_middle:
    "bg-transparent",

  range_end:
    "bg-transparent",
}}

  onSelect={(range) => {

    setDateRange(range);

    setDisplayRange(range);

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