import AccountCurrencyCard from "./AccountCurrencyCard";
import OpenPositionsCard from "./OpenPositionsCard";
import RecentTradesCard from "./RecentTradesCard";

import { Dispatch, SetStateAction } from "react";

import { Trade } from "@/types/trade";

type DashboardRightColumnProps = {
  trades: Trade[];
  reportingCurrency: string;
  setReportingCurrency: Dispatch<SetStateAction<string>>;
};

export default function DashboardRightColumn({
  trades,
  reportingCurrency,
  setReportingCurrency,
}: DashboardRightColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <AccountCurrencyCard
        trades={trades}
        reportingCurrency={reportingCurrency}
        setReportingCurrency={setReportingCurrency}
      />

      <div className="h-[16px]" />

      <OpenPositionsCard trades={trades} />

      <div className="h-[16px]" />

      <RecentTradesCard trades={trades} />
    </div>
  );
}