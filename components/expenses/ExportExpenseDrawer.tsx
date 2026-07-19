"use client";

import { useEffect, useState } from "react";

import {
  X,
  Check,
  PieChart,
  FileText,
  LayoutGrid,
  Info,
  Calendar,
  Flag,
} from "lucide-react";

import DateRangePicker from "@/components/shared/DateRangePicker";

interface ExportExpenseDrawerProps {
  open: boolean;
  onClose: () => void;
}

const headerPaddingX = "px-7";
const headerPaddingTop = "pt-6";
const headerPaddingBottom = "pb-5";

const titleX = "translate-x-3";
const titleY = "translate-y-2";

const subtitleX = "translate-x-3";
const subtitleY = "translate-y-3";

const closeButtonX = "-translate-x-2";
const closeButtonY = "translate-y-2";

const titleSize = "text-[20px]";
const subtitleSize = "text-[12px]";

const closeButtonSize = "h-8 w-8";
const closeIconSize = 20;

const headerDividerY = "translate-y-4";

/* ========================================== */
/* BODY SPACING */
/* ========================================== */

const bodyY = "translate-y-3";

const includedSectionY = "translate-y-10";

const additionalColumnsY = "translate-y-10";

/* ========================================== */
/* INCLUDED SECTION */
/* ========================================== */

const includedTitleX = "translate-x-3";
const includedTitleY = "translate-y-0";

const includedContentX = "translate-x-3";
const includedContentY = "translate-y-2";

const includedCheckX = "translate-x-1.5";

const includedCardSpacing = "space-y-5";

const includedIconX = "translate-x-0.5";

/* ========================================== */
/* REPORTING PERIOD */
/* ========================================== */

const reportingPeriodX = "translate-x-3";

const reportingPeriodY = "translate-y-3";

const reportingPickerWidth = "min-w-[140px] w-fit";

const reportingPickerX = "translate-x-0";

const reportingPickerY = "translate-y-2";

/* ========================================== */
/* REPORT PREVIEW */
/* ========================================== */

const previewTitleX = "-translate-x-18";
const previewTitleY = "translate-y-0";

const previewCardX = "-translate-x-18";
const previewCardY = "translate-y-2";

const previewIconX = "translate-x-2";
const previewIconY = "translate-y-2";

const previewValueX = "translate-x-4";
const previewValueY = "translate-y-2";

const previewLabelX = "translate-x-4";
const previewLabelY = "translate-y-2";

const previewCardWidth = "w-[120%]";
const previewCardHeight = "h-[270px]";

const previewDividerX = "translate-x-0";
const previewDividerY = "translate-y-1";

const previewFooterX = "translate-x-4";
const previewFooterY = "translate-y-3";

const previewFooterIconX = "translate-x-0";
const previewFooterIconY = "translate-y-0";

const previewFooterTextX = "translate-x-0";
const previewFooterTextY = "translate-y-0";

const previewItemSpacing = "h-3";

/* ========================================== */
/* REPORT CONTENT */
/* ========================================== */

const REPORT_CONTENT = [
  {
    id: "expense-summary",
    label: "Expense Summary",
    icon: PieChart,
  },
  {
    id: "expense-details",
    label: "Expense Details",
    icon: FileText,
  },
  {
    id: "category-summary",
    label: "Category Summary",
    icon: LayoutGrid,
  },
  {
    id: "report-information",
    label: "Report Information",
    icon: Info,
  },
];




