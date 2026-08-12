"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";

import TradesTable from "@/components/trades/TradesTable";

import TradeDetailModal from "@/components/trades/TradeDetailModal";
import AddTradeModal from "@/components/trades/AddTradeModal";

import TradesToolbar from "@/components/trades/TradesToolbar";

import { supabase } from "@/lib/supabase";

import UserMenuV2
from "@/components/layout/UserMenuV2";

import {
  loadExecutionsFromSupabase,
} from "@/lib/storage/supabaseExecutionStorage";
import {
  loadTrades,
} from "@/lib/storage/tradeStorage";

import { pairTrades }
from "@/lib/parsers/pairTrades";

import { Trade } from "@/types/trade";

// =================================================
// HEADER POSITIONING
// =================================================

const lastImportX =
  "translate-x-[-0px]";

export default function TradesPage() {

  // =================================================
  // TRADE STATE
  // =================================================

  const [brokerConnections, setBrokerConnections] =
    useState<
      {
        broker_account_id: string;
        account_alias: string;
      }[]
    >([]);

  const [trades, setTrades] =
    useState<Trade[]>([]);

const [lastImportAt, setLastImportAt] =
  useState<string | null>(null);

  // =================================================
  // LOAD BROKER ACCOUNT ALIASES
  // =================================================

  useEffect(() => {
    const loadBrokerConnections = async () => {
      const { data, error } = await supabase
        .from("broker_connections")
        .select(`
          broker_account_id,
          account_alias
        `);

      if (error) {
        console.error(
          "Failed to load broker connections:",
          error
        );
        return;
      }

      setBrokerConnections(data || []);
    };

    loadBrokerConnections();
  }, []);

  // =================================================
  // MODAL STATE
  // =================================================

  const [selectedTrade, setSelectedTrade] =
    useState<Trade | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // =================================================
  // ADD TRADE MODAL
  // =================================================

  const [
    isAddTradeOpen,
    setIsAddTradeOpen,
  ] = useState(false);

// =================================================
// FILTER STATE
// =================================================

const [searchQuery, setSearchQuery] =
  useState(() => {

    if (typeof window === "undefined") {
      return "";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.searchQuery || "";
  });

const [accountFilter, setAccountFilter] =
  useState(() => {

    if (typeof window === "undefined") {
      return "ALL";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "ALL";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.accountFilter || "ALL";
  });

const [statusFilter, setStatusFilter] =
  useState(() => {

    if (typeof window === "undefined") {
      return "ALL";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "ALL";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.statusFilter || "ALL";
  });

const [sideFilter, setSideFilter] =
  useState(() => {

    if (typeof window === "undefined") {
      return "ALL";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "ALL";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.sideFilter || "ALL";
  });

const [assetFilter, setAssetFilter] =
  useState(() => {

    if (typeof window === "undefined") {
      return "ALL";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "ALL";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.assetFilter || "ALL";
  });

const [fromDate, setFromDate] =
  useState(() => {

    if (typeof window === "undefined") {
      return "";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.fromDate || "";
  });

const [toDate, setToDate] =
  useState(() => {

    if (typeof window === "undefined") {
      return "";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.toDate || "";
  });

const [selectedDatePreset, setSelectedDatePreset] =
  useState(() => {

    if (typeof window === "undefined") {
      return "All Time";
    }

    const stored =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!stored) {
      return "All Time";
    }

    const parsed =
      JSON.parse(stored);

    return parsed.selectedDatePreset || "All Time";
  });



// =================================================
// FILTER PERSISTENCE
// =================================================



useEffect(() => {

  localStorage.setItem(
    "elite-x-trade-filters",

    JSON.stringify({

      searchQuery,

      accountFilter,

      statusFilter,

      sideFilter,

      assetFilter,

      fromDate,

      toDate,

      selectedDatePreset,

    })
  );

}, [

  searchQuery,

  accountFilter,

  statusFilter,

  sideFilter,

  assetFilter,

  fromDate,

  toDate,

  selectedDatePreset,

]);

// =================================================
// LOAD TRADES
// =================================================

useEffect(() => {

  const loadAllTrades =
    async () => {

      // =========================================
      // LOAD EXECUTIONS FROM SUPABASE
      // =========================================

      const storedExecutions =
        await loadExecutionsFromSupabase();

      const rebuiltTrades =
        pairTrades(
          storedExecutions
        );

      // =========================================
      // MANUAL TRADES
      // =========================================

      const manualTrades =
        loadTrades();

      // =========================================
      // FILTER MANUAL ONLY
      // =========================================

      const filteredManualTrades =
        manualTrades.filter(
          (trade) =>
            !trade.contractKey
        );

      // =========================================
      // COMBINED RENDER LAYER
      // =========================================

setTrades([
  ...rebuiltTrades,
  ...filteredManualTrades,
]);

// =========================================
// LOAD LAST IMPORT
// =========================================

const {
  data: latestSync,
  error: latestSyncError,
} = await supabase
  .from("broker_connections")
  .select("last_sync_at")
  .eq("is_active", true)
  .not("last_sync_at", "is", null)
  .order("last_sync_at", {
    ascending: false,
  })
  .limit(1)
  .maybeSingle();

if (latestSyncError) {

  console.error(
    "FAILED TO LOAD LAST IMPORT:",
    latestSyncError
  );

} else {

  setLastImportAt(
    latestSync?.last_sync_at ?? null
  );
}
    };

  loadAllTrades();

}, []);

  // =================================================
  // FILTERED TRADES
  // =================================================

  const filteredTrades =
    useMemo(() => {

      return trades.filter(
        (trade) => {

                  // =========================================
          // SEARCH
          // =========================================

          const search =
            searchQuery
              .toLowerCase()
              .trim();

          const matchesSearch =
            !search ||
            trade.ticker
              ?.toLowerCase()
              .includes(search) ||
            trade.account
              ?.toLowerCase()
              .includes(search) ||
            trade.date
              ?.toLowerCase()
              .includes(search) ||
            trade.assetType
              ?.toLowerCase()
              .includes(search);

      // =========================================
      // ACCOUNT
      // =========================================

      const matchesAccount =

        accountFilter ===
          "ALL" ||

        trade.account ===
          accountFilter;


          // =========================================
          // STATUS
          // =========================================

          const isExpiredWorthless =

            trade.assetType
            ?.toUpperCase() ===
            "OPTIONS" &&
            trade.exitPrice ===
              0 &&
            trade.status ===
              "LOSS";

          const matchesStatus =

            statusFilter ===
              "ALL" ||

            (
              statusFilter ===
                "EXPIRED_WORTHLESS"

                ? isExpiredWorthless

                : trade.status ===
                  statusFilter
            );

          // =========================================
          // SIDE
          // =========================================

          const matchesSide =

            sideFilter ===
              "ALL" ||

            trade.side ===
              sideFilter;

          // =========================================
          // ASSET TYPE
          // =========================================

          const matchesAsset =

            assetFilter ===
              "ALL" ||

            trade.assetType ===
              assetFilter;

          // =========================================
          // DATE RANGE
          // =========================================

          const matchesFromDate =

            !fromDate ||

            trade.date >=
              fromDate;

          const matchesToDate =

            !toDate ||

            trade.date <=
              toDate;

return (
  matchesSearch &&
  matchesAccount &&
  matchesStatus &&
  matchesSide &&
  matchesAsset &&
  matchesFromDate &&
  matchesToDate
);
        }
      );

    }, [
      trades,
      searchQuery,
      accountFilter,
      statusFilter,
      sideFilter,
      assetFilter,
      fromDate,
      toDate,
    ]);

// =================================================
// LAST IMPORT FORMATTER
// =================================================

const formattedLastImport =
  lastImportAt
    ? new Date(
        lastImportAt
      ).toLocaleString(
        undefined,
        {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      )
    : "—";


  // =================================================
  // MODAL HANDLERS
  // =================================================

  const handleSelectTrade = (
    trade: Trade
  ) => {

    setSelectedTrade(
      trade
    );

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {

    setSelectedTrade(null);

    setIsModalOpen(false);
  };

  return (

    <main className="flex h-screen overflow-hidden bg-[#020617] text-slate-400">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <div className="p-4">
        <Sidebar />
      </div>

      {/* ================================================= */}
      {/* SIDEBAR SPACER */}
      {/* ================================================= */}

      <div className="w-8 shrink-0" />

      {/* ================================================= */}
      {/* PAGE CONTENT */}
      {/* ================================================= */}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pr-10 pt-4">

{/* ================================================= */}
{/* HEADER */}
{/* ================================================= */}

<div className="relative z-[1000] flex h-[72px] items-center justify-between border-b border-white/[0.05] px-8">

  {/* ================================================= */}
  {/* HEADER LEFT */}
  {/* ================================================= */}

  <div className="flex items-center">

    {/* ================================================= */}
    {/* TITLE */}
    {/* ================================================= */}

    <div className="relative">
      <h1 className="text-[24px] font-black tracking-tight text-slate-400">
        Trade History
      </h1>
    </div>

{/* ================================================= */}
{/* TOTAL TRADES */}
{/* ================================================= */}

<div
  className="
    relative
    ml-6
    translate-x-8
    translate-y-0
  "
>
<p className="mt-1 translate-y-0 text-[18px] font-bold text-slate-200">
  {filteredTrades.length}
</p>

  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
    Total Trades
  </div>
</div>

    {/* ================================================= */}
    {/* DIVIDER */}
    {/* ================================================= */}

    <div
      className="
        relative
        mx-8
        h-[32px]
        w-px
        translate-x-10
        translate-y-1
        bg-white/[0.08]
      "
    />

{/* ================================================= */}
{/* ACROSS ACCOUNTS */}
{/* ================================================= */}

<div
  className="
    relative
    ml-8
    translate-x-14
  "
>

  {/* ================================================= */}
  {/* ACROSS */}
  {/* ================================================= */}

  <div
    className="
      relative
      translate-y-0
      text-[9px]
      font-bold
      uppercase
      tracking-[0.18em]
      text-slate-500
    "
  >
    Across
  </div>

{/* ================================================= */}
{/* ACCOUNT COUNT */}
{/* ================================================= */}

<div
  className="
    relative
    translate-y-1
    text-[18px]
    font-bold
    leading-none
    text-slate-200
  "
>
  {
    new Set(
      trades
        .map(
          (trade) =>
            trade.account
        )
        .filter(Boolean)
    ).size
  }{" "}

  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
    Accounts
  </span>
</div>

</div>

    {/* ================================================= */}
    {/* DIVIDER */}
    {/* ================================================= */}

    <div
      className="
        relative
        mx-8
        h-[32px]
        w-px
        translate-x-18
        translate-y-1
        bg-white/[0.08]
      "
    />

    {/* ================================================= */}
    {/* LAST IMPORT */}
    {/* ================================================= */}

    <div
      className="
        relative
        translate-x-22
        translate-y-1
      "
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Last Import
      </div>

<span className="mt-1 -translate-y-2 text-[13px] font-semibold text-slate-300">
  {formattedLastImport}
</span>
    </div>

  </div>

{/* ================================================= */}
{/* HEADER ACTIONS */}
{/* ================================================= */}

<div
  className="
    relative
    flex
    items-center
    gap-4
    -translate-x-8
  "
>

{/* ================================================= */}
{/* ADD TRADE */}
{/* ================================================= */}

<button
  onClick={() =>
    setIsAddTradeOpen(true)
  }
  className="
    flex
    h-[40px]
    min-w-[100px]
    shrink-0
    items-center
    justify-center

    rounded-[8px]

    border
    border-blue-400/30

    bg-blue-500

    px-4

    text-[13px]
    font-semibold
    text-slate-200

    shadow-[0_0_12px_rgba(59,130,246,0.15)]

    transition-all
    hover:bg-blue-600
  "
>
  Add Trade
</button>

  {/* ================================================= */}
  {/* USER MENU */}
  {/* ================================================= */}

  <UserMenuV2
    totalTrades={trades.length}
    totalPnL={0}
    tradingDays={0}
  />



  </div>

</div>
{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[16px]" />
{/* ================================================= */}
{/* CONTENT */}
{/* ================================================= */}

<div className="flex-1 overflow-y-auto pl-8 pr-10 pt-8 pb-8">

  <div className="max-w-[98.5%]">

    {/* ================================================= */}
    {/* TOOLBAR */}
    {/* ================================================= */}

<TradesToolbar
  trades={trades}

  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}

  accountFilter={accountFilter}
  setAccountFilter={setAccountFilter}

  selectedDatePreset={selectedDatePreset}
  setSelectedDatePreset={
    setSelectedDatePreset
  }

  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}

  sideFilter={sideFilter}
  setSideFilter={setSideFilter}

  assetFilter={assetFilter}
  setAssetFilter={setAssetFilter}

  fromDate={fromDate}
  setFromDate={setFromDate}

  toDate={toDate}
  setToDate={setToDate}
/>

{/* ================================================= */}
{/* TABLE */}
{/* ================================================= */}

<TradesTable
  trades={filteredTrades}
  tradeCount={filteredTrades.length}
  onSelectTrade={handleSelectTrade}
  brokerConnections={brokerConnections}
/>
  </div>
</div>

{/* ================================================= */}
{/* MODAL */}
{/* ================================================= */}

{isModalOpen &&
  selectedTrade && (

  <TradeDetailModal
    selectedDate={
      selectedTrade.date
    }

    // =================================================
    // SINGLE TRADE ONLY
    // =================================================

    trades={[
      selectedTrade
    ]}

    onClose={
      handleCloseModal
    }
  />
)}

{/* ================================================= */}
{/* ADD TRADE MODAL */}
{/* ================================================= */}

<AddTradeModal
  open={isAddTradeOpen}
  onClose={() =>
    setIsAddTradeOpen(false)
  }
/>

</section>
</main>

);
}