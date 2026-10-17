
import { supabase } from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

export interface DailyNote {
  id: string;
  date: string;
  title: string;
  note: string;
  updated_at: string;
}

// =====================================================
// AUTHENTICATED USER
// =====================================================

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    console.error(
      "FAILED TO GET AUTHENTICATED USER:",
      error ?? "No authenticated user found",
    );

    return null;
  }

  return data.user.id;
}

// =====================================================
// LOAD ALL DAILY NOTES
// =====================================================

export async function loadDailyNotesFromSupabase(): Promise<DailyNote[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("daily_notes")
    .select("id, date, title, note, updated_at")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("FAILED TO LOAD DAILY NOTES:", error);
    return [];
  }

  return data ?? [];
}

// =====================================================
// CREATE A NEW NOTE
// =====================================================

export async function createDailyNoteInSupabase(
  date: string,
  title: string,
  note: string,
): Promise<DailyNote | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("daily_notes")
    .insert({
      user_id: userId,
      date,
      title,
      note,
    })
    .select("id, date, title, note, updated_at")
    .single();

  if (error) {
    console.error("FAILED TO CREATE DAILY NOTE:", error);
    return null;
  }

  return data;
}

// =====================================================
// UPDATE AN EXISTING NOTE BY ID
// =====================================================

export async function updateDailyNoteInSupabase(
  id: string,
  date: string,
  title: string,
  note: string,
): Promise<DailyNote | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("daily_notes")
    .update({
      date,
      title,
      note,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, date, title, note, updated_at")
    .maybeSingle();

  if (error) {
    console.error("FAILED TO UPDATE DAILY NOTE:", error);
    return null;
  }

  if (!data) {
    console.error("DAILY NOTE NOT FOUND:", id);
    return null;
  }

  return data;
}

// =====================================================
// DELETE ONE NOTE BY ID
// =====================================================

export async function deleteDailyNoteFromSupabase(
  id: string,
): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("daily_notes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("FAILED TO DELETE DAILY NOTE:", error);
    return false;
  }

  if (!data) {
    console.error("DAILY NOTE NOT FOUND FOR DELETION:", id);
    return false;
  }

  return true;
}
