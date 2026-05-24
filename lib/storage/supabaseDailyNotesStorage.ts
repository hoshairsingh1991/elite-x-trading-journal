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

  const {
    data,
    error,
  } = await supabase
    .from("daily_notes")
    .select("*");

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

  const {
    data,
    error,
  } = await supabase
    .from("daily_notes")
    .select("note")
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

  // =========================================
  // DELETE EMPTY NOTES
  // =========================================

  if (!note.trim()) {

    await supabase
      .from("daily_notes")
      .delete()
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
        date,
        note,
      },
      {
        onConflict:
          "date",
      }
    );

  if (error) {

    console.error(
      "FAILED TO UPSERT DAILY NOTE:",
      error
    );
  }
}