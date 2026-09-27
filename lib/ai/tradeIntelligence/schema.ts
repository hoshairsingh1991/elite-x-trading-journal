import { z } from "zod";

// =====================================================
// ELITE X — TRADE INTELLIGENCE SCHEMA
// =====================================================
//
// Runtime validation contract for AI-generated
// Trade Intelligence.
//
// IMPORTANT
//
// This schema validates the AI response.
//
// It does NOT:
//
//   - calculate P&L
//   - modify canonical Trade data
//   - modify Trade Review
//   - modify executions
//   - modify pairTrades()
//   - perform persistence
//
// The AI must return structured data that conforms to
// this schema before it can reach the UI or persistence.
// =====================================================

// =====================================================
// INSIGHT CONFIDENCE
// =====================================================

export const intelligenceConfidenceSchema =
  z.enum([
    "high",
    "medium",
    "low",
  ]);

// =====================================================
// TRACEABLE INSIGHT
// =====================================================
//
// Every substantive insight must contain:
//   text
//   evidenceRefs
//   confidence
//
// evidenceRefs are internal references to the trusted
// Trade / Review input used by the AI.
// =====================================================

export const intelligenceInsightSchema =
  z.object({
    text:
      z
        .string()
        .trim()
        .min(1),

    evidenceRefs:
      z
        .array(
          z.string().trim().min(1)
        )
        .min(1),

    confidence:
      intelligenceConfidenceSchema,
  });

// =====================================================
// INTERNAL AI RESULT
// =====================================================
//
// This is the richer analytical structure.
//
// Nullable sections are intentionally nullable because
// the AI must be allowed to abstain when evidence is
// insufficient.
// =====================================================

export const tradeIntelligenceInternalSchema =
  z.object({
    tradeRead:
      intelligenceInsightSchema,

    whatStandsOut:
      intelligenceInsightSchema,

    executionRead:
      intelligenceInsightSchema,

    behavioralSignal:
      intelligenceInsightSchema
        .nullable(),

    strength:
      intelligenceInsightSchema
        .nullable(),

    weakness:
      intelligenceInsightSchema
        .nullable(),

    keyTakeaway:
      intelligenceInsightSchema,

    xFactor:
      intelligenceInsightSchema
        .nullable(),
  });

// =====================================================
// UI-SAFE RESULT
// =====================================================
//
// This is the simplified presentation contract.
//
// Evidence references and confidence metadata are kept
// internal and should not be exposed directly to the
// generated Intelligence UI in the initial version.
// =====================================================

export const tradeIntelligenceResultSchema =
  z.object({
    tradeRead:
      z
        .string()
        .trim()
        .min(1),

    whatStandsOut:
      z
        .string()
        .trim()
        .min(1),

    executionRead:
      z
        .string()
        .trim()
        .min(1),

    behavioralSignal:
      z
        .string()
        .trim()
        .min(1)
        .nullable(),

    strength:
      z
        .string()
        .trim()
        .min(1)
        .nullable(),

    weakness:
      z
        .string()
        .trim()
        .min(1)
        .nullable(),

    keyTakeaway:
      z
        .string()
        .trim()
        .min(1),

    xFactor:
      z
        .string()
        .trim()
        .min(1)
        .nullable(),
  });

// =====================================================
// TYPES DERIVED FROM SCHEMAS
// =====================================================

export type TradeIntelligenceInternalSchema =
  z.infer<
    typeof tradeIntelligenceInternalSchema
  >;

export type TradeIntelligenceResultSchema =
  z.infer<
    typeof tradeIntelligenceResultSchema
  >;