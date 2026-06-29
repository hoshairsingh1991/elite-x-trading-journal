"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  saveExpense,
  updateExpense,
} from "@/lib/storage/supabaseExpenseStorage";
import type { Expense } from "@/lib/types/expense";

import { generateRecurringOccurrences }
from "@/lib/expenses/generateRecurringOccurrences";

import EliteSelect, {
  type EliteSelectOption,
} from "@/components/ui/EliteSelect";

import { supabase } from "@/lib/supabase";


type AddExpenseDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  editingExpense?: Expense | null;
};

const headerPaddingX = "px-7";
const headerPaddingTop = "pt-6";
const headerPaddingBottom = "pb-5";

const titleX = "translate-x-3";
const titleY = "translate-y-2";

const subtitleX = "translate-x-3";
const subtitleY = "translate-y-2";

const closeButtonX = "-translate-x-2";
const closeButtonY = "translate-y-2";

const titleSize = "text-[20px]";
const subtitleSize = "text-[12px]";

const closeButtonSize = "h-8 w-8";
const closeIconSize = 20;

const headerDividerY = "translate-y-2";

// =========================
// BASIC INFORMATION
// =========================

const expenseNameTextIndent = "indent-[6px]";
const descriptionTextIndent = "indent-[6px]";
const businessPurposeTextIndent = "pl-6";
const notesTextIndent = "indent-[6px]";


const descriptionPaddingX = "px-5";

const basicDividerY = "translate-y-0";

const basicSectionX = "translate-x-0";
const basicSectionY = "translate-y-1";

const basicHeaderX = "translate-x-3";
const basicHeaderY = "translate-y-3";

const expenseNameX = "translate-x-3";
const expenseNameY = "translate-y-3";
const expenseNameWidth = "w-full";
const expenseNameHeight = "h-[40px]";

const categoryX = "translate-x-3";
const categoryY = "translate-y-5";
const categoryWidth = "w-full";
const categoryHeight = "h-[40px]";

const vendorX = "translate-x-3";
const vendorY = "translate-y-5";
const vendorWidth = "w-full";
const vendorHeight = "h-[40px]";

const expenseDateX = "translate-x-3";
const expenseDateY = "translate-y-7";
const expenseDateWidth = "w-full";
const expenseDateHeight = "h-[40px]";

const descriptionX = "translate-x-3";
const descriptionY = "translate-y-9";
const descriptionWidth = "w-full";
const descriptionHeight = "h-24";

// =========================
// FINANCIAL
// =========================

const financialDividerY = "translate-y-10";

const financialSectionX = "translate-x-0";
const financialSectionY = "translate-y-2";

const financialHeaderX = "translate-x-3";
const financialHeaderY = "translate-y-11";

const originalAmountX = "translate-x-3";
const originalAmountY = "translate-y-12";
const originalAmountWidth = "w-full";
const originalAmountHeight = "h-[40px]";

const billedCurrencyX = "translate-x-3";
const billedCurrencyY = "translate-y-12";
const billedCurrencyWidth = "w-full";
const billedCurrencyHeight = "h-[40px]";

// =========================
// BUSINESS
// =========================

const businessDividerY = "translate-y-18";

const businessSectionX = "translate-x-0";
const businessSectionY = "translate-y-6";

const businessHeaderX = "translate-x-3";
const businessHeaderY = "translate-y-15";

const expenseTypeX = "translate-x-3";
const expenseTypeY = "translate-y-16";
const expenseTypeWidth = "w-full";
const expenseTypeHeight = "h-[40px]";

const paymentMethodX = "translate-x-3";
const paymentMethodY = "translate-y-21";
const paymentMethodWidth = "w-full";
const paymentMethodHeight = "h-[40px]";

const businessPurposeX = "translate-x-3";
const businessPurposeY = "translate-y-16";
const businessPurposeWidth = "w-full";
const businessPurposeHeight = "h-[70px]";

const recurringX = "translate-x-54";
const recurringY = "-translate-y-7";
const recurringWidth = "w-[180px]";
const recurringHeight = "h-[50px]";

const recurringLabelX = "translate-x-0";
const recurringLabelY = "translate-y-3";

const recurringToggleX = "-translate-x-40";
const recurringToggleY = "translate-y-1";

