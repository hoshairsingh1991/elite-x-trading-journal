export interface DailyNote {
  date: string;
  note: string;
}

const STORAGE_KEY =
  "elite-x-daily-notes";

// =====================================================
// LOAD NOTES
// =====================================================

export function loadDailyNotes():
  DailyNote[] {

  if (
    typeof window ===
    "undefined"
  ) {

    return [];
  }

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {

      return [];
    }

    return JSON.parse(raw);

  } catch {

    return [];
  }
}

// =====================================================
// SAVE NOTES
// =====================================================

export function saveDailyNotes(
  notes: DailyNote[]
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );
}

// =====================================================
// GET NOTE
// =====================================================

export function getDailyNote(
  date: string
): string {

  const notes =
    loadDailyNotes();

  return (
    notes.find(
      (note) =>
        note.date === date
    )?.note || ""
  );
}

// =====================================================
// UPSERT NOTE
// =====================================================

export function upsertDailyNote(
  date: string,
  note: string
) {

  const notes =
    loadDailyNotes();

  const existingIndex =
    notes.findIndex(
      (item) =>
        item.date === date
    );

  // =========================================
  // REMOVE EMPTY NOTES
  // =========================================

  if (!note.trim()) {

    const filtered =
      notes.filter(
        (item) =>
          item.date !== date
      );

    saveDailyNotes(
      filtered
    );

    return;
  }

  // =========================================
  // UPDATE EXISTING
  // =========================================

  if (
    existingIndex >= 0
  ) {

    notes[
      existingIndex
    ].note = note;

    saveDailyNotes(
      notes
    );

    return;
  }

  // =========================================
  // CREATE NEW
  // =========================================

  notes.push({
    date,
    note,
  });

  saveDailyNotes(
    notes
  );
}