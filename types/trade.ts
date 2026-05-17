export type TradeSide = "LONG" | "SHORT";

export type TradeStatus =
  | "WIN"
  | "LOSS"
  | "BREAKEVEN"
  | "OPEN";

export type TradingSession =
  | "LONDON"
  | "NEW_YORK_AM"
  | "NEW_YORK_PM"
  | "ASIA";

export type TradeEmotion =
  | "CONFIDENT"
  | "CALM"
  | "FEARFUL"
  | "GREEDY"
  | "FOMO"
  | "REVENGE"
  | "HESITANT"
  | "DISCIPLINED";

export type TradeMistake =
  | "OVERTRADING"
  | "FOMO_ENTRY"
  | "EARLY_EXIT"
  | "LATE_EXIT"
  | "OVERSIZED_POSITION"
  | "NO_STOP_LOSS"
  | "PLAN_DEVIATION"
  | "REVENGE_TRADING";

export interface Trade {
  id: string;

  // =================================================
  // BASIC TRADE INFO
  // =================================================

  ticker: string;

  side: TradeSide;

  status: TradeStatus;

  date: string;

  strategy: string;

  setup: string;

  session: TradingSession;

  // =================================================
  // EXECUTION
  // =================================================

  entryPrice: number;

  exitPrice: number;

  quantity: number;

  riskRewardRatio: number;

  stopLoss?: number;

  takeProfit?: number;

  // =================================================
  // PERFORMANCE
  // =================================================

  pnl: number;

  pnlPercent?: number;

  fees: number;

  // =================================================
  // JOURNALING
  // =================================================

  notes?: string;

  emotions?: TradeEmotion[];

  mistakes?: TradeMistake[];

  tags?: string[];

  // =================================================
  // MEDIA
  // =================================================

  screenshots?: string[];

  // =================================================
  // METADATA
  // =================================================

  createdAt: string;

  updatedAt: string;
}