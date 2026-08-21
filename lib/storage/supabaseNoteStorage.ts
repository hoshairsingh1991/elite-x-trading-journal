import { supabase } from "@/lib/supabase";

import {
  Note,
  NoteTradeLink,
  NoteAttachment,
  NoteAnnotation,
  NoteBlock,
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
// NOTE ANNOTATION ROW
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
// NOTE BLOCK ROW
// =====================================================

type NoteBlockRow = {
  id: string;

  note_id: string;

  type: string;

  position_x: number;
  position_y: number;

  width: number;
  height: number;

  z_index: number;

  content: string;

  // ===================================================
  // TEXT STYLE
  // ===================================================

  font_size: number | null;

  color: string | null;

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

function mapNoteRowToNote(
  row: NoteRow,
  tradeLinks: NoteTradeLink[],
  attachments: NoteAttachment[] = [],
  blocks: NoteBlock[] = []
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

blocks,

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
// LOAD ANNOTATIONS
// ===================================================

const attachmentIds =
  attachments.map(
    (attachment) =>
      attachment.id
  );

let annotations: NoteAnnotationRow[] = [];

if (
  attachmentIds.length > 0
) {

  const {
    data: annotationData,
    error: annotationError,
  } =
    await supabase
      .from("note_annotations")
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
      .in(
        "attachment_id",
        attachmentIds
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (annotationError) {

    console.error(
      "FAILED TO LOAD NOTE ANNOTATIONS:",
      annotationError
    );

  } else {

    annotations =
      (annotationData as NoteAnnotationRow[] | null) ?? [];
  }
}


// ===================================================
// GROUP ANNOTATIONS BY ATTACHMENT
// ===================================================

const annotationsByAttachment =
  new Map<
    string,
    NoteAnnotation[]
  >();


for (
  const annotation of annotations
) {

  const existing =
    annotationsByAttachment.get(
      annotation.attachment_id
    ) ?? [];

  existing.push({

    id:
      annotation.id,

    attachmentId:
      annotation.attachment_id,

    type:
      annotation.type,

    positionX:
      annotation.position_x,

    positionY:
      annotation.position_y,

    width:
      annotation.width,

    height:
      annotation.height,

    rotation:
      annotation.rotation,

    color:
      annotation.color,

    strokeWidth:
      annotation.stroke_width,

    points:
      annotation.points,

    text:
      annotation.text,

    fontSize:
      annotation.font_size,

    fontWeight:
      annotation.font_weight,

    fontStyle:
      annotation.font_style,

    textDecoration:
      annotation.text_decoration,

    textAlign:
      annotation.text_align,

    createdAt:
      annotation.created_at,

    updatedAt:
      annotation.updated_at,

  });

  annotationsByAttachment.set(
    annotation.attachment_id,
    existing
  );
}


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

   annotations:
    annotationsByAttachment.get(
      attachment.id
    ) ?? [],
    
  createdAt:
    attachment.created_at,

});


    attachmentsByNote.set(
      attachment.note_id,
      existing
    );
  }
  

// ===================================================
// LOAD NOTE BLOCKS
// ===================================================

const {
  data: blockData,
  error: blockError,
} =
  await supabase
    .from("note_blocks")
    .select(`
id,
note_id,
type,
position_x,
position_y,
width,
height,
z_index,
content,
font_size,
color,
font_weight,
font_style,
text_decoration,
text_align,
created_at,
updated_at
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


if (blockError) {

  console.error(
    "FAILED TO LOAD NOTE BLOCKS:",
    JSON.stringify(
      blockError,
      null,
      2
    )
  );

}

// ===================================================
// MAP DATABASE BLOCKS
// ===================================================

const blocks =
  (blockData as NoteBlockRow[] | null) ?? [];


// ===================================================
// GROUP BLOCKS BY NOTE
// =====================================================

const blocksByNote =
  new Map<
    string,
    NoteBlock[]
  >();


for (
  const block of blocks
) {

  const existing =
    blocksByNote.get(
      block.note_id
    ) ?? [];

  existing.push({

    id:
      block.id,

    noteId:
      block.note_id,

    type:
      block.type,

    positionX:
      block.position_x,

    positionY:
      block.position_y,

    width:
      block.width,

    height:
      block.height,

    zIndex:
      block.z_index,

content:
  block.content,

// ===================================================
// TEXT STYLE
// ===================================================

fontSize:
  block.font_size ?? 13,

color:
  block.color ?? "#ffffff",

fontWeight:
  block.font_weight ?? "400",

fontStyle:
  block.font_style ?? "normal",

textDecoration:
  block.text_decoration ?? "none",

textAlign:
  block.text_align ?? "left",

createdAt:
  block.created_at,

updatedAt:
  block.updated_at,

  });

  blocksByNote.set(
    block.note_id,
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
      ) ?? [],

      blocksByNote.get(
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

  blocks:
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
// CREATE NOTE BLOCK
// =====================================================

export async function
createNoteBlockInSupabase(
  block: NoteBlock
): Promise<NoteBlock | null> {

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
        block.noteId
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
      "FAILED TO VERIFY NOTE OWNERSHIP FOR BLOCK:",
      noteError
    );

    return null;
  }


  // ===================================================
  // INSERT BLOCK
  // ===================================================

  const {
    data,
    error,
  } =
    await supabase
      .from("note_blocks")
      .insert({

        id:
          block.id,

        note_id:
          block.noteId,

        type:
          block.type,

        position_x:
          block.positionX,

        position_y:
          block.positionY,

        width:
          block.width,

        height:
          block.height,

        z_index:
          block.zIndex,

content:
  block.content,

font_size:
  block.fontSize,

color:
  block.color,

font_weight:
  block.fontWeight,

font_style:
  block.fontStyle,

text_decoration:
  block.textDecoration,

text_align:
  block.textAlign,

created_at:
  block.createdAt,

        updated_at:
          block.updatedAt,

      })
.select(`
  id,
  note_id,
  type,
  position_x,
  position_y,
  width,
  height,
  z_index,
  content,
  font_size,
  color,
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
      "FAILED TO CREATE NOTE BLOCK:",
      error
    );

    return null;
  }


  const row =
    data as NoteBlockRow;


  // ===================================================
  // DATABASE → DOMAIN
  // ===================================================

  return {

    id:
      row.id,

    noteId:
      row.note_id,

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

    zIndex:
      row.z_index,

content:
  row.content,

// ===================================================
// TEXT STYLE
// ===================================================

fontSize:
  row.font_size ?? 13,

color:
  row.color ?? "#ffffff",

fontWeight:
  row.font_weight ?? "400",

fontStyle:
  row.font_style ?? "normal",

textDecoration:
  row.text_decoration ?? "none",

textAlign:
  row.text_align ?? "left",

createdAt:
  row.created_at,

updatedAt:
  row.updated_at,

  };
}

