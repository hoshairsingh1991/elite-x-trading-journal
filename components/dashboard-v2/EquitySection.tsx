import EquityCurveCard from "./EquityCurveCard";
import PerformanceBreakdownCard from "./PerformanceBreakdownCard";
import AccountCurrencyCard from "./AccountCurrencyCard";
import OpenPositionsCard from "./OpenPositionsCard";
import RecentTradesCard from "./RecentTradesCard";
import { Trade } from "@/types/trade";

import {
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

import {
  EquityAnalyticsData,
} from "@/lib/analytics/equityAnalytics";

import {
  DailyPnLData,
} from "@/lib/analytics/pnlAnalytics";

import {
  PerformanceBreakdownData,
} from "@/lib/analytics/performanceBreakdownAnalytics";

type EquitySectionProps = {
  equityAnalytics: EquityAnalyticsData;
  dailyPnL: DailyPnLData[];
  performanceBreakdownAnalytics: PerformanceBreakdownData;
  trades: Trade[];

  reportingCurrency: string;

  setReportingCurrency:
    Dispatch<
      SetStateAction<string>
    >;

  secondaryMetrics: ReactNode;
  tradingCalendar: ReactNode;
};

export default function EquitySection({
  equityAnalytics,
  dailyPnL,
  performanceBreakdownAnalytics,
  trades,
  reportingCurrency,
  setReportingCurrency,
  secondaryMetrics,
  tradingCalendar,
}: EquitySectionProps) {

return (
  <div className="flex justify-center">
    <div className="w-[98%]">
      <div className="flex gap-6">

        {/* ================================================= */}
        {/* LEFT COLUMN */}
        {/* ================================================= */}

        <div className="flex-[2.6] min-w-0 flex flex-col gap-6">

          {/* Top Row */}

          <div className="flex gap-6">

            {/* EQUITY CURVE */}

            <div className="flex-[1.6] min-w-0">
              <EquityCurveCard
                equityAnalytics={equityAnalytics}
                dailyPnL={dailyPnL}
                reportingCurrency={reportingCurrency}
              />
            </div>

            {/* PERFORMANCE BREAKDOWN */}

            <div className="flex-1 min-w-0">
              <PerformanceBreakdownCard
                performanceBreakdownAnalytics={
                  performanceBreakdownAnalytics
                }
                reportingCurrency={
                  reportingCurrency
                }
              />
            </div>

          </div>

          {/* SECONDARY METRICS */}

          {secondaryMetrics}

          {/* TRADING CALENDAR */}

          {tradingCalendar}

        </div>

        {/* ================================================= */}
        {/* RIGHT COLUMN */}
        {/* ================================================= */}

        <div className="flex-1 min-w-0">

          <AccountCurrencyCard
            trades={trades}
            reportingCurrency={reportingCurrency}
            setReportingCurrency={
              setReportingCurrency
            }
          />

          <div className="h-[16px]" />

          <OpenPositionsCard
            trades={trades}
          />

          <div className="h-[16px]" />

          <RecentTradesCard
            trades={trades}
          />

        </div>

      </div>
    </div>
  </div>
);
}