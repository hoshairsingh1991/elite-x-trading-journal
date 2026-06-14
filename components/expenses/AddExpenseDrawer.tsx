"use client";

import { X } from "lucide-react";

type AddExpenseDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const headerPaddingX = "px-7";
const headerPaddingTop = "pt-6";
const headerPaddingBottom = "pb-5";

const titleX = "translate-x-2";
const titleY = "translate-y-2";

const subtitleX = "translate-x-2";
const subtitleY = "translate-y-2";

const closeButtonX = "-translate-x-2";
const closeButtonY = "translate-y-2";

const titleSize = "text-[28px]";
const subtitleSize = "text-[14px]";

const closeButtonSize = "h-8 w-8";
const closeIconSize = 20;

const headerDividerY = "translate-y-2";

// =========================
// BASIC INFORMATION
// =========================


const basicDividerY = "translate-y-0";

const basicSectionX = "translate-x-0";
const basicSectionY = "translate-y-0";

const basicHeaderX = "translate-x-3";
const basicHeaderY = "translate-y-3";

const expenseNameX = "translate-x-3";
const expenseNameY = "translate-y-4";
const expenseNameWidth = "w-full";
const expenseNameHeight = "h-[50px]";

const categoryX = "translate-x-3";
const categoryY = "translate-y-6";
const categoryWidth = "w-full";
const categoryHeight = "h-[50px]";

const vendorX = "translate-x-3";
const vendorY = "translate-y-6";
const vendorWidth = "w-full";
const vendorHeight = "h-[50px]";

const expenseDateX = "translate-x-3";
const expenseDateY = "translate-y-8";
const expenseDateWidth = "w-full";
const expenseDateHeight = "h-[50px]";

const descriptionX = "translate-x-3";
const descriptionY = "translate-y-10";
const descriptionWidth = "w-full";
const descriptionHeight = "h-24";

// =========================
// FINANCIAL
// =========================

const financialDividerY = "translate-y-10";

const financialSectionX = "translate-x-0";
const financialSectionY = "translate-y-0";

const financialHeaderX = "translate-x-3";
const financialHeaderY = "translate-y-11";

const originalAmountX = "translate-x-3";
const originalAmountY = "translate-y-12";
const originalAmountWidth = "w-full";
const originalAmountHeight = "h-[50px]";

const billedCurrencyX = "translate-x-3";
const billedCurrencyY = "translate-y-12";
const billedCurrencyWidth = "w-full";
const billedCurrencyHeight = "h-[50px]";

// =========================
// BUSINESS
// =========================

const businessDividerY = "translate-y-14";

const businessSectionX = "translate-x-0";
const businessSectionY = "translate-y-0";

const businessHeaderX = "translate-x-3";
const businessHeaderY = "translate-y-15";

const accountX = "translate-x-3";
const accountY = "translate-y-16";
const accountWidth = "w-full";
const accountHeight = "h-[50px]";

const paymentMethodX = "translate-x-3";
const paymentMethodY = "translate-y-16";
const paymentMethodWidth = "w-full";
const paymentMethodHeight = "h-[50px]";

const recurringX = "translate-x-3";
const recurringY = "translate-y-20";
const recurringWidth = "w-full";
const recurringHeight = "h-[50px]";

const frequencyX = "translate-x-3";
const frequencyY = "translate-y-20";
const frequencyWidth = "w-full";
const frequencyHeight = "h-[50px]";

const startDateX = "translate-x-3";
const startDateY = "translate-y-20";
const startDateWidth = "w-full";
const startDateHeight = "h-[50px]";


// ==============================
// TAX SECTION
// ==============================

const taxDividerY = "translate-y-20";

const taxSectionX = "translate-x-0";
const taxSectionY = "translate-y-0";

const taxHeaderX = "translate-x-3";
const taxHeaderY = "translate-y-22";

const taxDeductibleX = "translate-x-3";
const taxDeductibleY = "translate-y-24";
const taxDeductibleWidth = "w-[180px]";
const taxDeductibleHeight = "h-[50px]";

