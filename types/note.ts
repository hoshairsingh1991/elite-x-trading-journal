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
  // These values will allow screenshots to support:
  // - moving
  // - resizing
  // - saving their position
  // - restoring their position after reload
  //
  // We are only defining the data model here.
  // The actual UI behavior comes later.
  //

  positionX: number;
  positionY: number;

  width: number;
  height: number;
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