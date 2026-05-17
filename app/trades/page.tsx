"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";

import TradesTable from "@/components/trades/TradesTable";

import TradeDetailModal from "@/components/trades/TradeDetailModal";

import { loadTrades } from "@/lib/storage/tradeStorage";

import { Trade } from "@/types/trade";

export default function TradesPage() {

  const [trades, setTrades] =
    useState<Trade[]>([]);

  const [selectedTrade, setSelectedTrade] =
    useState<Trade | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // =================================================
  // LOAD TRADES
  // =================================================

  useEffect(() => {

    const storedTrades =
      loadTrades();

    setTrades(
      storedTrades
    );

  }, []);

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

            <TradesTable
              trades={trades}
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
            trades={trades.filter(
              (trade) =>
                trade.date ===
                selectedTrade.date
            )}
            onClose={
              handleCloseModal
            }
          />
        )}
      </section>
    </main>
  );
}