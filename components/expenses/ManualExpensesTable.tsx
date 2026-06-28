"use client";

import { useState } from "react";

import {
  deleteExpense,
} from "@/lib/storage/supabaseExpenseStorage";

import { getCurrencySymbol } from "@/lib/fx/currencyFormatting";
import type { Expense } from "@/lib/types/expense";

import {
  convertAmount,
} from "@/lib/fx/fxConversion";

import {
  FxRates,
} from "@/lib/fx/fxRateProvider";

import {
  CalendarDays,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

type ManualExpensesTableProps = {
  expenses: Expense[];

  reportingCurrency: string;

  fxRates: FxRates;

  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onExpensesChanged: () => void;
};

export default function ManualExpensesTable({
  expenses,
  reportingCurrency,
  fxRates,
  onAddExpense,
  onEditExpense,
  onExpensesChanged,
}: ManualExpensesTableProps) {


const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [categoryFilter, setCategoryFilter] = useState("All");
const [vendorFilter, setVendorFilter] = useState("All");
const [paymentFilter, setPaymentFilter] = useState("All");
const [taxFilter, setTaxFilter] = useState("All");
const [recurringFilter, setRecurringFilter] = useState("All");
const [dateFilter, setDateFilter] = useState("All");


const ITEMS_PER_PAGE = 10;



// =====================================================
// FILTERED EXPENSES
// =====================================================

const filteredExpenses = expenses.filter((expense) => {
  // -----------------------------
  // Search Filter
  // -----------------------------
  const query = searchQuery.trim().toLowerCase();

  const matchesSearch =
    !query ||
    expense.expense_name?.toLowerCase().includes(query) ||
    expense.vendor?.toLowerCase().includes(query);

// -----------------------------
// Category Filter
// -----------------------------
const matchesCategory =
  categoryFilter === "All" ||
  expense.category === categoryFilter;

// -----------------------------
// Vendor Filter
// -----------------------------
const matchesVendor =
  vendorFilter === "All" ||
  expense.vendor === vendorFilter;

// -----------------------------
// Payment Filter
// -----------------------------
const matchesPayment =
  paymentFilter === "All" ||
  expense.payment_method === paymentFilter;

  // -----------------------------
// Tax Filter
// -----------------------------
const matchesTax =
  taxFilter === "All" ||
  (taxFilter === "Yes" &&
    expense.is_tax_deductible === true) ||
  (taxFilter === "No" &&
    expense.is_tax_deductible === false);

    // -----------------------------
// Recurring Filter
// -----------------------------
const matchesRecurring =
  recurringFilter === "All" ||
  (recurringFilter === "One-Time" &&
    expense.is_recurring === false) ||
  (expense.is_recurring === true &&
    expense.frequency === recurringFilter);

    // -----------------------------
// Date Filter
// -----------------------------
const matchesDate =
  dateFilter === "All" ||
  (() => {
    const expenseDate = new Date(
      `${expense.expense_date}T12:00:00`
    );

    const today = new Date();

    const days =
      dateFilter === "365"
        ? 365
        : Number(dateFilter);

    const cutoff = new Date();

    cutoff.setDate(today.getDate() - days);

    return expenseDate >= cutoff;
  })();

// -----------------------------
// Final Result
// -----------------------------
return (
  matchesSearch &&
  matchesCategory &&
  matchesVendor &&
  matchesPayment &&
  matchesTax &&
  matchesRecurring &&
  matchesDate
);
});


// =====================================================
// PAGINATION
// =====================================================

const totalExpenses = filteredExpenses.length;

const totalPages = Math.max(
  1,
  Math.ceil(totalExpenses / ITEMS_PER_PAGE)
);

const startItem =
  totalExpenses === 0
    ? 0
    : (currentPage - 1) * ITEMS_PER_PAGE + 1;

const endItem = Math.min(
  currentPage * ITEMS_PER_PAGE,
  totalExpenses
);


const paginationInfoX = "translate-x-6";

const headerCategoryX = "translate-x-6";
const headerVendorX = "translate-x-7";

/* =====================================================
   FINE TUNING
   ===================================================== */

  const toolbarX = "translate-x-3";
  const toolbarY = "translate-y-0";

  const tabsX = "translate-x-0";
  const tabsY = "translate-y-2";

  const filtersX = "translate-x-3";
  const filtersY = "-translate-y-0";

  const addButtonX = "translate-x-0";
  const addButtonY = "translate-y-3";

  const tableX = "translate-x-4";
  const tableY = "-translate-y-2";

  const addButtonWidth = "w-[110px]";
  const addButtonHeight = "h-[34px]";

  const filterHeight = "h-[34px]";

  const tabWidth = "w-[100px]";
const tabHeight = "h-[34px]";

const searchWidth = "w-[180px]";
const filterWidth = "w-[105px]";
const dateFilterWidth = "w-[145px]";

const tableHeaderHeight = "h-[34px]";
const tableRowHeight = "h-[38px]"; // <-- increase/decrease this only

const tableHeaderSpacerTop = "pt-1";
const tableHeaderSpacerBottom = "pb-1";

const tableRowSpacerTop = "pt-2";
const tableRowSpacerBottom = "pb-2";

const actionIconSize = 14;

const deductibleX = "-translate-x-5"; // try: translate-x-1, -translate-x-1, -translate-x-2, etc.

const expenseX = "-translate-x-2"; // adjust as needed

const categoryX = "-translate-x-2";
const vendorX = "-translate-x-2";
const originalAmountX = "-translate-x-4";
const reportingAmountX = "-translate-x-8";
const recurringX = "-translate-x-5";
const headerTypeX = "translate-x-6";
const typeX = "-translate-x-1";

  return (
    
<div
  className="
    w-full
    max-w-full
    min-w-0

    overflow-hidden

    rounded-3xl
    border
    border-white/10

    bg-[#0B1220]

    transition-all
    duration-300

    hover:-translate-y-0.5
    hover:border-white/15
    hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]

    p-6
  "
>
  <div className="mx-auto w-[98%]">
    {/* ALL EXISTING CONTENT GOES HERE */}
      
      {/* ================================================= */}
      {/* Top Toolbar */}
      {/* ================================================= */}

      <div
        className={`
          flex items-center justify-between

          ${toolbarX}
          ${toolbarY}
        `}
      >
        {/* Tabs */}
        <div
          className={`
            flex items-center gap-2

            ${tabsX}
            ${tabsY}
          `}
        >
          <button
  className={`
    flex
    ${tabWidth}
    ${tabHeight}
    items-center
    justify-center

    rounded-xl
    bg-blue-600

    text-[12px]
    font-semibold
    text-white
  `}
>
            All Expenses
          </button>

        </div>

{/* Add Expense */}
<button
  onClick={() => onAddExpense()}
  className={`
    flex
    ${addButtonWidth}
    ${addButtonHeight}
    items-center
    justify-center
    gap-2

    rounded-xl
    bg-blue-600
    text-[12px]
    font-semibold
    text-white

    transition
    hover:bg-blue-500

    ${addButtonX}
    ${addButtonY}
  `}
>
  <Plus className="h-4 w-4" />
  Add Expense
</button>
      </div>

      <div className="h-5" />

{/* ================================================= */}
{/* Filters */}
{/* ================================================= */}

<div
  className={`
    flex flex-wrap items-center gap-3

    ${filtersX}
    ${filtersY}
  `}
>
{/* Search */}
<div
  className={`
    flex
    ${searchWidth}
    ${filterHeight}
    items-center
    justify-center

    rounded-xl
    border
    border-white/10
    bg-white/[0.03]

    px-3
  `}
>
  <div className="flex w-[90%] items-center">
    <Search className="h-4 w-4 shrink-0 text-slate-500" />

<input
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }}
  placeholder="Search expenses..."
  className="
    ml-2
    w-full
    bg-transparent
    text-[12px]
    text-white
    outline-none
    placeholder:text-slate-500

    indent-[8px]
  "
/>
  </div>
</div>

{/* Centered Filters */}

{/* Category */}
<div className="relative">
  <select
    value={categoryFilter}
    onChange={(e) => {
      setCategoryFilter(e.target.value);
      setCurrentPage(1);
    }}
className={`
  appearance-none
  ${filterWidth}
  ${filterHeight}

  rounded-xl
  border
  border-white/10
  bg-white/[0.03]

  pr-10
  text-[12px]
  text-slate-300
  outline-none

  indent-[12px]
`}
  >
    <option value="All">Category</option>
    <option value="Software">Software</option>
    <option value="Infrastructure">Infrastructure</option>
    <option value="Market Data">Market Data</option>
    <option value="Brokerage Fees">Brokerage Fees</option>
    <option value="Education">Education</option>
    <option value="Other">Other</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>

{/* Vendor */}
<div className="relative">
  <select
    value={vendorFilter}
    onChange={(e) => {
      setVendorFilter(e.target.value);
      setCurrentPage(1);
    }}
    className={`
      appearance-none
      ${filterWidth}
      ${filterHeight}

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      pr-10
      indent-[16px]

      text-[12px]
      text-slate-300
      outline-none

      transition
      hover:bg-white/[0.05]
    `}
  >
    <option value="All">Vendor</option>

{[
  ...new Set(
    expenses
      .map((expense) => expense.vendor)
      .filter(
        (vendor): vendor is string => vendor !== null
      )
  ),
].map((vendor) => (
  <option key={vendor} value={vendor}>
    {vendor}
  </option>
))}
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>

{/* Expense Type */}
<div className="relative">
  <select
    className={`
      appearance-none
      ${filterWidth}
      ${filterHeight}

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      pr-10
      indent-[18px]

      text-[12px]
      text-slate-300
      outline-none

      transition
      hover:bg-white/[0.05]
    `}
  >
    <option value="All">Type</option>
    <option value="Operating">Operating</option>
    <option value="Capital">Capital</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>

{/* Payment */}
<div className="relative">
  <select
    value={paymentFilter}
    onChange={(e) => {
      setPaymentFilter(e.target.value);
      setCurrentPage(1);
    }}
    className={`
      appearance-none
      ${filterWidth}
      ${filterHeight}

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      pr-10
      indent-[14px]

      text-[12px]
      text-slate-300
      outline-none

      transition
      hover:bg-white/[0.05]
    `}
  >
    <option value="All">Payment</option>
    <option value="Credit Card">Credit Card</option>
    <option value="Debit Card">Debit Card</option>
    <option value="Bank Transfer">Bank Transfer</option>
    <option value="Cash">Cash</option>
    <option value="PayPal">PayPal</option>
    <option value="Wire Transfer">Wire Transfer</option>
    <option value="Crypto">Crypto</option>
    <option value="Other">Other</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>

{/* Tax */}
<div className="relative">
  <select
    value={taxFilter}
    onChange={(e) => {
      setTaxFilter(e.target.value);
      setCurrentPage(1);
    }}
    className={`
      appearance-none
      ${filterWidth}
      ${filterHeight}

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      pr-10
      indent-[30px]

      text-[12px]
      text-slate-300
      outline-none

      transition
      hover:bg-white/[0.05]
    `}
  >
<option value="All">Tax</option>
<option value="Yes">Yes</option>
<option value="No">No</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>

{/* Recurring */}
<div className="relative">
  <select
    value={recurringFilter}
    onChange={(e) => {
      setRecurringFilter(e.target.value);
      setCurrentPage(1);
    }}
    className={`
      appearance-none
      ${filterWidth}
      ${filterHeight}

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      pr-10
      indent-[14px]

      text-[12px]
      text-slate-300
      outline-none

      transition
      hover:bg-white/[0.05]
    `}
  >
    <option value="All">Recurring</option>
    <option value="One-Time">One-Time</option>
    <option value="Daily">Daily</option>
    <option value="Weekly">Weekly</option>
    <option value="Monthly">Monthly</option>
    <option value="Quarterly">Quarterly</option>
    <option value="Yearly">Yearly</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>

{/* Date */}
<div className="relative">
  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

  <select
    value={dateFilter}
    onChange={(e) => {
      setDateFilter(e.target.value);
      setCurrentPage(1);
    }}
    className={`
      appearance-none

      ${dateFilterWidth}
      ${filterHeight}

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      pr-10
      indent-[40px]

      text-[12px]
      text-slate-300
      outline-none

      transition
      hover:bg-white/[0.05]
    `}
  >
    <option value="All">All Time</option>
    <option value="7">Last 7 Days</option>
    <option value="30">Last 30 Days</option>
    <option value="90">Last 90 Days</option>
    <option value="365">This Year</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
</div>
</div>

<div className="h-6" />

{/* ================================================= */}
{/* Table */}
{/* ================================================= */}

<div
  className={`
    overflow-hidden
    rounded-2xl
    border
    border-white/10

    ${tableX}
    ${tableY}
  `}
>
  {/* Header */}
  <div
    className={`
      grid
      grid-cols-[1fr_2fr_1.3fr_1.3fr_1.3fr_1.5fr_1fr_1.2fr_1fr_1.3fr_0.8fr]

      items-center

      bg-white/[0.03]
      border-b
      border-white/10

      px-6

      ${tableHeaderHeight}
      ${tableHeaderSpacerTop}
      ${tableHeaderSpacerBottom}

      text-[10px]
      font-semibold
      uppercase
      tracking-wide
      text-slate-400
    `}
  >
    <span className="flex items-center justify-center">Date</span>
    <span
  className={`
    flex
    items-center
    justify-center

    ${expenseX}
  `}
>
  Expense
</span>
    <span
  className={`
    ${headerCategoryX}
  `}
>
  Category
</span>
    <span
  className={`
    ${headerVendorX}
  `}
>
  Vendor
</span>
    <span>Original Amount</span>
    <span>Reporting Amount </span>
    <span>Recurring</span>
    <span>Tax Deductible</span>
    <span
  className={`
    ${headerTypeX}
  `}
>
  Type
</span>
    <span>Payment Method</span>
    <span className="text-center">Actions</span>
  </div>

{filteredExpenses
  .slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  .map((row) => (
    <div
      key={row.id}
      className={`
        grid
        grid-cols-[1fr_2fr_1.3fr_1.3fr_1.3fr_1.5fr_1fr_1.2fr_1fr_1.3fr_0.8fr]

        items-center

        px-6

        ${tableRowHeight}
        ${tableRowSpacerTop}
        ${tableRowSpacerBottom}

        border-b
        border-white/5

        text-[12px]
        text-slate-300

        last:border-b-0
      `}
    >
      <span className="flex items-center justify-center">
  {new Date(
  `${row.expense_date}T12:00:00`
).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    font-medium
    text-white

    ${expenseX}
  `}
>
  {row.expense_name}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${categoryX}
  `}
>
  {row.category}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${vendorX}
  `}
>
  {row.vendor}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${originalAmountX}
  `}
>
  {getCurrencySymbol(row.billed_currency)}
{Number(row.original_amount).toFixed(2)}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${reportingAmountX}
  `}
>
  {getCurrencySymbol(
    reportingCurrency
  )}

  {convertAmount(
    row.original_amount,
    row.billed_currency,
    reportingCurrency,
    fxRates
  ).toFixed(2)}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${recurringX}
  `}
>
  {row.is_recurring
  ? row.frequency ?? "Recurring"
  : "One-Time"}
</span>

<span
  className={`
    flex
    items-center
    justify-center
    gap-2

    font-medium
    text-white

    ${deductibleX}
  `}
>
  <span
    className={`h-2 w-2 rounded-full ${
      row.is_tax_deductible
        ? "bg-emerald-400"
        : "bg-red-400"
    }`}
  />

  <span className="text-white">
    {row.is_tax_deductible ? "Yes" : "No"}
  </span>
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${typeX}
  `}
>
  Operating
</span>

      <span
  className={`
    flex
    items-center
    justify-center

    font-medium
    text-white

    ${expenseX}
  `}
>
  {row.payment_method ?? "—"}
</span>

      

      <div className="flex items-center justify-center gap-3">
<button
  onClick={() => onEditExpense(row)}
  className="text-slate-400 transition hover:text-white"
>
  <Pencil size={actionIconSize} />
</button>

<button
  onClick={async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.expense_name}"?`
    );

    if (!confirmed) {
      return;
    }

try {
  await deleteExpense(row.id);
  onExpensesChanged();
} catch (error) {
  console.error(error);
  alert("Failed to delete expense.");
}
  }}
  className="text-red-500 transition hover:text-red-400"
>
  <Trash2 size={actionIconSize} />
</button>

      </div>
    </div>
  ))}
</div>

{/* ================================================= */}
{/* Pagination Footer */}
{/* ================================================= */}

<div className="mt-4 flex items-center justify-between px-4 text-sm text-slate-400">
<span
  className={`transform ${paginationInfoX}`}
>
  Showing {startItem}–{endItem} of {totalExpenses} expenses
</span>

  <div className="flex items-center gap-4">
    <button
      onClick={() =>
        setCurrentPage((p) => Math.max(1, p - 1))
      }
      disabled={currentPage === 1}
      className="disabled:cursor-not-allowed disabled:opacity-40"
    >
      ← Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((p) =>
          Math.min(totalPages, p + 1)
        )
      }
      disabled={currentPage === totalPages}
      className="disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next →
    </button>
  </div>
</div>
{/* Spacer */}
  <div className="h-2" />
    </div>
    </div>
  );
}