const frequencyX = "-translate-x-15";
const frequencyY = "-translate-y-3";
const frequencyWidth = "w-[180px]";
const frequencyHeight = "h-[40px]";

const frequencyBoxX = "translate-x-30";
const frequencyBoxY = "translate-y-0";

const businessUseX = "-translate-x-78";
const businessUseY = "-translate-y-7";

const businessUseWidth = "w-[180px]";
const businessUseHeight = "h-[40px]";

const businessUseSymbolX = "-translate-x-12";
const businessUseSymbolY = "-translate-y-2";

const businessUseBoxX = "translate-x-0";
const businessUseBoxY = "translate-y-0";

// ==============================
// TAX SECTION
// ==============================

const taxDividerY = "-translate-y-2";

const taxSectionX = "translate-x-0";
const taxSectionY = "-translate-y-22";

const taxHeaderX = "translate-x-3";
const taxHeaderY = "translate-y-22";

const taxDeductibleX = "translate-x-3";
const taxDeductibleY = "translate-y-23";
const taxDeductibleWidth = "w-[180px]";
const taxDeductibleHeight = "h-[50px]";

const deductiblePercentX = "translate-x-2";
const deductiblePercentY = "translate-y-24";
const deductiblePercentWidth = "w-[180px]";
const deductiblePercentHeight = "h-[40px]";

const taxDeductibleTextX = "translate-x-0";
const taxDeductibleTextY = "translate-y-0";

const taxDeductibleLabelX = "translate-x-0";
const taxDeductibleLabelY = "translate-y-1";

const receiptNumberX = "translate-x-3";
const receiptNumberY = "translate-y-24";

const receiptNumberWidth = "w-[180px]";
const receiptNumberHeight = "h-[40px]";

const receiptNumberBoxX = "translate-x-0";
const receiptNumberBoxY = "translate-y-0";

const taxTypeX = "translate-x-54";
const taxTypeY = "translate-y-10";

const taxTypeWidth = "w-[180px]";
const taxTypeHeight = "h-[40px]";

const taxTypeBoxX = "translate-x-0";
const taxTypeBoxY = "translate-y-0";

const taxAmountX = "translate-x-3";
const taxAmountY = "translate-y-12";

const taxAmountWidth = "w-[180px]";
const taxAmountHeight = "h-[40px]";

const taxAmountBoxX = "translate-x-0";
const taxAmountBoxY = "translate-y-0";

const taxAmountSymbolX = "-translate-x-24";
const taxAmountSymbolY = "-translate-y-2";

// ==============================
// NOTES SECTION
// ==============================

const notesSectionX = "translate-x-0";
const notesSectionY = "-translate-y-28";

const notesHeaderX = "translate-x-2";
const notesHeaderY = "translate-y-22";

const notesX = "translate-x-3";
const notesY = "translate-y-22";
const notesWidth = "w-full";
const notesHeight = "h-30";

const notesDividerY = "-translate-y-8";

// ==============================
// UPLOAD BOX
// ==============================

const uploadBoxX = "translate-x-3";
const uploadBoxY = "translate-y-24";
const uploadBoxWidth = "w-full";
const uploadBoxPadding = "p-8";
const uploadBoxHeight = "h-[60px]";

// ==============================
// FOOTER
// ==============================

const footerX = "-translate-x-0";
const footerY = "translate-y-0";

const cancelButtonX = "translate-x-40";
const cancelButtonY = "translate-y-2";
const cancelButtonWidth = "w-[110px]";
const cancelButtonHeight = "h-10";

const saveButtonX = "translate-x-40";
const saveButtonY = "translate-y-2";
const saveButtonWidth = "w-[120px]";
const saveButtonHeight = "h-10";