const deductiblePercentX = "translate-x-2";
const deductiblePercentY = "translate-y-24";
const deductiblePercentWidth = "w-[180px]";
const deductiblePercentHeight = "h-[50px]";

// ==============================
// NOTES SECTION
// ==============================

const notesSectionX = "translate-x-0";
const notesSectionY = "translate-y-0";

const notesHeaderX = "translate-x-2";
const notesHeaderY = "translate-y-26";

const notesX = "translate-x-3";
const notesY = "translate-y-28";
const notesWidth = "w-full";
const notesHeight = "h-26";

const notesDividerY = "translate-y-24";

// ==============================
// UPLOAD BOX
// ==============================

const uploadBoxX = "translate-x-3";
const uploadBoxY = "translate-y-30";
const uploadBoxWidth = "w-full";
const uploadBoxPadding = "p-8";

// ==============================
// FOOTER
// ==============================

const footerX = "-translate-x-0";
const footerY = "translate-y-0";

const cancelButtonX = "translate-x-52";
const cancelButtonY = "translate-y-2";
const cancelButtonWidth = "w-[120px]";
const cancelButtonHeight = "h-10";

const saveButtonX = "translate-x-52";
const saveButtonY = "translate-y-2";
const saveButtonWidth = "w-[160px]";
const saveButtonHeight = "h-10";

