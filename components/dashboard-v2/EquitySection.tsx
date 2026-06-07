import EquityCurveCard from "./EquityCurveCard";
import PerformanceBreakdownCard from "./PerformanceBreakdownCard";
import AccountCurrencyCard from "./AccountCurrencyCard";
import OpenPositionsCard from "./OpenPositionsCard";
import RecentTradesCard from "./RecentTradesCard";
import { Trade } from "@/types/trade";

import { Dispatch, SetStateAction } from "react";

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
};

export default function EquitySection({
  equityAnalytics,
  dailyPnL,
  performanceBreakdownAnalytics,
  trades,
  reportingCurrency,
  setReportingCurrency,
}: EquitySectionProps) {

  return (
    <div className="flex justify-center">
      <div className="w-[98%]">
        <div className="flex gap-6">

          {/* ================================================= */}
          {/* EQUITY CURVE */}
          {/* ================================================= */}

          <div className="flex-[1.6] min-w-0">
<EquityCurveCard
  equityAnalytics={equityAnalytics}
  dailyPnL={dailyPnL}
  reportingCurrency={
    reportingCurrency
  }
/>
          </div>

          {/* ================================================= */}
          {/* PERFORMANCE BREAKDOWN */}
          {/* ================================================= */}

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

          {/* ================================================= */}
          {/* ACCOUNT & CURRENCY */}
          {/* ================================================= */}

          <div className="flex-1 min-w-0">

<AccountCurrencyCard
  trades={trades}
  reportingCurrency={
    reportingCurrency
  }
  setReportingCurrency={
    setReportingCurrency
  }
/>

            <div className="h-[16px]" />

            <OpenPositionsCard />

            <div className="h-[16px]" />

            <RecentTradesCard />

          </div>

        </div>
      </div>
    </div>
  );
}