export default function AddExpenseDrawer({
  open,
  onClose,
  onSaveSuccess,
  editingExpense,
}: AddExpenseDrawerProps) {

// ==========================================
// FORM STATE
// ==========================================

const [expenseName, setExpenseName] = useState("");
const [category, setCategory] = useState("");
const [vendor, setVendor] = useState("TradingView");
const [expenseDate, setExpenseDate] = useState("");

const [description, setDescription] = useState("");

const [originalAmount, setOriginalAmount] =
  useState("");

const [billedCurrency, setBilledCurrency] =
  useState("USD");

const [paymentMethod, setPaymentMethod] =
  useState("");

  const [businessPurpose, setBusinessPurpose] =
  useState("");

const [isRecurring, setIsRecurring] =
  useState(false);


const [frequency, setFrequency] =
  useState("");

  const [receiptNumber, setReceiptNumber] = useState("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);


const [isTaxDeductible, setIsTaxDeductible] =
  useState(false);

  const [businessUsePercent, setBusinessUsePercent] = useState("100");

  const [taxType, setTaxType] = useState("None");

const [deductiblePercent, setDeductiblePercent] =
  useState("100");

  const [taxAmount, setTaxAmount] = useState("0.00");

const [notes, setNotes] =
  useState("");

  const [expenseType, setExpenseType] = useState("Operating");

// ==========================================
// DROPDOWN OPTIONS
// ==========================================

const categoryOptions: EliteSelectOption[] = [
  { value: "Software", label: "Software" },
  { value: "Market Data", label: "Market Data" },
  { value: "Brokerage Fees", label: "Brokerage Fees" },
  { value: "Education", label: "Education" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Other", label: "Other" },
];

const vendorOptions: EliteSelectOption[] = [
  { value: "TradingView", label: "TradingView" },
  { value: "Bookmap", label: "Bookmap" },
  { value: "Rithmic", label: "Rithmic" },
  { value: "CQG", label: "CQG" },
  { value: "Interactive Brokers", label: "Interactive Brokers" },
  { value: "NinjaTrader", label: "NinjaTrader" },
  { value: "Edgeful", label: "Edgeful" },
  { value: "TradeZella", label: "TradeZella" },
  { value: "Udemy", label: "Udemy" },
  { value: "Other", label: "Other" },
];

const currencyOptions: EliteSelectOption[] = [
  { value: "USD", label: "USD" },
  { value: "CAD", label: "CAD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
  { value: "INR", label: "INR" },
];

const expenseTypeOptions: EliteSelectOption[] = [
  { value: "Operating", label: "Operating" },
  { value: "Capital", label: "Capital" },
];

const paymentMethodOptions: EliteSelectOption[] = [
  { value: "Credit Card", label: "Credit Card" },
  { value: "Bank Account", label: "Bank Account" },
  { value: "Cash", label: "Cash" },
  { value: "Debit Card", label: "Debit Card" },
  { value: "PayPal", label: "PayPal" },
  { value: "Wire Transfer", label: "Wire Transfer" },
  { value: "Other", label: "Other" },
];

const frequencyOptions: EliteSelectOption[] = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Yearly", label: "Yearly" },
];

const taxTypeOptions: EliteSelectOption[] = [
  { value: "None", label: "None" },
  { value: "GST/HST", label: "GST/HST" },
  { value: "GST Included", label: "GST Included" },
  { value: "HST Included", label: "HST Included" },
  { value: "PST", label: "PST" },
  { value: "QST", label: "QST" },
  { value: "VAT", label: "VAT" },
  { value: "Sales Tax", label: "Sales Tax" },
  { value: "Other", label: "Other" },
];

// ==========================================
// RECEIPT UPLOAD
// ==========================================

function handleReceiptUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  setReceiptFile(file);
  setReceiptUrl(null);

  console.log("Receipt selected:", file.name);
}

// ==========================================
// VIEW RECEIPT
// ==========================================

async function handleViewReceipt() {
  if (!receiptUrl) return;

  const {
    data,
    error,
  } = await supabase.storage
    .from("receipts")
    .createSignedUrl(
      receiptUrl,
      60
    );

  if (error) {
    console.error(error);
    alert("Unable to open receipt.");
    return;
  }

  window.open(
    data.signedUrl,
    "_blank"
  );
}

// ==========================================
// REMOVE RECEIPT
// ==========================================

async function handleRemoveReceipt() {
  const confirmed = window.confirm(
    "Remove this receipt?"
  );

  if (!confirmed) return;

  // Existing receipt stored in Supabase
  if (receiptUrl) {
    const { error } = await supabase.storage
      .from("receipts")
      .remove([receiptUrl]);

    if (error) {
      console.error(error);
      alert("Failed to remove receipt.");
      return;
    }
  }

  setReceiptFile(null);
  setReceiptUrl(null);
}

// ==========================================
// EDIT MODE PREFILL
// ==========================================

useEffect(() => {
if (!editingExpense) {
  setExpenseName("");

  setCategory("Software");
  setVendor("TradingView");

  setExpenseDate(new Date().toISOString().split("T")[0]);
  setDescription("");

  setOriginalAmount("");

  setBilledCurrency("USD");

  setPaymentMethod("Credit Card");

  setBusinessPurpose("");

  setExpenseType("Operating");

  setBusinessUsePercent("100");

  setIsRecurring(false);
  setFrequency("Monthly");

  setIsTaxDeductible(false);

  setTaxType("None");
  setTaxAmount("0.00");

  setDeductiblePercent("100");

  setReceiptNumber("");

  setReceiptFile(null);
setReceiptUrl(null);

  setNotes("");

  return;
}

  setExpenseName(editingExpense.expense_name ?? "");
  setCategory(editingExpense.category ?? "");
  setVendor(editingExpense.vendor ?? "TradingView");
  setExpenseDate(editingExpense.expense_date ?? "");

  setDescription(editingExpense.description ?? "");

  setOriginalAmount(
    editingExpense.original_amount?.toString() ?? ""
  );

  setBilledCurrency(
    editingExpense.billed_currency ?? "USD"
  );

  setPaymentMethod(
  editingExpense.payment_method ?? "Credit Card"
);

setExpenseType(
  editingExpense.expense_type ?? "Operating"
);

setBusinessPurpose(
  editingExpense.business_purpose ?? ""
);

setBusinessUsePercent(
  editingExpense.business_use_percent?.toString() ?? "100"
);

  setIsRecurring(
    editingExpense.is_recurring ?? false
  );

setFrequency(
  editingExpense.frequency ?? "Monthly"
);

  setIsTaxDeductible(
  editingExpense.is_tax_deductible ?? false
);

  setDeductiblePercent(
    editingExpense.deductible_percent?.toString() ?? "100"
  );

  setReceiptNumber(
  editingExpense.receipt_number ?? ""
);

setReceiptFile(null);

setReceiptUrl(
  editingExpense.receipt_url ?? null
);

setTaxType(
  editingExpense.tax_type ?? "None"
);

setTaxAmount(
  editingExpense.tax_amount?.toString() ?? "0.00"
);

  setNotes(
    editingExpense.notes ?? ""
  );
}, [editingExpense, open]);

// ==========================================
// SAVE
// ==========================================

async function handleSave() {
  if (
    !expenseName ||
    !category ||
    !expenseDate ||
    !originalAmount ||
    !billedCurrency
  ) {
    alert("Please complete all required fields.");
    return;
  }

try {
  const recurringGroupId =
  editingExpense?.recurring_group_id
    ? editingExpense.recurring_group_id
    : isRecurring
      ? crypto.randomUUID()
      : null;

       const businessUse = Math.max(
    0,
    Math.min(100, Number(businessUsePercent) || 100)
  );

  const deductible = Math.max(
  0,
  Math.min(100, Number(deductiblePercent) || 100)
);

// ==========================================
// UPLOAD RECEIPT (IF SELECTED)
// ==========================================

let uploadedReceiptUrl = receiptUrl;

if (receiptFile) {
console.log("Uploading receipt...", receiptFile.name);

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    alert("Please sign in again.");
    return;
  }

  const fileName =
    `${Date.now()}-${receiptFile.name}`;

  const filePath =
    `${user.id}/${fileName}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from("receipts")
    .upload(filePath, receiptFile);

  if (uploadError) {
    console.error(uploadError);
    alert("Failed to upload receipt.");
    return;
  }

  uploadedReceiptUrl = filePath;
}

const expenseData = {
  expense_name: expenseName,
  expense_date: expenseDate,

  category,
  description,

  original_amount: parseFloat(originalAmount),
  billed_currency: billedCurrency,

vendor,

// Business Details
expense_type: expenseType,
business_purpose: businessPurpose,
business_use_percent: businessUse,

payment_method: paymentMethod,

// Tax & Receipt
receipt_number: receiptNumber,

tax_type: taxType,
tax_amount: parseFloat(taxAmount) || 0,

  is_recurring: isRecurring,
  frequency: frequency || null,
  start_date: expenseDate,

  recurring_group_id: recurringGroupId,

  is_template: false,
  is_generated: false,
  is_active: true,

  is_tax_deductible: isTaxDeductible,
  deductible_percent: deductible,

notes,
receipt_url: uploadedReceiptUrl,
};

if (editingExpense?.id) {

  await updateExpense(
    editingExpense.id,
    expenseData
  );

} else {

  const savedExpense =
    await saveExpense(
      expenseData
    );

  if (
    savedExpense &&
    savedExpense.is_recurring
  ) {

    await generateRecurringOccurrences(
      savedExpense
    );
  }
}

  onSaveSuccess();
  onClose();
} catch (error) {
  console.error(error);
  alert("Failed to save expense.");
}
}

const inputCenter =
  "h-[40px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[12px] text-center placeholder:text-center text-sm text-white placeholder:text-slate-500 outline-none";

const label =
  "mb-2.5 block text-[12px] font-medium text-slate-200";

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
  className={`fixed right-0 top-0 z-[9999] h-screen w-[420px] max-w-[96vw] overflow-x-hidden border-l border-white/10 bg-[#07111d] transition-transform duration-300 ${
    open ? "translate-x-0" : "translate-x-full"
  }`}
>
        <div className="flex h-full flex-col overflow-x-hidden">


            
{/* HEADER */}
<div
  className={`${headerPaddingX} ${headerPaddingTop} ${headerPaddingBottom}`}
>
  <div className="flex items-start justify-between">
    <div>
      <h2
        className={`${titleSize} font-bold leading-none tracking-tight text-white transform ${titleX} ${titleY}`}
      >
        {editingExpense ? "Edit Expense" : "Add Expense"}
      </h2>

      <p
        className={`mt-2 ${subtitleSize} text-slate-400 transform ${subtitleX} ${subtitleY}`}
      >
        {editingExpense
  ? "Update an existing business or trading expense"
  : "Record a new business or trading expense"}
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
<div className="flex-1 overflow-x-hidden overflow-y-auto">
  <div className="mx-auto w-[95%] px-5 py-6">
{/* ===================== BASIC ===================== */}

<section
  className={`mb-10 transform ${basicSectionX} ${basicSectionY}`}
>
  <h3
    className={`mb-6 text-[16px] font-semibold text-white transform ${basicHeaderX} ${basicHeaderY}`}
  >
    Basic Information
  </h3>

  {/* Expense Name */}
  <div
    className={`mb-5 transform ${expenseNameX} ${expenseNameY}`}
  >
    <label className={label}>Expense Name *</label>

<input
  value={expenseName}
  onChange={(e) => setExpenseName(e.target.value)}
  className={`${expenseNameWidth} ${expenseNameHeight} rounded-xl border border-white/10 bg-white/[0.03] px-4 ${expenseNameTextIndent} text-sm text-white outline-none`}
  placeholder="Enter expense name"
/>
  </div>

  {/* Category + Vendor */}
  <div className="mb-5 grid grid-cols-2 gap-5">
    <div className={`transform ${categoryX} ${categoryY}`}>
      <label className={label}>Category *</label>

<EliteSelect
  variant="form"
  value={category}
  options={categoryOptions}
  onChange={setCategory}
  width={categoryWidth}
  height={categoryHeight}
/>
    </div>

<div className={`transform ${vendorX} ${vendorY}`}>
  <label className={label}>Vendor</label>

<EliteSelect
  variant="form"
  value={vendor}
  options={vendorOptions}
  onChange={setVendor}
  width={vendorWidth}
  height={vendorHeight}
/>
</div>
</div>

{/* Expense Date */}
<div className="mb-5 grid grid-cols-2 gap-5">
  <div className={`transform ${expenseDateX} ${expenseDateY}`}>
    <label className={label}>Expense Date *</label>

<input
  type="date"
  value={expenseDate}
  onChange={(e) => setExpenseDate(e.target.value)}
  className={`${expenseDateWidth} ${expenseDateHeight} rounded-xl border border-white/10 bg-white/[0.03] px-4 text-center text-sm text-white outline-none`}
  style={{
    colorScheme: "dark",
  }}
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
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className={`h-20 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] ${descriptionTextIndent} pr-4 pt-4 pb-4 text-sm text-white outline-none`}
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
  className={`relative z-50 mb-8 pt-7 transform ${financialSectionX} ${financialSectionY}`}
>
  <h3
    className={`mb-5 text-[14px] font-semibold text-white transform ${financialHeaderX} ${financialHeaderY}`}
  >
    Financial Details
  </h3>

  <div className="grid grid-cols-2 gap-5">
    <div className={`transform ${originalAmountX} ${originalAmountY}`}>
      <label className={label}>Original Amount *</label>

<input
  type="number"
  step="0.01"
  min="0"
  value={originalAmount}
  onChange={(e) => setOriginalAmount(e.target.value)}
  className={`${inputCenter} ${originalAmountWidth} ${originalAmountHeight}`}
  placeholder="0.00"
/>
    </div>

<div className={`transform ${billedCurrencyX} ${billedCurrencyY}`}>
  <label className={label}>Billed Currency *</label>

<EliteSelect
  variant="form"
  value={billedCurrency}
  options={currencyOptions}
  onChange={setBilledCurrency}
  width={billedCurrencyWidth}
  height={billedCurrencyHeight}
/>
</div>
  </div>
</section>

{/* ===================== BUSINESS DIVIDER ===================== */}

<div className={`border-t border-white/10 transform ${businessDividerY}`} />

{/* ===================== BUSINESS ===================== */}

<section
  className={`relative z-10 mb-8 pt-7 transform ${businessSectionX} ${businessSectionY}`}
>
  <h3
    className={`mb-5 text-[14px] font-semibold text-white transform ${businessHeaderX} ${businessHeaderY}`}
  >
    Business Details
  </h3>

  <div className="grid grid-cols-2 gap-5">
{/* Account */}
<div className={`transform ${expenseTypeX} ${expenseTypeY}`}>
  <label className={label}>Expense Type *</label>

<EliteSelect
  variant="form"
  value={expenseType}
  options={expenseTypeOptions}
  onChange={setExpenseType}
  width={expenseTypeWidth}
  height={expenseTypeHeight}
/>
</div>

{/* Business Purpose */}
<div
  className={`mt-5 transform ${businessPurposeX} ${businessPurposeY}`}
>
  <label className={label}>Business Purpose *</label>

  <textarea
    value={businessPurpose}
    onChange={(e) => setBusinessPurpose(e.target.value)}
    className={`
      ${businessPurposeWidth}
      ${businessPurposeHeight}
      resize-none
      rounded-xl
      border
      border-white/10
      bg-white/[0.03]
      ${businessPurposeTextIndent}
      pr-4
      pt-4
      pb-4
      text-sm
      text-white
      outline-none
    `}
    placeholder="Describe how this expense supports your business or trading activities..."
  />
</div>

    {/* Payment Method */}
    <div className={`transform ${paymentMethodX} ${paymentMethodY}`}>
      <label className={label}>Payment Method *</label>

<EliteSelect
  variant="form"
  value={paymentMethod}
  options={paymentMethodOptions}
  onChange={setPaymentMethod}
  width={paymentMethodWidth}
  height={paymentMethodHeight}
/>
    </div>
  </div>

  <div className="mt-5 grid grid-cols-3 gap-5">
    <div className={`transform ${recurringX} ${recurringY}`}>
      <label
  className={`
    ${label}
    transform
    ${recurringLabelX}
    ${recurringLabelY}
  `}
>
  Recurring
</label>

     <div
  className={`${recurringWidth} ${recurringHeight} relative z-0 flex items-center justify-between`}
>
        <span className="text-sm text-slate-300 whitespace-nowrap">
  Enable Recurring
</span>

{/* Business Use */}
<div
  className={`
    mt-4
    transform
    ${businessUseX}
    ${businessUseY}
  `}
>
  <label className={label}>Business Use %</label>

  <div
    className={`
      relative
      ${businessUseWidth}
      ${businessUseBoxX}
      ${businessUseBoxY}
    `}
  >
<input
  type="number"
  min={0}
  max={100}
  step={1}
  inputMode="numeric"
  value={businessUsePercent}
  onChange={(e) => {
    const raw = e.target.value;

    // Allow user to temporarily clear the field while editing
    if (raw === "") {
      setBusinessUsePercent("");
      return;
    }

    let value = Number(raw);

    if (Number.isNaN(value)) return;

    value = Math.max(0, Math.min(100, value));

    setBusinessUsePercent(value.toString());
  }}
  onBlur={() => {
    // Never leave the field empty
    if (businessUsePercent === "") {
      setBusinessUsePercent("100");
    }
  }}
  className={`${inputCenter} w-full ${businessUseHeight} pr-10`}
/>

<span
  className={`
    pointer-events-none
    absolute
    right-4
    top-1/2
    -translate-y-1/2
    transform
    ${businessUseSymbolX}
    ${businessUseSymbolY}
    text-xs
    text-slate-400
  `}
>
  %
</span>
  </div>
</div>

{/* Toggle Test */}
<div
  className={`
    transform
    ${recurringToggleX}
    ${recurringToggleY}
    relative
    z-0
  `}
>
  <button
    type="button"
    onClick={() => setIsRecurring((prev) => !prev)}
    className={`relative h-6 w-11 rounded-full transition-colors ${
      isRecurring ? "bg-blue-600" : "bg-slate-600"
    }`}
  >
    <span
      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
        isRecurring ? "right-1" : "left-1"
      }`}
    />
  </button>
</div>
</div>

<div
  className={`
    transform
    ${frequencyX}
    ${frequencyY}
    flex
    flex-col
    items-end
  `}
>
  <label className={label}>Frequency</label>

<div
  className={`
    ${frequencyWidth}
    ${frequencyBoxX}
    ${frequencyBoxY}
  `}
>
  <EliteSelect
    variant="form"
    value={frequency}
    options={frequencyOptions}
    onChange={setFrequency}
    width="w-full"
    height={frequencyHeight}
    disabled={!isRecurring}
  />
</div>
</div>
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
  className={`relative z-1 mb-8 pt-7 transform ${taxSectionX} ${taxSectionY}`}
>
  <h3
    className={`mb-5 text-[14px] font-semibold text-white transform ${taxHeaderX} ${taxHeaderY}`}
  >
    Tax Information
  </h3>

  <div className="grid grid-cols-2 gap-5">
    {/* Tax Deductible Toggle */}
    <div
      className={`transform ${taxDeductibleX} ${taxDeductibleY}`}
    >
      <label
  className={`
    ${label}
    transform
    ${taxDeductibleLabelX}
    ${taxDeductibleLabelY}
  `}
>
  Tax Deductible
</label>

      <div
        className={`${taxDeductibleWidth} ${taxDeductibleHeight} flex items-center justify-between`}
      >
        <span
  className={`
    text-sm
    text-slate-300
    transform
    ${taxDeductibleTextX}
    ${taxDeductibleTextY}
  `}
>
  Enable Deduction
</span>

        <button
          type="button"
          onClick={() =>
            setIsTaxDeductible((prev) => !prev)
          }
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isTaxDeductible
              ? "bg-blue-600"
              : "bg-slate-600"
          }`}
        >
<span
  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
    isTaxDeductible
      ? "right-1"
      : "left-1"
  }`}
