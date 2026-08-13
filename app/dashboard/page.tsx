"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter }
from "next/navigation";

import {
  getFxRates,
  FxRates,
  FALLBACK_RATES,
} from "@/lib/fx/fxRateProvider";

import {
  convertTradesToReportingCurrency,
} from "@/lib/fx/convertTradesToReportingCurrency";


import Sidebar from "@/components/layout/Sidebar";
import UserMenuV2 from "@/components/layout/UserMenuV2";

import DashboardHeader
from "@/components/dashboard-v2/DashboardHeader";

import KPIGrid
from "@/components/dashboard-v2/KPIGrid";

import {
  getDashboardMetrics,
} from "@/lib/dashboard/dashboardMetrics";

import {
  generateEquityAnalytics,
} from "@/lib/analytics/equityAnalytics";

import {
  generateRiskAnalytics,
} from "@/lib/analytics/riskAnalytics";

import {
  groupDailyPnL,
  generatePnLAnalytics,
} from "@/lib/analytics/pnlAnalytics";

import {
  generateConsistencyAnalytics,
} from "@/lib/analytics/consistencyAnalytics";

import {
  generateTradingScoreAnalytics,
} from "@/lib/analytics/tradingScoreAnalytics";

import {
  generatePerformanceBreakdownAnalytics,
} from "@/lib/analytics/performanceBreakdownAnalytics";



import {
  generateWinRateTrend,
} from "@/lib/analytics/kpiTrendAnalytics";

import TradingCalendar from "@/components/dashboard/TradingCalendar";


import TradeDetailModal from "@/components/trades/TradeDetailModal";
import AddTradeModal from "@/components/trades/AddTradeModal";

import EquityCurveCard
from "@/components/dashboard-v2/EquityCurveCard";

import EquitySection
from "@/components/dashboard-v2/EquitySection";


import ProtectedRoute from "@/components/auth/ProtectedRoute";

import SecondaryMetricsRow from "@/components/dashboard-v2/SecondaryMetricsRow";

import {
  generateSecondaryMetricsAnalytics,
} from "@/lib/analytics/secondaryMetricsAnalytics";


