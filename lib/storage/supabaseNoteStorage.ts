import { supabase } from "@/lib/supabase";

import { Note } from "@/types/note";

// =====================================================
// LOAD NOTES FROM SUPABASE
// =====================================================

export async function
loadNotesFromSupabase():
Promise<Note[]> {

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

  // ===================================================
  // LOAD USER NOTES
  // ===================================================

  const {
    data,
    error,
  } = await supabase
    .from("notes")
    .select("*")
    .eq(
      "user_id",
      user.id
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  if (error) {

    console.error(
      "FAILED TO LOAD NOTES FROM SUPABASE:",
      error
    );

    return [];
  }

  const formattedNotes =
    (data || []).map(
      (note: any) => ({

        id:
          note.id,

        title:
          note.title,

        content:
          note.content,

        createdAt:
          note.created_at,

        updatedAt:
          note.updated_at,
      })
    );

  return formattedNotes;
}

// =====================================================
// CREATE NOTE
// =====================================================

export async function
createNoteInSupabase():
Promise<Note | null> {

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

    return null;
  }

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
  };

  const {
    error,
  } = await supabase
    .from("notes")
    .insert({

      id:
        newNote.id,

      title:
        newNote.title,

      content:
        newNote.content,

      created_at:
        newNote.createdAt,

      updated_at:
        newNote.updatedAt,

      user_id:
        user.id,
    });

  if (error) {

    console.error(
      "FAILED TO CREATE NOTE:",
      error
    );

    return null;
  }

  return newNote;
}

// =====================================================
// UPDATE NOTE
// =====================================================

export async function
updateNoteInSupabase(
  note: Note
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

  const {
    error,
  } = await supabase
    .from("notes")
    .update({

      title:
        note.title,

      content:
        note.content,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      note.id
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {

    console.error(
      "FAILED TO UPDATE NOTE:",
      error
    );
  }
}

// =====================================================
// DELETE NOTE
// =====================================================

export async function
deleteNoteFromSupabase(
  noteId: string
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

  const {
    error,
  } = await supabase
    .from("notes")
    .delete()
    .eq(
      "id",
      noteId
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {

    console.error(
      "FAILED TO DELETE NOTE:",
      error
    );
  }
}