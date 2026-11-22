"use client";

import Sidebar from "@/components/layout/Sidebar";

import {
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Landmark,
  ChevronDown,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";

import type {
  CapitalTransaction,
  BrokerageAccount,
} from "@/lib/capital/types";

import {
  loadCapitalAccounts,
  createCapitalAccount,
  updateCapitalAccount,
  archiveCapitalAccount,
} from "@/lib/storage/supabaseCapitalStorage";

import {
  loadCapitalTransactions,
  createCapitalTransaction,
  type CreateCapitalTransactionInput,
} from "@/lib/storage/supabaseCapitalTransactionStorage";

import {
  getMonthlyFundingActivity,
  getCapitalActivitySummary,
} from "@/lib/capital/analytics";


import { CURRENCY_ORDER } from "@/lib/capital/constants";

import {
  getCurrencyTotals,
  getNetFundingTotals,
} from "@/lib/capital/calculations";

import {
  getAccountById,
} from "@/lib/capital/helpers";

import { MetricCard } from "@/components/capital/CapitalMetricCard";

import { StatusBadge } from "@/components/capital/StatusBadge";

import { TypeIcon } from "@/components/capital/CapitalTypeIcon";

import CapitalHeader from "@/components/capital/CapitalHeader";

import Filter from "@/components/capital/CapitalFilters";

import BrokerageAccountsCard from "@/components/capital/BrokerageAccountsCard";

import PendingActivityPanel from "@/components/capital/PendingActivityPanel";

import FundingActivityCard from "@/components/capital/FundingActivityCard";

import CapitalActivitySummaryCard from "@/components/capital/CapitalActivitySummaryCard";

import RecentTransactionsTable from "@/components/capital/RecentTransactionsTable";

import AddTransactionDrawer from "@/components/capital/AddTransactionDrawer";

import ManageAccountsDrawer from "@/components/capital/ManageAccountsDrawer";

// =====================================================
// UI HELPERS
// =====================================================


function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#0A1422] px-3 pr-9 text-[12px] font-medium text-slate-200 outline-none transition focus:border-blue-500/50"
        >
          {children}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </label>
  );
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =====================================================
// CAPITAL MANAGEMENT PAGE
// =====================================================

export default function CapitalPage() {
  // ===================================================
  // PAGE DATA
  // ===================================================

const [transactions, setTransactions] =
  useState<CapitalTransaction[]>([]);

  const [transactionsLoading, setTransactionsLoading] =
  useState(true);

const [transactionsError, setTransactionsError] =
  useState<string | null>(null);

const [transactionsRetry, setTransactionsRetry] =
  useState(0);

  const [accounts, setAccounts] =
    useState<BrokerageAccount[]>([]);

  const [accountsLoading, setAccountsLoading] =
    useState(true);

  const [accountsError, setAccountsError] =
    useState<string | null>(null);

    const [accountsRetry, setAccountsRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchAccounts() {
      setAccountsLoading(true);
      setAccountsError(null);

      try {
        const data = await loadCapitalAccounts();

        if (!cancelled) {
          setAccounts(data);
        }
      } catch (error) {
        console.error("Failed to load capital accounts:", error);

        if (!cancelled) {
          setAccountsError(
            error instanceof Error
              ? error.message
              : "Failed to load brokerage accounts."
          );
        }
      } finally {
        if (!cancelled) {
          setAccountsLoading(false);
        }
      }
    }

    fetchAccounts();

    return () => {
      cancelled = true;
    };
  }, [accountsRetry]);

  useEffect(() => {
  let cancelled = false;

  async function fetchTransactions() {
    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const page = await loadCapitalTransactions();

      if (!cancelled) {
        setTransactions(page.transactions);
      }
    } catch (error) {
      console.error("Failed to load capital transactions:", error);

      if (!cancelled) {
        setTransactionsError(
          error instanceof Error
            ? error.message
            : "Failed to load capital transactions."
        );
      }
    } finally {
      if (!cancelled) {
        setTransactionsLoading(false);
      }
    }
  }

  fetchTransactions();

  return () => {
    cancelled = true;
  };
}, [transactionsRetry]);

  // ===================================================
  // FILTER STATE
  // ===================================================

