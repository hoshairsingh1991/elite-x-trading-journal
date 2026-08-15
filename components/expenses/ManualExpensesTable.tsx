"use client";

import { useEffect, useRef, useState } from "react";



import {
  deleteExpense,
} from "@/lib/storage/supabaseExpenseStorage";

import { viewReceipt } from "@/lib/receipts/viewReceipt";

import { Paperclip } from "lucide-react";

import { getCurrencySymbol } from "@/lib/fx/currencyFormatting";
import type { Expense } from "@/lib/types/expense";

import { Star } from "lucide-react";

import EliteSelect from "@/components/ui/EliteSelect";

import DateRangePicker from "@/components/shared/DateRangePicker";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  onViewExpense: (expense: Expense) => void;

  onExpensesChanged: () => void;
};

export default function ManualExpensesTable({
  expenses,
  reportingCurrency,
  fxRates,
  onAddExpense,
  onEditExpense,
  onViewExpense,
  onExpensesChanged,
}: ManualExpensesTableProps) {


const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [categoryFilter, setCategoryFilter] = useState("All");
const [vendorFilter, setVendorFilter] = useState("All");
const [paymentFilter, setPaymentFilter] = useState("All");
const [taxFilter, setTaxFilter] = useState("All");
const [recurringFilter, setRecurringFilter] = useState("All");
const [receiptFilter, setReceiptFilter] = useState("All");
const [selectedPreset, setSelectedPreset] =
  useState("All Time");


const [startDate, setStartDate] =
  useState<Date | null>(null);


const [endDate, setEndDate] =
  useState<Date | null>(null);

  const tableDateInitialized =
  useRef(false);

  const getFreshTableDateRange = (
  preset: string
): {
  startDate: Date | null;
  endDate: Date | null;
} => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  switch (preset) {
    case "Today":
      return {
        startDate: startOfDay,
        endDate: endOfDay,
      };

    case "This Week": {
      const start = new Date(startOfDay);
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;

      start.setDate(start.getDate() + diff);

      return {
        startDate: start,
        endDate: endOfDay,
      };
    }

    case "This Month":
      return {
        startDate: new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0
        ),
        endDate: endOfDay,
      };

    case "Last 30 Days": {
      const start = new Date(startOfDay);
      start.setDate(start.getDate() - 29);

      return {
        startDate: start,
        endDate: endOfDay,
      };
    }

    case "This Quarter": {
      const quarterStartMonth =
        Math.floor(now.getMonth() / 3) * 3;

      return {
        startDate: new Date(
          now.getFullYear(),
          quarterStartMonth,
          1,
          0,
          0,
          0,
          0
        ),
        endDate: endOfDay,
      };
    }

    case "YTD":
      return {
        startDate: new Date(
          now.getFullYear(),
          0,
          1,
          0,
          0,
          0,
          0
        ),
        endDate: endOfDay,
      };

    default:
      return {
        startDate: null,
        endDate: null,
      };
  }
};


useEffect(() => {
  const savedFilter =
    localStorage.getItem(
      "expensesTableDateFilter"
    );

  if (!savedFilter) {
    return;
  }

  const parsed =
    JSON.parse(savedFilter);

  const preset =
    parsed.selectedPreset ??
    "All Time";

  setSelectedPreset(preset);

  const dynamicPresets = new Set([
    "Today",
    "This Week",
    "This Month",
    "Last 30 Days",
    "This Quarter",
    "YTD",
  ]);

  if (dynamicPresets.has(preset)) {
    const freshRange =
      getFreshTableDateRange(
        preset
      );

    setStartDate(
      freshRange.startDate
    );

    setEndDate(
      freshRange.endDate
    );

    return;
  }

  setStartDate(
    parsed.startDate
      ? new Date(parsed.startDate)
      : null
  );

  setEndDate(
    parsed.endDate
      ? new Date(parsed.endDate)
      : null
  );
}, []);

