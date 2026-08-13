"use client";

import { useState, useMemo } from "react";
import { DEMO_TRADES } from "@/lib/demo/demoDataset";

import Sidebar from "@/components/layout/Sidebar";
import TradesToolbar from "@/components/trades/TradesToolbar";
import TradesTable from "@/components/trades/TradesTable";
import UserMenuV2 from "@/components/layout/UserMenuV2";
import TradeDetailModal from "@/components/trades/TradeDetailModal";

import { Trade } from "@/types/trade";

export default function DemoTradesPage() {
  // Development Guard
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_ROUTE !== "true") {
    // Allowed for local screenshot generation
  }

  // Filter States initialized to "ALL" so all 26 trades are visible
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sideFilter, setSideFilter] = useState("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [selectedDatePreset, setSelectedDatePreset] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter trades deterministically from DEMO_TRADES
  const filteredTrades = useMemo(() => {
    return DEMO_TRADES.filter((trade) => {
      const matchesSearch =
        searchQuery === "" ||
        trade.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trade.contract && trade.contract.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAccount = accountFilter === "ALL" || trade.account === accountFilter;
      const matchesStatus = statusFilter === "ALL" || trade.status === statusFilter;
      const matchesSide = sideFilter === "ALL" || trade.side === sideFilter;
      const matchesAsset = assetFilter === "ALL" || trade.assetType === assetFilter;

      const tradeDateOnly = trade.date.split("T")[0];
      const matchesFromDate = !fromDate || tradeDateOnly >= fromDate;
      const matchesToDate = !toDate || tradeDateOnly <= toDate;

      return (
        matchesSearch &&
        matchesAccount &&
        matchesStatus &&
        matchesSide &&
        matchesAsset &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [searchQuery, accountFilter, statusFilter, sideFilter, assetFilter, fromDate, toDate]);

  const uniqueAccountCount = useMemo(() => {
    return new Set(DEMO_TRADES.map((t) => t.account).filter(Boolean)).size;
  }, []);

  return (
    <main className="flex h-screen overflow-hidden bg-[#020617] text-slate-400">
      {/* Sidebar Shell */}
      <div className="p-4">
        <Sidebar />
      </div>

      <div className="w-8 shrink-0" />

      {/* Page Content Area */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pr-10 pt-4">
        {/* Header Bar */}
        <div className="relative z-[1000] flex h-[72px] items-center justify-between border-b border-white/[0.05] px-8">
          <div className="flex items-center">
            {/* Title */}
            <div className="relative">
              <h1 className="text-[24px] font-black tracking-tight text-slate-400">
                Trade History
              </h1>
            </div>

            {/* Total Trades Count */}
            <div className="relative ml-6">
              <p className="mt-1 text-[18px] font-bold text-slate-200">
                {filteredTrades.length}
              </p>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Total Trades
              </div>
            </div>

            {/* Divider */}
            <div className="relative mx-8 h-[32px] w-px bg-white/[0.08]" />

            {/* Account Count */}
            <div className="relative ml-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Across
              </div>
              <div className="text-[18px] font-bold leading-none text-slate-200">
                {uniqueAccountCount}{" "}
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Accounts
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mx-8 h-[32px] w-px bg-white/[0.08]" />

            {/* Last Import Badge */}
            <div className="relative">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Last Import
              </div>
              <span className="mt-1 text-[13px] font-semibold text-slate-300">
                May 31, 2026
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative flex items-center gap-4">
            <UserMenuV2 totalTrades={DEMO_TRADES.length} totalPnL={0} tradingDays={20} />
          </div>
        </div>

        <div className="h-[16px]" />

        {/* Filtered Table Content */}
        <div className="flex-1 overflow-y-auto pl-8 pr-10 pt-8 pb-8">
          <div className="max-w-[98.5%]">
            <TradesToolbar
              trades={DEMO_TRADES}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              accountFilter={accountFilter}
              setAccountFilter={setAccountFilter}
              selectedDatePreset={selectedDatePreset}
              setSelectedDatePreset={setSelectedDatePreset}
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

            <TradesTable
              trades={filteredTrades}
              tradeCount={filteredTrades.length}
              onSelectTrade={(trade) => {
                setSelectedTrade(trade);
                setIsModalOpen(true);
              }}
              brokerConnections={[
                { broker_account_id: "master-01", account_alias: "Master Trading" },
                { broker_account_id: "growth-01", account_alias: "Options Growth" },
                { broker_account_id: "cad-01", account_alias: "Secondary CAD" },
              ]}
            />
          </div>
        </div>

        {/* Single Trade Detail Modal */}
        {isModalOpen && selectedTrade && (
          <TradeDetailModal
            selectedDate={selectedTrade.date}
            trades={[selectedTrade]}
            onClose={() => {
              setSelectedTrade(null);
              setIsModalOpen(false);
            }}
          />
        )}
      </section>
    </main>
  );
}
