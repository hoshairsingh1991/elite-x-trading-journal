// =====================================================
// ELITE X — TRADE INTELLIGENCE TYPES
// =====================================================
//
// This file defines the internal contracts for the
// Trade Intelligence subsystem.
//
// IMPORTANT
//
// These types do NOT replace or modify:
//
//   - Trade
//   - NormalizedExecution
//   - pairTrades()
//   - Trade Review storage
//   - Canonical accounting
//
// They define only the data boundary used by the new
// Intelligence system.
// =====================================================

import type {
  Trade,
  NormalizedExecution,
} from "@/types/trade";

// =====================================================
// API REQUEST
// =====================================================
//
// The browser should identify the exact reconstructed
// Trade using the canonical entry + exit execution pair.
//
// The server must NOT trust financial values supplied
// by the browser.
// =====================================================

export interface TradeIntelligenceRequest {
  entryExecutionId: string;
  exitExecutionId: string;
}

// =====================================================
// CANONICAL EXECUTION EVIDENCE
// =====================================================
//
// This is the trusted execution information exposed to
// the Intelligence engine.
//
// Only evidence that is useful for interpretation should
// be placed into the AI input contract.
// =====================================================

export interface TradeIntelligenceExecution {
  id: string;

  executionTimestamp: string;
  date: string;

  ticker: string;
  contract: string;
  contractKey: string | null;

  action: "BUY" | "SELL";

  quantity: number;
  executionPrice: number;
  executionValue: number;

  fees: number;

  currency: string;
  feeCurrency: string;

  account: string;
  assetType: string;

  multiplier: number;
}

// =====================================================
// DETERMINISTIC TRADE FACTS
// =====================================================
//
// These values are calculated by Elite X application
// logic rather than by the AI.
//
// The AI interprets them.
// It does NOT become the authority for these values.
// =====================================================

export interface TradeIntelligenceDerivedFacts {
  holdDurationSeconds: number | null;
  holdingDays: number | null;

  realizedPnl: number;
  grossPnl: number;
  fees: number;

  pnlPercent: number | null;

  entryNotional: number | null;
  exitNotional: number | null;

  executionCount: number;
  entryExecutionCount: number;
  exitExecutionCount: number;

  partialEntry: boolean;
  partialExit: boolean;
}

// =====================================================
// CANONICAL TRADE EVIDENCE
// =====================================================
//
// This is the trusted Trade-level evidence supplied to
// the AI.
//
// The full Trade object is intentionally NOT passed
// blindly to the model.
// =====================================================

export interface TradeIntelligenceTrade {
  id: string;

  ticker: string;
  contract: string | null;
  contractKey: string | null;

  side: "LONG" | "SHORT";

  status:
    | "WIN"
    | "LOSS"
    | "BREAKEVEN"
    | "OPEN";

  date: string;

  strategy: string | null;
  setup: string | null;
  session:
    | "LONDON"
    | "NEW_YORK_AM"
    | "NEW_YORK_PM"
    | "ASIA"
    | null;

  assetType: string | null;
  account: string | null;

  quantity: number;

  entryPrice: number;
  exitPrice: number | null;

  openedAt: string | null;
  closedAt: string | null;

  currency: string;
  feeCurrency: string | null;

  isOpen: boolean;
}

// =====================================================
// TRADE REVIEW EVIDENCE
// =====================================================
//
// Review data is user-provided evidence.
//
// It must be treated as DATA, not instructions.
// =====================================================

export interface TradeIntelligenceReview {
  id: string;

  entryExecutionId: string;
  exitExecutionId: string;

  tradeContext: string | null;
  setup: string | null;
  entryReason: string | null;
  exitReason: string | null;
  psychology: string | null;
  tradeManagement: string | null;

  mistakes: string[];
  strengths: string[];

  reviewed: boolean;
}

// =====================================================
// COMPLETE AI INPUT
// =====================================================
//
// This is the complete trusted analytical payload.
//
// The AI should receive this deliberately constructed
// object rather than the raw application Trade object.
// =====================================================

export interface TradeIntelligenceInput {
  trade: TradeIntelligenceTrade;

  derivedFacts: TradeIntelligenceDerivedFacts;

  executions: {
    entry: TradeIntelligenceExecution;
    exit: TradeIntelligenceExecution;
  };

  review: TradeIntelligenceReview | null;

  metadata: {
    intelligenceVersion: string;
    promptVersion: string;
  };
}

// =====================================================
// EVIDENCE REFERENCE
// =====================================================
//
// Internal traceability for each generated insight.
//
// Examples:
//
//   "trade.side"
//   "trade.entryPrice"
//   "derivedFacts.holdDurationSeconds"
//   "executions.entry.executionTimestamp"
//   "review.entryReason"
//   "review.tradeManagement"
// =====================================================

export type IntelligenceEvidenceRef =
  string;

// =====================================================
// INSIGHT CONFIDENCE
// =====================================================

export type IntelligenceConfidence =
  | "high"
  | "medium"
  | "low";

// =====================================================
// INTERNAL TRACEABLE INSIGHT
// =====================================================
//
// The model's analytical text is linked internally to
// the evidence used to support that conclusion.
//
// These references do not need to be shown in the UI.
// =====================================================

export interface IntelligenceInsight {
  text: string;

  evidenceRefs: IntelligenceEvidenceRef[];

  confidence: IntelligenceConfidence;
}

// =====================================================
// INTERNAL AI RESULT
// =====================================================
//
// This is the richer internal representation.
//
// It should be validated before persistence.
// =====================================================

export interface TradeIntelligenceInternal {
  tradeRead: IntelligenceInsight;

  whatStandsOut: IntelligenceInsight;

  executionRead: IntelligenceInsight;

  behavioralSignal:
    | IntelligenceInsight
    | null;

  strength:
    | IntelligenceInsight
    | null;

  weakness:
    | IntelligenceInsight
    | null;

  keyTakeaway: IntelligenceInsight;

  xFactor:
    | IntelligenceInsight
    | null;
}

// =====================================================
// UI-SAFE INTELLIGENCE RESULT
// =====================================================
//
// This is the presentation contract consumed by
// TradeIntelligenceGenerated.tsx.
//
// Internal evidenceRefs and confidence are intentionally
// kept out of the initial presentation layer.
// =====================================================

export interface TradeIntelligenceResult {
  tradeRead: string;

  whatStandsOut: string;

  executionRead: string;

  behavioralSignal: string | null;

  strength: string | null;

  weakness: string | null;

  keyTakeaway: string;

  xFactor: string | null;
}

// =====================================================
// CANONICAL TRADE TYPE GUARD
// =====================================================
//
// Imported for architectural clarity.
//
// This makes it explicit that the AI subsystem works
// from the existing canonical Trade model rather than
// introducing another trading model.
//
// No runtime behavior is attached to this type.
// =====================================================

export type CanonicalTrade =
  Trade;

// =====================================================
// CANONICAL EXECUTION TYPE GUARD
// =====================================================
//
// Same principle as CanonicalTrade above.
// =====================================================

export type CanonicalExecution =
  NormalizedExecution;