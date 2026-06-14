"use client";

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
};

export default function ManualExpensesTable({
  onAddExpense,
}: ManualExpensesTableProps) {

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
  const tableY = "-translate-y-4";

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

  {[
    {
      date: "Jun 11, 2026",
      expense: "TradingView Monthly",
      category: "Software",
      vendor: "TradingView",
      original: "$29.99 USD",
      reporting: "C$41.12",
      recurring: "Monthly",
      deductible: "Yes",
      account: "Trading",
      payment: "Credit Card",
    },
    {
      date: "Jun 10, 2026",
      expense: "DigitalOcean VPS",
      category: "Infrastructure",
      vendor: "DigitalOcean",
      original: "$15.00 USD",
      reporting: "C$20.61",
      recurring: "Monthly",
      deductible: "Yes",
      account: "Trading",
      payment: "Visa",
    },
    {
      date: "Jun 8, 2026",
      expense: "Rogers Internet",
      category: "Infrastructure",
      vendor: "Rogers",
      original: "$89.95 CAD",
      reporting: "C$89.95",
      recurring: "Monthly",
      deductible: "Yes",
      account: "Business",
      payment: "Bank",
    },
    {
      date: "Jun 6, 2026",
      expense: "NinjaTrader Lifetime",
      category: "Software",
      vendor: "NinjaTrader",
      original: "$999 USD",
      reporting: "C$1,370",
      recurring: "One-Time",
      deductible: "Yes",
      account: "Trading",
      payment: "Credit Card",
    },
    {
      date: "Jun 5, 2026",
      expense: "Bookmap Monthly",
      category: "Software",
      vendor: "Bookmap",
      original: "$49 USD",
      reporting: "C$67",
      recurring: "Monthly",
      deductible: "Yes",
      account: "Trading",
      payment: "Visa",
    },
  ].map((row) => (
    <div
      key={row.expense}
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
  {row.date}
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
  {row.expense}
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
  {row.original}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${reportingAmountX}
  `}
>
  {row.reporting}
</span>

<span
  className={`
    flex
    items-center
    justify-center

    ${recurringX}
  `}
>
  {row.recurring}
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
  {row.deductible}
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
  {row.payment}
</span>

      

      <div className="flex items-center justify-center gap-3">
        <button className="text-slate-400 transition hover:text-white">
          <Pencil size={actionIconSize} />
        </button>

        <button className="text-red-500 transition hover:text-red-400">
          <Trash2 size={actionIconSize} />
        </button>
      </div>
    </div>
  ))}
</div>
    </div>
    </div>
  );
}