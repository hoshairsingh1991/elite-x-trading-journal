import EquityCurveCard from "./EquityCurveCard";
import PerformanceBreakdownCard from "./PerformanceBreakdownCard";
import AccountCurrencyCard from "./AccountCurrencyCard";

import { EquityAnalyticsData }
from "@/lib/analytics/equityAnalytics";

import { DailyPnLData }
from "@/lib/analytics/pnlAnalytics";

type EquitySectionProps = {
  equityAnalytics: EquityAnalyticsData;
  dailyPnL: DailyPnLData[];
};

export default function EquitySection({
  equityAnalytics,
  dailyPnL,
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
            />
          </div>

          {/* ================================================= */}
          {/* PERFORMANCE BREAKDOWN */}
          {/* ================================================= */}

          <div className="flex-1 min-w-0">
            <PerformanceBreakdownCard />
          </div>

          {/* ================================================= */}
          {/* ACCOUNT & CURRENCY */}
          {/* ================================================= */}

          <div className="flex-1 min-w-0">
            <AccountCurrencyCard />
          </div>

        </div>
      </div>
    </div>
  );
}