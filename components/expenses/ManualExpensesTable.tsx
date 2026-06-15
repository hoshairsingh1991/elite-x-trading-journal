"use client";

import { useEffect, useState } from "react";

import {
  loadExpenses,
  deleteExpense,
} from "@/lib/storage/supabaseExpenseStorage";

import { getCurrencySymbol } from "@/lib/fx/currencyFormatting";

import {
  CalendarDays,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

type ManualExpensesTableProps = {
  onAddExpense: () => void;
  onEditExpense: (expense: any) => void;
  refreshKey: number;
};

export default function ManualExpensesTable({
  onAddExpense,
  onEditExpense,
  refreshKey,
}: ManualExpensesTableProps) {

  const [expenses, setExpenses] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

const ITEMS_PER_PAGE = 5;

const totalExpenses = expenses.length;

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

async function fetchExpenses() {
  const data = await loadExpenses();
  setExpenses(data);
}

useEffect(() => {
  fetchExpenses();
}, [refreshKey]);

const paginationInfoX = "translate-x-6";

  /* =====================================================
     FINE TUNING
     ===================================================== */

  const toolbarX = "translate-x-3";
  const toolbarY = "translate-y-0";

  const tabsX = "translate-x-0";
  const tabsY = "translate-y-2";

  const filtersX = "translate-x-3";
  const filtersY = "-translate-y-0";

  const addButtonX = "translate-x-2";
  const addButtonY = "translate-y-3";

  const tableX = "translate-x-4";
  const tableY = "-translate-y-2";

  const addButtonWidth = "w-[120px]";
  const addButtonHeight = "h-[38px]";

  const filterHeight = "h-[38px]";

  const tabWidth = "w-[100px]";
const tabHeight = "h-[36px]";

const searchWidth = "w-[160px]";
const filterWidth = "w-[105px]";
const dateFilterWidth = "w-[150px]";

const tableHeaderHeight = "h-[38px]";
const tableRowHeight = "h-[38px]"; // <-- increase/decrease this only

const tableHeaderSpacerTop = "pt-1";
const tableHeaderSpacerBottom = "pb-1";

const tableRowSpacerTop = "pt-2";
const tableRowSpacerBottom = "pb-2";

const actionIconSize = 16;

const deductibleX = "-translate-x-5"; // try: translate-x-1, -translate-x-1, -translate-x-2, etc.

const expenseX = "-translate-x-2"; // adjust as needed

const categoryX = "-translate-x-10";
const vendorX = "-translate-x-12";
const originalAmountX = "-translate-x-4";
const reportingAmountX = "-translate-x-8";
const recurringX = "-translate-x-5";

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

    text-[13px]
    font-semibold
    text-white
  `}
>
            All Expenses
          </button>

          <button
  className={`
    flex
    ${tabWidth}
    ${tabHeight}
    items-center
    justify-center

    rounded-xl
    bg-blue-600

    text-[13px]
    font-semibold
    text-white
  `}
>
            Recurring
          </button>

          <button
  className={`
    flex
    ${tabWidth}
    ${tabHeight}
    items-center
    justify-center

    rounded-xl
    bg-blue-600

    text-[13px]
    font-semibold
    text-white
  `}
>
            One-Time
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
    text-[13px]
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
      placeholder="Search expenses..."
      className="
        ml-2
        w-full
        bg-transparent
        text-[13px]
        text-white
        outline-none
        placeholder:text-slate-500
      "
    />
  </div>
</div>

  {/* Centered Filters */}
  {[
    "Category",
    "Vendor",
    "Account",
    "Payment",
    "Tax",
    "Recurring",
  ].map((item) => (
    <button
      key={item}
      className={`
        relative
        flex
        ${filterWidth}
        ${filterHeight}
        items-center
        justify-center

        rounded-xl
        border
        border-white/10
        bg-white/[0.03]

        text-[13px]
        text-slate-300

        transition
        hover:bg-white/[0.05]
      `}
    >
      <span className="-translate-x-3">{item}</span>

      <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400" />
    </button>
  ))}

  {/* Date */}
  <button
    className={`
      relative
      flex
      ${dateFilterWidth}
      ${filterHeight}
      items-center
      justify-center

      rounded-xl
      border
      border-white/10
      bg-white/[0.03]

      text-[13px]
      text-slate-300

      transition
      hover:bg-white/[0.05]
    `}
  >
    <CalendarDays className="absolute left-3 h-4 w-4 text-slate-400" />

    <span>Last 30 Days</span>

    <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400" />
  </button>
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

      text-[11px]
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
    <span>Category</span>
    <span>Vendor</span>
    <span>Original Amount</span>
    <span>Reporting Amount </span>
    <span>Recurring</span>
    <span>Tax Deductible</span>
    <span>Account</span>
    <span>Payment Method</span>
    <span className="text-center">Actions</span>
  </div>

{expenses
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

        text-[13px]
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
  —
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

    font-medium
    text-emerald-400

    ${deductibleX}
  `}
>
  {row.is_tax_deductible ? "Yes" : "No"}
</span>

      <span>{row.account}</span>

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
      await fetchExpenses();
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