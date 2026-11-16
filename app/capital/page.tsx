"use client";

import Sidebar from "@/components/layout/Sidebar";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Landmark,
  CalendarDays,
  ChevronDown,
  Clock3,
  CheckCircle2,
  Plus,
  X,
  Info,
  Paperclip,
  ArrowDownLeft,
  ArrowUpDown,
} from "lucide-react";

import type {
  CurrencyCode,
  TransactionType,
  TransactionStatus,
  PeriodFilter,
  BrokerageAccount,
  CapitalTransaction,
} from "@/lib/capital/types";

import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
} from "@/lib/capital/preview-data";


import { CURRENCY_ORDER } from "@/lib/capital/constants";

import {
  getCurrencyTotals,
  formatBreakdown,
  getNetFundingTotals,
  getTypeLabel,
} from "@/lib/capital/calculations";

import {
  getAccountById,
  getAccountName,
} from "@/lib/capital/helpers";

import { MetricCard } from "@/components/capital/CapitalMetricCard";

import { StatusBadge } from "@/components/capital/StatusBadge";

import { TypeIcon } from "@/components/capital/CapitalTypeIcon";

import CapitalHeader from "@/components/capital/CapitalHeader";

import Filter from "@/components/capital/CapitalFilters";

import BrokerageAccountsCard from "@/components/capital/BrokerageAccountsCard";

import PendingActivityPanel from "@/components/capital/PendingActivityPanel";

