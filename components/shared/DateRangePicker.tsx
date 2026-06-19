// components/shared/DateRangePicker.tsx

"use client";

import { useState } from "react";

import { Calendar as CalendarIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

export default function DateRangePicker() {

  const [open, setOpen] =
    useState(false);

    /* =====================================================
   DATE BUTTON CONTENT
   ===================================================== */

const dateIconX = "translate-x-2";
const dateIconY = "translate-y-0";

const dateLabelX = "translate-x-0";
const dateLabelY = "translate-y-0";

const dateValueX = "-translate-x-2";
const dateValueY = "translate-y-0";

/* =====================================================
   DATE BUTTON SIZE
   ===================================================== */

const dateButtonWidth = "w-[180px]";
const dateButtonHeight = "h-[50px]";


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
const dividerY = "-translate-y-45";

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

      flex
      items-center
      justify-between

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

          <span
  className={`
    text-slate-500

    ${dateValueX}
    ${dateValueY}
  `}
>
  All Time
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
].map((item) => (
  <div key={item}>
<button
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
      />
    </div>
  </div>
</PopoverContent>

    </Popover>
  );
}