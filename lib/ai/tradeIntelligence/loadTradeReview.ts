// =====================================================
// ELITE X — TRADE INTELLIGENCE REVIEW LOADER
// =====================================================
//
// Server-side loader for the exact Trade Review associated
// with a canonical entry + exit execution pair.
//
// This does NOT use Trade.id.
//
// Review identity:
//
//   user_id
//   +
//   entry_execution_id
//   +
//   exit_execution_id
//
// =====================================================

import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import type {
  TradeReview,
} from "@/lib/storage/supabaseTradeReviewStorage";

// =====================================================
// LOAD EXACT TRADE REVIEW
// =====================================================

export async function loadTradeIntelligenceReview(
  supabase: SupabaseClient,
  userId: string,
  entryExecutionId: string,
  exitExecutionId: string
): Promise<TradeReview | null> {

  const normalizedUserId =
    userId.trim();

  const normalizedEntryId =
    entryExecutionId.trim();

  const normalizedExitId =
    exitExecutionId.trim();

  if (!normalizedUserId) {
    throw new Error(
      "Authenticated user ID is required."
    );
  }

  if (
    !normalizedEntryId ||
    !normalizedExitId
  ) {
    throw new Error(
      "Both entry and exit execution IDs are required."
    );
  }

  if (
    normalizedEntryId ===
    normalizedExitId
  ) {
    throw new Error(
      "Entry and exit execution IDs must be different."
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("trade_reviews")
      .select("*")
      .eq(
        "user_id",
        normalizedUserId
      )
      .eq(
        "entry_execution_id",
        normalizedEntryId
      )
      .eq(
        "exit_execution_id",
        normalizedExitId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load trade review: ${error.message}`
    );
  }

  return data as TradeReview | null;
}