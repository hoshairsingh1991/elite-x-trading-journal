import { Trade } from "@/types/trade";

export interface DailyReviewBaseProps {
  selectedDay: number;
  monthName: string;
  currentYear: number;
  selectedTrades: Trade[];
  allTrades: Trade[];
  reportingCurrency: string;
}

export interface DailyReviewHeaderProps {
  selectedDay: number;
  currentMonth: number;
  monthName: string;
  currentYear: number;
  selectedTrades: Trade[];
  onClose: () => void;
}

export interface DailyReviewKpisProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

export interface DailyReviewPerformanceProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

export interface DailyReviewTradeActivityProps {
  selectedTrades: Trade[];
}

export interface DailyReviewInsightsProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

export interface DailyReviewSecondaryMetricsProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

export interface DailyReviewBreakdownsProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

export interface DailyReviewTradeTableProps {
  selectedTrades: Trade[];
  allTrades: Trade[];
  reportingCurrency: string;
  onSelectTrade: (trade: Trade) => void;
}

export interface TradeReviewDrawerProps {
  trade: Trade | null;
  allTrades: Trade[];
  reportingCurrency: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}