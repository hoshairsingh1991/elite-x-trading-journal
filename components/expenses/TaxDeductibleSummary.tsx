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

const deductibleCardX = "translate-x-1.5";
const deductibleCardY = "translate-y-5";

const deductibleCardWidth = "w-[110%]";
const deductibleCardHeight = "h-[80px]";

const deductibleTitleX =
  "translate-x-3 min-[1680px]:translate-x-0";
const deductibleTitleY = "translate-y-2";

const deductibleValueX =
  "translate-x-4 min-[1680px]:translate-x-0";
const deductibleValueY = "translate-y-3";

const deductibleSubtitleX =
  "translate-x-4 min-[1680px]:translate-x-0";
const deductibleSubtitleY = "translate-y-3";

const deductibleIconX =
  "translate-x-1 min-[1680px]:translate-x-3 min-[2400px]:translate-x-8 min-[3000px]:translate-x-10";
const deductibleIconY = "translate-y-6";

const deductibleIconSize = "h-7 w-7";

const deductibleValueFontSize = "text-[20px]";

const deductibleSubtitleFontSize = "text-[11px]";

/* =====================================================
   BENEFIT CARD
   ===================================================== */

const benefitCardX = "translate-x-1.5";
const benefitCardY = "translate-y-4";

const benefitCardWidth = "w-[110%]";
const benefitCardHeight = "h-[80px]";

const benefitTitleX =
  "translate-x-3 min-[1680px]:translate-x-0";
const benefitTitleY = "translate-y-3";

const benefitValueX =
  "translate-x-4 min-[1680px]:translate-x-0";
const benefitValueY = "translate-y-3";

const benefitSubtitleX =
  "translate-x-4 min-[1680px]:translate-x-0";
const benefitSubtitleY = "translate-y-3";

const benefitIconX =
  "translate-x-1 min-[1680px]:translate-x-3 min-[2400px]:translate-x-8 min-[3000px]:translate-x-10";
const benefitIconY = "translate-y-6";

const benefitIconSize = "h-7 w-7";

const benefitValueFontSize = "text-[20px]";

const benefitSubtitleFontSize = "text-[11px]";

/* =====================================================
   DONUT SECTION
   ===================================================== */

const donutContainerX = "translate-x-2";
const donutContainerY = "translate-y-12";

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

const taxProfileX = "translate-x-1.5";
const taxProfileY = "translate-y-6";

const taxProfileWidth = "w-[97%]";
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

    <div className="min-w-0 flex min-h-0 flex-1 flex-col min-[1680px]:text-center">

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

    <div className="min-w-0 flex min-h-0 flex-1 flex-col min-[1680px]:text-center">

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

{/* ================================================= */}
{/* CALCULATION BASIS */}
{/* ================================================= */}

<div
  className="
    w-[97%]
    mx-auto
    translate-x-1.5
    translate-y-0
    min-[1440px]:translate-y-8
  "
>
  <div