import RecentTransactionsTable from "@/components/capital/RecentTransactionsTable";

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
    useState<CapitalTransaction[]>(INITIAL_TRANSACTIONS);

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

  const [formType, setFormType] =
    useState<TransactionType>("DEPOSIT");

  const [formFromAccount, setFormFromAccount] =
    useState("ibkr-main");

  const [formToAccount, setFormToAccount] =
    useState("ibkr-tfsa");

  const [formAmount, setFormAmount] =
    useState("1000");

  const [formCurrency, setFormCurrency] =
    useState<CurrencyCode>("CAD");

  const [formReceivedAmount, setFormReceivedAmount] =
    useState("1000");

  const [formReceivedCurrency, setFormReceivedCurrency] =
    useState<CurrencyCode>("CAD");

  const [formExchangeRate, setFormExchangeRate] =
    useState("1");

  const [formDate, setFormDate] =
    useState("2026-11-16");

  const [formStatus, setFormStatus] =
    useState<TransactionStatus>("COMPLETED");

  const [formMethod, setFormMethod] =
    useState("EFT");

  const [formCounterparty, setFormCounterparty] =
    useState("TD Bank");

  const [formReference, setFormReference] =
    useState("");

  const [formNotes, setFormNotes] =
    useState("");

  const [formAttachmentName, setFormAttachmentName] =
    useState("");

  const [showAdditionalDetails, setShowAdditionalDetails] =
    useState(false);

  const [formError, setFormError] =
    useState("");

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
    getAccountById(INITIAL_ACCOUNTS, id)?.broker === brokerFilter
);

        if (!involvesBroker) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
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
    INITIAL_ACCOUNTS.filter((account) => {
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

      return account.status === "ACTIVE";
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
  // FORM HANDLERS
  // ===================================================

  const openTransactionDrawer = () => {
    setFormError("");
    setPreviewNotice("");
    setIsDrawerOpen(true);
  };

  const handleCreatePreviewTransaction = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");

    const amount = Number(formAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setFormError(
        "Enter a valid transaction amount."
      );
      return;
    }

    if (formType === "TRANSFER") {
      if (formFromAccount === formToAccount) {
        setFormError(
          "Source and destination accounts must be different."
        );
        return;
      }

      const receivedAmount = Number(formReceivedAmount);
      const exchangeRate = Number(formExchangeRate);

      if (
        formReceivedCurrency !== formCurrency &&
        (
          !Number.isFinite(receivedAmount) ||
          receivedAmount <= 0 ||
          !Number.isFinite(exchangeRate) ||
          exchangeRate <= 0
        )
      ) {
        setFormError(
          "Enter a valid receiving amount and exchange rate."
        );
        return;
      }
    }

    const isTransfer =
      formType === "TRANSFER";

    const transaction: CapitalTransaction = {
      id: `PREVIEW-${Date.now()}`,
      date: formDate,
      type: formType,
      status: formStatus,
      amount,
      currency: formCurrency,

      fromAccountId:
        formType === "DEPOSIT"
          ? null
          : formFromAccount,

      toAccountId:
        formType === "WITHDRAWAL"
          ? null
          : formToAccount,

      receivedAmount: isTransfer
        ? formReceivedCurrency === formCurrency
          ? amount
          : Number(formReceivedAmount)
        : null,

      receivedCurrency:
        isTransfer
          ? formReceivedCurrency
          : null,

      exchangeRate:
        isTransfer && formReceivedCurrency !== formCurrency
          ? Number(formExchangeRate)
          : isTransfer
            ? 1
            : null,

      method: formMethod,
      counterpartyInstitution:
        isTransfer ? "" : formCounterparty,

      referenceNumber: formReference,
      notes: formNotes,
    };

    setTransactions((current) => [
      transaction,
      ...current,
    ]);

    setPreviewNotice(
      "Preview transaction added. No data was saved to Supabase."
    );

    setIsDrawerOpen(false);
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
              />

              <MetricCard
                label="Total Withdrawals"
                icon={<ArrowUpFromLine size={17} />}
                accent="red"
                values={withdrawalTotals}
                description="Completed withdrawals from brokerage accounts."
              />

              <MetricCard
                label="Net Funding"
                icon={<Landmark size={17} />}
                accent="green"
                values={netFundingTotals}
                description="Deposits minus withdrawals. Internal transfers excluded."
              />

              <MetricCard
                label="Internal Transfers"
                icon={<ArrowLeftRight size={17} />}
                accent="blue"
                values={transferTotals}
                countLabel={`${transferTransactions.length} transfers`}
                description="Amount sent between tracked brokerage accounts."
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
              accounts={INITIAL_ACCOUNTS}
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

              <BrokerageAccountsCard
                accounts={visibleAccounts}
                completedTransactions={completedTransactions}
                accountFilter={accountFilter}
                onAccountSelect={setAccountFilter}
              />
            


{/* PENDING ACTIVITY */}

<PendingActivityPanel
  pendingTransactions={pendingTransactions}
  pendingTotals={pendingTotals}
  accounts={INITIAL_ACCOUNTS}
/>

            </div>
<div className="h-3" />
            {/* ================================================= */}
            {/* RECENT TRANSACTIONS */}
            {/* ================================================= */}

            <RecentTransactionsTable
  transactions={recentTransactions}
  accounts={INITIAL_ACCOUNTS}
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

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[200] flex justify-end bg-black/65 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsDrawerOpen(false);
            }
          }}
        >

          <div className="flex h-full w-full max-w-[520px] flex-col border-l border-white/[0.08] bg-[#081321] shadow-[-20px_0_60px_rgba(0,0,0,0.45)]">

            {/* DRAWER HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-6 py-5">

              <div>
                <h2 className="text-[18px] font-semibold tracking-tight text-white">
                  Add Transaction
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Record a brokerage capital movement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Close drawer"
              >
                <X size={17} />
              </button>

            </div>

            {/* DRAWER BODY */}

            <form
              onSubmit={handleCreatePreviewTransaction}
              className="flex min-h-0 flex-1 flex-col"
            >

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

                {/* TRANSACTION TYPE */}

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
                    Transaction Type
                  </p>

                  <div className="grid grid-cols-3 gap-2">

                    {([
                      "DEPOSIT",
                      "WITHDRAWAL",
                      "TRANSFER",
                    ] as TransactionType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setFormType(type);
                          setFormError("");
                        }}
                        className={`flex h-[65px] flex-col items-center justify-center gap-2 rounded-lg border text-[10px] font-semibold transition ${
                          formType === type
                            ? "border-blue-500/50 bg-blue-500/[0.10] text-white"
                            : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:bg-white/[0.05]"
                        }`}
                      >
                        {type === "DEPOSIT" && (
                          <ArrowDownToLine
                            size={18}
                            className={
                              formType === type
                                ? "text-emerald-400"
                                : ""
                            }
                          />
                        )}

                        {type === "WITHDRAWAL" && (
                          <ArrowUpFromLine
                            size={18}
                            className={
                              formType === type
                                ? "text-rose-400"
                                : ""
                            }
                          />
                        )}

                        {type === "TRANSFER" && (
                          <ArrowLeftRight
                            size={18}
                            className={
                              formType === type
                                ? "text-blue-400"
                                : ""
                            }
                          />
                        )}

                        {type === "DEPOSIT"
                          ? "Deposit"
                          : type === "WITHDRAWAL"
                            ? "Withdrawal"
                            : "Transfer"}
                      </button>
                    ))}

                  </div>
                </div>

                {/* ACCOUNT SELECTION */}

                {formType === "DEPOSIT" && (
                  <div className="space-y-2">

                    <label className="block text-[11px] font-semibold text-slate-300">
                      Deposit Into
                    </label>

                    <select
                      value={formToAccount}
                      onChange={(event) =>
                        setFormToAccount(event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                    >
                      {INITIAL_ACCOUNTS.map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.name} · {account.broker}
                        </option>
                      ))}
                    </select>

                  </div>
                )}

                {formType === "WITHDRAWAL" && (
                  <div className="space-y-2">

                    <label className="block text-[11px] font-semibold text-slate-300">
                      Withdraw From
                    </label>

                    <select
                      value={formFromAccount}
                      onChange={(event) =>
                        setFormFromAccount(event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                    >
                      {INITIAL_ACCOUNTS.map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.name} · {account.broker}
                        </option>
                      ))}
                    </select>

                  </div>
                )}

                {formType === "TRANSFER" && (
                  <div className="space-y-3">

                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        From Account
                      </label>

                      <select
                        value={formFromAccount}
                        onChange={(event) =>
                          setFormFromAccount(event.target.value)
                        }
                        className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                      >
                        {INITIAL_ACCOUNTS.map((account) => (
                          <option
                            key={account.id}
                            value={account.id}
                          >
                            {account.name} · {account.broker}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/[0.08] text-blue-400">
                        <ArrowDownLeft size={15} />
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        To Account
                      </label>

                      <select
                        value={formToAccount}
                        onChange={(event) =>
                          setFormToAccount(event.target.value)
                        }
                        className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                      >
                        {INITIAL_ACCOUNTS.map((account) => (
                          <option
                            key={account.id}
                            value={account.id}
                          >
                            {account.name} · {account.broker}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                )}

                {/* AMOUNT */}

                {formType !== "TRANSFER" ? (
                  <div className="space-y-2">

                    <label className="block text-[11px] font-semibold text-slate-300">
                      Amount
                    </label>

                    <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formAmount}
                        onChange={(event) =>
                          setFormAmount(event.target.value)
                        }
                        className="h-11 min-w-0 rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[15px] font-semibold text-white outline-none focus:border-blue-500/50"
                      />

                      <select
                        value={formCurrency}
                        onChange={(event) =>
                          setFormCurrency(
                            event.target.value as CurrencyCode
                          )
                        }
                        className="h-11 rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] font-semibold text-slate-200 outline-none focus:border-blue-500/50"
                      >
                        {CURRENCY_ORDER.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>

                    </div>

                  </div>
                ) : (
                  <div className="space-y-3">

                    <div>
                      <p className="mb-2 text-[11px] font-semibold text-slate-300">
                        Amount Sent
                      </p>

                      <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={formAmount}
                          onChange={(event) =>
                            setFormAmount(event.target.value)
                          }
                          className="h-11 min-w-0 rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[15px] font-semibold text-white outline-none focus:border-blue-500/50"
                        />

                        <select
                          value={formCurrency}
                          onChange={(event) =>
                            setFormCurrency(
                              event.target.value as CurrencyCode
                            )
                          }
                          className="h-11 rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] font-semibold text-slate-200 outline-none"
                        >
                          {CURRENCY_ORDER.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>

                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[11px] font-semibold text-slate-300">
                        Amount Received
                      </p>

                      <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={formReceivedAmount}
                          onChange={(event) =>
                            setFormReceivedAmount(event.target.value)
                          }
                          className="h-11 min-w-0 rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[15px] font-semibold text-white outline-none focus:border-blue-500/50"
                        />

                        <select
                          value={formReceivedCurrency}
                          onChange={(event) =>
                            setFormReceivedCurrency(
                              event.target.value as CurrencyCode
                            )
                          }
                          className="h-11 rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] font-semibold text-slate-200 outline-none"
                        >
                          {CURRENCY_ORDER.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>

                      </div>
                    </div>

                    {formCurrency !== formReceivedCurrency && (
                      <div className="space-y-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.045] p-3">

                        <label className="block text-[11px] font-semibold text-slate-300">
                          Exchange Rate
                        </label>

                        <input
                          type="number"
                          min="0.00000001"
                          step="any"
                          value={formExchangeRate}
                          onChange={(event) =>
                            setFormExchangeRate(event.target.value)
                          }
                          className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#081321] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                        />

                        <p className="text-[10px] leading-relaxed text-slate-500">
                          Receiving currency units per one unit of sending currency.
                        </p>

                      </div>
                    )}

                  </div>
                )}

                {/* DATE + STATUS */}

                <div className="grid grid-cols-2 gap-3">

                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Transaction Date
                    </label>

                    <input
                      type="date"
                      value={formDate}
                      onChange={(event) =>
                        setFormDate(event.target.value)
                      }
                      required
                      className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[11px] text-slate-200 outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Status
                    </label>

                    <select
                      value={formStatus}
                      onChange={(event) =>
                        setFormStatus(
                          event.target.value as TransactionStatus
                        )
                      }
                      className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[11px] text-slate-200 outline-none focus:border-blue-500/50"
                    >
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                </div>

                {/* METHOD */}

                {formType !== "TRANSFER" && (
                  <div className="space-y-2">

                    <label className="block text-[11px] font-semibold text-slate-300">
                      {formType === "DEPOSIT"
                        ? "Deposit Method"
                        : "Withdrawal Method"}
                    </label>

                    <select
                      value={formMethod}
                      onChange={(event) =>
                        setFormMethod(event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                    >
                      <option>EFT</option>
                      <option>Bank wire</option>
                      <option>Bill payment</option>
                      <option>ACH</option>
                      <option>Cheque</option>
                      <option>Other</option>
                    </select>

                  </div>
                )}

                {/* ADDITIONAL DETAILS */}

                <div className="overflow-hidden rounded-lg border border-white/[0.07]">

                  <button
                    type="button"
                    onClick={() =>
                      setShowAdditionalDetails((current) => !current)
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.025]"
                  >
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300">
                        Additional Details
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Reference, institution and notes
                      </p>
                    </div>

                    <ChevronDown
                      size={15}
                      className={`text-slate-500 transition-transform ${
                        showAdditionalDetails
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {showAdditionalDetails && (
                    <div className="space-y-4 border-t border-white/[0.07] p-4">

                      {formType !== "TRANSFER" && (
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            {formType === "DEPOSIT"
                              ? "Source Institution"
                              : "Destination Institution"}
                          </label>

                          <input
                            value={formCounterparty}
                            onChange={(event) =>
                              setFormCounterparty(event.target.value)
                            }
                            placeholder="Bank or financial institution"
                            className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Reference Number
                        </label>

                        <input
                          value={formReference}
                          onChange={(event) =>
                            setFormReference(event.target.value)
                          }
                          placeholder="Optional confirmation number"
                          className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Notes
                        </label>

                        <textarea
                          rows={3}
                          value={formNotes}
                          onChange={(event) =>
                            setFormNotes(event.target.value)
                          }
                          placeholder="Add any additional information..."
                          className="w-full resize-none rounded-lg border border-white/[0.09] bg-[#0C1928] px-3 py-2.5 text-[12px] text-slate-200 outline-none focus:border-blue-500/50"
                        />
                      </div>

                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/[0.12] px-3 py-3 transition hover:border-blue-500/40">
                        <Paperclip
                          size={15}
                          className="text-slate-500"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-slate-300">
                            Attach confirmation
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-slate-500">
                            {formAttachmentName ||
                              "Optional supporting document"}
                          </p>
                        </div>

                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            setFormAttachmentName(
                              event.target.files?.[0]?.name ?? ""
                            )
                          }
                        />
                      </label>

                    </div>
                  )}

                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-[11px] text-rose-400"
                  >
                    {formError}
                  </p>
                )}

                <p className="text-[10px] leading-relaxed text-slate-600">
                  Preview mode only. No transaction or attachment will be
                  uploaded to Supabase.
                </p>

              </div>

              {/* DRAWER FOOTER */}

              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-white/[0.07] px-6 py-4">

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-10 rounded-lg border border-white/[0.09] px-4 text-[11px] font-semibold text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[11px] font-semibold text-white shadow-[0_5px_18px_rgba(37,99,235,0.18)] transition hover:bg-blue-500"
                >
                  <Plus size={14} />
                  Add to Preview
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}