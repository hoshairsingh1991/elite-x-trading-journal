"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";

import TradesTable from "@/components/trades/TradesTable";

import TradeDetailModal from "@/components/trades/TradeDetailModal";

import TradesToolbar from "@/components/trades/TradesToolbar";

import {
  loadExecutions,
} from "@/lib/storage/executionStorage";
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

  // =================================================
  // LOAD TRADES
  // =================================================

  useEffect(() => {

  // =========================================
  // IMPORTED EXECUTION TRADES
  // =========================================

  const storedExecutions =
    loadExecutions();

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

          return (
            matchesSearch &&
            matchesStatus &&
            matchesSide &&
            matchesAsset
          );
        }
      );

    }, [
      trades,
      searchQuery,
      statusFilter,
      sideFilter,
      assetFilter,
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

        <div className="flex h-[100px] items-center border-b border-white/[0.05] px-8 pb-4">

          <div className="relative left-3">

            <h1 className="text-[38px] font-black tracking-tight text-white">
              Trades
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Execution history & trade review
            </p>

            <div className="h-2 opacity-0" />
          </div>
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
      </section>
    </main>
  );
}