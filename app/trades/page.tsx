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

import {
  loadExecutionsFromSupabase,
} from "@/lib/storage/supabaseExecutionStorage";
import {
  loadTrades,
} from "@/lib/storage/tradeStorage";

import { pairTrades }
from "@/lib/parsers/pairTrades";

import { Trade } from "@/types/trade";

export default function TradesPage() {

  // =================================================
  // TRADE STATE
  // =================================================

  const [trades, setTrades] =
    useState<Trade[]>([]);

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
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [sideFilter, setSideFilter] =
    useState("ALL");

  const [assetFilter, setAssetFilter] =
    useState("ALL");
      const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

      // =================================================
  // FILTER PERSISTENCE
  // =================================================

  useEffect(() => {

    const storedFilters =
      localStorage.getItem(
        "elite-x-trade-filters"
      );

    if (!storedFilters) {
      return;
    }

    const parsed =
      JSON.parse(
        storedFilters
      );

    setSearchQuery(
      parsed.searchQuery || ""
    );

    setStatusFilter(
      parsed.statusFilter || "ALL"
    );

    setSideFilter(
      parsed.sideFilter || "ALL"
    );

    setAssetFilter(
      parsed.assetFilter || "ALL"
    );

    setFromDate(
      parsed.fromDate || ""
    );

    setToDate(
      parsed.toDate || ""
    );

  }, []);

  useEffect(() => {

    localStorage.setItem(
      "elite-x-trade-filters",

      JSON.stringify({

        searchQuery,

        statusFilter,

        sideFilter,

        assetFilter,

        fromDate,

        toDate,
      })
    );

  }, [

    searchQuery,

    statusFilter,

    sideFilter,

    assetFilter,

    fromDate,

    toDate,
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
          // STATUS
          // =========================================

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            trade.status ===
              statusFilter;

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
      statusFilter,
      sideFilter,
      assetFilter,
      fromDate,
      toDate,
    ]);


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

    <main className="flex h-screen overflow-hidden bg-[#020617] text-white">

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

        <div className="flex h-[100px] items-center justify-between border-b border-white/[0.05] px-8 pb-4">

          <div className="relative left-3">

            <h1 className="text-[38px] font-black tracking-tight text-white">
              Trades
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Execution history & trade review
            </p>

            <div className="h-2 opacity-0" />
          </div>

          {/* ================================================= */}
          {/* ADD TRADE BUTTON */}
          {/* ================================================= */}

          <button
            onClick={() =>
              setIsAddTradeOpen(true)
            }
            className="relative right-10 flex h-[46px] min-w-[150px] items-center justify-center gap-3 rounded-[18px] border border-blue-400/30 bg-blue-500 px-5 text-[14px] font-bold text-white shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-600"
          >

            Add Trade

          </button>
        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="flex-1 overflow-y-auto pl-8 pr-10 pt-8 pb-8">

          <div className="max-w-[98.5%]">

            {/* ================================================= */}
            {/* TOOLBAR */}
            {/* ================================================= */}

            <TradesToolbar
              searchQuery={
                searchQuery
              }
              setSearchQuery={
                setSearchQuery
              }

              statusFilter={
                statusFilter
              }
              setStatusFilter={
                setStatusFilter
              }

              sideFilter={
                sideFilter
              }
              setSideFilter={
                setSideFilter
              }

              assetFilter={
                assetFilter
              }
              setAssetFilter={
                setAssetFilter
              }

              fromDate={
                fromDate
              }
              setFromDate={
                setFromDate
              }

              toDate={
                toDate
              }
              setToDate={
                setToDate
              }
            />

            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <TradesTable
              trades={
                filteredTrades
              }
              onSelectTrade={
                handleSelectTrade
              }
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