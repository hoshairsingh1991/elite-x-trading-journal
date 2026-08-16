import { supabase } from "@/lib/supabase";

import {
  Note,
  NoteTradeLink,
  NoteAttachment,
} from "@/types/note";


// =====================================================
// DATABASE ROW TYPE
// =====================================================

type NoteRow = {
  id: string;

  title: string;
  is_title_custom: boolean;

  content: string;

  created_at: string;
  updated_at: string;

  user_id: string;
};


// =====================================================
// NOTE TRADE LINK ROW
// =====================================================

type NoteTradeLinkRow = {
  note_id: string;
  trade_id: string;

  created_at: string;
};


// =====================================================
// NOTE ATTACHMENT ROW
// =====================================================

type NoteAttachmentRow = {
  id: string;

  note_id: string;

  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;

  position_x: number;
  position_y: number;

  width: number;
  height: number;

  created_at: string;
};

// =====================================================
// DATABASE → DOMAIN MAPPING
// =====================================================

function mapNoteRowToNote(
  row: NoteRow,
  tradeLinks: NoteTradeLink[],
  attachments: NoteAttachment[] = []
): Note {

return {

  id:
    row.id,

  title:
    row.title,

  isTitleCustom:
    row.is_title_custom,

  content:
    row.content,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    tradeLinks,

attachments,
  };
}


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
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return [];
  }


  // ===================================================
  // LOAD NOTES
  // ===================================================

  const {
    data: noteData,
    error: noteError,
  } =
    await supabase
      .from("notes")
.select(`
  id,
  title,
  is_title_custom,
  content,
  created_at,
  updated_at,
  user_id
`)
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


  if (noteError) {

    console.error(
      "FAILED TO LOAD NOTES FROM SUPABASE:",
      noteError
    );

    return [];
  }


  const notes =
    (noteData as NoteRow[] | null) ?? [];


  if (notes.length === 0) {

    return [];
  }


  // ===================================================
  // LOAD TRADE LINKS
  // ===================================================

  const noteIds =
    notes.map(
      (note) =>
        note.id
    );


  const {
    data: linkData,
    error: linkError,
  } =
    await supabase
      .from("note_trades")
      .select(`
        note_id,
        trade_id,
        created_at
      `)
      .in(
        "note_id",
        noteIds
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (linkError) {

    console.error(
      "FAILED TO LOAD NOTE TRADE LINKS:",
      linkError
    );

    return notes.map(
      (note) =>
        mapNoteRowToNote(
          note,
          []
        )
    );
  }


  const links =
    (linkData as NoteTradeLinkRow[] | null) ?? [];


  // ===================================================
  // GROUP LINKS BY NOTE
  // ===================================================

  const linksByNote =
    new Map<
      string,
      NoteTradeLink[]
    >();


  for (
    const link of links
  ) {

    const existing =
      linksByNote.get(
        link.note_id
      ) ?? [];


    existing.push({

      id:
        `${link.note_id}:${link.trade_id}`,

      noteId:
        link.note_id,

      tradeId:
        link.trade_id,

      createdAt:
        link.created_at,

    });


    linksByNote.set(
      link.note_id,
      existing
    );
  }

  // ===================================================
  // LOAD ATTACHMENTS
  // ===================================================

const {
  data: attachmentData,
  error: attachmentError,
} =
  await supabase
    .from("note_attachments")
    .select(`
      id,
      note_id,
      file_name,
      storage_path,
      mime_type,
      file_size,
      position_x,
      position_y,
      width,
      height,
      created_at
    `)
    .in(
      "note_id",
      noteIds
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );


  if (attachmentError) {

    console.error(
      "FAILED TO LOAD NOTE ATTACHMENTS:",
      attachmentError
    );

    return notes.map(
      (note) =>
        mapNoteRowToNote(
          note,
          linksByNote.get(
            note.id
          ) ?? [],
          []
        )
    );
  }


  const attachments =
    (attachmentData as NoteAttachmentRow[] | null) ?? [];

      // ===================================================
  // GROUP ATTACHMENTS BY NOTE
  // ===================================================

  const attachmentsByNote =
    new Map<
      string,
      NoteAttachment[]
    >();


  for (
    const attachment of attachments
  ) {

    const existing =
      attachmentsByNote.get(
        attachment.note_id
      ) ?? [];


existing.push({

  id:
    attachment.id,

  noteId:
    attachment.note_id,

  fileName:
    attachment.file_name,

  storagePath:
    attachment.storage_path,

  mimeType:
    attachment.mime_type,

  fileSize:
    attachment.file_size,

  positionX:
    attachment.position_x,

  positionY:
    attachment.position_y,

  width:
    attachment.width,

  height:
    attachment.height,

  createdAt:
    attachment.created_at,

});


    attachmentsByNote.set(
      attachment.note_id,
      existing
    );
  }
  

  // ===================================================
  // BUILD DOMAIN NOTES
  // ===================================================

  return notes.map(
    (note) =>
      mapNoteRowToNote(
        note,
        linksByNote.get(
          note.id
        ) ?? [],
        attachmentsByNote.get(
          note.id
        ) ?? []
      )
  );
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
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return null;
  }


  // ===================================================
  // TIMESTAMP
  // ===================================================

  const now =
    new Date().toISOString();


  // ===================================================
  // NEW NOTE
  // ===================================================

