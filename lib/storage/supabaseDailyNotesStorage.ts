import { supabase } from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

export interface DailyNote {

  date: string;

  note: string;
}

// =====================================================
// LOAD DAILY NOTES
// =====================================================

export async function
loadDailyNotesFromSupabase():
Promise<DailyNote[]> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("daily_notes")
    .select("*")
    .eq(
      "user_id",
      user.id
    );

  if (error) {

    console.error(
      "FAILED TO LOAD DAILY NOTES:",
      error
    );

    return [];
  }

  return (
    data || []
  );
}

// =====================================================
// GET DAILY NOTE
// =====================================================

export async function
getDailyNoteFromSupabase(
  date: string
): Promise<string> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return "";
  }

  const {
    data,
    error,
  } = await supabase
    .from("daily_notes")
    .select("note")
    .eq(
      "user_id",
      user.id
    )
    .eq(
      "date",
      date
    )
    .maybeSingle();

  if (error) {

    return "";
  }

  return (
    data?.note || ""
  );
}

// =====================================================
// UPSERT DAILY NOTE
// =====================================================

export async function
upsertDailyNoteInSupabase(
  date: string,
  note: string
): Promise<void> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return;
  }

  // =========================================
  // DELETE EMPTY NOTES
  // =========================================

  if (!note.trim()) {

    await supabase
      .from("daily_notes")
      .delete()
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "date",
        date
      );

    return;
  }

  // =========================================
  // UPSERT NOTE
  // =========================================

  const {
    error,
  } = await supabase
    .from("daily_notes")
    .upsert(
      {
        user_id:
          user.id,

        date,

        note,
      },
      {
        onConflict:
          "user_id,date",
      }
    );

  if (error) {

    console.error(
      "FAILED TO UPSERT DAILY NOTE:",
      error
    );
  }
}