const [selectedPreset, setSelectedPreset] =
  useState("YTD");

const [dateRangeStart, setDateRangeStart] =
  useState<Date | null>(
    () => new Date(new Date().getFullYear(), 0, 1)
  );

const [dateRangeEnd, setDateRangeEnd] =
  useState<Date | null>(() => new Date());

const [brokerFilter, setBrokerFilter] =
  useState("ALL");

const [accountFilter, setAccountFilter] =
  useState("ALL");

const [currencyFilter, setCurrencyFilter] =
  useState("ALL");

  // ===================================================
  // TRANSACTION DRAWER STATE
  // ===================================================

const [isDrawerOpen, setIsDrawerOpen] =
  useState(false);

const [isManageAccountsOpen, setIsManageAccountsOpen] =
  useState(false);

const [previewNotice, setPreviewNotice] =
  useState("");


  // ===================================================
  // FILTERED TRANSACTIONS
  // ===================================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Date range filter
      if (
        dateRangeStart &&
        transaction.date < toDateKey(dateRangeStart)
      ) {
        return false;
      }

      if (
        dateRangeEnd &&
        transaction.date > toDateKey(dateRangeEnd)
      ) {
        return false;
      }

      // Currency filter
      if (
        currencyFilter !== "ALL" &&
        transaction.currency !== currencyFilter
      ) {
        return false;
      }

      const involvedAccounts = [
        transaction.fromAccountId,
        transaction.toAccountId,
      ].filter((id): id is string => Boolean(id));

      // Account filter
      if (
        accountFilter !== "ALL" &&
        !involvedAccounts.includes(accountFilter)
      ) {
        return false;
      }

      // Broker filter
      if (brokerFilter !== "ALL") {
const involvesBroker = involvedAccounts.some(
  (id) =>
    getAccountById(accounts, id)?.broker === brokerFilter
);

        if (!involvesBroker) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    accounts,
    dateRangeStart,
    dateRangeEnd,
    brokerFilter,
    accountFilter,
    currencyFilter,
  ]);

  const completedTransactions =
    filteredTransactions.filter(
      (transaction) =>
        transaction.status === "COMPLETED"
    );

  const pendingTransactions =
    filteredTransactions.filter(
      (transaction) =>
        transaction.status === "PENDING"
    );

  const depositTransactions =
    completedTransactions.filter(
      (transaction) =>
        transaction.type === "DEPOSIT"
    );

  const withdrawalTransactions =
    completedTransactions.filter(
      (transaction) =>
        transaction.type === "WITHDRAWAL"
    );

  const transferTransactions =
    completedTransactions.filter(
      (transaction) =>
        transaction.type === "TRANSFER"
    );

  // ===================================================
  // KPI CALCULATIONS
  // ===================================================

  const depositTotals =
    getCurrencyTotals(depositTransactions);

  const withdrawalTotals =
    getCurrencyTotals(withdrawalTransactions);

  const netFundingTotals =
    getNetFundingTotals(
      depositTransactions,
      withdrawalTransactions
    );

  const transferTotals =
    getCurrencyTotals(transferTransactions);

  // ===================================================
  // ACCOUNT TABLE
  // ===================================================

const visibleAccounts =
  accounts.filter((account) => {
    if (account.status !== "ACTIVE") {
      return false;
    }

    if (
      accountFilter !== "ALL" &&
      account.id !== accountFilter
    ) {
      return false;
    }

    if (
      brokerFilter !== "ALL" &&
      account.broker !== brokerFilter
    ) {
      return false;
    }

    if (
      currencyFilter !== "ALL" &&
      account.baseCurrency !== currencyFilter
    ) {
      return false;
    }

    return true;
  });

  // ===================================================
  // RECENT TRANSACTIONS
  // ===================================================

  const recentTransactions =
    [...completedTransactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);

  // ===================================================
  // PENDING TOTALS
  // ===================================================

  const pendingTotals =
    getCurrencyTotals(pendingTransactions);

// ===================================================
// CAPITAL ANALYTICS
// ===================================================