export default function AddExpenseDrawer({
  open,
  onClose,
}: AddExpenseDrawerProps) {


const inputCenter =
  "h-[50px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-center placeholder:text-center text-sm text-white placeholder:text-slate-500 outline-none";

const label =
  "mb-2.5 block text-[14px] font-medium text-slate-200";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[9999] h-screen w-[520px] max-w-[96vw] border-l border-white/10 bg-[#07111d] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">


            
{/* HEADER */}
<div
  className={`${headerPaddingX} ${headerPaddingTop} ${headerPaddingBottom}`}
>
  <div className="flex items-start justify-between">
    <div>
      <h2
        className={`${titleSize} font-bold leading-none tracking-tight text-white transform ${titleX} ${titleY}`}
      >
        Add Expense
      </h2>

      <p
        className={`mt-2 ${subtitleSize} text-slate-400 transform ${subtitleX} ${subtitleY}`}
      >
        Record a new business or trading expense
      </p>
    </div>

    <div className={`transform ${closeButtonX} ${closeButtonY}`}>
      <button
        onClick={onClose}
        className={`flex ${closeButtonSize} items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-slate-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white`}
      >
        <X size={closeIconSize} />
      </button>
    </div>
  </div>
</div>
{/* ===================== HEADER DIVIDER ===================== */}

<div
  className={`border-b border-white/10 transform ${headerDividerY}`}
/>
{/* BODY */}
<div className="flex-1 overflow-y-auto">
  <div className="mx-auto w-[95%] px-5 py-6">
{/* ===================== BASIC ===================== */}

<section
  className={`mb-10 transform ${basicSectionX} ${basicSectionY}`}
>
  <h3
    className={`mb-6 text-[18px] font-semibold text-white transform ${basicHeaderX} ${basicHeaderY}`}
  >
    Basic Information
  </h3>

  {/* Expense Name */}
  <div
    className={`mb-5 transform ${expenseNameX} ${expenseNameY}`}
  >
    <label className={label}>Expense Name *</label>

    <input
      className={`${expenseNameWidth} ${expenseNameHeight} rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none`}
      placeholder="Enter expense name"
    />
  </div>

  {/* Category + Vendor */}
  <div className="mb-5 grid grid-cols-2 gap-5">
    <div className={`transform ${categoryX} ${categoryY}`}>
      <label className={label}>Category *</label>

      <input
       className={`${inputCenter} ${categoryWidth} ${categoryHeight}`}
        placeholder="Select category"
      />
    </div>

    <div className={`transform ${vendorX} ${vendorY}`}>
      <label className={label}>Vendor</label>

      <input
        className={`${inputCenter} ${vendorWidth} ${vendorHeight}`}
        placeholder="Select or enter vendor"
      />
    </div>
  </div>

  {/* Expense Date */}
  <div className="mb-5 grid grid-cols-2 gap-5">
    <div className={`transform ${expenseDateX} ${expenseDateY}`}>
      <label className={label}>Expense Date *</label>

      <input
       className={`${inputCenter} ${expenseDateWidth} ${expenseDateHeight}`}
        placeholder="Jun 11, 2026"
      />
    </div>

    <div />
  </div>

  {/* Description */}
  <div
    className={`transform ${descriptionX} ${descriptionY}`}
  >
    <label className={label}>Description</label>

    <textarea
      className={`${descriptionWidth} ${descriptionHeight} resize-none rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white outline-none`}
      placeholder="Enter a brief description (optional)"
    />
  </div>
</section>

{/* Spacer */}
<div className="h-2" />

{/* ===================== FINANCIAL DIVIDER ===================== */}

<div className={`border-t border-white/10 transform ${financialDividerY}`} />

{/* ===================== FINANCIAL ===================== */}

<section
  className={`mb-8 pt-7 transform ${financialSectionX} ${financialSectionY}`}
>
  <h3
    className={`mb-5 text-lg font-semibold text-white transform ${financialHeaderX} ${financialHeaderY}`}
  >
    Financial Details
  </h3>

  <div className="grid grid-cols-2 gap-5">
    <div className={`transform ${originalAmountX} ${originalAmountY}`}>
      <label className={label}>Original Amount *</label>

      <input
       className={`${inputCenter} ${originalAmountWidth} ${originalAmountHeight}`}
        placeholder="0.00"
      />
    </div>

    <div className={`transform ${billedCurrencyX} ${billedCurrencyY}`}>
      <label className={label}>Billed Currency *</label>

      <input
        className={`${inputCenter} ${billedCurrencyWidth} ${billedCurrencyHeight}`}
        placeholder="USD"
      />
    </div>
  </div>
</section>

{/* ===================== BUSINESS DIVIDER ===================== */}

<div className={`border-t border-white/10 transform ${businessDividerY}`} />

{/* ===================== BUSINESS ===================== */}

<section
  className={`mb-8 pt-7 transform ${businessSectionX} ${businessSectionY}`}
>
  <h3
    className={`mb-5 text-lg font-semibold text-white transform ${businessHeaderX} ${businessHeaderY}`}
  >
    Business Details
  </h3>

  <div className="grid grid-cols-2 gap-5">
    <div className={`transform ${accountX} ${accountY}`}>
      <label className={label}>Account *</label>

<input
  className={`${inputCenter} ${accountWidth} ${accountHeight}`}
  placeholder="Select account"
/>
    </div>

    <div className={`transform ${paymentMethodX} ${paymentMethodY}`}>
      <label className={label}>Payment Method *</label>

      <input
        className={`${inputCenter} ${paymentMethodWidth} ${paymentMethodHeight}`}
        placeholder="Credit Card"
      />
    </div>
  </div>

  <div className="mt-5 grid grid-cols-3 gap-5">
<div className={`transform ${recurringX} ${recurringY}`}>
  <label className={label}>Recurring</label>

  <div
    className={`${recurringWidth} ${recurringHeight} flex items-center justify-between`}
  >
    <span className="text-sm text-slate-300">Enable recurring expense</span>

    {/* Toggle */}
    <button
      type="button"
      className="relative h-6 w-11 rounded-full bg-slate-600 transition-colors"
    >
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
    </button>
  </div>
</div>

    <div className={`transform ${frequencyX} ${frequencyY}`}>
      <label className={label}>Frequency</label>

      <input
        className={`${inputCenter} ${frequencyWidth} ${frequencyHeight}`}
        placeholder="Monthly"
      />
    </div>

    <div className={`transform ${startDateX} ${startDateY}`}>
      <label className={label}>Start Date</label>

      <input
       className={`${inputCenter} ${startDateWidth} ${startDateHeight}`}
        placeholder="Jun 11, 2026"
      />
    </div>
  </div>
</section>

{/* Spacer */}
<div className="h-2" />
{/* ===================== TAX DIVIDER ===================== */}

<div
  className={`border-t border-white/10 transform ${taxDividerY}`}
/>

{/* ===================== TAX ===================== */}

<section
  className={`mb-8 pt-7 transform ${taxSectionX} ${taxSectionY}`}
>
  <h3
    className={`mb-5 text-lg font-semibold text-white transform ${taxHeaderX} ${taxHeaderY}`}
  >
    Tax Information
  </h3>

  <div className="grid grid-cols-2 gap-5">
{/* Tax Deductible Toggle */}
<div
  className={`transform ${taxDeductibleX} ${taxDeductibleY}`}
>
  <label className={label}>Tax Deductible</label>

  <div
    className={`${taxDeductibleWidth} ${taxDeductibleHeight} flex items-center justify-between`}
  >
    <span className="text-sm text-slate-300">
      Eligible for tax deduction
    </span>

    <button
      type="button"
      className="relative h-6 w-11 rounded-full bg-blue-600 transition-colors"
    >
      <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-all" />
    </button>
  </div>
</div>

    {/* Deductible Percentage */}
    <div
      className={`transform ${deductiblePercentX} ${deductiblePercentY}`}
    >
      <label className={label}>Deductible %</label>

      <input
        className={`${inputCenter} ${deductiblePercentWidth} ${deductiblePercentHeight}`}
        placeholder="100"
      />
    </div>
  </div>
</section>

{/* Spacer */}
<div className="h-2" />
{/* ===================== NOTES DIVIDER ===================== */}

<div
  className={`border-t border-white/10 transform ${notesDividerY}`}
/>

{/* ===================== NOTES ===================== */}

<section
  className={`pt-7 transform ${notesSectionX} ${notesSectionY}`}
>
  <h3
    className={`mb-5 text-lg font-semibold text-white transform ${notesHeaderX} ${notesHeaderY}`}
  >
    Additional Information
  </h3>

  <div className={`transform ${notesX} ${notesY}`}>
    <label className={label}>Notes</label>

    <textarea
      className={`${notesWidth} ${notesHeight} resize-none rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white outline-none`}
      placeholder="Add any notes..."
    />
  </div>

  <div
    className={`mt-6 ${uploadBoxWidth} rounded-2xl border border-dashed border-white/10 ${uploadBoxPadding} text-center transform ${uploadBoxX} ${uploadBoxY}`}
  >
    <p className="text-sm text-slate-300">
      Drag & drop receipts here
    </p>

    <p className="mt-2 text-xs text-slate-500">
      JPG • PNG • PDF
    </p>
  </div>
</section>

{/* Close inner wrapper (w-[95%] / w-[96%]) */}
</div>

{/* Close scrollable body */}
</div>

{/* ===================== FOOTER ===================== */}

<div
  className={`border-t border-white/10 bg-[#07111d] px-8 py-5 transform ${footerX} ${footerY}`}
>
  <div className="flex gap-4">
    <div className={`transform ${cancelButtonX} ${cancelButtonY}`}>
      <button
        onClick={onClose}
        className={`${cancelButtonWidth} ${cancelButtonHeight} rounded-xl border border-white/10 text-white`}
      >
        Cancel
      </button>
    </div>

    <div className={`flex-1 transform ${saveButtonX} ${saveButtonY}`}>
      <button
        className={`${saveButtonWidth} ${saveButtonHeight} rounded-xl bg-blue-600 font-semibold text-white`}
      >
        Save Expense
      </button>
    </div>
  </div>
</div>
{/* Spacer */}
  <div className="h-4" />
{/* Close flex h-full flex-col */}
</div>

</aside>
    </>
  );
}