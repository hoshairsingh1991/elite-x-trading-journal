import { supabase } from "@/lib/supabase";

import {
  NoteAttachment,
} from "@/types/note";

// =====================================================
// STORAGE BUCKET
// =====================================================

const STORAGE_BUCKET =
  "note-attachments";


// =====================================================
// UPLOAD NOTE ATTACHMENT
// =====================================================

export async function
uploadNoteAttachment(
  noteId: string,
  file: File
): Promise<NoteAttachment | null> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (
    authError ||
    !user
  ) {

    console.error(
      "FAILED TO GET AUTHENTICATED USER:",
      authError
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
  // GENERATE STORAGE PATH
  // ===================================================

  const attachmentId =
    crypto.randomUUID();

  const fileExtension =
    file.name.includes(".")
      ? file.name
          .split(".")
          .pop()
          ?.toLowerCase()
      : "";

  const storagePath =
    fileExtension
      ? `${user.id}/${noteId}/${attachmentId}.${fileExtension}`
      : `${user.id}/${noteId}/${attachmentId}`;


  // ===================================================
  // UPLOAD FILE
  // ===================================================

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        STORAGE_BUCKET
      )
      .upload(
        storagePath,
        file,
        {
          contentType:
            file.type || "application/octet-stream",

          upsert:
            false,
        }
      );


  if (uploadError) {

    console.error(
      "FAILED TO UPLOAD NOTE ATTACHMENT:",
      uploadError
    );

    return null;
  }


  // ===================================================
  // CREATE DATABASE ROW
  // ===================================================

  const {
    data,
    error: insertError,
  } =
    await supabase
      .from("note_attachments")
      .insert({

        id:
          attachmentId,

        note_id:
          noteId,

        file_name:
          file.name,

        storage_path:
          storagePath,

        mime_type:
          file.type,

        file_size:
          file.size,

        position_x:
          0,

        position_y:
          0,

        width:
          600,

        height:
          400,

      })
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
      .single();


  if (
    insertError ||
    !data
  ) {

    console.error(
      "FAILED TO CREATE NOTE ATTACHMENT RECORD:",
      insertError
    );

    // =================================================
    // CLEAN UP ORPHANED STORAGE FILE
    // =================================================

    await supabase.storage
      .from(
        STORAGE_BUCKET
      )
      .remove([
        storagePath,
      ]);

    return null;
  }


  // ===================================================
  // DATABASE → DOMAIN MAPPING
  // ===================================================

  const attachment: NoteAttachment = {

    id:
      data.id,

    noteId:
      data.note_id,

    fileName:
      data.file_name,

    storagePath:
      data.storage_path,

    mimeType:
      data.mime_type,

    fileSize:
      Number(
        data.file_size
      ),

    positionX:
      Number(
        data.position_x
      ),

    positionY:
      Number(
        data.position_y
      ),

    width:
      Number(
        data.width
      ),

    height:
      Number(
        data.height
      ),

    createdAt:
      data.created_at,

  };


  return attachment;
}

// =====================================================
// DELETE NOTE ATTACHMENT
// =====================================================

export async function
deleteNoteAttachment(
  attachment: NoteAttachment
): Promise<boolean> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (
    authError ||
    !user
  ) {

    console.error(
      "FAILED TO GET AUTHENTICATED USER:",
      authError
    );

    return false;
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
        attachment.noteId
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

    return false;
  }

  // ===================================================
  // DELETE STORAGE FILE
  // ===================================================

  const {
    error: storageError,
  } =
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([
        attachment.storagePath,
      ]);

  if (storageError) {

    console.error(
      "FAILED TO DELETE NOTE ATTACHMENT FROM STORAGE:",
      storageError
    );

    return false;
  }

  // ===================================================
  // DELETE DATABASE RECORD
  // ===================================================

  const {
    error: databaseError,
  } =
    await supabase
      .from("note_attachments")
      .delete()
      .eq(
        "id",
        attachment.id
      )
      .eq(
        "note_id",
        attachment.noteId
      );

  if (databaseError) {

    console.error(
      "FAILED TO DELETE NOTE ATTACHMENT RECORD:",
      databaseError
    );

    return false;
  }

  return true;
}

// =====================================================
// UPDATE NOTE ATTACHMENT LAYOUT
// =====================================================

export async function
updateNoteAttachmentLayout(
  attachment: NoteAttachment,
  layout: {
    positionX: number;
    positionY: number;
    width: number;
    height: number;
  }
): Promise<boolean> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  const user =
    authData.user;

  if (
    authError ||
    !user
  ) {

    console.error(
      "FAILED TO GET AUTHENTICATED USER:",
      authError
    );

    return false;
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
        attachment.noteId
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

    return false;
  }

  // ===================================================
  // UPDATE ATTACHMENT LAYOUT
  // ===================================================

  const {
    data,
    error: updateError,
  } =
    await supabase
      .from("note_attachments")
      .update({

        position_x:
          layout.positionX,

        position_y:
          layout.positionY,

        width:
          layout.width,

        height:
          layout.height,

      })
      .eq(
        "id",
        attachment.id
      )
      .eq(
        "note_id",
        attachment.noteId
      )
      .select(`
        id,
        position_x,
        position_y,
        width,
        height
      `)
      .maybeSingle();

  if (updateError) {

    console.error(
      "FAILED TO UPDATE NOTE ATTACHMENT LAYOUT:",
      updateError
    );

    return false;
  }

  if (!data) {

    console.error(
      "NOTE ATTACHMENT LAYOUT UPDATE AFFECTED ZERO ROWS:",
      {
        attachmentId:
          attachment.id,

        noteId:
          attachment.noteId,

        requestedLayout:
          layout,
      }
    );

    return false;
  }

  console.log(
    "NOTE ATTACHMENT LAYOUT SAVED:",
    data
  );

  return true;
}