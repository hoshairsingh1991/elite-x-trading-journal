import type {
  Trade,
  NormalizedExecution,
} from "@/types/trade";

import type {
  TradeIntelligenceInput,
  TradeIntelligenceExecution,
  TradeIntelligenceReview,
  TradeIntelligenceTrade,
  TradeIntelligenceDerivedFacts,
} from "@/lib/ai/tradeIntelligence/types";

import type {
  TradeReview,
} from "@/lib/storage/supabaseTradeReviewStorage";

// =====================================================
// ELITE X — TRADE INTELLIGENCE INPUT BUILDER
// =====================================================
//
// Converts trusted canonical Trade + Trade Review data
// into the deliberately restricted input contract used
// by the Intelligence engine.
//
// IMPORTANT
//
// This file does NOT:
//
//   - call OpenAI
//   - calculate canonical P&L
//   - modify Trade
//   - modify executions
//   - modify Trade Review
//   - persist anything
//
// Deterministic values are derived only from already
// trusted canonical values.
// =====================================================

// =====================================================
// VERSIONING
// =====================================================

export const TRADE_INTELLIGENCE_VERSION =
  "1.0.0";

export const TRADE_INTELLIGENCE_PROMPT_VERSION =
  "1.0.0";

// =====================================================
// EXECUTION MAPPING
// =====================================================

function buildExecutionEvidence(
  execution: NormalizedExecution
): TradeIntelligenceExecution {
  return {
    id:
      execution.id,

    executionTimestamp:
      execution.executionTimestamp,

    date:
      execution.date,

    ticker:
      execution.ticker,

    contract:
      execution.contract,

    contractKey:
      execution.contractKey ??
      null,

    action:
      execution.action,

    quantity:
      execution.quantity,

    executionPrice:
      execution.executionPrice,

    executionValue:
      execution.executionValue,

    fees:
      execution.fees,

    currency:
      execution.currency,

    feeCurrency:
      execution.feeCurrency ??
      execution.currency,

    account:
      execution.account,

    assetType:
      execution.assetType,

    multiplier:
      execution.multiplier,
  };
}

// =====================================================
// TRADE MAPPING
// =====================================================

function buildTradeEvidence(
  trade: Trade
): TradeIntelligenceTrade {
  return {
    id:
      trade.id,

    ticker:
      trade.ticker,

    contract:
      trade.contract ??
      null,

    contractKey:
      trade.contractKey ??
      null,

    side:
      trade.side,

    status:
      trade.status,

    date:
      trade.date,

    strategy:
      trade.strategy ??
      null,

    setup:
      trade.setup ??
      null,

    session:
      trade.session ??
      null,

    assetType:
      trade.assetType ??
      null,

    account:
      trade.account ??
      null,

    quantity:
      trade.quantity,

    entryPrice:
      trade.entryPrice,

    exitPrice:
      trade.exitPrice ??
      null,

    openedAt:
      trade.openedAt ??
      null,

    closedAt:
      trade.closedAt ??
      null,

    currency:
      trade.currency,

    feeCurrency:
      trade.feeCurrency ??
      null,

    isOpen:
      trade.isOpen,
  };
}

// =====================================================
// HOLD DURATION
// =====================================================

function calculateHoldDurationSeconds(
  openedAt?: string,
  closedAt?: string | null
): number | null {

  if (
    !openedAt ||
    !closedAt
  ) {
    return null;
  }

  const opened =
    new Date(
      openedAt
    ).getTime();

  const closed =
    new Date(
      closedAt
    ).getTime();

  if (
    !Number.isFinite(opened) ||
    !Number.isFinite(closed)
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.round(
      (
        closed -
        opened
      ) / 1000
    )
  );
}

// =====================================================
// NOTIONAL
// =====================================================
//
// Use canonical multiplier from the execution rather
// than allowing the AI to infer contract sizing.
// =====================================================

function calculateNotional(
  price: number | null | undefined,
  quantity: number | null | undefined,
  multiplier: number | null | undefined
): number | null {

  if (
    price == null ||
    quantity == null ||
    multiplier == null
  ) {
    return null;
  }

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(quantity) ||
    !Number.isFinite(multiplier)
  ) {
    return null;
  }

  return (
    Math.abs(quantity) *
    price *
    multiplier
  );
}

// =====================================================
// DERIVED FACTS
// =====================================================