import {
  calculateAverageWin,
  calculateTotalFees,
  calculateTotalPnL,
  calculateTotalTrades,
  calculateWinRate,
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



export default function HomePage() {

  const router =
  useRouter();

const [selectedPreset, setSelectedPreset] =
  useState("YTD");

const [startDate, setStartDate] =
  useState<Date | null>(
    new Date(
      new Date().getFullYear(),
      0,
      1
    )
  );

const [endDate, setEndDate] =
  useState<Date | null>(
    new Date()
  );

  const [
  selectedAccount,
  setSelectedAccount,
] = useState("ALL");

const [
  reportingCurrency,
  setReportingCurrency,
] = useState("USD");

const [
  fxRates,
  setFxRates,
] = useState<FxRates>(
  FALLBACK_RATES
);

// =================================================
// REPORTING CURRENCY PERSISTENCE
// =================================================

useEffect(() => {

  const savedCurrency =
    localStorage.getItem(
      "reportingCurrency"
    );

  if (savedCurrency) {
    setReportingCurrency(
      savedCurrency
    );
  }

}, []);

useEffect(() => {

  localStorage.setItem(
    "reportingCurrency",
    reportingCurrency
  );

}, [reportingCurrency]);

const [isSyncing, setIsSyncing] =
  useState(false);

// =================================================
// FX RATES
// =================================================

useEffect(() => {

  async function loadFxRates() {

    const rates =
      await getFxRates();

    setFxRates(
      rates
    );
  }

  loadFxRates();

}, []);

// =================================================
// DASHBOARD DATE RANGE PERSISTENCE
// =================================================

const getFreshDashboardDateRange = (
  preset: string
): {
  startDate: Date | null;
  endDate: Date | null;
} => {

  const now = new Date();

  const startOfDay =
    new Date(now);

  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  const endOfDay =
    new Date(now);

  endOfDay.setHours(
    23,
    59,
    59,
    999
  );

  switch (preset) {

    case "Today":

      return {
        startDate:
          startOfDay,

        endDate:
          endOfDay,
      };


    case "This Week": {

      const start =
        new Date(
          startOfDay
        );

      const day =
        start.getDay();

      const diff =
        day === 0
          ? -6
          : 1 - day;

      start.setDate(
        start.getDate() +
        diff
      );

      return {
        startDate:
          start,

        endDate:
          endOfDay,
      };
    }


    case "This Month":

      return {
        startDate:
          new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0
          ),

        endDate:
          endOfDay,
      };


    case "Last 30 Days": {

      const start =
        new Date(
          startOfDay
        );

      start.setDate(
        start.getDate() - 29
      );

      return {
        startDate:
          start,

        endDate:
          endOfDay,
      };
    }


    case "This Quarter": {

      const quarterStartMonth =
        Math.floor(
          now.getMonth() / 3
        ) * 3;

      return {
        startDate:
          new Date(
            now.getFullYear(),
            quarterStartMonth,
            1,
            0,
            0,
            0,
            0
          ),

        endDate:
          endOfDay,
      };
    }


    case "YTD":

      return {
        startDate:
          new Date(
            now.getFullYear(),
            0,
            1,
            0,
            0,
            0,
            0
          ),

        endDate:
          endOfDay,
      };


    default:

      return {
        startDate:
          null,

        endDate:
          null,
      };
  }
};


useEffect(() => {

  const saved =
    localStorage.getItem(
      "dashboardDateFilter"
    );

  if (!saved) {
    return;
  }

  const parsed =
    JSON.parse(saved);

  const preset =
    parsed.selectedPreset ??
    "YTD";

  setSelectedPreset(
    preset
  );

  const dynamicPresets =
    new Set([
      "Today",
      "This Week",
      "This Month",
      "Last 30 Days",
      "This Quarter",
      "YTD",
    ]);

  if (
    dynamicPresets.has(
      preset
    )
  ) {

    const freshRange =
      getFreshDashboardDateRange(
        preset
      );

    setStartDate(
      freshRange.startDate
    );

    setEndDate(
      freshRange.endDate
    );

    return;
  }

  setStartDate(
    parsed.startDate
      ? new Date(
          parsed.startDate
        )
      : null
  );

  setEndDate(
    parsed.endDate
      ? new Date(
          parsed.endDate
        )
      : null
  );

}, []);
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

const availableAccounts: string[] = [

  "ALL",

  ...Array.from(

    new Set(

      importedTrades
        .map(
          (trade) =>
            trade.account
        )
        .filter(
          (
            account
          ): account is string =>
            Boolean(account)
        )

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
  accountFilteredTrades.filter(
    (trade) => {

      if (!startDate || !endDate) {
        return true;
      }

      const tradeDate =
        new Date(
          `${trade.date}T00:00:00`
        );

      const rangeStart =
        new Date(startDate);

      rangeStart.setHours(
        0,
        0,
        0,
        0
      );

      const rangeEnd =
        new Date(endDate);

      rangeEnd.setHours(
        23,
        59,
        59,
        999
      );

      return (
        tradeDate >= rangeStart &&
        tradeDate <= rangeEnd
      );

    }
  );

// =================================================
// REPORTING CURRENCY
// =================================================


const reportingTrades =
  convertTradesToReportingCurrency(
    filteredTrades,
    reportingCurrency,
    fxRates
  );


  // =================================================
  // ANALYTICS
  // =================================================

const totalPnL =
  calculateTotalPnL(
    reportingTrades
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
    reportingTrades
  );

const dailyPnL =
  groupDailyPnL(
    reportingTrades
  );

const pnlAggregationRange:
  | "1D"
  | "7D"
  | "30D"
  | "MTD"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "ALL" =
  !startDate || !endDate
    ? "ALL"
    : (() => {

        const start =
          new Date(startDate);

        const end =
          new Date(endDate);

        start.setHours(
          0,
          0,
          0,
          0
        );

        end.setHours(
          23,
          59,
          59,
          999
        );

        const days =
          Math.ceil(
            (
              end.getTime() -
              start.getTime()
            ) /
            (1000 * 60 * 60 * 24)
          ) + 1;

        if (days <= 14) {
          return "7D";
        }

        if (days <= 90) {
          return "30D";
        }

        return "YTD";

      })();

const pnlAnalytics =
  generatePnLAnalytics(
    reportingTrades,
    pnlAggregationRange
  );

  const winRateTrend =
  generateWinRateTrend(
    filteredTrades
  );
  

const equityAnalytics =
  generateEquityAnalytics(
    dailyPnL,
    totalPnL
  );

const profitFactorTrend =
  dailyPnL.reduce<number[]>(
    (acc, day) => {

      const previous =
        acc.length > 0
          ? acc[acc.length - 1]
          : 1;

      const next =
        previous +
        day.pnl / 1000;

      acc.push(
        Math.max(
          0.5,
          next
        )
      );

      return acc;
    },
    []
  );

  const expectancyTrend =
  dailyPnL.reduce<number[]>(
    (acc, day) => {

      const previous =
        acc.length > 0
          ? acc[acc.length - 1]
          : 0;

      const next =
        previous +
        day.pnl / 500;

      acc.push(next);

      return acc;
    },
    []
  );

const drawdownTrend =
  equityAnalytics.equityCurve.map(
    (_, index) => {

      const progress =
        index /
        Math.max(
          equityAnalytics.equityCurve.length - 1,
          1
        );

      return (
        equityAnalytics.maxDrawdown *
        progress
      );
    }
  );


const avgWinLossHistogram =
  filteredTrades
    .slice(-20)
    .map(
      trade =>
        Math.abs(
          trade.pnl
        )
    );

  const bestDayTrend =
  dailyPnL.reduce<number[]>(
    (acc, day) => {

      const previous =
        acc.length > 0
          ? acc[acc.length - 1]
          : 0;

      const next =
        previous +
        Math.max(
          day.pnl,
          0
        ) / 500;

      acc.push(next);

      return acc;
    },
    []
  );

const worstDayTrend = [
  0,
  0,
  0,
  ...dailyPnL.reduce<number[]>(
    (acc, day) => {

      const previous =
        acc.length > 0
          ? acc[acc.length - 1]
          : 0;

      const next =
        previous +
        Math.min(
          day.pnl,
          0
        ) / 500;

      acc.push(next);

      return acc;
    },
    []
  ),
];

  const riskAnalytics =
  generateRiskAnalytics(
    equityAnalytics.currentDrawdown,
    dashboardMetrics.profitFactor
  );

  const winningDays =
  dailyPnL.filter(
    day => day.pnl > 0
  ).length;

const totalDays =
  dailyPnL.length;

const consistencyAnalytics =
  generateConsistencyAnalytics(
    winningDays,
    totalDays,
    equityAnalytics.equityCurve
  );

  const tradingScoreAnalytics =
  generateTradingScoreAnalytics(
    dashboardMetrics.profitFactor,
    equityAnalytics.calmarRatio,
    dashboardMetrics.totalTrades,
    consistencyAnalytics.consistencyScore
  );

  const secondaryMetricsAnalytics =
  generateSecondaryMetricsAnalytics(
    reportingTrades
  );


const performanceBreakdownAnalytics =
  generatePerformanceBreakdownAnalytics(
    reportingTrades
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
// MANUAL MULTI-BROKER SYNC
// =================================================

const handleTestIBKRSync =
  async () => {

    if (isSyncing) {
      return;
    }

    try {

      setIsSyncing(true);

      console.log(
        "STARTING MULTI-BROKER SYNC..."
      );

const {
  data: {
    session,
  },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  console.error(
    "NO AUTHENTICATED SESSION"
  );
  return;
}

const response =
  await fetch(
    "/api/sync-all-brokers",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${session.access_token}`,
      },
    }
  );

      const data =
        await response.json();

      if (!data.success) {

        console.error(
          "SYNC FAILED:",
          data
        );

        return;
      }

      // =====================================
      // RELOAD CANONICAL EXECUTIONS
      // =====================================

      const refreshedExecutions =
        await loadExecutionsFromSupabase();

      const rebuiltTrades =
        pairTrades(
          refreshedExecutions
        );

      // =====================================
      // RELOAD MANUAL TRADES
      // =====================================

      const manualTrades =
        loadTrades().filter(
          (trade) =>
            !trade.contractKey
        );

      // =====================================
      // REFRESH DASHBOARD
      // =====================================

      setImportedTrades([
        ...rebuiltTrades,
        ...manualTrades,
      ]);

      console.log(
        "MULTI-BROKER SYNC COMPLETE"
      );

    } catch (error) {

      console.error(
        "MULTI-BROKER SYNC FAILED:",
        error
      );

    } finally {

      setIsSyncing(false);

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

// =========================================
// LOAD EXECUTIONS
// =========================================

const storedExecutions =
  await loadExecutionsFromSupabase();

// =========================================
// REBUILD TRADES
// =========================================

const rebuiltTrades =
  pairTrades(
    storedExecutions
  );

// =========================================
// VERIFY EXECUTIONS DID NOT CHANGE
// =========================================

const july1After =
  storedExecutions.filter(
    execution =>
      execution.date === "2026-07-01"
  );

console.log(
  "JULY 1 AFTER PAIRTRADES:",
  july1After.length
);

console.table(july1After);

console.log(
  "========================================");

// =========================================
// MANUAL TRADES
// =========================================



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

    <div className="p-[10px]">
  <Sidebar />
</div>

    {/* ================================================= */}
    {/* SIDEBAR SPACER */}
    {/* ================================================= */}

    <div className="w-0 shrink-0" />

    {/* ================================================= */}
    {/* MAIN CONTENT */}
    {/* ================================================= */}

    <section className="flex min-w-0 flex-1 flex-col overflow-hidden px-8 pt-[10px]">




        {/* ================================================= */}
        {/* SCROLL AREA */}
        {/* ================================================= */}

      <div className="flex-1 overflow-y-auto">

  <DashboardHeader
  selectedAccount={selectedAccount}
  setSelectedAccount={setSelectedAccount}
  availableAccounts={availableAccounts}
selectedPreset={selectedPreset}
onDateRangeChange={(
  preset,
  start,
  end
) => {

  setSelectedPreset(preset);

  setStartDate(start);

  setEndDate(end);

  localStorage.setItem(
    "dashboardDateFilter",
    JSON.stringify({
      selectedPreset: preset,
      startDate: start,
      endDate: end,
    })
  );

}}
  totalTrades={totalTrades}
  totalPnL={totalPnL}
  tradingDays={
    new Set(
      filteredTrades.map(
        trade => trade.date
      )
    ).size
  }
  isSyncing={isSyncing}
  onSync={handleTestIBKRSync}
  onUpload={handleCSVUpload}
/>

  <div className="h-4 shrink-0" />

{/* ================================================= */}
{/* TOP SECTION */}
{/* ================================================= */}

<div>

  {/* ================================================= */}
  {/* MAIN DASHBOARD CONTENT */}
  {/* ================================================= */}

  <div className="flex w-full flex-col gap-4">

  {/* ================================================= */}
  {/* KPI GRID */}
  {/* ================================================= */}

<KPIGrid
  reportingCurrency={reportingCurrency}

  dashboardMetrics={dashboardMetrics}
  equityAnalytics={equityAnalytics}
  tradingScoreAnalytics={tradingScoreAnalytics}
  consistencyScore={
    consistencyAnalytics.consistencyScore
  }

  netPnLSparklineData={dailyPnL}

  sparklineData={
    dailyPnL.map(
      day => day.pnl
    )
  }
  winRateTrend={winRateTrend}
  profitFactorTrend={profitFactorTrend}
  expectancyTrend={expectancyTrend}
  bestDayTrend={bestDayTrend}
  worstDayTrend={worstDayTrend}
  avgWinLossTrend={avgWinLossHistogram}
  drawdownTrend={drawdownTrend}
/>

{/* ================================================= */}
{/* PNL ANALYTICS */}
{/* ================================================= */}

<div className="px-8">
<EquitySection
  equityAnalytics={equityAnalytics}
  dailyPnL={dailyPnL}
  performanceBreakdownAnalytics={
    performanceBreakdownAnalytics
  }
  trades={filteredTrades}
  reportingCurrency={reportingCurrency}
  setReportingCurrency={
    setReportingCurrency
  }
  secondaryMetrics={
    <SecondaryMetricsRow
      pnlAnalytics={pnlAnalytics}
      consistencyAnalytics={
        consistencyAnalytics
      }
      equityAnalytics={
        equityAnalytics
      }
      secondaryMetricsAnalytics={
        secondaryMetricsAnalytics
      }
    />
  }
tradingCalendar={
  <TradingCalendar
    trades={reportingTrades}
    reportingCurrency={reportingCurrency}
  />
}
/>
</div>


{/* ================================================= */}
{/* POSITIONS & TRADES */}
{/* ================================================= */}

{/*
<div className="pr-8">
  <PositionsTradesPanel
    trades={filteredTrades}
  />
</div>
*/}

</div> {/* closes flex w-full flex-col gap-6 */}
</div> {/* closes TOP SECTION wrapper */}

<div className="h-6 shrink-0" />
</div> {/* closes scroll area */}

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