"use client";

import type { Expense } from "@/lib/types/expense";

import {
  generateExpenseAnalytics,
} from "@/lib/analytics/expenseAnalytics";

interface TaxDeductibleSummaryProps {
  expenses: Expense[];
}

export default function TaxDeductibleSummary({
  expenses,
}: TaxDeductibleSummaryProps) {


const analytics =
  generateExpenseAnalytics(
    expenses
  );

const deductibleAmount =
  analytics.taxDeductibleAmount;

const nonDeductibleAmount =
  analytics.nonDeductibleAmount;

const ringPercent =
  analytics.deductiblePercent;

const estimatedTaxSavings =
  deductibleAmount * 0.30;

/* =====================================================
   FINE TUNING
   ===================================================== */

const cardHeight = "h-[340px]";

const headerX = "translate-x-2";
const headerY = "translate-y-2";

const topSectionX = "translate-x-4";
const topSectionY = "translate-y-12";

const leftPanelWidth = "w-[35%]";
const rightPanelWidth = "w-[40%]";

const metricCardHeight = "h-[80px]";

const ringOuter = 170;
const ringInner = 126;

const legendX = "translate-x-6";
const legendY = "translate-y-20";

/* =====================================================
   POSITION CONTROLS
   ===================================================== */

// Donut
const donutX = "-translate-x-14";
const donutY = "translate-y-0";

// Tax Deductible Total
const deductibleCardX = "translate-x-0";
const deductibleCardY = "translate-y-0";
const deductibleValueX = "translate-x-4";
const deductibleValueY = "translate-y-2";

// Estimated Tax Savings
const savingsCardX = "translate-x-0";
const savingsCardY = "translate-y-0";
const savingsValueX = "translate-x-4";
const savingsValueY = "translate-y-2";

// Bottom Legend - Deductible
const legendDeductibleAmountX = "-translate-x-30";
const legendDeductiblePercentX = "-translate-x-20";

// Bottom Legend - Non-Deductible
const legendNonDeductibleAmountX = "-translate-x-30.5";
const legendNonDeductiblePercentX = "-translate-x-20";

// Label: Tax Deductible Total
const deductibleLabelX = "translate-x-4";
const deductibleLabelY = "translate-y-2";

// Label: Estimated Tax Savings
const savingsLabelX = "translate-x-4";
const savingsLabelY = "translate-y-2";

return (
  <div
    className={`
      ${cardHeight}

      rounded-3xl
      border
      border-white/10
      bg-[#0B1220]

      p-6

      transition-all
      duration-300

      hover:-translate-y-0.5
      hover:border-white/15
      hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]
    `}
  >
    {/* ============================== */}
    {/* Header */}
    {/* ============================== */}

    <div
      className={`
        flex items-center gap-2

        ${headerX}
        ${headerY}
      `}
    >
      <h3 className="text-[14px] font-semibold text-white">
        Tax Deductible Summary
      </h3>

      
    </div>

    {/* ============================== */}
    {/* Main */}
    {/* ============================== */}

    <div
      className={`
        mt-8
        flex
        justify-between
        gap-6

        ${topSectionX}
        ${topSectionY}
      `}
    >
      {/* LEFT */}

      <div className={`${leftPanelWidth} flex flex-col gap-5`}>
<div
  className={`
    ${metricCardHeight}
    rounded-2xl
    border
    border-white/10
    bg-white/[0.02]
    px-5
    py-4

    ${deductibleCardX}
    ${deductibleCardY}
  `}
>
<p
  className={`
    text-[12px]
    text-slate-400

    ${deductibleLabelX}
    ${deductibleLabelY}
  `}
>
  Tax Deductible Total
</p>

<div
  className={`
    mt-4
    text-[28px]
    font-bold
    text-white

    ${deductibleValueX}
    ${deductibleValueY}
  `}
>
${deductibleAmount.toFixed(2)}
</div>
        </div>

        <div
          className={`
            ${metricCardHeight}

            rounded-2xl
            border
            border-white/10
            bg-white/[0.02]

            px-5
            py-4
          `}
        >
<p
  className={`
    text-[12px]
    text-slate-400

    ${savingsLabelX}
    ${savingsLabelY}
  `}
>
  Estimated Tax Savings
</p>

<div
  className={`
    mt-4
    text-[28px]
    font-bold
    text-emerald-400

    ${savingsValueX}
    ${savingsValueY}
  `}
>
 ${estimatedTaxSavings.toFixed(2)}
</div>
        </div>
      </div>

      {/* RIGHT */}

<div
  className={`
    ${rightPanelWidth}
    flex
    items-center
    justify-center

    ${donutX}
    ${donutY}
  `}
>
<div
  className="relative flex items-center justify-center rounded-full"
  style={{
    width: ringOuter,
    height: ringOuter,

    background: `conic-gradient(
      #34d399 ${ringPercent * 3.6}deg,
      rgba(148,163,184,.25) 0deg
    )`,

    boxShadow: "0 0 18px rgba(52, 211, 153, 0.12)"
  }}
>
          <div
            className="flex flex-col items-center justify-center rounded-full bg-[#0B1220]"
            style={{
              width: ringInner,
              height: ringInner,
            }}
          >
            <div className="text-[18px] font-bold text-white">
              {ringPercent.toFixed(1)}%
            </div>

            <div className="mt-1 text-[12px] text-slate-400">
              Deductible
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ============================== */}
    {/* Legend */}
    {/* ============================== */}

    <div
      className={`
        mt-10
        space-y-4

        ${legendX}
        ${legendY}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400" />

          <span className="text-[13px] font-medium text-white">
            Deductible
          </span>
        </div>

        <div className="flex gap-6 text-[13px]">
<span
  className={`
    font-medium
    text-white

    ${legendDeductibleAmountX}
  `}
>
  ${deductibleAmount.toFixed(2)}
</span>

<span
  className={`
    w-12
    text-right
    text-slate-400

    ${legendDeductiblePercentX}
  `}
>
  {ringPercent.toFixed(1)}%
</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-slate-500" />

          <span className="text-[13px] font-medium text-slate-300">
            Non-Deductible
          </span>
        </div>

        <div className="flex gap-6 text-[13px]">
<span
  className={`
    font-medium
    text-slate-300

    ${legendNonDeductibleAmountX}
  `}
>
  ${nonDeductibleAmount.toFixed(2)}
</span>

<span
  className={`
    w-12
    text-right
    text-slate-400

    ${legendNonDeductiblePercentX}
  `}
>
  {(100 - ringPercent).toFixed(1)}%
</span>
        </div>
      </div>
    </div>
  </div>
);
}