"use client";

import {
  CalendarDays,
  ChevronDown,
  CircleHelp,
} from "lucide-react";

import UserMenuV2 from "@/components/layout/UserMenuV2";

/* =====================================================
   REPORTING CURRENCY FINE TUNING
   ===================================================== */

// Move Reporting content (flag + text)
const reportingContentOffset = "translate-x-3";

// Move Reporting chevron
const reportingChevronX = "-translate-x-2";
const reportingChevronY = "translate-y-1";

/* =====================================================
   LIVE FX FINE TUNING
   ===================================================== */

// Move entire Live FX text block
const liveFxContentX = "translate-x-5";
const liveFxContentY = "translate-y-0";

// Move green status dot
const liveFxDotX = "translate-x-2";
const liveFxDotY = "translate-y-0.5";

// Move info icon
const liveFxInfoX = "translate-x-0";
const liveFxInfoY = "translate-y-0";

/* =====================================================
   DATE RANGE FINE TUNING
   ===================================================== */

// Move entire date content block
const dateContentX = "translate-x-2";
const dateContentY = "translate-y-0";

// Move calendar icon
const dateIconX = "translate-x-0";
const dateIconY = "translate-y-0";

// Move dropdown chevron
const dateChevronX = "-translate-x-1";
const dateChevronY = "translate-y-0";

export default function ExpensesHeader() {
  /* =====================================================
     EASY UI TUNING
     ===================================================== */

  // Move entire toolbar left/right
  const toolbarOffset = "-translate-x-2";

  // Gap between cards
  const toolbarGap = "gap-4";

  // Card sizing
  const reportingWidth = "w-[170px]";
  const reportingHeight = "h-[50px]";

  const liveFxWidth = "w-[140px]";
  const liveFxHeight = "h-[50px]";

  const dateWidth = "w-[205px]";
  const dateHeight = "h-[50px]";

  return (
    <header className="flex w-full items-start justify-between">
      {/* ================================================= */}
      {/* LEFT */}
      {/* ================================================= */}

      <div className="flex min-w-0 flex-col">
        <h1 className="text-[38px] font-bold leading-none tracking-[-0.02em] text-white">
          Expenses
        </h1>

        <p className="mt-2 text-[16px] font-medium text-slate-400">
          Track and analyze all trading business expenses
        </p>
      </div>

      {/* ================================================= */}
      {/* RIGHT TOOLBAR */}
      {/* ================================================= */}

      <div
        className={`flex shrink-0 items-center ${toolbarGap} ${toolbarOffset}`}
      >
        {/* ============================================= */}
        {/* Reporting Currency */}
        {/* ============================================= */}

        <button
          type="button"
          className={`
            ${reportingWidth}
            ${reportingHeight}

            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]

            px-5

            transition-all
            duration-200

            hover:border-white/20
            hover:bg-white/[0.05]

            flex
            items-center
            justify-center
          `}
        >
       <div className="flex w-full items-center justify-between">
  <div
    className={`flex flex-col justify-center ${reportingContentOffset}`}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
      Reporting Currency
    </span>

    <div className="mt-[2px] flex items-center gap-1.5">
      <span>🇨🇦</span>

      <span className="text-[15px] font-semibold text-white">
        CAD
      </span>
    </div>
  </div>

  <ChevronDown
  className={`h-4 w-4 text-slate-500 ${reportingChevronX} ${reportingChevronY}`}
/>
</div>
        </button>

{/* ============================================= */}
{/* Live FX */}
{/* ============================================= */}

<div
  className={`
    ${liveFxWidth}
    ${liveFxHeight}

    rounded-2xl
    border
    border-white/10
    bg-white/[0.03]

    px-5

    transition-all
    duration-200

    hover:border-white/20
    hover:bg-white/[0.05]

    flex
    items-center
  `}
>
  {/* Green Dot */}
  <div
    className={`
      mr-2
      h-2.5
      w-2.5
      rounded-full
      bg-emerald-400

      ${liveFxDotX}
      ${liveFxDotY}
    `}
  />

  {/* Text */}
  <div
    className={`
      flex
      flex-col
      justify-center

      ${liveFxContentX}
      ${liveFxContentY}
    `}
  >
    <span className="text-[15px] font-semibold leading-none text-white">
      Live FX
    </span>

    <div className="mt-[3px] flex items-center gap-1">
      <span className="text-[11px] text-slate-400">
        ECB Daily Rates
      </span>

      <CircleHelp
        className={`
          h-3
          w-3
          text-slate-500

          ${liveFxInfoX}
          ${liveFxInfoY}
        `}
      />
    </div>
  </div>
</div>

{/* ============================================= */}
{/* Date Range */}
{/* ============================================= */}

<button
  type="button"
  className={`
    ${dateWidth}
    ${dateHeight}

    rounded-2xl
    border
    border-white/10
    bg-white/[0.03]

    px-5

    transition-all
    duration-200

    hover:border-white/20
    hover:bg-white/[0.05]

    flex
    items-center
    justify-center
  `}
>
  <div className="flex w-full items-center justify-between">
    {/* Left Side */}
    <div
      className={`
        flex
        items-center
        gap-3

        ${dateContentX}
        ${dateContentY}
      `}
    >
      <CalendarDays
        className={`
          h-4
          w-4
          text-slate-400

          ${dateIconX}
          ${dateIconY}
        `}
      />

      <span className="text-[15px] font-medium text-white">
        Jun 1 – Jun 11, 2026
      </span>
    </div>

    {/* Chevron */}
    <ChevronDown
      className={`
        h-4
        w-4
        text-slate-500

        ${dateChevronX}
        ${dateChevronY}
      `}
    />
  </div>
</button>

{/* ============================================= */}
{/* USER MENU */}
{/* ============================================= */}

<div className="relative z-[100] flex h-[50px] items-center justify-center">
  <UserMenuV2
    totalTrades={0}
    totalPnL={0}
    tradingDays={0}
  />
</div>
      </div>
    </header>
  );
}