export default function ExportExpenseDrawer({
  open,
  onClose,
}: ExportExpenseDrawerProps) {

      const [
    selectedPreset,
    setSelectedPreset,
  ] = useState("This Year");

  const [
    startDate,
    setStartDate,
  ] = useState<Date | null>(null);

  const [
    endDate,
    setEndDate,
  ] = useState<Date | null>(null);

  useEffect(() => {

  const savedFilter =
    localStorage.getItem(
      "expenseExportDateFilter"
    );

  if (!savedFilter) {
    return;
  }

  const parsed =
    JSON.parse(savedFilter);

  setSelectedPreset(
    parsed.selectedPreset ??
      "This Year"
  );

  setStartDate(
    parsed.startDate
      ? new Date(
          parsed.startDate
        )
      : null
  );

  setEndDate(
    parsed.endDate
      ? new Date(
          parsed.endDate
        )
      : null
  );

}, []);

useEffect(() => {

  localStorage.setItem(
    "expenseExportDateFilter",
    JSON.stringify({
      selectedPreset,
      startDate,
      endDate,
    })
  );

}, [
  selectedPreset,
  startDate,
  endDate,
]);

/* ========================================== */
/* REPORT PREVIEW DATA */
/* ========================================== */

const previewItems = [
  {
    icon: FileText,
    value: "0",
    label: "Expenses",
    color: "bg-blue-600/20 text-blue-300",
  },
  {
    icon: LayoutGrid,
    value: "0",
    label: "Categories",
    color: "bg-violet-600/20 text-violet-300",
  },
  {
    icon: Calendar,
    value: selectedPreset,
    label: "Date Range",
    color: "bg-emerald-600/20 text-emerald-300",
  },
  {
    icon: Flag,
    value: "USD",
    label: "Reporting Currency",
    color: "bg-amber-600/20 text-amber-300",
  },
];

return (
  <>
    {/* ========================================== */}
    {/* BACKDROP */}
    {/* ========================================== */}

    <div
      onClick={onClose}
      className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-all duration-300 ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    />

    {/* ========================================== */}
    {/* DRAWER */}
    {/* ========================================== */}

    <aside
      className={`fixed right-0 top-0 z-[9999] h-screen w-[560px] max-w-[96vw] overflow-x-hidden border-l border-white/10 bg-[#07111d] transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
<div className="flex h-full flex-col">

  {/* ========================================== */}
  {/* HEADER */}
  {/* ========================================== */}

  <div
    className={`${headerPaddingX} ${headerPaddingTop} ${headerPaddingBottom}`}
  >
    <div className="flex items-start justify-between">

      <div>

        <h2
          className={`${titleSize} font-bold leading-none tracking-tight text-white transform ${titleX} ${titleY}`}
        >
          Export Expense Report
        </h2>

        <p
          className={`mt-2 ${subtitleSize} text-slate-400 transform ${subtitleX} ${subtitleY}`}
        >
          Generate a professional PDF report for accounting,
          tax filing, and business records.
        </p>

      </div>

      <div
        className={`transform ${closeButtonX} ${closeButtonY}`}
      >
        <button
          onClick={onClose}
          className={`flex ${closeButtonSize} items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-slate-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white`}
        >
          <X size={closeIconSize} />
        </button>
      </div>

    </div>
  </div>

  {/* ========================================== */}
  {/* HEADER DIVIDER */}
  {/* ========================================== */}

  <div
    className={`border-b border-white/10 transform ${headerDividerY}`}
  />

    {/* ========================================== */}
  {/* BODY */}
  {/* ========================================== */}

  <div
  className={`
    flex-1
    overflow-y-auto
    px-7
    py-6
    transform
    ${bodyY}
  `}
>

    {/* ====================================== */}
    {/* REPORTING PERIOD */}
    {/* ====================================== */}

<section
  className={`
    transform
    ${reportingPeriodX}
    ${reportingPeriodY}
  `}
>

<h3
  className="
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.08em]
    text-slate-400
  "
>
  Reporting Period
</h3>

<div
  className={`
    mt-4
    transform
    ${reportingPickerX}
    ${reportingPickerY}
  `}
>
<DateRangePicker
  widthClass={reportingPickerWidth}
  selectedPreset={selectedPreset}
  onDateRangeChange={(
    preset,
    start,
    end
  ) => {
    setSelectedPreset(preset);
    setStartDate(start);
    setEndDate(end);
  }}
/>
</div>

    </section>

    {/* ====================================== */}
    {/* INCLUDED + REPORT PREVIEW */}
    {/* ====================================== */}

    <section
  className={`
    mt-10
    grid
    grid-cols-[1fr_190px]
    gap-8
    transform
    ${includedSectionY}
  `}
>

      {/* ================================== */}
      {/* INCLUDED */}
      {/* ================================== */}

      <div>

<h3
  className={`
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.08em]
    text-slate-400
    transform
    ${includedTitleX}
    ${includedTitleY}
  `}
>
  Report Content
</h3>

<div
  className={`
    mt-5
    w-[74%]

    transform
    ${includedContentX}
    ${includedContentY}

    ${includedCardSpacing}
  `}
>

  {REPORT_CONTENT.map((item) => {

    const Icon = item.icon;

return (

  <div key={item.id}>

    <div
      className="
        flex
        h-[50px]
        items-center
        gap-4

        rounded-xl

        border
        border-white/[0.05]

        bg-white/[0.035]

        px-5
      "
    >

        {/* Check */}

        <div
          className={`
            mr-2

            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center

            rounded-[8px]

            bg-slate-600

            transform
            ${includedCheckX}
          `}
        >
          <Check
            size={15}
            className="text-white"
          />
        </div>

        {/* Icon */}

<Icon
  size={17}
  className={`
    text-slate-400
    transform
    ${includedIconX}
  `}
/>

        {/* Label */}

        <span
          className="
            text-[15px]
            font-medium
            text-slate-200
          "
        >
          {item.label}
        </span>

    </div>

    <div className="h-2" />

  </div>

);

  })}

</div>

      </div>

      {/* ================================== */}
      {/* REPORT PREVIEW */}
      {/* ================================== */}

      <div>

<h3
  className={`
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.08em]
    text-slate-400

    transform
    ${previewTitleX}
    ${previewTitleY}
  `}
>
  Report Preview
</h3>

<div
  className={`
    mt-5

    ${previewCardWidth}
    ${previewCardHeight}

    rounded-2xl
    border
    border-white/10

    bg-white/[0.03]

    p-5

    transform
    ${previewCardX}
    ${previewCardY}
  `}
>

  <div>

    {previewItems.map((item) => {

      const Icon = item.icon;

return (

  <div key={item.label}>

    <div className="flex items-start gap-3">

      {/* Icon */}

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center

          rounded-xl

          ${item.color}

          transform
          ${previewIconX}
          ${previewIconY}
        `}
      >
        <Icon size={17} />
      </div>

      {/* Text */}

      <div>

        <div
          className={`
            text-[15px]
            font-semibold
            text-white

            transform
            ${previewValueX}
            ${previewValueY}
          `}
        >
          {item.value}
        </div>

        <div
          className={`
            mt-1
            text-[12px]
            text-slate-400

            transform
            ${previewLabelX}
            ${previewLabelY}
          `}
        >
          {item.label}
        </div>

      </div>

    </div>

    <div className={previewItemSpacing} />

  </div>

);

    })}

  </div>

  {/* Divider */}

  <div
  className={`
    my-5
    border-t
    border-white/10

    transform
    ${previewDividerX}
    ${previewDividerY}
  `}
/>

  {/* Footer */}

  <div
  className={`
    flex
    items-start
    gap-2

    transform
    ${previewFooterX}
    ${previewFooterY}
  `}
>

<Info
  size={15}
  className={`
    mt-[2px]
    text-slate-500

    transform
    ${previewFooterIconX}
    ${previewFooterIconY}
  `}
/>

<p
  className={`
    max-w-[175px]

    text-[11px]
    leading-5
    text-slate-500

    transform
    ${previewFooterTextX}
    ${previewFooterTextY}
  `}
>
      Preview is based on the current
      filters and export
      selections.
    </p>

  </div>

</div>

      </div>

    </section>

  </div>


</div>
    </aside>
  </>
);
}