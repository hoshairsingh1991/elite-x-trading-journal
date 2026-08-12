"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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

<div
  className="
    w-full
 rounded-[8px]
border-white/[0.06]
    bg-[#071427]
    p-4
    shadow-[0_0_50px_rgba(0,0,0,0.22)]
  "
>

{/* ================================================= */}
{/* TOP ROW */}
{/* ================================================= */}

<div
  className="
    flex
    min-h-[60px]
    w-full
    flex-wrap
    items-center
    gap-3
    pr-[10px]
  "
>

  {/* ================================================= */}
  {/* LEFT FILTER GROUP */}
  {/* ================================================= */}

  <div
    className="
      flex
      min-w-0
      flex-1
      flex-wrap
      items-center
      gap-3
    "
  >

    {/* ================================================= */}
    {/* SEARCH */}
    {/* ================================================= */}

    <div
      className="
        relative
        w-[320px]
        max-w-full
        shrink
        translate-x-[10px]
      "
    >

      {/* SEARCH ICON */}

      <Search
        size={18}
        strokeWidth={1.8}
        className="
          pointer-events-none
          absolute
          left-[14px]
          top-1/2
          -translate-y-1/2
          translate-x-[0px]
          text-slate-400
        "
      />

      {/* SEARCH INPUT */}

      <input
        type="text"
        placeholder="Search ticker, account, date..."
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(
            e.target.value
          )
        }
        className="
          h-[40px]
          w-full
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          pl-[46px]
          [text-indent:52px]
          pr-4
          text-left
          text-[14px]
          font-medium
          text-white
          outline-none
          transition-all
          placeholder:text-slate-500
          focus:border-blue-500/40
        "
      />

    </div>


    {/* ================================================= */}
    {/* DATE RANGE */}
    {/* ================================================= */}

    <div
      className="
        flex
        h-[40px]
        shrink-0
        items-center
        translate-x-[10px]
      "
    >

      <DateRangePicker
        variant="tradeHistory"
        heightClass="h-[40px]"
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

    </div>


    {/* ================================================= */}
    {/* ACCOUNT FILTER */}
    {/* ================================================= */}

    <div
      className="
        shrink-0
        translate-x-[10px]
      "
    >

      <select
        value={accountFilter}
        onChange={(e) =>
          setAccountFilter(
            e.target.value
          )
        }
        className="
          h-[40px]
          min-w-[130px]
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          px-4
          text-center
          text-[13px]
          font-semibold
          text-slate-300
          outline-none
          transition-all
          focus:border-blue-500/40
        "
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

    </div>


    {/* ================================================= */}
    {/* STATUS FILTER */}
    {/* ================================================= */}

    <div
      className="
        shrink-0
        translate-x-[10px]
      "
    >

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(
            e.target.value
          )
        }
        className="
          h-[40px]
          min-w-[100px]
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          px-4
          text-center
          text-[13px]
          font-semibold
          text-slate-300
          outline-none
          transition-all
          focus:border-blue-500/40
        "
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

    </div>


    {/* ================================================= */}
    {/* SIDE FILTER */}
    {/* ================================================= */}

    <div
      className="
        shrink-0
        translate-x-[10px]
      "
    >

      <select
        value={sideFilter}
        onChange={(e) =>
          setSideFilter(
            e.target.value
          )
        }
        className="
          h-[40px]
          min-w-[90px]
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          px-4
          text-center
          text-[13px]
          font-semibold
          text-slate-300
          outline-none
          transition-all
          focus:border-blue-500/40
        "
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

    </div>


    {/* ================================================= */}
    {/* ASSET FILTER */}
    {/* ================================================= */}

    <div
      className="
        shrink-0
        translate-x-[10px]
      "
    >

      <select
        value={assetFilter}
        onChange={(e) =>
          setAssetFilter(
            e.target.value
          )
        }
        className="
          h-[40px]
          min-w-[100px]
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          px-4
          text-center
          text-[13px]
          font-semibold
          text-slate-300
          outline-none
          transition-all
          focus:border-blue-500/40
        "
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

      </select>

    </div>

  </div>


{/* ================================================= */}
{/* RIGHT ACTION GROUP */}
{/* ================================================= */}

<div
  className="
    ml-auto
    flex
    shrink-0
    items-center
    pl-4
  "
>

{/* ================================================= */}
{/* RESET */}
{/* ================================================= */}

<button
  onClick={handleReset}
  className="
  translate-x-[-20px]
    h-[40px]
    w-[100px]
    rounded-[8px]
    border
    border-red-500/15
    bg-red-500/10
    px-5
    text-[12px]
    font-bold
    uppercase
    tracking-[0.14em]
    text-red-400
    transition-all
    hover:bg-red-500/15
  "
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