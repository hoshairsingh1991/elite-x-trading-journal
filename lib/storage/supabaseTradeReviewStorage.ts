import { supabase } from "@/lib/supabase";

// =====================================================
// TRADE REVIEW TYPES
// =====================================================

export interface TradeReview {

  id: string;

  user_id: string;

  entry_execution_id: string;

  exit_execution_id: string;

  trade_context: string | null;

  setup: string | null;

  entry_reason: string | null;

  exit_reason: string | null;

  psychology: string | null;

  mistakes: string[];

  strengths: string[];

  reviewed: boolean;

  reviewed_at: string | null;

  created_at: string;

  updated_at: string;
}

// =====================================================
// SAVE INPUT
// =====================================================

export interface SaveTradeReviewInput {

  entryExecutionId: string;

  exitExecutionId: string;

  tradeContext: string | null;

  setup: string | null;

  entryReason: string | null;

  exitReason: string | null;

  psychology: string | null;

  mistakes: string[];

  strengths: string[];

}

// =====================================================
// LOAD REVIEW
// =====================================================
//
// Returns:
//   TradeReview → saved review exists
//   null       → no review exists yet
//
// IMPORTANT:
// This function does NOT use Trade.id.
//
// Review identity is based on the exact canonical
// entry + exit execution pair.
// =====================================================

export async function loadTradeReview(
  entryExecutionId: string,
  exitExecutionId: string
): Promise<TradeReview | null> {

  if (
    !entryExecutionId.trim() ||
    !exitExecutionId.trim()
  ) {

    throw new Error(
      "Trade review requires both entry and exit execution IDs."
    );
  }

  if (
    entryExecutionId === exitExecutionId
  ) {

    throw new Error(
      "Trade review entry and exit execution IDs must be different."
    );
  }

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    throw new Error(
      "No authenticated user found."
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
        user.id
      )
      .eq(
        "entry_execution_id",
        entryExecutionId
      )
      .eq(
        "exit_execution_id",
        exitExecutionId
      )
      .maybeSingle();

  if (error) {

    console.error(
      "FAILED TO LOAD TRADE REVIEW:",
      error
    );

    throw error;
  }

  return data as TradeReview | null;
}

// =====================================================
// DELETE REVIEW
// =====================================================
//
// Deleting a Review means the trade is no longer
// considered reviewed.
//
// This is used when the user clears every Review
// field and explicitly saves the empty state.
//
// IMPORTANT:
// This only removes Review metadata.
// It never modifies canonical Trade / Execution data.
// =====================================================

export async function deleteTradeReview(
  entryExecutionId: string,
  exitExecutionId: string
): Promise<void> {

  if (
    !entryExecutionId.trim() ||
    !exitExecutionId.trim()
  ) {

    throw new Error(
      "Trade review requires both entry and exit execution IDs."
    );
  }

  if (
    entryExecutionId ===
    exitExecutionId
  ) {

    throw new Error(
      "Trade review entry and exit execution IDs must be different."
    );
  }

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    throw new Error(
      "No authenticated user found."
    );
  }

  const {
    error,
  } =
    await supabase
      .from("trade_reviews")
      .delete()
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "entry_execution_id",
        entryExecutionId
      )
      .eq(
        "exit_execution_id",
        exitExecutionId
      );

  if (error) {

    console.error(
      "FAILED TO DELETE TRADE REVIEW:",
      error
    );

    throw error;
  }
}

// =====================================================
// SAVE REVIEW
// =====================================================
//
// First save:
//   INSERT
//
// Subsequent saves:
//   UPDATE
//
// Uniqueness is enforced by:
// user_id + entry_execution_id + exit_execution_id
//
// IMPORTANT:
// This function only saves Review metadata.
// It never modifies canonical Trade / Execution data.
// =====================================================

