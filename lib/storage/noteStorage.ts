import { Note } from "@/types/note";

// =====================================================
// STORAGE KEY
// =====================================================

const STORAGE_KEY =
  "elite-x-notes";

// =====================================================
// LOAD NOTES
// =====================================================

export function loadNotes(): Note[] {

  if (
    typeof window ===
    "undefined"
  ) {

    return [];
  }

  try {

    const storedNotes =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedNotes) {

      return [];
    }

    const parsedNotes =
      JSON.parse(
        storedNotes
      );

    if (
      !Array.isArray(
        parsedNotes
      )
    ) {

      return [];
    }

    return parsedNotes;

  } catch (error) {

    console.error(
      "FAILED TO LOAD NOTES:",
      error
    );

    return [];
  }
}

// =====================================================
// SAVE NOTES
// =====================================================

export function saveNotes(
  notes: Note[]
): void {

  if (
    typeof window ===
    "undefined"
  ) {

    return;
  }

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notes)
    );

  } catch (error) {

    console.error(
      "FAILED TO SAVE NOTES:",
      error
    );
  }
}

// =====================================================
// CREATE NOTE
// =====================================================

export function createNote(): Note {

const newNote: Note = {

  id:
    crypto.randomUUID(),

  title:
    "Untitled Note",

  content: "",

  createdAt:
    new Date().toISOString(),

  updatedAt:
    new Date().toISOString(),

  tradeLinks:
    [],

  attachments:
    [],
};

  const existingNotes =
    loadNotes();

  const updatedNotes = [
    newNote,
    ...existingNotes,
  ];

  saveNotes(
    updatedNotes
  );

  return newNote;
}

// =====================================================
// UPDATE NOTE
// =====================================================

export function updateNote(
  updatedNote: Note
): Note[] {

  const existingNotes =
    loadNotes();

  const updatedNotes =
    existingNotes.map(
      (note) => {

        if (
          note.id ===
          updatedNote.id
        ) {

          return {

            ...updatedNote,

            updatedAt:
              new Date().toISOString(),
          };
        }

        return note;
      }
    );

  saveNotes(
    updatedNotes
  );

  return updatedNotes;
}

// =====================================================
// DELETE NOTE
// =====================================================

export function deleteNote(
  noteId: string
): Note[] {

  const existingNotes =
    loadNotes();

  const updatedNotes =
    existingNotes.filter(
      (note) =>
        note.id !== noteId
    );

  saveNotes(
    updatedNotes
  );

  return updatedNotes;
}