/>
        </button>
      </div>
    </div>

    {/* Deductible Percentage */}
    <div
      className={`transform ${deductiblePercentX} ${deductiblePercentY}`}
    >
      <label className={label}>Deductible %</label>

<input
  type="number"
  min="0"
  max="100"
  step="1"
  value={deductiblePercent}
  onChange={(e) => {
    const value = Number(e.target.value);

    if (e.target.value === "") {
      setDeductiblePercent("");
      return;
    }

    if (value < 0) {
      setDeductiblePercent("0");
      return;
    }

    if (value > 100) {
      setDeductiblePercent("100");
      return;
    }

    setDeductiblePercent(e.target.value);
  }}
  onBlur={() => {
    if (deductiblePercent === "") {
      setDeductiblePercent("100");
    }
  }}
  disabled={!isTaxDeductible}
  className={`${inputCenter} ${deductiblePercentWidth} ${deductiblePercentHeight} ${
    !isTaxDeductible
      ? "cursor-not-allowed opacity-50"
      : ""
  }`}
  placeholder="100"
/>
    </div>
  </div>

  {/* Receipt / Invoice Number */}
<div
  className={`
    transform
    ${receiptNumberX}
    ${receiptNumberY}
  `}
>
  <label className={label}>Receipt / Invoice #</label>

  <div
    className={`
      relative
      ${receiptNumberWidth}
      ${receiptNumberBoxX}
      ${receiptNumberBoxY}
    `}
  >
    <input
      type="text"
      value={receiptNumber}
      onChange={(e) => setReceiptNumber(e.target.value)}
      placeholder="Optional"
      className={`${inputCenter} w-full ${receiptNumberHeight}`}
    />
  </div>