export async function saveTradeReview(
  input: SaveTradeReviewInput
): Promise<TradeReview> {

  if (
    !input.entryExecutionId.trim() ||
    !input.exitExecutionId.trim()
  ) {

    throw new Error(
      "Trade review requires both entry and exit execution IDs."
    );
  }

  if (
    input.entryExecutionId ===
    input.exitExecutionId
  ) {

    throw new Error(
      "Trade review entry and exit execution IDs must be different."
    );
  }

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    throw new Error(
      "No authenticated user found."
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("trade_reviews")
      .upsert(
        {
          user_id:
            user.id,

          entry_execution_id:
            input.entryExecutionId,

          exit_execution_id:
            input.exitExecutionId,

          trade_context:
            input.tradeContext ?? null,

          setup:
            input.setup ?? null,

          entry_reason:
            input.entryReason ?? null,

          exit_reason:
            input.exitReason ?? null,

          psychology:
            input.psychology ?? null,

          mistakes:
            input.mistakes ?? [],

          strengths:
            input.strengths ?? [],

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,entry_execution_id,exit_execution_id",
        }
      )
      .select()
      .single();

  if (error) {

    console.error(
      "FAILED TO SAVE TRADE REVIEW:",
      error
    );

    throw error;
  }

  return data as TradeReview;
}

// =====================================================
// UPDATE REVIEWED STATUS
// =====================================================
//
// This is intentionally separate from saving the
// structured review answers.
//
// reviewed = true
//   → reviewed_at is set
//
// reviewed = false
//   → reviewed_at is cleared
//
// =====================================================

export async function updateTradeReviewStatus(
  entryExecutionId: string,
  exitExecutionId: string,
  reviewed: boolean
): Promise<TradeReview> {

  if (
    !entryExecutionId.trim() ||
    !exitExecutionId.trim()
  ) {

    throw new Error(
      "Trade review requires both entry and exit execution IDs."
    );
  }

  if (
    entryExecutionId === exitExecutionId
  ) {

    throw new Error(
      "Trade review entry and exit execution IDs must be different."
    );
  }

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    throw new Error(
      "No authenticated user found."
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("trade_reviews")
      .update(
        {
          reviewed,

          reviewed_at:
            reviewed
              ? new Date().toISOString()
              : null,

          updated_at:
            new Date().toISOString(),
        }
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "entry_execution_id",
        entryExecutionId
      )
      .eq(
        "exit_execution_id",
        exitExecutionId
      )
      .select()
      .single();

  if (error) {

    console.error(
      "FAILED TO UPDATE TRADE REVIEW STATUS:",
      error
    );

    throw error;
  }

  return data as TradeReview;
}

// =====================================================
// TRADE REVIEW IDENTITY
// =====================================================
//
// A closed Trade is identified by its exact canonical
// entry + exit execution pair.
//
// Trade.id is intentionally NOT used here.
//
// =====================================================

export function getTradeReviewKey(
  entryExecutionId: string,
  exitExecutionId: string
): string {

  return `${entryExecutionId}::${exitExecutionId}`;
}

// =====================================================
// LOAD REVIEW KEYS FOR A TRADE SET
// =====================================================
//
// Returns only the exact closed-trade review keys that
// already exist for the authenticated user.
//
// The query uses IN filters for both execution IDs.
// That produces a bounded candidate set. We then
// validate the exact entry/exit pair in memory.
//
// =====================================================

export async function loadTradeReviewKeys(
  pairs: {
    entryExecutionId: string;
    exitExecutionId: string;
  }[]
): Promise<Set<string>> {

  if (pairs.length === 0) {
    return new Set();
  }

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    throw new Error(
      "No authenticated user found."
    );
  }

  const validPairs =
    new Set(
      pairs.map(
        (pair) =>
          getTradeReviewKey(
            pair.entryExecutionId,
            pair.exitExecutionId
          )
      )
    );

  const entryExecutionIds =
    Array.from(
      new Set(
        pairs.map(
          (pair) =>
            pair.entryExecutionId
        )
      )
    );

  const exitExecutionIds =
    Array.from(
      new Set(
        pairs.map(
          (pair) =>
            pair.exitExecutionId
        )
      )
    );

  const {
    data,
    error,
  } =
    await supabase
      .from("trade_reviews")
      .select(
        "entry_execution_id,exit_execution_id"
      )
      .eq(
        "user_id",
        user.id
      )
      .in(
        "entry_execution_id",
        entryExecutionIds
      )
      .in(
        "exit_execution_id",
        exitExecutionIds
      );

  if (error) {

    console.error(
      "FAILED TO LOAD TRADE REVIEW KEYS:",
      error
    );

    throw error;
  }

  const reviewedKeys =
    new Set<string>();

  for (
    const row of data ?? []
  ) {

    const key =
      getTradeReviewKey(
        row.entry_execution_id,
        row.exit_execution_id
      );

    if (
      validPairs.has(key)
    ) {

      reviewedKeys.add(
        key
      );
    }
  }

  return reviewedKeys;
}