const monthlyFundingActivity = useMemo(() => {
  if (!dateRangeStart || !dateRangeEnd) {
    return [];
  }

  return getMonthlyFundingActivity(
    filteredTransactions,
    toDateKey(dateRangeStart),
    toDateKey(dateRangeEnd)
  );
}, [
  filteredTransactions,
  dateRangeStart,
  dateRangeEnd,
]);

const capitalActivitySummary = useMemo(
  () => getCapitalActivitySummary(filteredTransactions),
  [filteredTransactions]
);

  // ===================================================
  // FORM HANDLERS
  // ===================================================

  const openTransactionDrawer = () => {
    setPreviewNotice("");
    setIsDrawerOpen(true);
  };

  const clearFilters = () => {
    const today = new Date();

    setSelectedPreset("YTD");
    setDateRangeStart(
      new Date(today.getFullYear(), 0, 1)
    );
    setDateRangeEnd(today);

    setBrokerFilter("ALL");
    setAccountFilter("ALL");
    setCurrencyFilter("ALL");
  };

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <main className="flex h-screen overflow-hidden bg-[#020817]">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <div className="shrink-0 p-4">
        <Sidebar />
      </div>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pt-4 pr-5 xl:pr-8">

        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          <div className="w-full pb-10">

{/* ================================================= */}
{/* HEADER */}
{/* ================================================= */}

<CapitalHeader
  selectedPreset={selectedPreset}
  onDateRangeChange={(preset, start, end) => {
    setSelectedPreset(preset);
    setDateRangeStart(start);
    setDateRangeEnd(end);
  }}
  onAddTransaction={openTransactionDrawer}
  onManageAccounts={() => setIsManageAccountsOpen(true)}
/>

<div className="h-5" />
{/* ================================================= */}
{/* KPI GRID */}
{/* ================================================= */}

<div className="relative left-3 mx-auto my-2 grid w-[98%] grid-cols-1 gap-3 py-2 sm:grid-cols-2 xl:grid-cols-4">

  <MetricCard
    label="Total Deposits"
    icon={<ArrowDownToLine size={17} />}
    accent="green"
    values={depositTotals}
    description="Completed deposits into brokerage accounts."
    loading={transactionsLoading}
  />

  <MetricCard
    label="Total Withdrawals"
    icon={<ArrowUpFromLine size={17} />}
    accent="red"
    values={withdrawalTotals}
    description="Completed withdrawals from brokerage accounts."
    loading={transactionsLoading}
  />

  <MetricCard
    label="Net Funding"
    icon={<Landmark size={17} />}
    accent="green"
    values={netFundingTotals}
    description="Deposits minus withdrawals. Internal transfers excluded."
    loading={transactionsLoading}
  />

  <MetricCard
    label="Internal Transfers"
    icon={<ArrowLeftRight size={17} />}
    accent="blue"
    values={transferTotals}
    countLabel={`${transferTransactions.length} transfers`}
    description="Amount sent between tracked brokerage accounts."
    loading={transactionsLoading}
  />

</div>

<div className="h-3" />

{/* ================================================= */}
{/* FILTER BAR */}
{/* ================================================= */}

            <Filter
  brokerFilter={brokerFilter}
  accountFilter={accountFilter}
  currencyFilter={currencyFilter}
  accounts={accounts}
  currencies={CURRENCY_ORDER}
              onBrokerChange={(value) => {
                setBrokerFilter(value);
                setAccountFilter("ALL");
              }}
              onAccountChange={setAccountFilter}
              onCurrencyChange={setCurrencyFilter}
              onReset={clearFilters}
            />
<div className="h-3" />
            {/* ================================================= */}
            {/* ACCOUNT TABLE + PENDING ACTIVITY */}
            {/* ================================================= */}

           <div className="relative left-3 mt-5 grid w-[98%] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">

                            {/* ACCOUNT TABLE */}

