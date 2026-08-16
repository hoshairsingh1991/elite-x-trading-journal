// =====================================================
// NOTE ANNOTATION
// =====================================================

export type NoteAnnotation = {
  id: string;

  attachmentId: string;

  // ===================================================
  // ANNOTATION TYPE
  // ===================================================
  //
  // Examples:
  // - pen
  // - arrow
  // - line
  // - level
  // - rectangle
  // - highlight
  // - text
  // - quick_mark
  //

  type: string;

  // ===================================================
  // POSITION + SIZE
  // ===================================================
  //
  // These values describe the annotation geometry
  // relative to its parent screenshot.
  //

  positionX: number;
  positionY: number;

  width: number;
  height: number;

  rotation: number;

  // ===================================================
  // DRAWING STYLE
  // ===================================================

  color: string;

  strokeWidth: number;

  // ===================================================
  // FREEHAND / MULTI-POINT GEOMETRY
  // ===================================================
  //
  // Coordinates are normalized to the screenshot:
  //
  // x: 0 → left edge
  // x: 1 → right edge
  //
  // y: 0 → top edge
  // y: 1 → bottom edge
  //
  // This allows annotations to scale correctly when
  // the screenshot itself is resized.
  //

  points: Array<{
    x: number;
    y: number;
  }> | null;

  // ===================================================
  // TEXT
  // ===================================================

  text: string | null;

  fontSize: number | null;

  fontWeight: string | null;

  fontStyle: string | null;

  textDecoration: string | null;

  textAlign: string | null;

  // ===================================================
  // TIMESTAMPS
  // ===================================================

  createdAt: string;

  updatedAt: string;
};


// =====================================================
// NOTE ATTACHMENT
// =====================================================

export type NoteAttachment = {
  id: string;

  noteId: string;

  fileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;

  createdAt: string;

  // ===================================================
  // IMAGE LAYOUT
  // ===================================================
  //
  // These values control the screenshot itself.
  //

  positionX: number;
  positionY: number;

  width: number;
  height: number;

  // ===================================================
  // SCREENSHOT ANNOTATIONS
  // ===================================================

  annotations: NoteAnnotation[];
};


// =====================================================
// NOTE TRADE LINK
// =====================================================

export type NoteTradeLink = {
  id: string;

  noteId: string;
  tradeId: string;

  createdAt: string;
};


// =====================================================
// NOTE
// =====================================================

export type Note = {
  id: string;

  // ===================================================
  // TITLE
  // ===================================================

  title: string;

  /**
   * True when the user has manually customized
   * the note title.
   *
   * When false, the title may be generated
   * automatically from attached trades.
   */

  isTitleCustom: boolean;

  content: string;

  createdAt: string;
  updatedAt: string;

  // ===================================================
  // TRADE LINKS
  // ===================================================

  tradeLinks: NoteTradeLink[];

  // ===================================================
  // ATTACHMENTS
  // ===================================================

  attachments: NoteAttachment[];
};