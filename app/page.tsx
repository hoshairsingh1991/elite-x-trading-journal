"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter }
from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import UserMenuV2 from "@/components/layout/UserMenuV2";

import {
  getDashboardMetrics,
} from "@/lib/dashboard/dashboardMetrics";

import TradingCalendar from "@/components/dashboard/TradingCalendar";
import PnLAnalytics from "@/components/dashboard/PnLAnalytics";
import PositionsTradesPanel from "@/components/dashboard/PositionsTradesPanel";

import TradeDetailModal from "@/components/trades/TradeDetailModal";
import AddTradeModal from "@/components/trades/AddTradeModal";


import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  calculateAverageWin,
  calculateTotalFees,
  calculateTotalPnL,
  calculateTotalTrades,
  calculateWinRate,
  filterTradesByRange,
  TimeRange,
} from "@/lib/analytics";

import {
  calculatePnLByCurrency,
  calculateFeesByCurrency,
} from "@/lib/analytics/currencyAnalytics";

import { parseIBKRCsv } from "@/lib/parsers/ibkrParser";

import { pairTrades }
from "@/lib/parsers/pairTrades";

import {
  loadExecutionsFromSupabase,
  saveExecutionsToSupabase,
} from "@/lib/storage/supabaseExecutionStorage";

import {
  loadTrades,
} from "@/lib/storage/tradeStorage";

import { supabase }
from "@/lib/supabase";

import { Trade } from "@/types/trade";

import {
  Upload,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function HomePage() {

  const router =
  useRouter();

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

    const storedRange =
      localStorage.getItem(
        "elite-x-dashboard-range"
      );

    if (!storedRange) {
      return;
    }

    setSelectedRange(
      storedRange as TimeRange
    );

  }, []);

    const [hasHydrated, setHasHydrated] =
    useState(false);

  useEffect(() => {

    const storedRange =
      localStorage.getItem(
        "elite-x-dashboard-range"
      );

    if (storedRange) {

      setSelectedRange(
        storedRange as TimeRange
      );
    }

    setHasHydrated(true);

  }, []);

  useEffect(() => {

    if (!hasHydrated) {
      return;
    }

    localStorage.setItem(
      "elite-x-dashboard-range",
      selectedRange
    );

  }, [
    selectedRange,
    hasHydrated,
  ]);

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
  // IBKR CONNECTION MODAL
  // =================================================

  const [
    isBrokerModalOpen,
    setIsBrokerModalOpen,
  ] = useState(false);

  const [
    flexQueryId,
    setFlexQueryId,
  ] = useState("");

  const [
    flexToken,
    setFlexToken,
  ] = useState("");

  const [
    isSavingBroker,
    setIsSavingBroker,
  ] = useState(false);

  // =================================================
  // IMPORTED TRADES
  // =================================================

  const [
    importedTrades,
    setImportedTrades,
  ] = useState<Trade[]>([]);

 // =================================================
 // INITIAL LOAD
 // =================================================

