"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import {
  Trade,
} from "@/types/trade";

const DateRangePicker = dynamic(
  () =>
    import(
      "@/components/shared/DateRangePicker"
    ),
  {
    ssr: false,
  }
);

interface TradesToolbarProps {

  trades: Trade[];

  searchQuery: string;

  setSearchQuery: (
    value: string
  ) => void;

  accountFilter: string;

  setAccountFilter: (
    value: string
  ) => void;

  selectedDatePreset: string;

  setSelectedDatePreset: (
    value: string
  ) => void;

  statusFilter: string;

  setStatusFilter: (
    value: string
  ) => void;

  sideFilter: string;

  setSideFilter: (
    value: string
  ) => void;

  assetFilter: string;

  setAssetFilter: (
    value: string
  ) => void;

  fromDate: string;

  setFromDate: (
    value: string
  ) => void;

  toDate: string;

  setToDate: (
    value: string
  ) => void;
}

export default function TradesToolbar({

  trades,

  searchQuery,
  setSearchQuery,

  accountFilter,
  setAccountFilter,

  selectedDatePreset,
  setSelectedDatePreset,

  statusFilter,
  setStatusFilter,

  sideFilter,
  setSideFilter,

  assetFilter,
  setAssetFilter,

  fromDate,
  setFromDate,

  toDate,
  setToDate,

}: TradesToolbarProps) {

  // =================================================
// AVAILABLE ACCOUNTS
// =================================================

const accounts = Array.from(
  new Set(
    trades
      .map(
        (trade) =>
          trade.account
      )
      .filter(Boolean)
  )
);

  // =================================================
  // TEST STATE
  // =================================================

  const [
    isAddTradeOpen,
    setIsAddTradeOpen,
  ] = useState(false);

  // =================================================
  // ACTIVE FILTERS
  // =================================================

    const activeFilters = [

    statusFilter !== "ALL"
      ? statusFilter
      : null,

    sideFilter !== "ALL"
      ? sideFilter
      : null,

    assetFilter !== "ALL"
      ? assetFilter
      : null,

    fromDate
      ? `FROM ${fromDate}`
      : null,

    toDate
      ? `TO ${toDate}`
      : null,

  ].filter(Boolean);

  // =================================================
  // RESET
  // =================================================

    const handleReset = () => {

    setSearchQuery("");

    setStatusFilter("ALL");

    setSideFilter("ALL");

    setAssetFilter("ALL");

    setFromDate("");

    setToDate("");
  };

  return (

    <>

      {/* ================================================= */}
      {/* TEST MODAL */}
      {/* ================================================= */}

      {isAddTradeOpen && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">

          <div className="rounded-3xl bg-[#071427] p-10">

            <h1 className="text-3xl font-black text-white">
              STATE WORKING
            </h1>

            <button
              onClick={() =>
                setIsAddTradeOpen(false)
              }
              className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="ml-10 mr-10 rounded-[28px] border border-white/[0.05] bg-[#071427] p-6 shadow-[0_0_50px_rgba(0,0,0,0.22)]">

        {/* ================================================= */}
        {/* TOP ROW */}
        {/* ================================================= */}

        <div className="flex flex-wrap items-center justify-end gap-3">


          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div className="w-[200px]">

            <input
              type="text"
              placeholder="Search ticker, account, date..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="h-[40px] min-w-[200px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-5 text-center text-[14px] font-medium text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/40"
            />
          </div>

{/* ================================================= */}
{/* DATE RANGE */}
{/* ================================================= */}

<DateRangePicker
  selectedPreset={
    selectedDatePreset
  }
  onDateRangeChange={(
    preset,
    startDate,
    endDate
  ) => {

    setSelectedDatePreset(
      preset
    );

    setFromDate(
      startDate
        ? startDate
            .toISOString()
            .split("T")[0]
        : ""
    );

    setToDate(
      endDate
        ? endDate
            .toISOString()
            .split("T")[0]
        : ""
    );
  }}
/>

{/* ================================================= */}
{/* ACCOUNT FILTER */}
{/* ================================================= */}

<select
  value={accountFilter}
  onChange={(e) =>
    setAccountFilter(
      e.target.value
    )
  }
  className="h-[40px] min-w-[130px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-center text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
>
  <option value="ALL">
    All Accounts
  </option>

  {accounts.map(
    (account) => (
      <option
        key={account}
        value={account}
      >
        {account}
      </option>
    )
  )}
</select>

          {/* ================================================= */}
          {/* STATUS FILTER */}
          {/* ================================================= */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-[40px] min-w-[80px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-center text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="WIN">
              Win
            </option>

            <option value="LOSS">
              Loss
            </option>

            <option value="OPEN">
              Open
            </option>

            <option value="EXPIRED_WORTHLESS">
            Expired Worthless
            </option>
          </select>

          {/* ================================================= */}
          {/* SIDE FILTER */}
          {/* ================================================= */}

          <select
            value={sideFilter}
            onChange={(e) =>
              setSideFilter(
                e.target.value
              )
            }
            className="h-[40px] min-w-[90px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-center text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
          >
            <option value="ALL">
              All Sides
            </option>

            <option value="LONG">
              Long
            </option>

            <option value="SHORT">
              Short
            </option>
          </select>

          {/* ================================================= */}
          {/* ASSET FILTER */}
          {/* ================================================= */}

          <select
            value={assetFilter}
            onChange={(e) =>
              setAssetFilter(
                e.target.value
              )
            }
            className="h-[40px] min-w-[100px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-center text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
          >
            <option value="ALL">
              All Assets
            </option>

            <option value="Futures">
              Futures
            </option>

            <option value="Options">
              Options
            </option>

            <option value="Stocks">
              Stocks
            </option>

            <option value="Forex">
              Forex
            </option>

<option value="CRYPTO">
  Crypto
</option>

<option value="CFD">
  CFD
</option>

          </select>

          {/* ================================================= */}
          {/* RESET */}
          {/* ================================================= */}

          <div className="w-[100px] flex justify-center">

            <button
              onClick={handleReset}
              className="h-[40px] w-full rounded-2xl border border-red-500/15 bg-red-500/10 px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-red-400 transition-all hover:bg-red-500/15"
            >
              Reset
            </button>
                   </div>
        </div>

      </div>

      {/* ================================================= */}
      {/* OPTICAL SPACING */}
      {/* ================================================= */}

      <div className="h-4 opacity-0" />
    </>
  );
}