// =====================================================
// UPDATE NOTE BLOCK
// =====================================================

export async function
updateNoteBlockInSupabase(
  block: NoteBlock
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
        block.noteId
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
      "FAILED TO VERIFY NOTE OWNERSHIP FOR BLOCK UPDATE:",
      noteError
    );

    return;
  }


  // ===================================================
  // UPDATE BLOCK
  // ===================================================

  const {
    error,
  } =
    await supabase
      .from("note_blocks")
      .update({

        type:
          block.type,

        position_x:
          block.positionX,

        position_y:
          block.positionY,

        width:
          block.width,

        height:
          block.height,

        z_index:
          block.zIndex,

        content:
          block.content,

        font_size:
          block.fontSize,

        color:
          block.color,

        font_weight:
          block.fontWeight,

        font_style:
          block.fontStyle,

        text_decoration:
          block.textDecoration,

        text_align:
          block.textAlign,

        updated_at:
          new Date().toISOString(),

      })
      .eq(
        "id",
        block.id
      )
      .eq(
        "note_id",
        block.noteId
      );


  if (error) {

    console.error(
      "FAILED TO UPDATE NOTE BLOCK:",
      error
    );
  }
}



// =====================================================
// DELETE NOTE BLOCK
// =====================================================

export async function
deleteNoteBlockFromSupabase(
  blockId: string
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
  // LOAD BLOCK + VERIFY NOTE OWNERSHIP
  // ===================================================

  const {
    data: block,
    error: blockError,
  } =
    await supabase
      .from("note_blocks")
      .select(`
        id,
        note_id
      `)
      .eq(
        "id",
        blockId
      )
      .maybeSingle();


  if (
    blockError ||
    !block
  ) {

    console.error(
      "FAILED TO FIND NOTE BLOCK FOR DELETE:",
      blockError
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
        block.note_id
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
      "FAILED TO VERIFY NOTE OWNERSHIP FOR BLOCK DELETE:",
      noteError
    );

    return;
  }


  // ===================================================
  // DELETE BLOCK
  // ===================================================

  const {
    error,
  } =
    await supabase
      .from("note_blocks")
      .delete()
      .eq(
        "id",
        blockId
      )
      .eq(
        "note_id",
        block.note_id
      );


  if (error) {

    console.error(
      "FAILED TO DELETE NOTE BLOCK:",
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