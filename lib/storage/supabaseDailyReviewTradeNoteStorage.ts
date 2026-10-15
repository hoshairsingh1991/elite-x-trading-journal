
import { supabase } from "@/lib/supabase";

import {
  DailyReviewTradeNote,
} from "@/types/dailyReviewTradeNote";

// =====================================================
// DATABASE ROW TYPE
// =====================================================

type DailyReviewTradeNoteRow = {
  id: string;
  user_id: string;
  trade_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

// =====================================================
// DATABASE → DOMAIN MAPPING
// =====================================================

function mapRowToDailyReviewTradeNote(
  row: DailyReviewTradeNoteRow
): DailyReviewTradeNote {
  return {
    id: row.id,
    userId: row.user_id,
    tradeId: row.trade_id,
    title: row.title || "Trade note",
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =====================================================
// LOAD NOTES FOR A TRADE
// =====================================================

export async function loadDailyReviewTradeNotes(
  tradeId: string
): Promise<DailyReviewTradeNote[]> {
  if (!tradeId.trim()) {
    return [];
  }

  const { data: authData } =
    await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return [];
  }

  const { data, error } = await supabase
    .from("daily_review_trade_notes")
    .select(`
      id,
      user_id,
      trade_id,
      title,
      content,
      created_at,
      updated_at
    `)
    .eq("user_id", user.id)
    .eq("trade_id", tradeId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "FAILED TO LOAD DAILY REVIEW TRADE NOTES:",
      error.message
    );

    return [];
  }

  const rows =
    (data as DailyReviewTradeNoteRow[] | null) ?? [];

  return rows.map(mapRowToDailyReviewTradeNote);
}

// =====================================================
// CREATE TRADE NOTE
// =====================================================

export async function createDailyReviewTradeNote(
  tradeId: string,
  title: string,
  content: string
): Promise<DailyReviewTradeNote | null> {
  if (!tradeId.trim()) {
    return null;
  }

  if (!title.trim() && !content.trim()) {
    return null;
  }

  const { data: authData } =
    await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return null;
  }

  const { data, error } = await supabase
    .from("daily_review_trade_notes")
    .insert({
      user_id: user.id,
      trade_id: tradeId,
      title: title.trim() || "Trade note",
      content,
    })
    .select(`
      id,
      user_id,
      trade_id,
      title,
      content,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error(
      "FAILED TO CREATE DAILY REVIEW TRADE NOTE:",
      error
    );

    return null;
  }

  return mapRowToDailyReviewTradeNote(
    data as DailyReviewTradeNoteRow
  );
}

// =====================================================
// UPDATE TRADE NOTE
// =====================================================

export async function updateDailyReviewTradeNote(
  noteId: string,
  title: string,
  content: string
): Promise<DailyReviewTradeNote | null> {
  if (!noteId.trim()) {
    return null;
  }

  if (!title.trim() && !content.trim()) {
    return null;
  }

  const { data: authData } =
    await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return null;
  }

  const { data, error } = await supabase
    .from("daily_review_trade_notes")
    .update({
      title: title.trim() || "Trade note",
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select(`
      id,
      user_id,
      trade_id,
      title,
      content,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error(
      "FAILED TO UPDATE DAILY REVIEW TRADE NOTE:",
      error
    );

    return null;
  }

  return mapRowToDailyReviewTradeNote(
    data as DailyReviewTradeNoteRow
  );
}

// =====================================================
// DELETE TRADE NOTE
// =====================================================

export async function deleteDailyReviewTradeNote(
  noteId: string
): Promise<boolean> {
  if (!noteId.trim()) {
    return false;
  }

  const { data: authData } =
    await supabase.auth.getUser();

  const user = authData.user;

  if (!user) {
    console.error("NO AUTHENTICATED USER FOUND");
    return false;
  }

  const { error } = await supabase
    .from("daily_review_trade_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "FAILED TO DELETE DAILY REVIEW TRADE NOTE:",
      error
    );

    return false;
  }

  return true;
}