useEffect(() => {

  if (!tableDateInitialized.current) {
    tableDateInitialized.current = true;
    return;
  }

  localStorage.setItem(
    "expensesTableDateFilter",
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
// Receipt Filter
// -----------------------------
const matchesReceipt =
  receiptFilter === "All" ||
  (receiptFilter === "Yes" &&
    expense.receipt_url !== null) ||
  (receiptFilter === "No" &&
    expense.receipt_url === null);

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
  !startDate ||
  !endDate ||
  (() => {

    const expenseDate = new Date(
      `${expense.expense_date}T12:00:00`
    );

    return (
      expenseDate >= startDate &&
      expenseDate <= endDate
    );

  })();

// -----------------------------
// Final Result
// -----------------------------
return (
  matchesSearch &&
  matchesCategory &&
  matchesVendor &&
  matchesPayment &&
  matchesReceipt &&
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
const filterWidth = "w-[100px]";
const dateFilterWidth = "w-[145px]";

const tableHeaderHeight = "h-[34px]";
const tableRowHeight = "min-h-[38px] h-auto"; // Allow rows to grow naturally when text wraps

const tableHeaderSpacerTop = "pt-1";
const tableHeaderSpacerBottom = "pb-1";

const tableRowSpacerTop = "pt-1.5";
const tableRowSpacerBottom = "pb-1.5";

const actionIconSize = 14;

const deductibleX = "-translate-x-5"; // try: translate-x-1, -translate-x-1, -translate-x-2, etc.

const expenseX = "-translate-x-2"; // adjust as needed

const categoryX = "-translate-x-2";
const vendorX = "-translate-x-2";
const originalAmountX = "-translate-x-4";
const reportingAmountX = "-translate-x-8";
const recurringX = "-translate-x-5";
const headerTypeX = "translate-x-14";
const typeX = "translate-x-4";
const headerPaymentX = "translate-x-10";
const paymentMethodX = "translate-x-4";

  return (
    
<div
  className="
    w-full
    max-w-full
    min-w-0

    overflow-hidden

rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]

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

    rounded-[8px]
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

    rounded-[8px]
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

    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]

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


<EliteSelect
  value={categoryFilter}
  width={filterWidth}
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  yOffset="translate-y-0"
  options={[
    {
      value: "All",
      label: "Category",
    },
    {
      value: "Software",
      label: "Software",
    },
    {
      value: "Infrastructure",
      label: "Infrastructure",
    },
    {
      value: "Market Data",
      label: "Market Data",
    },
    {
      value: "Brokerage Fees",
      label: "Brokerage Fees",
    },
    {
      value: "Education",
      label: "Education",
    },
    {
      value: "Other",
      label: "Other",
    },
  ]}
  onChange={(value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  }}
/>

{/* Vendor */}

<EliteSelect
  value={vendorFilter}
  width="w-[90px]"
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  yOffset="translate-y-0"
  options={[
    {
      value: "All",
      label: "Vendor",
    },

    ...[
      ...new Set(
        expenses
          .map((expense) => expense.vendor)
          .filter(
            (vendor): vendor is string =>
              vendor !== null
          )
      ),
    ].map((vendor) => ({
      value: vendor,
      label: vendor,
    })),
  ]}
  onChange={(value) => {
    setVendorFilter(value);
    setCurrentPage(1);
  }}
/>

{/* Receipt */}
<EliteSelect
  value={receiptFilter}
  width="w-[90px]"
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  yOffset="translate-y-0"
  options={[
    {
      value: "All",
      label: "Receipt",
    },
    {
      value: "Yes",
      label: "Yes",
    },
    {
      value: "No",
      label: "No",
    },
  ]}
  onChange={(value) => {
    setReceiptFilter(value);
    setCurrentPage(1);
  }}
/>

{/* Payment */}
<EliteSelect
  value={paymentFilter}
  width={filterWidth}
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  yOffset="translate-y-0"
  options={[
    {
      value: "All",
      label: "Payment",
    },
    {
      value: "Credit Card",
      label: "Credit Card",
    },
    {
      value: "Debit Card",
      label: "Debit Card",
    },
    {
      value: "Bank Transfer",
      label: "Bank Transfer",
    },
    {
      value: "Cash",
      label: "Cash",
    },
    {
      value: "PayPal",
      label: "PayPal",
    },
    {
      value: "Wire Transfer",
      label: "Wire Transfer",
    },
    {
      value: "Crypto",
      label: "Crypto",
    },
    {
      value: "Other",
      label: "Other",
    },
  ]}
  onChange={(value) => {
    setPaymentFilter(value);
    setCurrentPage(1);
  }}
/>

<EliteSelect
  value={taxFilter}
  width="w-[70px]"
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  iconYOffset="translate-y-0"
  yOffset="translate-y-0"
  options={[
    {
      value: "All",
      label: "Tax",
    },
    {
      value: "Yes",
      label: "Yes",
    },
    {
      value: "No",
      label: "No",
    },
  ]}
  onChange={(value) => {
    setTaxFilter(value);
    setCurrentPage(1);
  }}
/>

{/* Recurring */}
<EliteSelect
  value={recurringFilter}
  width={filterWidth}
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  iconYOffset="translate-y-0"
  yOffset="translate-y-0"
  options={[
    {
      value: "All",
      label: "Recurring",
    },
    {
      value: "One-Time",
      label: "One-Time",
    },
    {
      value: "Daily",
      label: "Daily",
    },
    {
      value: "Weekly",
      label: "Weekly",
    },
    {
      value: "Monthly",
      label: "Monthly",
    },
    {
      value: "Quarterly",
      label: "Quarterly",
    },
    {
      value: "Yearly",
      label: "Yearly",
    },
  ]}
  onChange={(value) => {
    setRecurringFilter(value);
    setCurrentPage(1);
  }}
/>

{/* Date */}
<div className="relative">

  <DateRangePicker
    selectedPreset={selectedPreset}
    heightClass="h-[34px]"
    onDateRangeChange={(
      preset,
      start,
      end
    ) => {
      setSelectedPreset(preset);
      setStartDate(start);
      setEndDate(end);
      setCurrentPage(1);
    }}
  />

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
    ${headerPaymentX}
  `}
>
  Payment Method
</span>

<span
  className={`
    ${headerTypeX}
  `}
>
  Receipt
</span>
    <span className="text-center">Actions</span>
  </div>

{filteredExpenses
  .slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  .map((row) => {

    const isPrimaryRecurringExpense =
      row.is_recurring &&
      !row.is_generated &&
      row.is_active;

    return (
<div
  key={row.id}
  onClick={() => onViewExpense(row)}
  className={`
    grid
    grid-cols-[1fr_2fr_1.3fr_1.3fr_1.3fr_1.5fr_1fr_1.2fr_1fr_1.3fr_0.8fr]

    cursor-pointer

    items-center

    px-6

    ${tableRowHeight}
    ${tableRowSpacerTop}
    ${tableRowSpacerBottom}

    border-b
    border-white/5

    text-[12px]
    text-slate-300

    transition-colors
    hover:bg-white/[0.02]

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
    justify-center
    justify-center
    pt-0.5

    ${categoryX}
  `}
>
  {row.category}
</span>

<span
  className={`
    flex
    justify-center
    justify-center
    pt-0.5

    ${vendorX}
  `}
>
  {row.vendor}
</span>

<span
  className={`
    flex
    justify-center
    justify-center
    pt-0.5

    ${originalAmountX}
  `}
>
  {getCurrencySymbol(row.billed_currency)}
{Number(row.original_amount).toFixed(2)}
</span>

<span
  className={`
    flex
    justify-center
    justify-center
    pt-0.5

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
    justify-center
    justify-center
    gap-1
    pt-0.5

    ${recurringX}
  `}
>
  <span>
    {row.is_recurring
      ? row.frequency ?? "Recurring"
      : "One-Time"}
  </span>

  {isPrimaryRecurringExpense && (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="cursor-help"
          aria-label="Recurring schedule"
        >
          <Star
            className="h-3 w-3 fill-amber-400 text-amber-400"
          />
        </button>
      </TooltipTrigger>

<TooltipContent
  side="top"
  sideOffset={10}
  className="
    max-w-[340px]
    rounded-[16px]
    border
    border-cyan-500/20
    bg-[#081526]
    px-6
    py-5
    text-slate-200
    shadow-[0_12px_40px_rgba(0,0,0,0.55)]
  "
>
<div
  className="
    min-h-[130px]
    space-y-4
    translate-x-2
    translate-y-3
    pb-4
  "
>

  <div>
    <h4 className="text-[14px] font-semibold text-white">
      Primary Recurring Expense
    </h4>
  </div>

  <div className="space-y-3">
    <p className="text-[13px] leading-6 text-slate-200">
      This is the original expense that controls this recurring schedule.
    </p>

    <p className="text-[13px] leading-6 text-slate-200">
      To stop future recurring expenses, edit this expense and turn <strong>Enable Recurring</strong> Off.
    </p>
  </div>

</div>
      </TooltipContent>
    </Tooltip>
  )}
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
    className={`h-2 w-2 shrink-0 rounded-full ${
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
    justify-center
    justify-center
    pt-0.5

    font-medium
    text-white

    ${paymentMethodX}
  `}
>
  {row.payment_method ?? "—"}
</span>


<span
  className={`
    flex
    justify-center
    justify-center
    pt-0.5

    ${typeX}
  `}
>
  {row.receipt_url ? (
    <Paperclip
      size={16}
      onClick={(e) => {
        e.stopPropagation();
        viewReceipt(row.receipt_url);
      }}
      className="
        cursor-pointer
        text-blue-400
        transition-colors
        hover:text-blue-300
      "
    />
  ) : (
    <Paperclip
      size={16}
      className="text-slate-600"
    />
  )}
</span>

<div className="flex justify-center gap-3 pt-0.5">

  <button
    onClick={(e) => {
      e.stopPropagation();
      onEditExpense(row);
    }}
    className="text-slate-400 transition hover:text-white"
  >
    <Pencil size={actionIconSize} />
  </button>

  <button
    onClick={async (e) => {
      e.stopPropagation();

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
    );
  })}
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