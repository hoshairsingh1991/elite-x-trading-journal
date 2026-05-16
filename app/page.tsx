"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TradingCalendar from "@/components/dashboard/TradingCalendar";
import TradesTable from "@/components/trades/TradesTable";
import TradeDetailModal from "@/components/trades/TradeDetailModal";

import tradesData from "@/data/trades.json";

import {
  calculateAverageWin,
  calculateProfitFactor,
  calculateTotalFees,
  calculateTotalPnL,
  calculateTotalTrades,
  calculateWinRate,
  filterTradesByRange,
  TimeRange,
} from "@/lib/analytics";

import { Trade } from "@/types/trade";

import {
  Upload,
  Plus,
} from "lucide-react";

export default function HomePage() {

  const [selectedRange, setSelectedRange] =
    useState<TimeRange>("ALL");

  const [selectedTrade, setSelectedTrade] =
    useState<Trade | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const trades: Trade[] = tradesData;

  const filteredTrades = filterTradesByRange(
    trades,
    selectedRange
  );

  const totalPnL = calculateTotalPnL(filteredTrades);

  const totalTrades = calculateTotalTrades(filteredTrades);

  const winRate = calculateWinRate(filteredTrades);

  const averageWin = calculateAverageWin(filteredTrades);

  const profitFactor = calculateProfitFactor(filteredTrades);

  const totalFees = calculateTotalFees(filteredTrades);

  const handleSelectTrade = (
    trade: Trade
  ) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
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
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pr-10 pt-4">

        {/* ================================================= */}
        {/* TOP HEADER */}
        {/* ================================================= */}

        <div className="flex h-[70px] shrink-0 items-center justify-end gap-4 border-b border-white/[0.05] px-8 pb-4">

          <button className="flex h-[46px] items-center gap-3 rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-[14px] font-semibold text-slate-200 transition-all hover:bg-[#13203a]">

            <Upload size={17} />

            Upload IBKR CSV
          </button>

          <button className="flex h-[46px] min-w-[150px] items-center justify-center gap-3 rounded-[18px] border border-blue-400/30 bg-blue-500 px-5 text-[14px] font-bold text-white shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-600">

            <Plus size={17} />

            Add Trade
          </button>
        </div>

        {/* ================================================= */}
        {/* HEADER GAP */}
        {/* ================================================= */}

        <div className="h-8 shrink-0" />

        {/* ================================================= */}
        {/* SCROLL AREA */}
        {/* ================================================= */}

        <div className="flex-1 overflow-y-auto px-8">

          {/* ================================================= */}
          {/* TOP GRID */}
          {/* ================================================= */}

          <div className="flex gap-10">

            {/* ================================================= */}
            {/* LEFT SIDE */}
            {/* ================================================= */}

            <div className="flex w-[78%] flex-col gap-8">

              {/* ================================================= */}
              {/* ACCOUNT OVERVIEW */}
              {/* ================================================= */}

              <div className="rounded-[28px] bg-[#071427] p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]">

                <div className="min-h-[170px] rounded-[24px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">

                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-6">

                    <div className="relative left-4">

                      <h1 className="text-[34px] font-black tracking-tight text-white">
                        Account Overview
                      </h1>

                      <p className="mt-2 text-sm text-slate-500">
                        Trading performance snapshot
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      {["1D", "7D", "30D", "1Y", "ALL"].map((range) => (
                        <button
                          key={range}
                          onClick={() =>
                            setSelectedRange(range as TimeRange)
                          }
                          className={`rounded-full px-4 py-2 text-[12px] font-black tracking-[0.08em] transition-all ${
                            selectedRange === range
                              ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                              : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative left-4 grid grid-cols-3 gap-20 pt-14">

                    {[
                      {
                        title: "Total P&L",
                        value: `$${totalPnL.toLocaleString()}`,
                        sub: `${totalTrades} total trades`,
                        color: totalPnL >= 0
                          ? "text-emerald-400"
                          : "text-red-400",
                      },

                      {
                        title: "Average Win",
                        value: `$${averageWin.toLocaleString()}`,
                        sub: `${winRate}% win rate`,
                        color: "text-emerald-400",
                      },

                      {
                        title: "Commissions",
                        value: `$${totalFees.toLocaleString()}`,
                        sub: "Execution & brokerage",
                        color: "text-orange-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex flex-col"
                      >

                        <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          {item.title}
                        </p>

                        <h2 className="mt-5 text-[50px] font-black leading-none tracking-tight text-white">
                          {item.value}
                        </h2>

                        <p className={`mt-4 text-[14px] font-bold ${item.color}`}>
                          {item.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* PERFORMANCE + EQUITY */}
              {/* ================================================= */}

              <div className="grid grid-cols-2 gap-8">

                {/* PERFORMANCE */}

                <div className="rounded-[28px] bg-[#071427] p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]">

                  <div className="rounded-[24px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">

                    <div className="relative left-3">

                      <h2 className="text-[26px] font-black tracking-tight text-white">
                        Trading Performance
                      </h2>
                    </div>

                    <div className="mt-10">

                      <div className="flex items-center justify-between">

                        <div className="relative left-3">

                          <p className="text-sm text-slate-400">
                            Win Rate
                          </p>

                          <h3 className="mt-3 text-[40px] font-black tracking-tight text-white">
                            {winRate}%
                          </h3>
                        </div>

                        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-[8px] border-blue-500">

                          <span className="text-lg font-bold text-white">
                            {winRate}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-10 space-y-5 border-t border-white/[0.05] pt-6">

                        <div className="flex items-center justify-between">

                          <span className="text-sm text-slate-400">
                            Profit Factor
                          </span>

                          <span className="text-lg font-bold text-blue-400">
                            {profitFactor.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">

                          <span className="text-sm text-slate-400">
                            Total Trades
                          </span>

                          <span className="text-lg font-bold text-white">
                            {totalTrades}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EQUITY */}

                <div className="rounded-[28px] bg-[#071427] p-6 shadow-[0_0_40px_rgba(0,0,0,0.18)]">

                  <div className="h-[420px] rounded-[24px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">

                    <div className="relative left-3">

                      <h2 className="text-[26px] font-black tracking-tight text-white">
                        Equity Curve
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Portfolio growth performance
                      </p>
                    </div>

                    <div className="mt-10 flex h-[300px] items-center justify-center rounded-[18px] border border-dashed border-white/[0.08] bg-white/[0.02]">

                      <span className="text-sm font-medium text-slate-500">
                        Equity Curve Temporarily Disabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[22%] shrink-0" />
          </div>

          <div className="h-10" />

          <TradingCalendar />

          <div className="h-10" />

          <div className="max-w-[98.5%]">

            <TradesTable
              trades={filteredTrades}
              onSelectTrade={handleSelectTrade}
            />
          </div>

          <div className="h-12" />
        </div>

        <TradeDetailModal
          trade={selectedTrade}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </section>
    </main>
  );
}