useEffect(() => {

  const loadAllTrades =
    async () => {

      // =========================================
      // LOAD EXECUTIONS FROM SUPABASE
      // =========================================

     const storedExecutions =
  await loadExecutionsFromSupabase();

      console.log(
        "SUPABASE EXECUTIONS:",
        storedExecutions
      );

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
    };

  loadAllTrades();

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

const pnlByCurrency =
  calculatePnLByCurrency(
    filteredTrades
  );

const feesByCurrency =
  calculateFeesByCurrency(
    filteredTrades
  );

  const dashboardMetrics =
  getDashboardMetrics(
    filteredTrades
  );

  console.log(
  JSON.stringify(
    dashboardMetrics,
    null,
    2
  )
);



useEffect(() => {
  localStorage.setItem(
    "elite-x-menu-stats",
    JSON.stringify({
      totalTrades,
      totalPnL,
      tradingDays: new Set(
        filteredTrades.map(
          trade => trade.date
        )
      ).size,
    })
  );
}, [
  totalTrades,
  totalPnL,
  filteredTrades.length,
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

    setIsModalOpen(false);

    setSelectedTrade(null);
  };

  // =================================================
  // LOAD IBKR CONNECTION
  // =================================================

  const handleOpenBrokerModal =
    async () => {

      try {

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("broker_connections")
          .select("*")
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "broker",
            "IBKR"
          )
          .single();

        if (
          data &&
          !error
        ) {

          setFlexQueryId(
            data.flex_query_id || ""
          );

          setFlexToken(
            data.flex_token || ""
          );
        }

        setIsBrokerModalOpen(true);

      } catch (error) {

        console.error(
          "LOAD BROKER CONNECTION FAILED:",
          error
        );

        setIsBrokerModalOpen(true);
      }
    };

  // =================================================
  // SAVE IBKR CONNECTION
  // =================================================

  const handleSaveBrokerConnection =
    async () => {

      try {

        setIsSavingBroker(true);

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

                const {
          error,
        } = await supabase
          .from("broker_connections")
          .upsert(
            {
              user_id: user.id,
              broker: "IBKR",
              flex_query_id:
                flexQueryId,
              flex_token:
                flexToken,
              is_active: true,
            },
            {
              onConflict:
                "user_id,broker",
            }
          );

        if (error) {

          console.error(
  "BROKER SAVE ERROR FULL:",
  JSON.stringify(
    error,
    null,
    2
  )
);

          return;
        }

        console.log(
          "IBKR connection saved"
        );

        setIsBrokerModalOpen(false);

      } catch (error) {

        console.error(
          "BROKER SAVE FAILED:",
          error
        );

      } finally {

        setIsSavingBroker(false);
      }
    };

  // =================================================
  // TEST IBKR FLEX SYNC
  // =================================================

  const handleTestIBKRSync =
    async () => {

      try {

        console.log(
          "STARTING IBKR FLEX SYNC..."
        );

        const response =
          await fetch(
            "/api/ibkr/flex",
            {
              method: "POST",
            }
          );

        const data =
  await response.json();

console.log(
  "IBKR FLEX RESPONSE:",
  data
);

if (
  !data.success
) {

  console.error(
    "IBKR SYNC ERROR:",
    data.error
  );

  return;
}

const csv =
  data.xml;

  console.log(
  "CSV TYPE:",
  typeof csv
);

console.log(
  "CSV CONSTRUCTOR:",
  csv?.constructor?.name
);


const parsedExecutions =
  await parseIBKRCsv(csv);

console.log(
  "PARSED EXECUTIONS:",
  parsedExecutions
);

const reconstructedTrades =
  pairTrades(
    parsedExecutions
  );

console.log(
  "RECONSTRUCTED TRADES:",
  reconstructedTrades
);

await saveExecutionsToSupabase(
  parsedExecutions
);

const refreshedExecutions =
  await loadExecutionsFromSupabase();

const rebuiltTrades =
  pairTrades(
    refreshedExecutions
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

await supabase
  .from("broker_connections")
  .update({
    last_sync_at:
      new Date().toISOString(),
    last_sync_status:
      "success",
    last_sync_error:
      null,
    last_sync_execution_count:
      parsedExecutions.length,
  })
  .eq(
    "broker",
    "IBKR"
  )
  .eq(
    "is_active",
    true
  );


if (
  reconstructedTrades.length > 0
) {

}

      } catch (error) {

        console.error(
          "IBKR SYNC FAILED:",
          error
        );
      }
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

await saveExecutionsToSupabase(
  parsedTrades
);

const storedExecutions =
  await loadExecutionsFromSupabase();

const rebuiltTrades =
  pairTrades(
    storedExecutions
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

  <ProtectedRoute>

    <main className="flex h-screen overflow-hidden bg-[#020617] text-slate-300">

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
              className="h-[46px] min-w-[130px] rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-center text-[14px] font-bold tracking-[0.08em]  outline-none transition-all hover:bg-[#13203a]"
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

<div className="relative right-10 flex items-center gap-4">

          {/* ================================================= */}
          {/* IBKR SYNC BUTTON */}
          {/* ================================================= */}

          <button
            onClick={
  handleTestIBKRSync
}
            className="flex h-[46px] min-w-[120px] items-center justify-center gap-3 rounded-[18px] border border-emerald-400/20 bg-emerald-500/10 px-6 text-[14px] font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
          >

            <RefreshCw size={17} />

            Sync IBKR

          </button>


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
            className="flex h-[46px] min-w-[150px] items-center justify-center gap-3 rounded-[18px] border border-blue-400/30 bg-blue-500 px-5 text-[14px] font-bold text-slate-300 shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-600"
          >

            <Plus size={17} />

            Add Trade
          </button>

          <UserMenuV2
  totalTrades={totalTrades}
  totalPnL={totalPnL}
  tradingDays={
    new Set(
      filteredTrades.map(
        trade => trade.date
      )
    ).size
  }
/>

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

                      <h1 className="text-[34px] font-black tracking-tight text-slate-300">
                        Account Overview
                      </h1>

                      <p className="mt-2 text-sm text-slate-500">
                        Trading performance snapshot
                      </p>
                    </div>

                    <div className="relative right-4 flex max-w-[620px] items-center gap-2 overflow-x-auto scrollbar-hide">

                      {[
                         "1D",
                        "7D",
                        "30D",
                        "MTD",
                        "3M",
                        "6M",
                        "YTD",
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
                          className={`flex h-[22px] shrink-0 min-w-[40px] items-center justify-center rounded-full px-4 text-[15px] font-black tracking-[0.08em] transition-all ${
                            selectedRange === range
                              ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                              : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
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
                      Object.entries(
                      pnlByCurrency
                      ),

                      sub:
                      `${totalTrades} total trades`,

                      color:
                      "text-slate-300",
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
    Object.entries(
      feesByCurrency
    ),

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

    <div className="mt-5 flex flex-col gap-2">

      {Array.isArray(
        item.value
      ) ? (

        item.value.map(
          (
            [currency, value]
          ) => (

            <h2
              key={currency}
              className="text-[50px] font-black leading-none tracking-tight text-slate-300"
            >

              {currency === "USD"
                ? "$"
                : currency === "CAD"
                ? "C$"
                : currency === "EUR"
                ? "€"
                : `${currency} `}

              {Number(
                value
              ).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}

            </h2>
          )
        )

      ) : (

        <h2 className="text-[50px] font-black leading-none tracking-tight text-slate-300">

          {item.value}

        </h2>
      )}

    </div>

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
        {/* IBKR CONNECTION MODAL */}
        {/* ================================================= */}

        {isBrokerModalOpen && (

          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div className="w-[480px] rounded-[32px] border border-white/[0.06] bg-[#071427] px-8 pb-8 pt-7 shadow-[0_0_60px_rgba(0,0,0,0.45)]">

              {/* ============================================= */}
              {/* HEADER */}
              {/* ============================================= */}

              <div className="relative left-1 border-b border-white/[0.05] pb-5">

                <h2 className="text-[24px] font-black tracking-tight text-slate-200">
                  Connect Trade Confirmation Flex
                </h2>

                <p className="mt-2 text-[13px] text-slate-500">
                  Securely connect your IBKR Flex account for deterministic execution sync.
                </p>

              </div>

             {/* ============================================= */}
{/* FORM */}
{/* ============================================= */}

<div className="mt-8">

  {/* INVISIBLE SAFE-ZONE SPACER */}

  <div className="h-[12px] shrink-0" />

  <div className="flex flex-col gap-7">

                {/* FLEX QUERY ID */}

                <div className="flex flex-col gap-2">

                  <label className="relative left-1 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Trade Confirmation Query ID
                  </label>

                  <input
                    type="text"
                    value={flexQueryId}
                    onChange={(event) =>
                      setFlexQueryId(
                        event.target.value
                      )
                    }
                    placeholder="Enter Trade Confirmation Query ID"
                    className="w-full h-[52px] rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-[14px] text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/30"
                  />

                </div>

                {/* FLEX TOKEN */}

                <div className="flex flex-col gap-2">

                  <label className="relative left-1 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    IBKR Flex Token
                  </label>

                  <input
                    type="password"
                    value={flexToken}
                    onChange={(event) =>
                      setFlexToken(
                        event.target.value
                      )
                    }
                    placeholder="Enter IBKR Flex Token"
                    className="w-full h-[52px] rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-[14px] text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-400/30"
                  />

                </div>

              </div>

              </div>

                            {/* ============================================= */}
              {/* ACTIONS */}
              {/* ============================================= */}

              <div className="mt-8">

                {/* INVISIBLE SAFE-ZONE SPACER */}

                <div className="h-[12px] shrink-0" />

                {/* DIVIDER */}

                <div className="border-t border-white/[0.05]" />

                {/* ACTION ROW */}

                <div className="relative right-4 pt-6">

                  <div className="flex items-center justify-end gap-4">

                    <button
                      onClick={() =>
                        setIsBrokerModalOpen(false)
                      }
                      className="flex h-[46px] items-center justify-center rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-6 text-[14px] font-semibold text-slate-300 transition-all hover:bg-[#13203a]"
                    >

                      Cancel

                    </button>

                    <button
                      onClick={
                        handleSaveBrokerConnection
                      }
                      disabled={isSavingBroker}
                      className="flex h-[46px] items-center justify-center rounded-[18px] border border-emerald-400/20 bg-emerald-500/10 px-6 text-[14px] font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                    >

                      {isSavingBroker
                        ? "Saving..."
                        : "Save Connection"}

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

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

  </ProtectedRoute>
  );
}