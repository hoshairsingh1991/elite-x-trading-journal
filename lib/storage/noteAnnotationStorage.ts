import { supabase } from "@/lib/supabase";

import {
  NoteAnnotation,
} from "@/types/note";

// =====================================================
// DATABASE ROW TYPE
// =====================================================

type NoteAnnotationRow = {
  id: string;

  attachment_id: string;

  type: string;

  position_x: number;
  position_y: number;

  width: number;
  height: number;

  rotation: number;

  color: string;

  stroke_width: number;

  points: Array<{
    x: number;
    y: number;
  }> | null;

  text: string | null;

  font_size: number | null;
  font_weight: string | null;
  font_style: string | null;
  text_decoration: string | null;
  text_align: string | null;

  created_at: string;
  updated_at: string;
};


// =====================================================
// DATABASE → DOMAIN MAPPING
// =====================================================

function mapAnnotationRowToAnnotation(
  row: NoteAnnotationRow
): NoteAnnotation {

  return {

    id:
      row.id,

    attachmentId:
      row.attachment_id,

    type:
      row.type,

    positionX:
      row.position_x,

    positionY:
      row.position_y,

    width:
      row.width,

    height:
      row.height,

    rotation:
      row.rotation,

    color:
      row.color,

    strokeWidth:
      row.stroke_width,

    points:
      row.points,

    text:
      row.text,

    fontSize:
      row.font_size,

    fontWeight:
      row.font_weight,

    fontStyle:
      row.font_style,

    textDecoration:
      row.text_decoration,

    textAlign:
      row.text_align,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

  };
}


// =====================================================
// VERIFY ATTACHMENT OWNERSHIP
// =====================================================

async function verifyAttachmentOwnership(
  attachmentId: string
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
  // VERIFY ATTACHMENT → NOTE → USER
  // ===================================================

  const {
    data: attachment,
    error: attachmentError,
  } =
    await supabase
      .from("note_attachments")
      .select(`
        id,
        notes!inner (
          id,
          user_id
        )
      `)
      .eq(
        "id",
        attachmentId
      )
      .eq(
        "notes.user_id",
        user.id
      )
      .maybeSingle();

  if (
    attachmentError ||
    !attachment
  ) {

    console.error(
      "FAILED TO VERIFY NOTE ATTACHMENT OWNERSHIP:",
      attachmentError
    );

    return false;
  }

  return true;
}


// =====================================================
// CREATE ANNOTATION
// =====================================================

export async function
createNoteAnnotation(
  annotation: Omit<
    NoteAnnotation,
    "id" |
    "createdAt" |
    "updatedAt"
  >
): Promise<NoteAnnotation | null> {

  // ===================================================
  // VERIFY OWNERSHIP
  // ===================================================

  const ownsAttachment =
    await verifyAttachmentOwnership(
      annotation.attachmentId
    );

  if (!ownsAttachment) {

    return null;
  }

  // ===================================================
  // CREATE DATABASE ROW
  // ===================================================

  const {
    data,
    error,
  } =
    await supabase
      .from("note_annotations")
      .insert({

        attachment_id:
          annotation.attachmentId,

        type:
          annotation.type,

        position_x:
          annotation.positionX,

        position_y:
          annotation.positionY,

        width:
          annotation.width,

        height:
          annotation.height,

        rotation:
          annotation.rotation,

        color:
          annotation.color,

        stroke_width:
          annotation.strokeWidth,

        points:
          annotation.points,

        text:
          annotation.text,

        font_size:
          annotation.fontSize,

        font_weight:
          annotation.fontWeight,

        font_style:
          annotation.fontStyle,

        text_decoration:
          annotation.textDecoration,

        text_align:
          annotation.textAlign,

      })
      .select(`
        id,
        attachment_id,
        type,
        position_x,
        position_y,
        width,
        height,
        rotation,
        color,
        stroke_width,
        points,
        text,
        font_size,
        font_weight,
        font_style,
        text_decoration,
        text_align,
        created_at,
        updated_at
      `)
      .single();

  if (error) {

    console.error(
      "FAILED TO CREATE NOTE ANNOTATION:",
      error
    );

    return null;
  }

  return mapAnnotationRowToAnnotation(
    data as NoteAnnotationRow
  );
}


// =====================================================
// UPDATE ANNOTATION
// =====================================================

export async function
updateNoteAnnotation(
  annotation: NoteAnnotation
): Promise<NoteAnnotation | null> {

  // ===================================================
  // VERIFY OWNERSHIP
  // ===================================================

  const ownsAttachment =
    await verifyAttachmentOwnership(
      annotation.attachmentId
    );

  if (!ownsAttachment) {

    return null;
  }

  // ===================================================
  // UPDATE DATABASE ROW
  // ===================================================

  const {
    data,
    error,
  } =
    await supabase
      .from("note_annotations")
      .update({

        type:
          annotation.type,

        position_x:
          annotation.positionX,

        position_y:
          annotation.positionY,

        width:
          annotation.width,

        height:
          annotation.height,

        rotation:
          annotation.rotation,

        color:
          annotation.color,

        stroke_width:
          annotation.strokeWidth,

        points:
          annotation.points,

        text:
          annotation.text,

        font_size:
          annotation.fontSize,

        font_weight:
          annotation.fontWeight,

        font_style:
          annotation.fontStyle,

        text_decoration:
          annotation.textDecoration,

        text_align:
          annotation.textAlign,

        updated_at:
          new Date().toISOString(),

      })
      .eq(
        "id",
        annotation.id
      )
      .eq(
        "attachment_id",
        annotation.attachmentId
      )
      .select(`
        id,
        attachment_id,
        type,
        position_x,
        position_y,
        width,
        height,
        rotation,
        color,
        stroke_width,
        points,
        text,
        font_size,
        font_weight,
        font_style,
        text_decoration,
        text_align,
        created_at,
        updated_at
      `)
      .maybeSingle();

  if (error) {

    console.error(
      "FAILED TO UPDATE NOTE ANNOTATION:",
      error
    );

    return null;
  }

  if (!data) {

    console.error(
      "NOTE ANNOTATION UPDATE AFFECTED ZERO ROWS:",
      {
        annotationId:
          annotation.id,

        attachmentId:
          annotation.attachmentId,
      }
    );

    return null;
  }

  return mapAnnotationRowToAnnotation(
    data as NoteAnnotationRow
  );
}


// =====================================================
// DELETE ANNOTATION
// =====================================================

export async function
deleteNoteAnnotation(
  annotation: NoteAnnotation
): Promise<boolean> {

  // ===================================================
  // VERIFY OWNERSHIP
  // ===================================================

  const ownsAttachment =
    await verifyAttachmentOwnership(
      annotation.attachmentId
    );

  if (!ownsAttachment) {

    return false;
  }

  // ===================================================
  // DELETE DATABASE ROW
  // ===================================================

  const {
    error,
  } =
    await supabase
      .from("note_annotations")
      .delete()
      .eq(
        "id",
        annotation.id
      )
      .eq(
        "attachment_id",
        annotation.attachmentId
      );

  if (error) {

    console.error(
      "FAILED TO DELETE NOTE ANNOTATION:",
      error
    );

    return false;
  }

  return true;
}