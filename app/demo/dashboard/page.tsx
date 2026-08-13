"use client";

import { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { DEMO_TRADES } from "@/lib/demo/demoDataset";

import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard-v2/DashboardHeader";
import KPIGrid from "@/components/dashboard-v2/KPIGrid";
import EquitySection from "@/components/dashboard-v2/EquitySection";
import SecondaryMetricsRow from "@/components/dashboard-v2/SecondaryMetricsRow";
import TradingCalendar from "@/components/dashboard/TradingCalendar";

import { getDashboardMetrics } from "@/lib/dashboard/dashboardMetrics";
import { generateEquityAnalytics } from "@/lib/analytics/equityAnalytics";
import { groupDailyPnL, generatePnLAnalytics } from "@/lib/analytics/pnlAnalytics";
import { generateConsistencyAnalytics } from "@/lib/analytics/consistencyAnalytics";
import { generateTradingScoreAnalytics } from "@/lib/analytics/tradingScoreAnalytics";
import { generatePerformanceBreakdownAnalytics } from "@/lib/analytics/performanceBreakdownAnalytics";
import { generateSecondaryMetricsAnalytics } from "@/lib/analytics/secondaryMetricsAnalytics";
import { generateWinRateTrend } from "@/lib/analytics/kpiTrendAnalytics";
import { FALLBACK_RATES } from "@/lib/fx/fxRateProvider";
import { convertTradesToReportingCurrency } from "@/lib/fx/convertTradesToReportingCurrency";
import { Trade } from "@/types/trade";

function DemoCalendarWrapper({
  trades,
  reportingCurrency,
}: {
  trades: Trade[];
  reportingCurrency: string;
}) {
  const OriginalDate = globalThis.Date;

  class DemoDate extends OriginalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(2026, 4, 15); // May 15, 2026
      } else {
        // @ts-ignore
        super(...args);
      }
    }
  }

  globalThis.Date = DemoDate as any;
  try {
    return (
      <TradingCalendar
        trades={trades}
        reportingCurrency={reportingCurrency}
      />
    );
  } finally {
    globalThis.Date = OriginalDate;
  }
}

export default function DemoDashboardPage() {
  // Development & Screenshot Guard
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_ROUTE !== "true") {
    // Allowed for local screenshot generation
  }

  const [selectedAccount, setSelectedAccount] = useState("ALL");
  const [reportingCurrency, setReportingCurrency] = useState("USD");
  const [selectedPreset, setSelectedPreset] = useState("MTD");

  // Filter Trades by Account
  const filteredTrades = useMemo(() => {
    if (selectedAccount === "ALL") return DEMO_TRADES;
    return DEMO_TRADES.filter((t) => t.account === selectedAccount);
  }, [selectedAccount]);

  // Convert Trades to Reporting Currency (USD)
  const convertedTrades = useMemo(() => {
    return convertTradesToReportingCurrency(filteredTrades, reportingCurrency, FALLBACK_RATES);
  }, [filteredTrades, reportingCurrency]);

  // Derive Analytics Metrics using Production Engine
  const dashboardMetrics = useMemo(() => getDashboardMetrics(convertedTrades), [convertedTrades]);
  const dailyPnL = useMemo(() => groupDailyPnL(convertedTrades), [convertedTrades]);
  const equityAnalytics = useMemo(() => generateEquityAnalytics(dailyPnL, dashboardMetrics.netPnL), [dailyPnL, dashboardMetrics.netPnL]);
  const pnlAnalytics = useMemo(() => generatePnLAnalytics(convertedTrades, "MTD"), [convertedTrades]);

  const winningDays = useMemo(() => dailyPnL.filter((d) => d.pnl > 0).length, [dailyPnL]);
  const totalDays = dailyPnL.length;

  const consistencyAnalytics = useMemo(
    () => generateConsistencyAnalytics(winningDays, totalDays, equityAnalytics.equityCurve),
    [winningDays, totalDays, equityAnalytics.equityCurve]
  );

  const tradingScoreAnalytics = useMemo(
    () =>
      generateTradingScoreAnalytics(
        dashboardMetrics.profitFactor,
        equityAnalytics.calmarRatio,
        dashboardMetrics.totalTrades,
        consistencyAnalytics.consistencyScore
      ),
    [dashboardMetrics.profitFactor, equityAnalytics.calmarRatio, dashboardMetrics.totalTrades, consistencyAnalytics.consistencyScore]
  );

  const secondaryMetricsAnalytics = useMemo(() => generateSecondaryMetricsAnalytics(convertedTrades), [convertedTrades]);
  const performanceBreakdownAnalytics = useMemo(() => generatePerformanceBreakdownAnalytics(convertedTrades), [convertedTrades]);
  const winRateTrend = useMemo(() => generateWinRateTrend(convertedTrades), [convertedTrades]);

  const availableAccounts = ["ALL", "Master Trading", "Options Growth", "Secondary CAD"];

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#020617] text-slate-300">
      {/* Sidebar Shell */}
      <div className="p-[10px]">
        <Sidebar />
      </div>

      {/* Main Content Area - Full Width matching production Dashboard V2 */}
      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto px-8 pt-[10px]">
        <div className="flex w-full flex-col gap-4 pb-12">
          {/* Production Dashboard Header */}
          <DashboardHeader
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            availableAccounts={availableAccounts}
            selectedPreset={selectedPreset}
            onDateRangeChange={() => {}}
            totalTrades={dashboardMetrics.totalTrades}
            totalPnL={dashboardMetrics.netPnL}
            tradingDays={totalDays}
            isSyncing={false}
            onSync={() => {}}
            onUpload={() => {}}
          />

          {/* Production KPI Grid */}
          <KPIGrid
            reportingCurrency={reportingCurrency}
            dashboardMetrics={dashboardMetrics}
            equityAnalytics={equityAnalytics}
            tradingScoreAnalytics={tradingScoreAnalytics}
            consistencyScore={consistencyAnalytics.consistencyScore}
            netPnLSparklineData={dailyPnL}
            sparklineData={dailyPnL.map((day) => day.pnl)}
            winRateTrend={winRateTrend}
            profitFactorTrend={winRateTrend}
            expectancyTrend={winRateTrend}
            bestDayTrend={winRateTrend}
            worstDayTrend={winRateTrend}
            avgWinLossTrend={winRateTrend}
            drawdownTrend={winRateTrend}
          />

          {/* Production Equity & Analytics Section */}
          <div className="px-2">
            <EquitySection
              equityAnalytics={equityAnalytics}
              dailyPnL={dailyPnL}
              performanceBreakdownAnalytics={performanceBreakdownAnalytics}
              trades={convertedTrades}
              reportingCurrency={reportingCurrency}
              setReportingCurrency={setReportingCurrency}
              secondaryMetrics={
                <SecondaryMetricsRow
                  pnlAnalytics={pnlAnalytics}
                  consistencyAnalytics={consistencyAnalytics}
                  equityAnalytics={equityAnalytics}
                  secondaryMetricsAnalytics={secondaryMetricsAnalytics}
                />
              }
              tradingCalendar={
                <DemoCalendarWrapper
                  trades={convertedTrades}
                  reportingCurrency={reportingCurrency}
                />
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}
