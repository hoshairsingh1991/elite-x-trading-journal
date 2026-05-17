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

// =================================================
// RAW NORMALIZED EXECUTION
// =================================================

export interface NormalizedExecution {
  id: string;

  date: string;

  ticker: string;

  contract: string;

  side: TradeSide;

  quantity: number;

  executionPrice: number;

  executionValue: number;

  fees: number;

  account: string;

  assetType: string;

  multiplier: number;
}

// =================================================
// CANONICAL TRADE OBJECT
// =================================================

export interface Trade {
  id: string;

  // =================================================
  // BASIC INFO
  // =================================================

  ticker: string;

  contract?: string;

  side: TradeSide;

  status: TradeStatus;

  date: string;

  strategy?: string;

  setup?: string;

  session?: TradingSession;

  assetType?: string;

  account?: string;

  // =================================================
  // EXECUTION
  // =================================================

  entryPrice: number;

  exitPrice?: number | null;

  quantity: number;

  riskRewardRatio?: number;

  stopLoss?: number;

  takeProfit?: number;

  // =================================================
  // PERFORMANCE
  // =================================================

  pnl: number;

  pnlPercent?: number;

  fees: number;

  // =================================================
  // OPEN POSITION SUPPORT
  // =================================================

  isOpen: boolean;

  openedAt?: string;

  closedAt?: string | null;

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