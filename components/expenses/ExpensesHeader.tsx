"use client";

import {
  CalendarDays,
  ChevronDown,
  CircleHelp,
} from "lucide-react";

import UserMenuV2 from "@/components/layout/UserMenuV2";

import DateRangePicker from "@/components/shared/DateRangePicker";

import CurrencyFlag from "@/components/ui/CurrencyFlag";

import { FileDown } from "lucide-react";

/* =====================================================
   REPORTING CURRENCY FINE TUNING
   ===================================================== */

// Move Reporting content (flag + text)
const reportingContentOffset = "translate-x-3";

// Move Reporting chevron
const reportingChevronX = "-translate-x-2";
const reportingChevronY = "translate-y-1";


/* =====================================================
   EXPORT PDF FINE TUNING
   ===================================================== */

const exportContentOffset = "translate-x-0";

const exportIconX = "translate-x-0";
const exportIconY = "translate-y-0";

const exportTextX = "translate-x-0";
const exportTextY = "translate-y-0";

const exportWidth = "w-[140px]";
const exportHeight = "h-[46px]";


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

interface ExpensesHeaderProps {
  reportingCurrency: string;

  selectedPreset: string;

  onDateRangeChange: (
    preset: string,
    startDate: Date | null,
    endDate: Date | null
  ) => void;
  onExport: () => void;
}

export default function ExpensesHeader({
  reportingCurrency,
  selectedPreset,
  onDateRangeChange,
  onExport,
}: ExpensesHeaderProps) {

  const CURRENCY_FLAGS: Record<
  string,
  string
> = {
  USD: "🇺🇸",
  CAD: "🇨🇦",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  INR: "🇮🇳",
};


  /* =====================================================
     EASY UI TUNING
     ===================================================== */

  // Move entire toolbar left/right
  const toolbarOffset = "-translate-x-2";

  // Gap between cards
  const toolbarGap = "gap-3";

  // Card sizing
  const reportingWidth = "w-[160px]";
  const reportingHeight = "h-[46px]";

  const liveFxWidth = "w-[140px]";
  const liveFxHeight = "h-[46px]";


  return (
    <header className="flex w-full -translate-y-[0px] items-start justify-between">
      {/* ================================================= */}
      {/* LEFT */}
      {/* ================================================= */}

      <div className="flex min-w-0 flex-col">
        <h1 className="text-[22px] translate-x-4 font-bold leading-none tracking-[-0.02em] text-white">
          Expenses
        </h1>

        <p className="mt-2 text-[14px] translate-x-4 font-medium text-slate-400">
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

            rounded-[8px]
border
border-white/[0.06]
bg-[#0b0c1e]

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

    <span
      className="
        -translate-y-[2px]
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-slate-500
      "
    >
      Reporting Currency
    </span>

    <div
      className="
        mt-[2px]
        flex
        items-center
        gap-1.5
      "
    >

      <CurrencyFlag
        currency={reportingCurrency}
      />

      <span
        className="
          text-[12px]
          font-semibold
          text-white
        "
      >
        {reportingCurrency}
      </span>

    </div>

  </div>

</div>
        </button>


{/* ============================================= */}
{/* Date Range */}
{/* ============================================= */}

<DateRangePicker
  selectedPreset={
    selectedPreset
  }
  onDateRangeChange={
    onDateRangeChange
  }
/>

{/* ============================================= */}
{/* EXPORT PDF */}
{/* ============================================= */}

<button
  type="button"
onClick={onExport}
  className={`
    ${exportWidth}
    ${exportHeight}

    rounded-[8px]
    border
    border-sky-500/20

    bg-white/[0.03]

    px-5

    transition-all
    duration-200

    hover:border-sky-400/40
    hover:bg-sky-500/[0.05]
    hover:shadow-[0_0_16px_rgba(14,165,233,0.10)]

    flex
    items-center
    justify-center
  `}
>
  <div className="flex items-center gap-2.5">

    {/* Icon Badge */}

    <div
      className="
        flex
        h-6
        w-6
        items-center
        justify-center

        rounded-md

        border
        border-sky-500/20

        bg-sky-500/15
      "
    >
      <FileDown
        size={13}
        className={`
          text-sky-400
          ${exportIconX}
          ${exportIconY}
        `}
      />
    </div>

    {/* Text */}

    <span
      className={`
        text-[13px]
        font-bold
        tracking-[-0.01em]
        text-white

        ${exportTextX}
        ${exportTextY}
      `}
    >
      Export PDF
    </span>

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