className="
  h-auto
  min-h-[120px]
  rounded-[10px]
  border
  border-white/[0.08]
  bg-gradient-to-br
  from-[#111b2b]
  to-[#0b1220]
  p-3.5
  shadow-[0_10px_28px_rgba(0,0,0,0.18)]
"
  >

    {/* HEADER */}
<div className="h-2 w-full" />
    <div className="flex min-w-0 translate-x-2 items-center gap-2.5">

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-[8px]
          border
          border-sky-400/20
          bg-sky-400/10
        "
      >
        <Calculator className="h-5 w-5 text-sky-300" />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[12px] font-semibold text-white">
          Calculation Basis
        </p>

        <p className="mt-0.5 text-[10px] text-slate-500">
          How the estimate is derived
        </p>

      </div>

<span
  className="
    flex
    h-[24px]
    w-[64px]
    shrink-0
    -translate-x-4
    items-center
    justify-center
    rounded-[8px]
    border
    border-sky-400/15
    bg-sky-400/[0.06]
    text-[8px]
    font-semibold
    uppercase
    tracking-[0.12em]
    text-sky-300
  "
>
  Formula
</span>

    </div>

<div className="h-2 w-full" />
    {/* CALCULATION INPUTS */}

    <div className="mt-3 grid grid-cols-2 gap-2">

{/* DEDUCTIBLE EXPENSES */}

<div
  className="
    min-w-0
    w-[95%]
    translate-x-2
    rounded-[8px]
    border
    border-white/[0.07]
    bg-white/[0.025]
    px-2.5
    py-2
  "
>
  <div className="min-w-0 translate-x-2">

    <div className="h-1 w-full" />

    <p className="text-[10px] leading-4 text-slate-500">
      Deductible expenses
    </p>

    <p
      className="
        mt-0.5
        whitespace-nowrap
        text-[12px]
        font-semibold
        tracking-tight
        text-white
        tabular-nums
      "
    >
      {currencySymbol}
      {deductibleAmount.toFixed(2)}
    </p>

    <div className="h-1 w-full" />

  </div>
</div>


{/* TAX RATE */}

<div
  className="
    min-w-0
    w-[95%]
    rounded-[8px]
    border
    border-white/[0.07]
    bg-white/[0.025]
    px-2.5
    py-2
  "
>
  <div className="min-w-0 translate-x-2">

    <div className="h-1 w-full" />

    <p className="text-[10px] leading-4 text-slate-500">
      Applied tax rate
    </p>

    <p
      className="
        mt-0.5
        text-[12px]
        font-semibold
        text-white
        tabular-nums
      "
    >
      {TAX_RATE}%
    </p>

    <div className="h-1 w-full" />

  </div>
</div>

    </div>

<div className="h-2 w-full" />
    {/* ESTIMATED BENEFIT */}

    <div
className="
  mt-2.5
  mx-auto
  w-[95%]
  translate-x-2
  translate-y-0
  flex
  items-center
  justify-between
  gap-2
  rounded-[8px]
  border
  border-emerald-500/20
  bg-emerald-500/[0.07]
  px-3
  py-2.5
"
    >

      <div className="min-w-0 translate-x-2">
<div className="h-1.5 w-full" />
        <p className="text-[11px] font-semibold text-slate-200">
          Estimated tax benefit
        </p>

        <p className="mt-0.5 text-[9px] text-slate-500">
          Deductible expenses × tax rate
        </p>
<div className="h-1.5 w-full" />
      </div>

<p
  className="
    shrink-0
    whitespace-nowrap
    -translate-x-2
    text-[13px]
    font-bold
    text-emerald-400
    tabular-nums
  "
>
  {currencySymbol}
  {estimatedTaxBenefit.toFixed(2)}
</p>

    </div>
<div className="h-2 w-full" />
  </div>
</div>


{/* ================================================= */}
{/* TAX ESTIMATE DISCLAIMER */}
{/* ================================================= */}

<div
  className="
    w-[97%]
    mx-auto
    translate-x-1.5
    translate-y-10
  "
>
  <div
    className="
      flex
      items-center
      gap-3
      rounded-[10px]
      border
      border-white/[0.08]
      bg-[#0d1726]
      px-3.5
      py-3
      shadow-[0_8px_22px_rgba(0,0,0,0.12)]
    "
  >

    {/* ICON */}

    <div
className="
  flex
  h-8
  w-8
  shrink-0
  translate-x-1
  items-center
  justify-center
  rounded-[8px]
  border
  border-sky-400/15
  bg-sky-400/[0.06]
"
    >
      <ShieldCheck className="h-4 w-4 text-slate-400" />
    </div>


    {/* CONTENT */}

    <div className="min-w-0 flex-1">
<div className="h-1 w-full" />
      <p className="text-[11px] font-semibold text-slate-200">
        Estimate only
      </p>

      <p className="mt-1 text-[10px] leading-[17px] text-slate-400">
        This is an illustrative estimate, not a tax filing result.
        Actual deductibility and tax savings depend on applicable
        tax rules and your circumstances.
      </p>
<div className="h-1 w-full" />
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