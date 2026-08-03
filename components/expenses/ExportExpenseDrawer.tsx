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
  FileDown,
  Building2,
  Briefcase,
  Percent,
  Tag,
  File,
Table2,
FileBadge,
Clock3,
  DollarSign,
  FileCheck,
  RotateCw,
} from "lucide-react";

import DateRangePicker from "@/components/shared/DateRangePicker";

import {
  exportExpenseReport,
  buildExpenseReportPdf,
} from "@/lib/reporting/expense/exportExpenseReport";

import {
  loadProfile,
} from "@/lib/storage/profileStorage";

import {
  ExpenseReportOptions,
} from "@/lib/reporting/expense/types";

import { ReportingExpense } from "@/lib/types/expense";

import { PDFDocument } from "pdf-lib";

interface ExportExpenseDrawerProps {
  open: boolean;
  onClose: () => void;

  expenses: ReportingExpense[];

  reportingCurrency: string;


  generatedBy: string;

  reportVersion: string;
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

const previewTitleX = "-translate-x-16";
const previewTitleY = "translate-y-0";

const previewCardX = "-translate-x-16";
const previewCardY = "translate-y-2";

const previewIconX = "translate-x-2";
const previewIconY = "translate-y-2";

const previewValueX = "translate-x-4";
const previewValueY = "translate-y-2";

const previewLabelX = "translate-x-4";
const previewLabelY = "translate-y-2";

const previewCardWidth = "w-[110%]";
const previewCardHeight = "h-[240px]";

const previewItemSpacing = "h-3";

/* ========================================== */
/* ADDITIONAL COLUMNS */
/* ========================================== */

const additionalTitleX = "translate-x-3";
const additionalTitleY = "-translate-y-10";

const additionalContentX = "translate-x-3";
const additionalContentY = "-translate-y-7";

const additionalCardWidth = "w-[60%]";

const additionalCheckX = "translate-x-1.5";

const additionalIconX = "translate-x-1";

const additionalLabelX = "translate-x-2";

const additionalItemSpacing = "h-4";

const additionalDividerWidth = "w-[80%]";

const additionalDividerX = "translate-x-2";
const additionalDividerY = "-translate-y-14";



/* ========================================== */
/* ESTIMATED OUTPUT */
/* ========================================== */

/* Title */

const estimatedTitleX = "-translate-x-86";
const estimatedTitleY = "translate-y-70";

/* Card */

const estimatedCardWidth = "w-[276%]";
const estimatedCardHeight = "min-h-[150px]";

const estimatedCardX = "-translate-x-87";
const estimatedCardY = "translate-y-72";

/* ========================================== */
/* TOTAL PAGES */
/* ========================================== */

const pagesX = "translate-x-1";
const pagesY = "translate-y-4";

const pagesIconX = "translate-x-0";
const pagesIconY = "translate-y-0";

const pagesLabelX = "translate-x-2";
const pagesLabelY = "translate-y-0";

const pagesValueX = "translate-x-2";
const pagesValueY = "translate-y-3";

const pagesCaptionX = "translate-x-2";
const pagesCaptionY = "translate-y-5";

const columnsCaptionX = "translate-x-0";
const columnsCaptionY = "translate-y-5";

/* ========================================== */
/* TOTAL COLUMNS */
/* ========================================== */

const columnsX = "translate-x-0";
const columnsY = "translate-y-4";

const columnsIconX = "translate-x-0";
const columnsIconY = "translate-y-0";

const columnsLabelX = "translate-x-2";
const columnsLabelY = "translate-y-0";

const columnsValueX = "translate-x-2";
const columnsValueY = "translate-y-3";


/* ========================================== */
/* PDF SIZE */
/* ========================================== */

const pdfSizeX = "-translate-x-2";
const pdfSizeY = "translate-y-4";

const pdfSizeIconX = "translate-x-0";
const pdfSizeIconY = "translate-y-0";

const pdfSizeLabelX = "translate-x-2";
const pdfSizeLabelY = "translate-y-0";

const pdfSizeValueX = "translate-x-2";
const pdfSizeValueY = "translate-y-3";

const pdfSizeCaptionX = "translate-x-2";
const pdfSizeCaptionY = "translate-y-5";

/* ========================================== */
/* GENERATED ON */
/* ========================================== */

const generatedOnX = "-translate-x-2";
const generatedOnY = "translate-y-4";

const generatedOnIconX = "-translate-x-1";
const generatedOnIconY = "translate-y-0";

const generatedOnLabelX = "translate-x-0";
const generatedOnLabelY = "translate-y-0";

const generatedOnValueX = "translate-x-0";
const generatedOnValueY = "translate-y-3";

const generatedOnCaptionX = "translate-x-0";
const generatedOnCaptionY = "translate-y-5";

/* ========================================== */
/* DIVIDER 1 */
/* ========================================== */

const divider1X = "translate-x-2";
const divider1Y = "translate-y-4";
const divider1Height = "h-[88px]";

/* ========================================== */
/* DIVIDER 2 */
/* ========================================== */

const divider2X = "translate-x-0";
const divider2Y = "translate-y-4";
const divider2Height = "h-[88px]";

/* ========================================== */
/* DIVIDER 3 */
/* ========================================== */

const divider3X = "-translate-x-1";
const divider3Y = "translate-y-4";
const divider3Height = "h-[88px]";

/* ========================================== */
/* BOTTOM DIVIDER */
/* ========================================== */

const estimatedBottomDividerX = "translate-x-0";
const estimatedBottomDividerY = "translate-y-6";

/* ========================================== */
/* FOOTER */
/* ========================================== */

const estimatedFooterX = "translate-x-3";
const estimatedFooterY = "translate-y-8";


const footerDividerX = "translate-x-0";
const footerDividerY = "-translate-y-0";

const footerDividerWidth = "w-full";

const footerContentX = "translate-x-0";
const footerContentY = "translate-y-0";

const footerButtonGap = "gap-6";

const cancelButtonWidth = "w-[120px]";
const exportButtonWidth = "w-[170px]";

const cancelButtonX = "-translate-x-4";
const cancelButtonY = "translate-y-2";

const exportButtonX = "-translate-x-4";
const exportButtonY = "translate-y-2";



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
    id: "detailed-expense-ledger",
    label: "Detailed Expense Ledger",
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

const ALWAYS_INCLUDED_COLUMNS = [
  {
    label: "Date",
    icon: Calendar,
  },
  {
    label: "Expense Name",
    icon: FileText,
  },
  {
    label: "Category",
    icon: LayoutGrid,
  },
  {
    label: "Vendor",
    icon: Building2,
  },
  {
    label: "Original Amount",
    icon: DollarSign,
  },
  {
    label: "Reporting Amount",
    icon: Flag,
  },
  {
    label: "Receipt Available",
    icon: FileCheck,
  },
];

const BUSINESS_TAX_COLUMNS = [
  {
    id: "expenseType",
    label: "Expense Type",
    icon: Briefcase,
  },
  {
    id: "businessUse",
    label: "Business Use %",
    icon: Percent,
  },
  {
    id: "deductible",
    label: "Deductible %",
    icon: Percent,
  },
  {
    id: "taxType",
    label: "Tax Type",
    icon: Tag,
  },
  {
    id: "taxAmount",
    label: "Tax Amount",
    icon: DollarSign,
  },
];


export default function ExportExpenseDrawer({
  open,
  onClose,

  expenses,

  reportingCurrency,


  generatedBy,

  reportVersion,

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

  const [
  selectedColumns,
  setSelectedColumns,
] = useState({
  expenseType: false,
  businessUse: false,
  deductible: false,
  taxType: false,
  taxAmount: false,
});

const [
  estimatedPdfSize,
  setEstimatedPdfSize,
] = useState<number>(0);

const [
  estimatedPageCount,
  setEstimatedPageCount,
] = useState<number>(0);

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

useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [open]);

useEffect(() => {

async function calculatePdfSize() {

  if (!open) {
    return;
  }

  const options: ExpenseReportOptions = {

    includeSummary: true,

    includeCategorySummary: true,

    includeExpenseDetails: true,

    includeVendor: true,

    includeNotes: false,

    includeBusinessUse:
      selectedColumns.businessUse,

    includeDeductible:
      selectedColumns.deductible,

    includeTaxInformation:
      selectedColumns.taxType ||
      selectedColumns.taxAmount,

    includeReceiptStatus: true,

    includeRecurringStatus: false,

    includeExpenseType:
      selectedColumns.expenseType,

    includeTaxType:
      selectedColumns.taxType,

    includeTaxAmount:
      selectedColumns.taxAmount,

  };

  const filteredExpenses =
    expenses.filter(expense => {

      if (
        !startDate ||
        !endDate
      ) {
        return true;
      }

      const expenseDate =
        new Date(
          expense.expense_date +
          "T12:00:00"
        );

      return (
        expenseDate >= startDate &&
        expenseDate <= endDate
      );

    });

  const reportingPeriod =
    startDate && endDate
      ? `${startDate.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }
        )} – ${endDate.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }
        )}`
      : selectedPreset;

const blob =
  await buildExpenseReportPdf({

    expenses: filteredExpenses,

    reportingCurrency,

    reportingPeriod,

    generatedBy,

    reportVersion,

    options,

  });

const pdfDoc =
  await PDFDocument.load(
    await blob.arrayBuffer()
  );

setEstimatedPageCount(
  pdfDoc.getPageCount()
);

setEstimatedPdfSize(
  Math.max(
    1,
    Math.round(blob.size / 1024)
  )
);

}

 void calculatePdfSize().catch(console.error);

}, [
  open,
  expenses,
  reportingCurrency,
  generatedBy,
  reportVersion,
  selectedPreset,
  startDate,
  endDate,
  selectedColumns,
]);

/* ========================================== */
/* REPORT PREVIEW DATA */
/* ========================================== */

const previewExpenses =
  expenses.filter(
    expense => {

      if (
        !startDate ||
        !endDate
      ) {
        return true;
      }

      const expenseDate =
        new Date(
          expense.expense_date +
          "T12:00:00"
        );

      return (
        expenseDate >= startDate &&
        expenseDate <= endDate
      );

    }
  );

const uniqueCategories = new Set(
  previewExpenses.map(
    expense => expense.category
  )
).size;

const previewDateRange =
  startDate && endDate
    ? `${startDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      )} –\n${endDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      )}`
    : selectedPreset;

const previewItems = [
  {
    icon: FileText,
    value: String(previewExpenses.length),
    label: "Expenses",
    color: "bg-blue-600/20 text-blue-300",
  },
  {
    icon: LayoutGrid,
    value: String(uniqueCategories),
    label: "Categories",
    color: "bg-violet-600/20 text-violet-300",
  },
{
  icon: Calendar,
  value: previewDateRange,
  label: "Date Range",
  color: "bg-emerald-600/20 text-emerald-300",
},
  {
    icon: Flag,
    value: reportingCurrency,
    label: "Reporting Currency",
    color: "bg-amber-600/20 text-amber-300",
  },
];

const reportContentCount =
  REPORT_CONTENT.length +
  Object.values(selectedColumns)
    .filter(Boolean)
    .length;


const estimatedItems = [
  {
    icon: File,
    value: "0",
    label: "Total Pages",
    caption: "Estimated",
    color: "text-emerald-400",
  },
{
  icon: Table2,
  value: "0",
  label: "Total Columns",
  caption: "",
  color: "text-violet-400",
},
{
  icon: FileBadge,
  value: `~${estimatedPdfSize} KB`,
  label: "PDF Size",
  caption: "Estimated",
  color: "text-amber-400",
},
{
  icon: Clock3,
  value: "Today",
  label: "Generated On",
  caption: "Today",
  color: "text-blue-400",
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
  className={`
    fixed
    inset-y-0
    right-0
    z-[9999]

    w-[560px]
    max-w-[96vw]

    overflow-hidden

    border-l
    border-white/10
    bg-[#07111d]

    transition-transform
    duration-300

    ${open ? "translate-x-0" : "translate-x-full"}
  `}
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
    overflow-x-hidden

    px-7
    pt-6
    pb-32

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
    w-[78%]

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
whitespace-pre-line
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



</div>

      </div>

      {/* ================================== */}
{/* ADDITIONAL COLUMNS */}
{/* ================================== */}

<div
  className={`
    ${additionalColumnsY}
  `}
>



  {/* Divider */}

<div
  className={`
    ${additionalDividerWidth}

    mb-5
    border-t
    border-white/10

    transform
    ${additionalDividerX}
    ${additionalDividerY}
  `}
/>

  {/* Title */}

  <h3
    className={`
      text-[11px]
      font-semibold
      uppercase
      tracking-[0.08em]
      text-slate-400

      transform
      ${additionalTitleX}
      ${additionalTitleY}
    `}
  >
    Business & Tax Information
  </h3>

  <p
  className={`
    mt-2
    text-[13px]
    text-slate-500

    transform
    ${additionalTitleX}
    ${additionalTitleY}
  `}
>
  Include additional accounting and tax fields.
</p>

  {/* Content */}

  <div
    className={`
      mt-5

      ${additionalCardWidth}

      transform
      ${additionalContentX}
      ${additionalContentY}
    `}
  >

    {BUSINESS_TAX_COLUMNS.map((item) => {

      const Icon = item.icon;

      return (

        <div key={item.id}>

          <div
  onClick={() =>
    setSelectedColumns((prev) => ({
      ...prev,
      [item.id]: !prev[item.id as keyof typeof prev],
    }))
  }
  className="
    flex
    cursor-pointer
    items-center
    gap-3
  "
>

            {/* Checkbox */}

<div

  className={`
    flex
    h-7
    w-7
    shrink-0
    cursor-pointer
    items-center
    justify-center

    rounded-lg

    ${
      selectedColumns[item.id as keyof typeof selectedColumns]
        ? "bg-[#2563eb]"
        : "border border-slate-500"
    }

    transform
    ${additionalCheckX}
  `}
>
  {selectedColumns[item.id as keyof typeof selectedColumns] && (
    <Check
      size={16}
      className="text-white"
    />
  )}
</div>

            {/* Icon */}

            <Icon
              size={18}
              className={`
                text-slate-400

                transform
                ${additionalIconX}
              `}
            />

            {/* Label */}

            <span
  className={`
    text-[15px]
    text-white

    transform
    ${additionalLabelX}
  `}
>
  {item.label}
</span>

          </div>

          <div className={additionalItemSpacing} />

        </div>

      );

    })}

  </div>

</div>

{/* ================================== */}
{/* ESTIMATED OUTPUT */}
{/* ================================== */}

<div className="mt-10">

  {/* Title */}

  <h3
    className={`
      text-[11px]
      font-semibold
      uppercase
      tracking-[0.08em]
      text-slate-400

      transform
      ${estimatedTitleX}
      ${estimatedTitleY}
    `}
  >
    Estimated Output
  </h3>

  {/* Card */}

  <div
    className={`
      mt-5

      ${estimatedCardWidth}
      ${estimatedCardHeight}

      rounded-2xl
      border
      border-white/10

      bg-white/[0.03]

      p-6

      transform
      ${estimatedCardX}
      ${estimatedCardY}
    `}
  >

    <div className="flex items-start justify-between">

      {/* ================================== */}
      {/* TOTAL PAGES */}
      {/* ================================== */}

      <div
        className={`
          flex
          items-start

          transform
          ${pagesX}
          ${pagesY}
        `}
      >

        <File
          size={30}
          className={`
            mt-1
            shrink-0
            text-emerald-400

            transform
            ${pagesIconX}
            ${pagesIconY}
          `}
        />

        <div className="ml-4 flex flex-col">

          <span
            className={`
              text-[14px]
              font-medium
              text-slate-300

              transform
              ${pagesLabelX}
              ${pagesLabelY}
            `}
          >
            Total Pages
          </span>

          <span
            className={`
              mt-2
              text-[16px]
              font-semibold
              text-white

              transform
              ${pagesValueX}
              ${pagesValueY}
            `}
          >
           {estimatedPageCount}
          </span>

          <span
            className={`
              mt-2
              text-[13px]
              text-slate-400

              transform
              ${pagesCaptionX}
              ${pagesCaptionY}
            `}
          >
            Estimated
          </span>

        </div>

      </div>

      {/* Divider 1 */}

      <div
        className={`
          border-r
          border-white/10

          ${divider1Height}

          transform
          ${divider1X}
          ${divider1Y}
        `}
      />

      {/* ================================== */}
      {/* TOTAL COLUMNS */}
      {/* ================================== */}

      <div
        className={`
          flex
          items-start

          transform
          ${columnsX}
          ${columnsY}
        `}
      >

        <Table2
          size={30}
          className={`
            mt-1
            shrink-0
            text-violet-400

            transform
            ${columnsIconX}
            ${columnsIconY}
          `}
        />

        <div className="ml-4 flex flex-col">

          <span
            className={`
              text-[14px]
              font-medium
              text-slate-300

              transform
              ${columnsLabelX}
              ${columnsLabelY}
            `}
          >
            Report Content
          </span>

          <span
            className={`
              mt-2
              text-[16px]
              font-semibold
              text-white

              transform
              ${columnsValueX}
              ${columnsValueY}
            `}
          >
            {reportContentCount}
          </span>

<span
  className={`
    mt-1
    text-[13px]
    text-slate-400

    transform
    ${columnsCaptionX}
    ${columnsCaptionY}
  `}
>
  Included
</span>

        </div>

      </div>

      {/* Divider 2 */}

      <div
        className={`
          border-r
          border-white/10

          ${divider2Height}

          transform
          ${divider2X}
          ${divider2Y}
        `}
      />

{/* ================================== */}
{/* PDF SIZE */}
{/* ================================== */}

<div
  className={`
    flex
    items-start

    transform
    ${pdfSizeX}
    ${pdfSizeY}
  `}
>

  <FileBadge
    size={30}
    className={`
      mt-1
      shrink-0
      text-amber-400

      transform
      ${pdfSizeIconX}
      ${pdfSizeIconY}
    `}
  />

  <div className="ml-4 flex flex-col">

    <span
      className={`
        text-[14px]
        font-medium
        text-slate-300

        transform
        ${pdfSizeLabelX}
        ${pdfSizeLabelY}
      `}
    >
      PDF Size
    </span>

    <span
      className={`
        mt-2
        text-[16px]
        font-semibold
        text-white

        transform
        ${pdfSizeValueX}
        ${pdfSizeValueY}
      `}
    >
      {`~${estimatedPdfSize} KB`}
    </span>

    <span
      className={`
        mt-2
        text-[13px]
        text-slate-400

        transform
        ${pdfSizeCaptionX}
        ${pdfSizeCaptionY}
      `}
    >
      Estimated
    </span>

  </div>

</div>

{/* Divider 3 */}

<div
  className={`
    border-r
    border-white/10

    ${divider3Height}

    transform
    ${divider3X}
    ${divider3Y}
  `}
/>

{/* ================================== */}
{/* GENERATED ON */}
{/* ================================== */}

<div
  className={`
    flex
    items-start

    transform
    ${generatedOnX}
    ${generatedOnY}
  `}
>

  <Clock3
    size={30}
    className={`
      mt-1
      shrink-0
      text-blue-400

      transform
      ${generatedOnIconX}
      ${generatedOnIconY}
    `}
  />

  <div className="ml-4 flex flex-col">

    <span
      className={`
        text-[14px]
        font-medium
        text-slate-300

        transform
        ${generatedOnLabelX}
        ${generatedOnLabelY}
      `}
    >
      Generated On
    </span>

    <span
      className={`
        mt-2
        text-[16px]
        font-semibold
        text-white

        transform
        ${generatedOnValueX}
        ${generatedOnValueY}
      `}
    >
      Today
    </span>

    <span
      className={`
        mt-2
        text-[13px]
        text-slate-400

        transform
        ${generatedOnCaptionX}
        ${generatedOnCaptionY}
      `}
    >
      Today
    </span>

  </div>

</div>

</div>

{/* ================================== */}
{/* BOTTOM DIVIDER */}
{/* ================================== */}

<div
  className={`
    mt-6
    border-t
    border-white/10

    transform
    ${estimatedBottomDividerX}
    ${estimatedBottomDividerY}
  `}
/>

{/* ================================== */}
{/* FOOTER */}
{/* ================================== */}

<div
  className={`
    mt-4

    flex
    items-center
    gap-2

    text-[13px]
    text-slate-400

    transform
    ${estimatedFooterX}
    ${estimatedFooterY}
  `}
>

  <Info size={16} />

  <span>
    Estimates are based on current selections and may vary.
  </span>

</div>

</div>

</div>


</section>


</div>
<div className="h-[24px] ">
  spacer
</div>
{/* ================================== */}
{/* FIXED FOOTER */}
{/* ================================== */}

<div
  className="
    relative
    z-20

    shrink-0

    min-h-[62px]

    px-7
    py-5

    border-t
    border-white/10

    bg-[#07111d]

    shadow-[0_-12px_24px_rgba(0,0,0,0.35)]
  "
>

  {/* Divider */}

  <div
    className={`
      ${footerDividerWidth}

      transform
      ${footerDividerX}
      ${footerDividerY}
    `}
  />

  {/* Buttons */}

  <div
    className={`
      mt-6

      flex
      justify-end

      ${footerButtonGap}

      transform
      ${footerContentX}
      ${footerContentY}
    `}
  >

    {/* Cancel */}

    <button
      type="button"
      onClick={onClose}
      className={`
        ${cancelButtonWidth}

        h-11

        rounded-xl
        border
        border-white/10

        bg-white/[0.04]

        text-[15px]
        font-medium
        text-slate-300

        transition-all
        hover:bg-white/[0.08]

        transform
        ${cancelButtonX}
        ${cancelButtonY}
      `}
    >
      Cancel
    </button>

    {/* Export */}

    <button
      type="button"
      onClick={async () => {

const options: ExpenseReportOptions = {

  includeSummary: true,

  includeCategorySummary: true,

  includeExpenseDetails: true,

  includeVendor: true,

  includeNotes: false,

  includeBusinessUse:
    selectedColumns.businessUse,

  includeDeductible:
    selectedColumns.deductible,

  includeTaxInformation:
    selectedColumns.taxType ||
    selectedColumns.taxAmount,

  includeReceiptStatus: true,

  includeRecurringStatus: false,

  includeExpenseType:
    selectedColumns.expenseType,

  includeTaxType:
    selectedColumns.taxType,

  includeTaxAmount:
    selectedColumns.taxAmount,

};

const filteredExportExpenses =
  expenses.filter(
    expense => {

      if (
        !startDate ||
        !endDate
      ) {
        return true;
      }

      const expenseDate =
        new Date(
          expense.expense_date +
          "T12:00:00"
        );

      return (
        expenseDate >= startDate &&
        expenseDate <= endDate
      );

    }
  );

const reportingPeriod =

  startDate && endDate

    ? `${startDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      )} – ${endDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      )}`

    : selectedPreset;

const profile =
  await loadProfile();

const reportOwner =
  profile?.display_name ??
  "Elite X User";

  await exportExpenseReport({

    expenses: filteredExportExpenses,

    reportingCurrency,

    reportingPeriod,

    generatedBy,

    reportVersion,

    options,

  });

}}
      className={`
        ${exportButtonWidth}

        h-11

        flex
        items-center
        justify-center
        gap-2

        rounded-xl

        bg-blue-600

        text-[15px]
        font-semibold
        text-white

        transition-all
        hover:bg-blue-500

        transform
        ${exportButtonX}
        ${exportButtonY}
      `}
    >
      <FileDown size={17} />

      Export PDF
    </button>

  </div>

</div>

</div>

</aside>
</>
);
}