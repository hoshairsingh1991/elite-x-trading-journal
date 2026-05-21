"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";

import TradingCalendar from "@/components/dashboard/TradingCalendar";
import PnLAnalytics from "@/components/dashboard/PnLAnalytics";
import PositionsTradesPanel from "@/components/dashboard/PositionsTradesPanel";

import TradeDetailModal from "@/components/trades/TradeDetailModal";
import AddTradeModal from "@/components/trades/AddTradeModal";

import {
  calculateAverageWin,
  calculateTotalFees,
  calculateTotalPnL,
  calculateTotalTrades,
  calculateWinRate,
  filterTradesByRange,
  TimeRange,
} from "@/lib/analytics";

import { parseIBKRCsv } from "@/lib/parsers/ibkrParser";
import { pairTrades }
from "@/lib/parsers/pairTrades";

import {
  loadExecutions,
  appendExecutions,
} from "@/lib/storage/executionStorage";
import {
  loadTrades,
} from "@/lib/storage/tradeStorage";

import { Trade } from "@/types/trade";

import {
  Upload,
  Plus,
} from "lucide-react";

export default function HomePage() {

  const [selectedRange, setSelectedRange] =
  useState<TimeRange>("ALL");
  const [
  selectedAccount,
  setSelectedAccount,
] = useState("ALL");
  // =================================================
// RANGE PERSISTENCE
// =================================================

useEffect(() => {

  const savedRange =
    localStorage.getItem(
      "elite-x-range"
    );

  if (
    savedRange
  ) {

    setSelectedRange(
      savedRange as TimeRange
    );
  }

}, []);

useEffect(() => {

  localStorage.setItem(
    "elite-x-range",
    selectedRange
  );

}, [selectedRange]);

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

  const [importedTrades, setImportedTrades] =
    useState<Trade[]>([]);

  // =================================================
  // INITIAL LOAD
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
  // REMOVE IMPORTED DUPLICATES
  // =========================================

  const filteredManualTrades =
    manualTrades.filter(
      (trade) =>
        !trade.contractKey
    );

  // =========================================
  // COMBINED RENDER LAYER
  // =========================================

  setImportedTrades([
    ...rebuiltTrades,
    ...filteredManualTrades,
  ]);

}, []);

  // =================================================
  // AVAILABLE ACCOUNTS
  // =================================================

  const availableAccounts = [

    "ALL",

    ...Array.from(

      new Set(

        importedTrades
          .map(
            (trade) =>
              trade.account
          )
          .filter(Boolean)

      )

    ),

  ];

    // =================================================
  // ACCOUNT FILTERED TRADES
  // =================================================

  const accountFilteredTrades =

    selectedAccount === "ALL"

      ? importedTrades

      : importedTrades.filter(
          (trade) =>
            trade.account ===
            selectedAccount
        );

  // =================================================
  // FILTERED TRADES
  // =================================================

  const filteredTrades =
    filterTradesByRange(
      accountFilteredTrades,
      selectedRange
    );

  // =================================================
  // ANALYTICS
  // =================================================

  const totalPnL =
    calculateTotalPnL(
      filteredTrades
    );

  const totalTrades =
    calculateTotalTrades(
      filteredTrades
    );

  const winRate =
    calculateWinRate(
      filteredTrades
    );

  const averageWin =
    calculateAverageWin(
      filteredTrades
    );

  const totalFees =
    calculateTotalFees(
      filteredTrades
    );

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

    setIsModalOpen(false);

    setSelectedTrade(null);
  };

  // =================================================
  // CSV IMPORT
  // =================================================

  const handleCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    try {

      const parsedTrades =
        await parseIBKRCsv(file);

      const updatedExecutions =
  appendExecutions(
    parsedTrades
  );

const rebuiltTrades =
  pairTrades(
    updatedExecutions
  );

const manualTrades =
  loadTrades().filter(
    (trade) =>
      !trade.contractKey
  );

setImportedTrades([
  ...rebuiltTrades,
  ...manualTrades,
]);

    } catch (error) {

      console.error(
        "CSV PARSE ERROR:",
        error
      );
    }
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

        <div className="flex h-[70px] shrink-0 items-center justify-between gap-4 border-b border-white/[0.05] px-8 pb-4">

                  {/* ================================================= */}
          {/* ACCOUNT SELECTOR */}
          {/* ================================================= */}

                    <div className="flex flex-col items-center">

            <p className="mb-2 pl-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Select Account
            </p>

            <select
              value={selectedAccount}
              onChange={(event) =>
                setSelectedAccount(
                  event.target.value
                )
              }
              className="h-[46px] min-w-[130px] rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-center text-[14px] font-bold tracking-[0.08em] text-slate-200 outline-none transition-all hover:bg-[#13203a]"
            >

              {availableAccounts.map(
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

<div className="flex items-center gap-4">
          {/* ================================================= */}
          {/* CSV BUTTON */}
          {/* ================================================= */}

          <label className="flex h-[46px] cursor-pointer items-center gap-3 rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-[14px] font-semibold text-slate-200 transition-all hover:bg-[#13203a]">

            <Upload size={17} />

            Upload IBKR CSV

            <input
              type="file"
              accept=".csv"
              onChange={
                handleCSVUpload
              }
              className="hidden"
            />
          </label>

          {/* ================================================= */}
          {/* ADD TRADE BUTTON */}
          {/* ================================================= */}

          <button
            onClick={() =>
              setIsAddTradeOpen(true)
            }
            className="flex h-[46px] min-w-[150px] items-center justify-center gap-3 rounded-[18px] border border-blue-400/30 bg-blue-500 px-5 text-[14px] font-bold text-white shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-600"
          >

            <Plus size={17} />

            Add Trade
          </button>
        </div>
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
          {/* TOP SECTION */}
          {/* ================================================= */}

          <div className="flex items-start gap-8">

            

            {/* ================================================= */}
            {/* LEFT SIDE */}
            {/* ================================================= */}

            <div className="flex w-[68%] flex-col gap-8">

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

                    <div className="relative right-4 flex items-center gap-3">

                      {[
                        "1D",
                        "7D",
                        "30D",
                        "MTD",
                        "1Y",
                        "ALL",
                      ].map((range) => (

                        <button
                          key={range}
                          onClick={() =>
                            setSelectedRange(
                              range as TimeRange
                            )
                          }
                          className={`flex h-[22px] min-w-[40px] items-center justify-center rounded-full px-5 text-[15px] font-black tracking-[0.08em] transition-all ${
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
                        title:
                          "Total P&L",

                        value:
                          `$${totalPnL.toLocaleString()}`,

                        sub:
                          `${totalTrades} total trades`,

                        color:
                          totalPnL >= 0
                            ? "text-emerald-400"
                            : "text-red-400",
                      },

                      {
                        title:
                          "Average Win",

                        value:
                          `$${averageWin.toLocaleString()}`,

                        sub:
                          `${winRate}% win rate`,

                        color:
                          "text-emerald-400",
                      },

                      {
                        title:
                          "Commissions",

                        value:
                          `$${totalFees.toLocaleString()}`,

                        sub:
                          "Execution & brokerage",

                        color:
                          "text-orange-400",
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
              {/* PNL ANALYTICS */}
              {/* ================================================= */}

              <PnLAnalytics
  trades={filteredTrades}
  selectedRange={selectedRange}
/>
            </div>

            {/* ================================================= */}
            {/* RIGHT PANEL */}
            {/* ================================================= */}

            <div className="w-[29%] shrink-0 pr-2">

              <PositionsTradesPanel
                trades={filteredTrades}
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* CALENDAR */}
          {/* ================================================= */}

          <div className="h-10" />

          <TradingCalendar
            trades={filteredTrades}
          />

          <div className="h-12" />
        </div>

        {/* ================================================= */}
        {/* TRADE DETAIL MODAL */}
        {/* ================================================= */}

        {isModalOpen &&
          selectedTrade && (

          <TradeDetailModal
            selectedDate={
              selectedTrade.date
            }
            trades={filteredTrades.filter(
              (trade) =>
                trade.date ===
                selectedTrade.date
            )}
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