</div>

<div
  className={`
    transform
    ${taxTypeX}
    ${taxTypeY}
  `}
>
  <label className={label}>Tax Type</label>

<div
  className={`
    ${taxTypeWidth}
    ${taxTypeBoxX}
    ${taxTypeBoxY}
  `}
>
  <EliteSelect
    variant="form"
    value={taxType}
    options={taxTypeOptions}
    onChange={setTaxType}
    width="w-full"
    height={taxTypeHeight}
  />
</div>
</div>

{/* Tax Amount */}
<div
  className={`
    mt-4
    transform
    ${taxAmountX}
    ${taxAmountY}
  `}
>
  <label className={label}>Tax Amount</label>

  <div
    className={`
      relative
      ${taxAmountWidth}
      ${taxAmountBoxX}
      ${taxAmountBoxY}
    `}
  >
    <input
      type="number"
      min="0"
      step="0.01"
      value={taxAmount}
      onChange={(e) => setTaxAmount(e.target.value)}
      className={`${inputCenter} w-full ${taxAmountHeight}`}
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
    className={`mb-5 text-[14px] font-semibold text-white transform ${notesHeaderX} ${notesHeaderY}`}
  >
    Additional Information
  </h3>

  {/* Notes */}
  <div className={`transform ${notesX} ${notesY}`}>
    <label className={label}>Notes</label>

    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className={`${notesWidth} ${notesHeight} resize-none rounded-xl border border-white/10 bg-white/[0.03] p-4 ${notesTextIndent} text-sm text-white outline-none`}
      placeholder="Add any notes..."
    />
  </div>

  {/* Receipt Upload */}
  <label
    htmlFor="receipt-upload"
    className={`
      mt-6
      ${uploadBoxWidth}
      ${uploadBoxHeight}
      flex
      cursor-pointer
      flex-col
      items-center
      justify-center
      rounded-2xl
      border
      border-dashed
      border-white/10
      text-center
      transition-all
      hover:border-blue-400/40
      hover:bg-white/[0.02]
      transform
      ${uploadBoxX}
      ${uploadBoxY}
    `}
  >

    {receiptFile ? (
      <>
        <p className="text-sm font-medium text-white">
          📄 {receiptFile.name}
        </p>

        <p className="mt-2 text-xs text-emerald-400">
          ✓ Ready to upload
        </p>
      </>
    ) : receiptUrl ? (
      <>
        <p className="text-sm font-medium text-white">
          📎 Receipt Attached
        </p>

<div className="mt-3 flex items-center justify-center gap-4">

  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      handleViewReceipt();
    }}
    className="text-xs text-blue-400 hover:text-blue-300"
  >
    👁 View
  </button>

  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      handleRemoveReceipt();
    }}
    className="text-xs text-red-400 hover:text-red-300"
  >
    ✕ Remove
  </button>

</div>

        <p className="mt-3 text-[11px] text-slate-500">
          Click anywhere to replace
        </p>
      </>
    ) : (
      <>
        <p className="text-sm text-slate-300">
          Drag & drop receipts here
        </p>

        <p className="mt-2 text-xs text-slate-500">
          JPG • PNG • PDF
        </p>
      </>
    )}

  </label>

  <input
    id="receipt-upload"
    type="file"
    accept=".jpg,.jpeg,.png,.pdf"
    className="hidden"
    onChange={handleReceiptUpload}
  />

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
        className={`${cancelButtonWidth} ${cancelButtonHeight} rounded-xl text-[14px] border border-white/10 text-white`}
      >
        Cancel
      </button>
    </div>

    <div className={`flex-1 transform ${saveButtonX} ${saveButtonY}`}>
<button
  onClick={handleSave}
  className={`${saveButtonWidth} ${saveButtonHeight} rounded-xl text-[14px] bg-blue-600 font-semibold text-white`}
>
  {editingExpense
  ? "Update Expense"
  : "Save Expense"}
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
