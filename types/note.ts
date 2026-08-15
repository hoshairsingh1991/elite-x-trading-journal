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

  title: string;
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