const newNote: Note = {

  id:
    crypto.randomUUID(),

  title:
    "Trading Note",

  isTitleCustom:
    false,

  content:
    "",
    createdAt:
      now,

    updatedAt:
      now,

    tradeLinks:
      [],

    attachments:
      [],
  };


  // ===================================================
  // INSERT NOTE
  // ===================================================

  const {
    error,
  } =
    await supabase
      .from("notes")
.insert({

  id:
    newNote.id,

  title:
    newNote.title,

  is_title_custom:
    newNote.isTitleCustom,

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
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return;
  }


  // ===================================================
  // UPDATE NOTE
  // ===================================================

  const {
    error,
  } =
    await supabase
      .from("notes")
.update({

  title:
    note.title,

  is_title_custom:
    note.isTitleCustom,

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
// ADD TRADE TO NOTE
// =====================================================

export async function
addTradeToNoteInSupabase(
  noteId: string,
  tradeId: string
): Promise<NoteTradeLink | null> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return null;
  }


  // ===================================================
  // VERIFY NOTE OWNERSHIP
  // ===================================================

  const {
    data: note,
    error: noteError,
  } =
    await supabase
      .from("notes")
      .select("id")
      .eq(
        "id",
        noteId
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();


  if (
    noteError ||
    !note
  ) {

    console.error(
      "FAILED TO VERIFY NOTE OWNERSHIP:",
      noteError
    );

    return null;
  }


  // ===================================================
  // INSERT TRADE LINK
  // ===================================================

  const {
    data,
    error,
  } =
    await supabase
      .from("note_trades")
      .insert({

        note_id:
          noteId,

        trade_id:
          tradeId,

      })
      .select(`
        note_id,
        trade_id,
        created_at
      `)
      .single();


  if (error) {

    console.error(
      "FAILED TO ADD TRADE TO NOTE:",
      error
    );

    return null;
  }


  const row =
    data as NoteTradeLinkRow;


  return {

    id:
      `${row.note_id}:${row.trade_id}`,

    noteId:
      row.note_id,

    tradeId:
      row.trade_id,

    createdAt:
      row.created_at,

  };
}


// =====================================================
// REMOVE TRADE FROM NOTE
// =====================================================

export async function
removeTradeFromNoteInSupabase(
  noteId: string,
  tradeId: string
): Promise<void> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return;
  }


  // ===================================================
  // VERIFY NOTE OWNERSHIP
  // ===================================================

  const {
    data: note,
    error: noteError,
  } =
    await supabase
      .from("notes")
      .select("id")
      .eq(
        "id",
        noteId
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();


  if (
    noteError ||
    !note
  ) {

    console.error(
      "FAILED TO VERIFY NOTE OWNERSHIP:",
      noteError
    );

    return;
  }


  // ===================================================
  // DELETE TRADE LINK
  // ===================================================

  const {
    error,
  } =
    await supabase
      .from("note_trades")
      .delete()
      .eq(
        "note_id",
        noteId
      )
      .eq(
        "trade_id",
        tradeId
      );


  if (error) {

    console.error(
      "FAILED TO REMOVE TRADE FROM NOTE:",
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
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return;
  }


  // ===================================================
  // DELETE NOTE
  // ===================================================

  const {
    error,
  } =
    await supabase
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