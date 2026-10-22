"use client";

import type { ReportingExpense } from "@/lib/types/expense";

import { Calculator } from "lucide-react";

import { TrendingUp } from "lucide-react";

import { BadgeDollarSign } from "lucide-react";
import { PiggyBank } from "lucide-react";
import { FileText } from "lucide-react";

import { ShieldCheck, Pencil } from "lucide-react";

import {
  Percent,
  MapPin,
  User,
  Calendar,
} from "lucide-react";


import {
  generateExpenseAnalytics,
} from "@/lib/analytics/expenseAnalytics";

import TaxSettingsDrawer from "./TaxSettingsDrawer";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import { useEffect, useState } from "react";

import {
  TaxProfile,
} from "@/lib/types/taxProfile";

import {
  loadTaxProfile,
  saveTaxProfile,
} from "@/lib/storage/supabaseTaxProfileStorage";

interface TaxDeductibleSummaryProps {
  expenses: ReportingExpense[];
  reportingCurrency: string;
}

export default function TaxDeductibleSummary({
  expenses,
  reportingCurrency,
}: TaxDeductibleSummaryProps) {

  const [taxProfile, setTaxProfile] =
  useState<TaxProfile | null>(null);

  const [isTaxSettingsOpen, setIsTaxSettingsOpen] =
  useState(false);


 useEffect(() => {
  async function fetchTaxProfile() {
    try {

      const profile =
        await loadTaxProfile();

     if (profile) {

  setTaxProfile(profile);

} else {

  console.log(
    "NO TAX PROFILE FOUND - CREATING DEFAULT PROFILE"
  );

  await saveTaxProfile({
    country: "Canada",
    country_code: "CA",

    province: "Ontario",

    entity_type: "Individual",

    tax_rate: 30,

    tax_year: 2026,
  });

  const newProfile =
    await loadTaxProfile();

  if (newProfile) {
    setTaxProfile(newProfile);
  }
}

    } catch (error) {
      console.error(
        "Failed to load tax profile:",
        error
      );
    }
  }

  fetchTaxProfile();
}, []);


const analytics =
  generateExpenseAnalytics(
    expenses
  );

const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

const deductibleAmount =
  analytics.taxDeductibleAmount;

const nonDeductibleAmount =
  analytics.nonDeductibleAmount;

const ringPercent =
  analytics.deductiblePercent;

const TAX_RATE =
  taxProfile?.tax_rate ?? 30;

const estimatedTaxBenefit =
  deductibleAmount *
  (TAX_RATE / 100);

const monthlyTaxBenefit =
  estimatedTaxBenefit / 12;

/* =====================================================
   CONFIDENCE BADGE
   ===================================================== */



const confidenceIconX = "translate-x-0";
const confidenceIconY = "translate-y-0";

const confidenceIconSize = "h-5 w-5";

const confidenceTextX = "translate-x-0";
const confidenceTextY = "translate-y-0";

const confidenceTextFontSize = "text-[12px]";

const confidenceBadgeWidth = "w-36";
const confidenceBadgeHeight = "h-8";

const confidenceBadgeX = "-translate-x-2";
const confidenceBadgeY = "translate-y-2";

/* =====================================================
   HEADER
   ===================================================== */

const headerContainerX = "translate-x-0";
const headerContainerY = "translate-y-0";

const titleX = "translate-x-4";
const titleY = "translate-y-2";




const editButtonX = "-translate-x-4";
const editButtonY = "translate-y-2";

const editButtonWidth = "w-15";
const editButtonHeight = "h-8";

/* =====================================================
   TOP SECTION
   ===================================================== */

const topSectionX = "translate-x-0";
const topSectionY = "translate-y-0";

const topSectionWidth = "w-[96%]";
const topSectionGap = "gap-0";

/* =====================================================
   LEFT COLUMN
   ===================================================== */

const leftColumnX = "translate-x-0";
const leftColumnY = "translate-y-0";

const leftColumnWidth = "w-[55%]";
const leftColumnGap = "gap-3";

/* =====================================================
   DEDUCTIBLE CARD
   ===================================================== */

const deductibleCardX = "translate-x-3";
const deductibleCardY = "translate-y-7";

const deductibleCardWidth = "w-[105%]";
const deductibleCardHeight = "h-[80px]";

const deductibleTitleX = "translate-x-3";
const deductibleTitleY = "translate-y-2";

const deductibleValueX = "translate-x-4";
const deductibleValueY = "translate-y-3";

const deductibleSubtitleX = "translate-x-4";
const deductibleSubtitleY = "translate-y-3";

const deductibleIconX = "translate-x-1";
const deductibleIconY = "translate-y-6";

const deductibleIconSize = "h-7 w-7";

const deductibleValueFontSize = "text-[20px]";

const deductibleSubtitleFontSize = "text-[11px]";

/* =====================================================
   BENEFIT CARD
   ===================================================== */

const benefitCardX = "translate-x-3";
const benefitCardY = "translate-y-8";

const benefitCardWidth = "w-[105%]";
const benefitCardHeight = "h-[80px]";

const benefitTitleX = "translate-x-3";
const benefitTitleY = "translate-y-3";

const benefitValueX = "translate-x-4";
const benefitValueY = "translate-y-3";

const benefitSubtitleX = "translate-x-4";
const benefitSubtitleY = "translate-y-3";

const benefitIconX = "translate-x-1";
const benefitIconY = "translate-y-6";

const benefitIconSize = "h-7 w-7";

const benefitValueFontSize = "text-[20px]";

const benefitSubtitleFontSize = "text-[11px]";

/* =====================================================
   DONUT SECTION
   ===================================================== */

const donutContainerX = "translate-x-2";
const donutContainerY = "translate-y-14";

const donutContainerWidth = "w-[38%]";
const donutContainerHeight = "h-auto";

const donutOuterSize = 100;
const donutInnerSize = 80;

const donutPercentX = "translate-x-0";
const donutPercentY = "-translate-y-0";

const donutLabelX = "translate-x-0";
const donutLabelY = "-translate-y-0";

const donutBottomTextX = "translate-x-0";
const donutBottomTextY = "translate-y-2";

const donutPercentFontSize = "text-[16px]";
const donutLabelFontSize = "text-[11px]";
const donutBottomTextFontSize = "text-[12px]";

/* =====================================================
   TAX PROFILE CARD
   ===================================================== */

const taxProfileX = "translate-x-3";
const taxProfileY = "translate-y-12";

const taxProfileWidth = "w-[95%]";
const taxProfileHeight = "h-[70px]";

/* =====================================================
   TAX RATE
   ===================================================== */

const taxRateSectionX = "translate-x-2";
const taxRateSectionY = "translate-y-1";
const taxRateSectionWidth = "w-auto";

const taxRateIconX = "translate-x-1";
const taxRateIconY = "-translate-y-1";
const taxRateIconSize = "h-5 w-5";
const taxRateIconSvgSize = "h-3.5 w-3.5";

const taxRateValueX = "-translate-x-1";
const taxRateValueY = "translate-y-0";
const taxRateValueFontSize = "text-[12px]";

const taxRateLabelX = "-translate-x-1";
const taxRateLabelY = "translate-y-0";
const taxRateLabelFontSize = "text-[10px]";

/* =====================================================
   DIVIDER 1
   ===================================================== */

const divider1Height = "h-9";


/* =====================================================
   CALCULATION BASIS V2
   ===================================================== */

/* CARD */

const calculationCardX = "translate-x-3";
const calculationCardY =
  "translate-y-0 min-[1440px]:translate-y-16";

const calculationCardWidth = "w-[95%]";
const calculationCardHeight = "h-[90px]";

/* HEADER ROW */

const calculationHeaderX = "translate-x-2";
const calculationHeaderY = "-translate-y-7";

/* ICON */

const calculationIconX = "-translate-x-1";
const calculationIconY = "translate-y-14";

const calculationIconSize = "h-5 w-5";

/* TITLE */

const calculationTitleX = "translate-x-2";
const calculationTitleY = "translate-y-8.5";

const calculationTitleFontSize = "text-[12px]";


/* FORMULA ROW */

const calculationBoxesX =
  "translate-x-0 min-[1440px]:translate-x-3";
const calculationBoxesY = "translate-y-3";

/* AMOUNT BOX */

const calculationAmountWidth = "w-[60px]";
const calculationAmountHeight = "h-[30px]";

const calculationAmountBoxX = "translate-x-0";
const calculationAmountBoxY = "translate-y-0";

const calculationAmountLabelX = "translate-x-0";
const calculationAmountLabelY = "translate-y-1";

/* MULTIPLY */

const calculationMultiplyX = "-translate-x-2";
const calculationMultiplyY = "translate-y-0";

/* TAX BOX */

const calculationTaxWidth = "w-[60px]";
const calculationTaxHeight = "h-[30px]";

const calculationTaxBoxX = "-translate-x-2";
const calculationTaxBoxY = "translate-y-0";

const calculationTaxLabelX = "translate-x-0";
const calculationTaxLabelY = "translate-y-1";

/* EQUALS */

const calculationEqualsX = "-translate-x-2";
const calculationEqualsY = "translate-y-0";

/* RESULT BOX */

const calculationResultWidth = "w-[90px]";
const calculationResultHeight = "h-[30px]";

const calculationResultBoxX = "-translate-x-1";
const calculationResultBoxY = "translate-y-0";

const calculationResultLabelX = "translate-x-0";
const calculationResultLabelY = "translate-y-1";

/* =====================================================
   DISCLAIMER V2
   ===================================================== */

const disclaimerX = "translate-x-2";
const disclaimerY = "translate-y-20";

const disclaimerWidth = "w-[95%]";
const disclaimerHeight = "h-[100px]";

const disclaimerIconX = "translate-x-0";
const disclaimerIconY = "translate-y-7";

const disclaimerIconSize = "h-10 w-10";

const disclaimerTextWidth = "w-[85%]";

const disclaimerTextX = "translate-x-10";
const disclaimerTextY = "-translate-y-7";

const disclaimerTextFontSize = "text-[11px]";

function getEntityTypeDisplay(
  entityType?: string
) {
  switch (entityType) {
    case "Sole Proprietorship":
      return "Sole Prop.";

    case "Corporation":
      return "Corp.";

    case "Partnership":
      return "Partner.";

    default:
      return entityType ?? "Individual";
  }
}

function getProvinceDisplay(
  province?: string
) {
  switch (province) {
    case "British Columbia":
      return "BC";

    case "Nova Scotia":
      return "NS";

    case "New Brunswick":
      return "NB";

    case "Prince Edward Island":
      return "PEI";

    case "Newfoundland and Labrador":
      return "NL";

    case "Northwest Territories":
      return "NWT";

    default:
      return province ?? "Ontario";
  }
}

return (
  <div
    className="
      h-[560px]
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]
      p-8

      transition-all
      duration-300

      hover:border-white/20
      hover:bg-[#0b0c1e]
      hover:shadow-[0_16px_40px_rgba(0,0,0,0.30)]
    "
  >
   {/* HEADER */}

<div
  className={`
    flex
    items-center
    justify-between

    ${headerContainerX}
    ${headerContainerY}
  `}
>
  {/* TITLE */}

  <h3
    className={`
      text-[12px]
      font-semibold
      text-white

      ${titleX}
      ${titleY}
    `}
  >
    Tax Deductible Summary
  </h3>

  {/* ACTIONS */}

  <div className="flex items-center gap-4">


{/* EDIT BUTTON */}

<button
  onClick={() => setIsTaxSettingsOpen(true)}
  className={`
    ${editButtonWidth}
    ${editButtonHeight}

    group
    rounded-[8px]
    border
    border-white/10
    bg-white/[0.02]
    px-3
    py-1.5

    text-[12px]
    font-medium
    text-slate-300

    transition-all
    duration-200
    ease-out

    hover:border-violet-400/40
    hover:bg-gradient-to-r
    hover:from-violet-500/[0.10]
    hover:to-blue-500/[0.08]
    hover:text-white
    hover:shadow-[0_0_14px_rgba(139,92,246,0.14)]

    active:scale-[0.97]

    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-violet-400/60
    focus-visible:ring-offset-2
    focus-visible:ring-offset-[#0b1220]

    ${editButtonX}
    ${editButtonY}
  `}
>
  <div className="flex items-center justify-center gap-2">
    <Pencil
      className="
        h-3 w-3
        transition-transform
        duration-200
        group-hover:rotate-[-8deg]
        group-hover:scale-110
      "
    />
    Edit
  </div>
</button>


  </div>
</div>

{/* TOP SECTION */}

<div
  className={`
    ${topSectionWidth}
    mx-auto

    ${topSectionX}
    ${topSectionY}
  `}
>
  <div className="flex items-start justify-between">

    {/* LEFT SIDE */}

    <div
      className={`
        ${leftColumnWidth}

        flex
        flex-col
        gap-3

        ${leftColumnX}
        ${leftColumnY}
      `}
    >

      {/* DEDUCTIBLE CARD */}

<div
  className={`
    ${deductibleCardWidth}
    ${deductibleCardHeight}

    rounded-[8px]
    border
    border-white/10
    bg-white/[0.02]

    ${deductibleCardX}
    ${deductibleCardY}
  `}
>
  <div className="flex h-full">

    {/* ICON */}

    <div
      className={`
        flex

        ${deductibleIconX}
        ${deductibleIconY}
      `}
    >
     <div
  className={`
    ${deductibleIconSize}

    flex
    items-center
    justify-center

    rounded-[8px]
    border
    border-emerald-500/20
    bg-emerald-500/10
  `}
>
  <FileText className="h-6 w-6 text-emerald-400" />
</div>
    </div>

    {/* CONTENT */}

    <div className="min-w-0 flex min-h-0 flex-col">

      <div
        className={`
          text-[12px]
          font-medium
          text-slate-300

          ${deductibleTitleX}
          ${deductibleTitleY}
        `}
      >
        Tax Deductible Total
      </div>

      <div
        className={`
          ${deductibleValueFontSize}

          font-bold
          text-emerald-400

          ${deductibleValueX}
          ${deductibleValueY}
        `}
      >
        {currencySymbol}
        {deductibleAmount.toFixed(2)}
      </div>

<div
  className={`
    ${deductibleSubtitleFontSize}
    whitespace-nowrap
    truncate

    text-slate-400

    ${deductibleSubtitleX}
    ${deductibleSubtitleY}
  `}
>
  Eligible expenses
</div>

    </div>

  </div>
</div>

{/* BENEFIT CARD */}

<div
  className={`
    ${benefitCardWidth}
    ${benefitCardHeight}

    rounded-[8px]
    border
    border-white/10
    bg-white/[0.02]

    ${benefitCardX}
    ${benefitCardY}
  `}
>
  <div className="flex h-full">

    {/* ICON */}

    <div
      className={`
        flex

        ${benefitIconX}
        ${benefitIconY}
      `}
    >
     <div
  className={`
    ${benefitIconSize}

    flex
    items-center
    justify-center

    rounded-[8px]
    border
    border-emerald-500/20
    bg-emerald-500/10
  `}
>
  <TrendingUp className="h-6 w-6 text-emerald-400" />
</div>
    </div>

    {/* CONTENT */}

    <div className="flex flex-col">

      <div
        className={`
          text-[12px]
          font-medium
          text-slate-300

          ${benefitTitleX}
          ${benefitTitleY}
        `}
      >
        Estimated Tax Benefit
      </div>

      <div
        className={`
          ${benefitValueFontSize}

          font-bold
          text-emerald-400

          ${benefitValueX}
          ${benefitValueY}
        `}
      >
        {currencySymbol}
        {estimatedTaxBenefit.toFixed(2)}
      </div>

      <div
        className={`
          ${benefitSubtitleFontSize}

          text-slate-400

          ${benefitSubtitleX}
          ${benefitSubtitleY}
        `}
      >
        ≈ {currencySymbol}
        {monthlyTaxBenefit.toFixed(2)}
        / month
      </div>

    </div>

  </div>
</div>

</div>

{/* DONUT */}

<div
  className={`
    ${donutContainerWidth}

    flex
    flex-col
    items-center

    ${donutContainerX}
    ${donutContainerY}
  `}
>

  {/* DONUT RING */}

  <div
    className="relative flex items-center justify-center rounded-full"
    style={{
      width: donutOuterSize,
      height: donutOuterSize,

      background: `conic-gradient(
        #34d399 ${ringPercent * 3.6}deg,
        rgba(148,163,184,.25) 0deg
      )`,

      boxShadow:
        "0 0 30px rgba(52,211,153,.15)",
    }}
  >
    <div
      className="absolute rounded-full bg-[#0B1220]"
      style={{
        width: donutInnerSize,
        height: donutInnerSize,
      }}
    />

    <div className="absolute flex flex-col items-center">

      <div
        className={`
          ${donutPercentFontSize}
          font-bold
          text-white

          ${donutPercentX}
          ${donutPercentY}
        `}
      >
        {ringPercent.toFixed(0)}%
      </div>

      <div
        className={`
          ${donutLabelFontSize}
          text-slate-400

          ${donutLabelX}
          ${donutLabelY}
        `}
      >
        Deductible
      </div>

    </div>
  </div>

  {/* BOTTOM LABEL */}

  <div
    className={`
      ${donutBottomTextFontSize}
      text-slate-400

      ${donutBottomTextX}
      ${donutBottomTextY}
    `}
  >
    of total expenses
  </div>

</div>

</div>
</div>

{/* TAX PROFILE */}

<div
  className={`
    ${taxProfileWidth}
    mx-auto

    ${taxProfileX}
    ${taxProfileY}
  `}
>
  <div
    className={`
      ${taxProfileHeight}

      rounded-[8px]
      border
      border-white/10
      bg-white/[0.02]

      flex
      items-center
      justify-between
    `}
  >

   <div className="flex h-full min-w-0 w-full items-center">

{/* TAX RATE */}

<div
  className="
    min-w-0
    flex-1
    flex
    items-center
    justify-center
    gap-3
    px-3

    -translate-x-1
    translate-y-0
  "
>
  <div
    className={`
      ${taxRateIconSize}

      flex
      shrink-0
      items-center
      justify-center

      rounded-[8px]
      border
      border-emerald-500/20
      bg-emerald-500/10

      ${taxRateIconX}
      ${taxRateIconY}
    `}
  >
    <Percent
      className={`
        ${taxRateIconSvgSize}
        text-emerald-400
      `}
    />
  </div>

  <div className="min-w-0">
    <div
      className={`
        ${taxRateValueFontSize}
        font-semibold
        leading-none
        text-white
        translate-x-1
        ${taxRateValueX}
        ${taxRateValueY}
      `}
    >
      {TAX_RATE}%
    </div>

    <div
      className={`
        mt-0.5
        ${taxRateLabelFontSize}
        text-slate-400
translate-x-0
        ${taxRateLabelX}
        ${taxRateLabelY}
      `}
    >
      Tax Rate
    </div>
  </div>
</div>

<div
  className={`
    ${divider1Height}
    w-px
    shrink-0
    bg-white/10

    -translate-x-2
    translate-y-0
  `}
 />

{/* PROVINCE */}

<div
  className="
    min-w-0
    flex-1
    flex
    items-center
    justify-center
    gap-3
    px-3

    -translate-x-2
    translate-y-0
  "
>
  <div
    className="
      h-5
      w-5
      shrink-0
      flex
      items-center
      justify-center

      rounded-[8px]
      border
      border-emerald-500/20
      bg-emerald-500/10
    "
  >
    <MapPin
      className="h-3.5 w-3.5 text-emerald-400"
    />
  </div>

  <div className="min-w-0">
    <div
      className="
        text-[12px]
        font-semibold
        leading-none
        -translate-x-1
        text-white
      "
    >
      {getProvinceDisplay(
        taxProfile?.province
      )}
    </div>

    <div
      className="
        mt-0.5
        -translate-x-1
        text-[10px]
        text-slate-400
      "
    >
      Province
    </div>
  </div>
</div>

<div
  className="
    h-9
    w-px
    shrink-0
    bg-white/10
    -translate-x-2
    translate-y-0
  "
/>

{/* ENTITY */}

<div
  className="
    min-w-0
    flex-1
    flex
    items-center
    justify-center
    gap-2
    px-3

    -translate-x-1
    translate-y-0
  "
>
  <div
    className="
      h-5
      w-5
      shrink-0
      flex
      items-center
      justify-center

      rounded-[8px]
      border
      border-emerald-500/20
      bg-emerald-500/10
    "
  >
    <User
      className="h-3.5 w-3.5 text-emerald-400"
    />
  </div>

  <div className="min-w-0">
<div
  className="
    min-w-0
    max-w-full
    truncate
    whitespace-nowrap
    text-[12px]
    font-semibold
    leading-none
    text-white
  "
>
  {getEntityTypeDisplay(
    taxProfile?.entity_type
  )}
</div>

    <div
      className="
        mt-0.5
        text-[10px]
        text-slate-400
      "
    >
      Entity Type
    </div>
  </div>
</div>

<div
  className="
    hidden
    min-[1680px]:block
    h-9
    w-px
    shrink-0
    bg-white/10
    translate-x-2
    translate-y-0
  "
/>

{/* YEAR */}

<div
  className="
    hidden
    min-[1680px]:flex
    min-w-0
    flex-1
    items-center
    justify-center
    gap-1
    px-3

    translate-x-1
    translate-y-0
  "
>
  <div
    className="
      h-5
      w-5
      shrink-0
      flex
      items-center
      justify-center

      rounded-[8px]
      border
      border-emerald-500/20
      bg-emerald-500/10
    "
  >
    <Calendar
      className="h-3.5 w-3.5 text-emerald-400"
    />
  </div>

  <div className="min-w-0">
    <div
      className="
        text-[12px]
        font-semibold
        leading-none
        text-white
      "
    >
      {taxProfile?.tax_year ?? 2026}
    </div>

    <div
      className="
        mt-0.5
        text-[10px]
        text-slate-400
      "
    >
      Tax Year
    </div>
  </div>


  </div> {/* YEAR SECTION */}

</div> {/* h-full row */}

</div> {/* tax profile card */}

</div> {/* tax profile wrapper */}

{/* CALCULATION BASIS */}

<div
  className={`
    ${calculationCardWidth}
    mx-auto

    ${calculationCardX}
    ${calculationCardY}
  `}
>
  <div
    className={`
      ${calculationCardHeight}

      rounded-[8px]
      border
      border-white/10
      bg-white/[0.02]
    `}
  >

    {/* HEADER */}

    <div
      className={`
        flex
        items-center

        ${calculationHeaderX}
        ${calculationHeaderY}
      `}
    >


<div
  className={`
    flex
    items-center
    justify-center

    ${calculationIconX}
    ${calculationIconY}
  `}
>
  <Calculator className="h-6 w-6 text-sky-400" />
</div>


      <div
        className={`
          ${calculationTitleFontSize}
          font-semibold
          text-white

          ${calculationTitleX}
          ${calculationTitleY}
        `}
      >
        Calculation Basis
      </div>

    </div>

    {/* FORMULA */}

{/* FORMULA */}

<div
  className={`
    grid
    min-w-0
    w-full
    max-w-full
    grid-cols-[minmax(60px,70px)_auto_minmax(50px,55px)_auto_minmax(75px,90px)]
    items-start
    justify-center
    gap-2

    ${calculationBoxesX}
    ${calculationBoxesY}
  `}
>

      {/* AMOUNT */}

      <div className="min-w-0 flex flex-1 flex-col items-center">

        <div
          className={`
            ${calculationAmountWidth}
            ${calculationAmountHeight}

            flex
            items-center
            justify-center

            rounded-[8px]
            border
            border-white/10
            bg-white/[0.03]

            ${calculationAmountBoxX}
            ${calculationAmountBoxY}
          `}
        >
          <span className="text-[13px] font-semibold text-white">
            {currencySymbol}
            {deductibleAmount.toFixed(2)}
          </span>
        </div>

<div
  className={`
    w-[100px]
    whitespace-nowrap
    text-[11px]
    text-slate-500

    ${calculationAmountLabelX}
    ${calculationAmountLabelY}
  `}
>
  Deductible Expenses
</div>

      </div>

      {/* MULTIPLY */}

      <div
        className={`
          text-[18px]
          text-slate-500

          ${calculationMultiplyX}
          ${calculationMultiplyY}
        `}
      >
        ×
      </div>

      {/* TAX */}

      <div className="min-w-0 flex flex-1 flex-col items-center">

        <div
          className={`
            ${calculationTaxWidth}
            ${calculationTaxHeight}

            flex
            items-center
            justify-center

            rounded-[8px]
            border
            border-white/10
            bg-white/[0.03]

            ${calculationTaxBoxX}
            ${calculationTaxBoxY}
          `}
        >
          <span className="text-[13px] font-semibold text-white">
            {TAX_RATE}%
          </span>
        </div>

        <div
          className={`
            text-[11px]
            text-slate-500

            ${calculationTaxLabelX}
            ${calculationTaxLabelY}
          `}
        >
          Tax Rate
        </div>

      </div>

      {/* EQUALS */}

      <div
        className={`
          text-[18px]
          text-slate-500

          ${calculationEqualsX}
          ${calculationEqualsY}
        `}
      >
        =
      </div>

      {/* RESULT */}

      <div className="min-w-0 flex flex-1 flex-col items-center">

        <div
          className={`
            ${calculationResultWidth}
            ${calculationResultHeight}

            flex
            items-center
            justify-center

            rounded-[8px]
            border
            border-emerald-500/20
            bg-emerald-500/5

            ${calculationResultBoxX}
            ${calculationResultBoxY}
          `}
        >
          <span className="text-[13px] font-semibold text-emerald-400">
            {currencySymbol}
            {estimatedTaxBenefit.toFixed(2)}
          </span>
        </div>

<div
  className={`
    w-[120px]
    whitespace-nowrap
    text-[11px]
    text-slate-500

    ${calculationResultLabelX}
    ${calculationResultLabelY}
  `}
>
  Estimated Tax Benefit
</div>

      </div>

    </div>

  </div>
</div>

{/* DISCLAIMER */}

<div
  className={`
    ${disclaimerWidth}
    mx-auto

    ${disclaimerX}
    ${disclaimerY}
  `}
>
  <div
    className={`
      ${disclaimerHeight}

      rounded-[8px]
      border
      border-white/10
      bg-white/[0.02]
    `}
  >

    {/* ICON */}

    <div
      className={`
        ${disclaimerIconSize}

        flex
        items-center
        justify-center

        ${disclaimerIconX}
        ${disclaimerIconY}
      `}
    >
      <ShieldCheck className="h-7 w-7 text-slate-400" />
    </div>

    {/* TEXT */}

    <div
      className={`
        ${disclaimerTextWidth}

        ${disclaimerTextFontSize}
        leading-6
        text-slate-300

        ${disclaimerTextX}
        ${disclaimerTextY}
      `}
    >
      Estimates are based on your configured tax profile and deductible expenses.
      Actual tax treatment may vary by country, province/state, and accountant.
    </div>

   </div>
</div>

<TaxSettingsDrawer
  open={isTaxSettingsOpen}
  onClose={() =>
    setIsTaxSettingsOpen(false)
  }
  onSaved={async () => {
    const profile =
      await loadTaxProfile();

    if (profile) {
      setTaxProfile(profile);
    }
  }}
/>

</div>

);
}