function buildDerivedFacts(
  trade: Trade,
  entryExecution: NormalizedExecution,
  exitExecution: NormalizedExecution
): TradeIntelligenceDerivedFacts {

  const holdDurationSeconds =
    calculateHoldDurationSeconds(
      trade.openedAt,
      trade.closedAt
    );

  const executionCount =
    Array.isArray(
      trade.executions
    )
      ? trade.executions.length
      : 0;

  // ---------------------------------------------------
  // Current canonical Trade reconstruction produces
  // exactly the matched entry + exit executions.
  //
  // Keep these values deterministic and explicit.
  // ---------------------------------------------------

  const entryExecutionCount =
    1;

  const exitExecutionCount =
    1;

  // ---------------------------------------------------
  // A quantity mismatch indicates that the matched
  // execution was only partially consumed by this
  // reconstructed Trade.
  //
  // This is an observation about the pairing, not a
  // new accounting calculation.
  // ---------------------------------------------------

  const partialEntry =
    Math.abs(
      Math.abs(
        entryExecution.quantity
      ) -
      Math.abs(
        trade.quantity
      )
    ) > 0.00000001;

  const partialExit =
    Math.abs(
      Math.abs(
        exitExecution.quantity
      ) -
      Math.abs(
        trade.quantity
      )
    ) > 0.00000001;

  return {
    holdDurationSeconds,

    holdingDays:
      trade.holdingDays ??
      null,

    realizedPnl:
      trade.pnl,

    grossPnl:
      Number(
        (
          trade.pnl +
          trade.fees
        ).toFixed(2)
      ),

    fees:
      trade.fees,

    pnlPercent:
      trade.pnlPercent ??
      null,

    entryNotional:
      calculateNotional(
        trade.entryPrice,
        trade.quantity,
        entryExecution.multiplier
      ),

    exitNotional:
      calculateNotional(
        trade.exitPrice,
        trade.quantity,
        exitExecution.multiplier
      ),

    executionCount,

    entryExecutionCount,

    exitExecutionCount,

    partialEntry,

    partialExit,
  };
}

// =====================================================
// REVIEW MAPPING
// =====================================================

function buildReviewEvidence(
  review: TradeReview | null
): TradeIntelligenceReview | null {

  if (!review) {
    return null;
  }

  return {
    id:
      review.id,

    entryExecutionId:
      review.entry_execution_id,

    exitExecutionId:
      review.exit_execution_id,

    tradeContext:
      review.trade_context,

    setup:
      review.setup,

    entryReason:
      review.entry_reason,

    exitReason:
      review.exit_reason,

    psychology:
      review.psychology,

    tradeManagement:
      review.trade_management,

    mistakes:
      Array.isArray(
        review.mistakes
      )
        ? [
            ...review.mistakes,
          ]
        : [],

    strengths:
      Array.isArray(
        review.strengths
      )
        ? [
            ...review.strengths,
          ]
        : [],

    reviewed:
      review.reviewed,
  };
}

// =====================================================
// MAIN BUILDER
// =====================================================

export function buildTradeIntelligenceInput(
  trade: Trade,
  review: TradeReview | null
): TradeIntelligenceInput {

  if (
    trade.isOpen
  ) {
    throw new Error(
      "Trade Intelligence currently requires a closed trade."
    );
  }

  if (
    !trade.executions ||
    trade.executions.length !== 2
  ) {
    throw new Error(
      "Trade Intelligence requires exactly one canonical entry execution and one canonical exit execution."
    );
  }

  const [
    entryExecution,
    exitExecution,
  ] =
    trade.executions;

  if (
    !entryExecution ||
    !exitExecution
  ) {
    throw new Error(
      "Canonical Trade execution pair is incomplete."
    );
  }

  if (
    entryExecution.id ===
    exitExecution.id
  ) {
    throw new Error(
      "Canonical Trade entry and exit executions must be different."
    );
  }

  if (
    review &&
    (
      review.entry_execution_id !==
        entryExecution.id ||
      review.exit_execution_id !==
        exitExecution.id
    )
  ) {
    throw new Error(
      "Trade Review does not match the canonical Trade execution pair."
    );
  }

  return {
    trade:
      buildTradeEvidence(
        trade
      ),

    derivedFacts:
      buildDerivedFacts(
        trade,
        entryExecution,
        exitExecution
      ),

    executions: {
      entry:
        buildExecutionEvidence(
          entryExecution
        ),

      exit:
        buildExecutionEvidence(
          exitExecution
        ),
    },

    review:
      buildReviewEvidence(
        review
      ),

    metadata: {
      intelligenceVersion:
        TRADE_INTELLIGENCE_VERSION,

      promptVersion:
        TRADE_INTELLIGENCE_PROMPT_VERSION,
    },
  };
}