{accountsLoading ? (
  <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-white/[0.07] bg-[#091321]">
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
      Loading brokerage accounts...
    </div>
  </div>
) : accountsError ? (
  <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-red-500/15 bg-[#091321] px-5 text-center">
    <p className="text-sm font-medium text-red-400">
      Failed to load brokerage accounts
    </p>

    <p className="max-w-md text-xs text-slate-400">
      {accountsError}
    </p>

    <button
      type="button"
      onClick={() => setAccountsRetry((current) => current + 1)}
      className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08]"
    >
      Retry
    </button>
  </div>
) : (
  <BrokerageAccountsCard
    accounts={visibleAccounts}
    completedTransactions={completedTransactions}
    accountFilter={accountFilter}
    onAccountSelect={setAccountFilter}
  />
)}
            


{/* PENDING ACTIVITY */}

<PendingActivityPanel
  pendingTransactions={pendingTransactions}
  pendingTotals={pendingTotals}
  accounts={accounts}
  loading={transactionsLoading}
/>

            </div>
   <div className="h-3" />
            {/* ================================================= */}
            {/* CAPITAL ANALYTICS */}
            {/* ================================================= */}

            <div className="relative left-3 mt-5 grid w-[98%] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">

              <FundingActivityCard
  data={monthlyFundingActivity}
  currencyFilter={currencyFilter}
  loading={transactionsLoading}
/>

             <CapitalActivitySummaryCard
  summary={capitalActivitySummary}
  loading={transactionsLoading}
/>

            </div>

            <div className="h-3" />

            {/* ================================================= */}
            {/* RECENT TRANSACTIONS */}
            {/* ================================================= */}

<RecentTransactionsTable
  transactions={recentTransactions}
  accounts={accounts}
  loading={transactionsLoading}
  error={transactionsError}
  onRetry={() => setTransactionsRetry((prev) => prev + 1)}
/>
<div className="h-2" />

{/* ================================================= */}
{/* FOOTER NOTE */}
{/* ================================================= */}

<div className="relative left-3 mt-5 w-[98%] rounded-[8px] border border-white/[0.07] bg-[#091321] px-5 py-3">

  <div className="flex items-start gap-3">

    <Info
      size={15}
     className="relative left-1 top-3 shrink-0 text-slate-500"
    />

    <div className="min-w-0">
<div className="h-1" />
      <h3 className="text-[12px] font-semibold text-slate-300">
        About Capital Management
      </h3>

      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Capital Management reports deposits, withdrawals and internal
        transfers only. These figures do not represent current brokerage
        cash balances, portfolio value or trading performance.
      </p>
<div className="h-1" />
    </div>

  </div>

</div>

{previewNotice && (
  <div
    role="status"
    className="fixed bottom-5 right-6 z-40 flex max-w-[420px] items-center gap-3 rounded-lg border border-blue-500/20 bg-[#0C1B2D] px-4 py-3 shadow-xl"
  >
    <CheckCircle2
      size={17}
      className="shrink-0 text-blue-400"
    />

    <p className="text-[11px] leading-relaxed text-slate-300">
      {previewNotice}
    </p>

    <button
      type="button"
      onClick={() => setPreviewNotice("")}
      className="ml-2 text-slate-500 hover:text-white"
      aria-label="Dismiss preview message"
    >
      <X size={14} />
    </button>
  </div>
)}

</div>
<div className="h-2" />
</div>

</section>


      {/* ================================================= */}
      {/* ADD TRANSACTION DRAWER */}
      {/* ================================================= */}

<AddTransactionDrawer
  isOpen={isDrawerOpen}
  accounts={accounts}
  onClose={() => setIsDrawerOpen(false)}
  onSubmit={async (transaction) => {
    await createCapitalTransaction(transaction);

    setTransactionsRetry((current) => current + 1);

    setPreviewNotice(
      "Capital transaction saved successfully."
    );
  }}
/>

<ManageAccountsDrawer
  isOpen={isManageAccountsOpen}
  accounts={accounts}
  accountsLoading={accountsLoading}
  accountsError={accountsError}
  onClose={() => setIsManageAccountsOpen(false)}
  onRetryAccounts={() =>
    setAccountsRetry((current) => current + 1)
  }
  onCreate={async (input) => {
    await createCapitalAccount(input);
    setAccountsRetry((current) => current + 1);
  }}
  onUpdate={async (input) => {
    await updateCapitalAccount(input);
    setAccountsRetry((current) => current + 1);
  }}
  onArchive={async (accountId) => {
    await archiveCapitalAccount(accountId);
    setAccountsRetry((current) => current + 1);
  }}
/>

    </main>
  );
}