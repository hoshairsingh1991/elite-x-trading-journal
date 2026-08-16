"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";
import UserMenuV2
from "@/components/layout/UserMenuV2";
import TiptapEditor from "@/components/notes/TiptapEditor";
import NoteTradeSelector from "@/components/notes/NoteTradeSelector";

import NoteAttachmentCanvas from "@/components/notes/NoteAttachmentCanvas";

import {
  uploadNoteAttachment,
  deleteNoteAttachment,
  updateNoteAttachmentLayout,
} from "@/lib/storage/noteAttachmentStorage";


import {
  Plus,
  Trash2,
  ImagePlus,
} from "lucide-react";

import {
  Note,
  NoteAnnotation,
} from "@/types/note";

import { Trade } from "@/types/trade";

import {
  loadNotesFromSupabase,
  createNoteInSupabase,
  updateNoteInSupabase,
  deleteNoteFromSupabase,
  addTradeToNoteInSupabase,
  removeTradeFromNoteInSupabase,
} from "@/lib/storage/supabaseNoteStorage";

import {
  loadExecutionsFromSupabase,
} from "@/lib/storage/supabaseExecutionStorage";

import { pairTrades }
from "@/lib/parsers/pairTrades";

export default function NotesPage() {

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [
    availableTrades,
    setAvailableTrades,
  ] = useState<Trade[]>([]);

  const [
    selectedNoteId,
    setSelectedNoteId,
  ] = useState<string>("");

  const fileInputRef =
  useRef<HTMLInputElement | null>(null);

const [
  isUploadingAttachment,
  setIsUploadingAttachment,
] = useState(false);


  const [
    activeAnnotationTool,
    setActiveAnnotationTool,
  ] = useState<
    "select" | "pen"
  >("select");

  // =================================================
  // LOAD NOTES
  // =================================================

  useEffect(() => {

    async function
    loadCloudNotes() {

      const storedNotes =
        await loadNotesFromSupabase();

      setNotes(
        storedNotes
      );

      if (
        storedNotes.length > 0
      ) {

        setSelectedNoteId(
          storedNotes[0].id
        );
      }
    }

    loadCloudNotes();

  }, []);

  // =================================================
  // LOAD AVAILABLE TRADES
  // =================================================

  useEffect(() => {

    async function
    loadAvailableTrades() {

      const executions =
        await loadExecutionsFromSupabase();

      const rebuiltTrades =
        pairTrades(
          executions
        );

      setAvailableTrades(
        rebuiltTrades
      );
    }

    loadAvailableTrades();

  }, []);

  // =================================================
  // SELECTED NOTE
  // =================================================

  const selectedNote =
    notes.find(
      (note) =>
        note.id ===
        selectedNoteId
    );

// =================================================
// AUTOMATIC NOTE TITLE
// =================================================

function getAutomaticNoteTitle(
  note: Note
): string {

  // No trades attached
  if (
    note.tradeLinks.length === 0
  ) {

    return "Trading Note";
  }

  // Resolve attached trade IDs
  const tickers =
    note.tradeLinks
      .map(
        (link) =>
          availableTrades.find(
            (trade) =>
              trade.id ===
              link.tradeId
          )?.ticker
      )
      .filter(
        (
          ticker
        ): ticker is string =>
          Boolean(ticker)
      );

  // Safety fallback
  if (
    tickers.length === 0
  ) {

    return "Trading Note";
  }

  // Remove duplicate tickers
  const uniqueTickers =
    Array.from(
      new Set(tickers)
    );

  // One unique ticker
  if (
    uniqueTickers.length === 1
  ) {

    return `Trade Review - ${uniqueTickers[0]}`;
  }

  // Two or three unique tickers
  if (
    uniqueTickers.length <= 3
  ) {

    return `Trade Review - ${uniqueTickers.join(", ")}`;
  }

  // More than three unique tickers
  const visibleTickers =
    uniqueTickers
      .slice(0, 3)
      .join(", ");

  const remainingCount =
    uniqueTickers.length - 3;

  return `Trade Review - ${visibleTickers} +${remainingCount}`;
}


// =================================================
// SYNC AUTOMATIC NOTE TITLE
// =================================================

useEffect(() => {

  if (
    !selectedNote ||
    selectedNote.isTitleCustom
  ) {

    return;
  }

  const automaticTitle =
    getAutomaticNoteTitle(
      selectedNote
    );

  if (
    selectedNote.title ===
    automaticTitle
  ) {

    return;
  }

  const updatedNote: Note = {

    ...selectedNote,

    title:
      automaticTitle,
  };

  setNotes(
    (currentNotes) =>
      currentNotes.map(
        (note) =>
          note.id ===
          updatedNote.id
            ? updatedNote
            : note
      )
  );

  updateNoteInSupabase(
    updatedNote
  );

}, [
  selectedNote,
  availableTrades,
]);

// =================================================
// UPLOAD NOTE ATTACHMENT
// =================================================

async function handleUploadAttachment(
  event: React.ChangeEvent<HTMLInputElement>
) {

  const file =
    event.target.files?.[0];

  // Reset input so the same file
  // can be selected again later.
  event.target.value = "";

  if (
    !file ||
    !selectedNote
  ) {

    return;
  }



  // =================================================
  // IMAGE VALIDATION
  // =================================================

  if (
    !file.type.startsWith("image/")
  ) {

    console.error(
      "NOTE ATTACHMENT MUST BE AN IMAGE"
    );

    return;
  }

  // =================================================
  // UPLOAD
  // =================================================

  setIsUploadingAttachment(
    true
  );

  try {

    const attachment =
      await uploadNoteAttachment(
        selectedNote.id,
        file
      );

    if (!attachment) {

      return;
    }

    // =================================================
    // UPDATE LOCAL NOTE STATE
    // =================================================

    setNotes(
      (currentNotes) =>
        currentNotes.map(
          (note) =>
            note.id ===
            selectedNote.id
              ? {
                  ...note,

                  attachments: [
                    ...note.attachments,
                    attachment,
                  ],
                }
              : note
        )
    );

  } finally {

    setIsUploadingAttachment(
      false
    );
  }
}

// =================================================
// DELETE NOTE ATTACHMENT
// =================================================

async function handleDeleteAttachment(
  attachment: Note["attachments"][number]
) {

  if (
    !selectedNote
  ) {

    return;
  }

  const deleted =
    await deleteNoteAttachment(
      attachment
    );

  if (!deleted) {

    return;
  }

  setNotes(
    (currentNotes) =>
      currentNotes.map(
        (note) =>
          note.id ===
          selectedNote.id
            ? {
                ...note,

                attachments:
                  note.attachments.filter(
                    (item) =>
                      item.id !==
                      attachment.id
                  ),
              }
            : note
      )
  );
}

// =================================================
// UPDATE NOTE ATTACHMENT LAYOUT
// =================================================

async function handleUpdateAttachmentLayout(
  attachment: Note["attachments"][number],
  layout: {
    positionX: number;
    positionY: number;
    width: number;
    height: number;
  }
) {

  if (
    !selectedNote
  ) {

    return;
  }

  const updated =
    await updateNoteAttachmentLayout(
      attachment,
      layout
    );

  if (!updated) {

    return;
  }

  // =================================================
  // UPDATE LOCAL NOTE STATE
  // =================================================

  setNotes(
    (currentNotes) =>
      currentNotes.map(
        (note) =>
          note.id ===
          selectedNote.id
            ? {
                ...note,

                attachments:
                  note.attachments.map(
                    (item) =>
                      item.id ===
                      attachment.id
                        ? {
                            ...item,

                            positionX:
                              layout.positionX,

                            positionY:
                              layout.positionY,

                            width:
                              layout.width,

                            height:
                              layout.height,
                          }
                        : item
                  ),
              }
            : note
      )
  );
}

// =================================================
// UPDATE NOTE ANNOTATION STATE
// =================================================

function handleAnnotationCreated(
  attachmentId: string,
  annotation: NoteAnnotation
) {

  setNotes(
    (currentNotes) =>
      currentNotes.map(
        (note) =>
          note.id ===
          selectedNoteId
            ? {
                ...note,

                attachments:
                  note.attachments.map(
                    (attachment) =>
                      attachment.id ===
                      attachmentId
                        ? {
                            ...attachment,

                            annotations: [
                              ...attachment.annotations,
                              annotation,
                            ],
                          }
                        : attachment
                  ),
              }
            : note
      )
  );
}

  // =================================================
  // CREATE NOTE
  // =================================================

  async function handleCreateNote() {

    const newNote =
      await createNoteInSupabase();

    if (!newNote) {
      return;
    }

    const updatedNotes = [
      newNote,
      ...notes,
    ];

    setNotes(
      updatedNotes
    );

    setSelectedNoteId(
      newNote.id
    );
  }



  // =================================================
  // DELETE NOTE
  // =================================================

  async function handleDeleteNote() {

    if (
      !selectedNote
    ) {

      return;
    }

    await deleteNoteFromSupabase(
      selectedNote.id
    );

    const updatedNotes =
      notes.filter(
        (note) =>
          note.id !==
          selectedNote.id
      );

    setNotes(
      updatedNotes
    );

    if (
      updatedNotes.length > 0
    ) {

      setSelectedNoteId(
        updatedNotes[0].id
      );

    } else {

      setSelectedNoteId(
        ""
      );
    }
  }

  // =================================================
  // UPDATE NOTE
  // =================================================

function handleUpdateNote(
  field:
    | "title"
    | "content",
  value: string
) {

  if (
    !selectedNote
  ) {

    return;
  }

  const updatedNote: Note = {

    ...selectedNote,

    [field]:
      value,

    // =================================================
    // MANUAL TITLE OVERRIDE
    // =================================================
    //
    // Once the user edits the title manually,
    // automatic trade-based title generation
    // must stop controlling the title.
    //
    ...(field === "title"
      ? {
          isTitleCustom:
            true,
        }
      : {}),
  };

  const updatedNotes =
    notes.map(
      (note) => {

        if (
          note.id ===
          updatedNote.id
        ) {

          return updatedNote;
        }

        return note;
      }
    );

  setNotes(
    updatedNotes
  );

  updateNoteInSupabase(
    updatedNote
  );
}

  // =================================================
  // ADD TRADE TO NOTE
  // =================================================

  async function handleAddTrade(
    tradeId: string
  ) {

    if (
      !selectedNote
    ) {

      return;
    }

    const link =
      await addTradeToNoteInSupabase(
        selectedNote.id,
        tradeId
      );

    if (!link) {
      return;
    }

    const updatedNote: Note = {

      ...selectedNote,

tradeLinks: [
  ...selectedNote.tradeLinks,
  link,
],
    };

    setNotes(
      (currentNotes) =>
        currentNotes.map(
          (note) =>
            note.id ===
            updatedNote.id
              ? updatedNote
              : note
        )
    );
  }

  // =================================================
  // REMOVE TRADE FROM NOTE
  // =================================================

  async function handleRemoveTrade(
    tradeId: string
  ) {

    if (
      !selectedNote
    ) {

      return;
    }

    await removeTradeFromNoteInSupabase(
      selectedNote.id,
      tradeId
    );

    const updatedNote: Note = {

      ...selectedNote,

tradeLinks:
  selectedNote.tradeLinks.filter(
    (link) =>
      link.tradeId !==
      tradeId
  ),
    };

    setNotes(
      (currentNotes) =>
        currentNotes.map(
          (note) =>
            note.id ===
            updatedNote.id
              ? updatedNote
              : note
        )
    );
  }

  // =================================================
  // PAGE
  // =================================================

  return (

    <main className="flex h-screen gap-[18px] overflow-hidden bg-[#020817] p-[18px] pb-[36px] pt-[36px] text-white">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar />

      {/* ================================================= */}
      {/* NOTES LAYOUT */}
      {/* ================================================= */}

      <div className="flex flex-1 gap-[18px] overflow-hidden py-[18px]">

        {/* ================================================= */}
        {/* NOTES SIDEBAR */}
        {/* ================================================= */}

        <div className="flex w-[340px] flex-col overflow-hidden rounded-[32px] border border-white/[0.04] bg-[#07101a]">

          {/* TOP SAFE ZONE */}

          <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

          {/* MAIN CONTENT */}

          <div className="flex flex-1">

            {/* LEFT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

            {/* CONTENT */}

            <div className="flex flex-1 flex-col overflow-hidden">

              {/* ============================================= */}
              {/* HEADER */}
              {/* ============================================= */}

              <div className="flex items-center justify-between rounded-[24px] border border-white/[0.04] bg-[#09111d] px-6 py-5">

                <div className="relative left-4">

                  <h1 className="text-xl font-bold text-white">
                    Notes
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Trading workspace
                  </p>

                </div>

                <button
                  onClick={
                    handleCreateNote
                  }
                  className="relative right-2 flex h-10 w-11 items-center justify-center rounded-xl bg-[#0b1730] text-blue-400 transition-all hover:bg-[#132347]"
                >

                  <Plus size={18} />

                </button>

              </div>

              {/* ============================================= */}
              {/* SPACER */}
              {/* ============================================= */}

              <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                spacer
              </div>

              {/* ============================================= */}
              {/* NOTES LIST */}
              {/* ============================================= */}

              <div className="mt-[18px] flex-1 overflow-y-auto">

                <div className="space-y-3">

                  {notes.map(
                    (note) => {

                      const isActive =
                        note.id ===
                        selectedNoteId;

                      return (

                        <button
                          key={note.id}
                          onClick={() =>
                            setSelectedNoteId(
                              note.id
                            )
                          }
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                            isActive
                              ? "border-blue-500/30 bg-[#0b1730]"
                              : "border-white/[0.04] bg-[#09111d] hover:bg-[#0b1730]"
                          }`}
                        >

                          <div className="flex items-center justify-between px-2">

                            <p className="relative left-2 truncate text-sm font-semibold text-white">
                              {note.title}
                            </p>

                            {isActive && (

                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote();
                                }}
                                className="relative right-2 top-[8px] flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-all hover:bg-red-500/10"
                              >

                                <Trash2 size={20} />

                              </div>

                            )}

                          </div>

                          <p className="relative left-2 mt-2 line-clamp-2 text-xs text-slate-500">

                            {note.content
                              .replace(/<[^>]+>/g, "")
                              || "Empty note"}

                          </p>

                        </button>

                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* RIGHT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

          </div>

          {/* BOTTOM SAFE ZONE */}

          <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

        </div>

        {/* ================================================= */}
        {/* NOTE EDITOR */}
        {/* ================================================= */}

        <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] border border-white/[0.04] bg-[#07101a]">

          {/* TOP SAFE ZONE */}

          <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

          {/* MAIN CONTENT */}

          <div className="flex flex-1">

            {/* LEFT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

            {/* CONTENT */}

            <div className="flex flex-1 flex-col overflow-hidden">

              {selectedNote ? (

                <>

                  {/* ============================================= */}
                  {/* TOP BAR */}
                  {/* ============================================= */}

                  <div className="flex items-center justify-between rounded-[24px] border border-white/[0.04] bg-[#09111d] pl-8 pr-4 py-5">

                    <p className="relative left-4 text-sm text-slate-500">

                      Last updated{" "}

                      {new Date(
                        selectedNote.updatedAt
                      ).toLocaleString()}

                    </p>

                    <div className="flex items-center gap-4">

                      <UserMenuV2
                        totalTrades={0}
                        totalPnL={0}
                        tradingDays={0}
                      />

                    </div>

                  </div>

                  {/* ============================================= */}
                  {/* SPACER */}
                  {/* ============================================= */}

                  <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                    spacer
                  </div>

                  {/* ============================================= */}
                  {/* EDITOR */}
                  {/* ============================================= */}

                  <div className="flex flex-1 overflow-hidden">

                    <div className="mt-[18px] flex flex-1 flex-col overflow-y-auto rounded-[24px] border border-white/[0.04] bg-[#09111d] px-8 py-8">

                      <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                        spacer
                      </div>

                      <input
                        type="text"
                        value={
                          selectedNote.title
                        }
                        onChange={(e) =>
                          handleUpdateNote(
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Note title..."
                        className="relative left-4 mt-4 border-none bg-transparent text-3xl font-black tracking-[-0.03em] text-white outline-none placeholder:text-slate-600"
                      />

{/* ============================================= */}
{/* TRADE ATTACHMENTS */}
{/* ============================================= */}

<div className="relative left-4 mt-8 w-[calc(100%-1rem)]">

<NoteTradeSelector
  trades={
    availableTrades
  }
  tradeLinks={
    selectedNote.tradeLinks
  }
  onAddTrade={
    handleAddTrade
  }
  onRemoveTrade={
    handleRemoveTrade
  }
/>

</div>

{/* ============================================= */}
{/* SCREENSHOT UPLOAD */}
{/* ============================================= */}

<div className="relative left-4 mt-4">

  <button
    type="button"
    title="Add screenshot"
    aria-label="Add screenshot"
    onClick={() =>
      fileInputRef.current?.click()
    }
    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.04] bg-[#0b1730] text-blue-400 transition-all hover:bg-[#132347]"
  >
    <ImagePlus
      size={17}
      strokeWidth={1.8}
    />
  </button>

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleUploadAttachment}
  />

</div>

{/* ============================================= */}
{/* TEMP ANNOTATION TEST */}
{/* ============================================= */}

<div className="relative left-4 mt-3">

  <button
    type="button"
    onClick={() =>
      setActiveAnnotationTool(
        activeAnnotationTool === "pen"
          ? "select"
          : "pen"
      )
    }
    className="rounded-lg bg-[#0b1730] px-3 py-2 text-xs text-blue-400"
  >
    {activeAnnotationTool === "pen"
      ? "Pen ON"
      : "Pen OFF"}
  </button>

</div>

{/* ============================================= */}
{/* SCREENSHOT ATTACHMENTS */}
{/* ============================================= */}

<NoteAttachmentCanvas
  attachments={
    selectedNote.attachments
  }
  activeAnnotationTool={
    activeAnnotationTool
  }
  onAnnotationCreated={
    handleAnnotationCreated
  }
  onDelete={
    handleDeleteAttachment
  }
  onLayoutChange={
    handleUpdateAttachmentLayout
  }
/>


{/* ============================================= */}
{/* TIPTAP EDITOR */}
{/* ============================================= */}

<div className="relative left-4 mt-8 min-h-[400px]">

  <TiptapEditor
    key={
      selectedNote.id
    }
    content={
      selectedNote.content
    }
    onChange={(
      value
    ) =>
      handleUpdateNote(
        "content",
        value
      )
    }
  />

</div>

                    </div>

                  </div>

                </>

              ) : (

                <div className="flex flex-1 items-center justify-center rounded-[24px] border border-white/[0.04] bg-[#09111d]">

                  <div className="text-center">

                    <h2 className="text-2xl font-bold text-white">
                      No Notes Yet
                    </h2>

                    <p className="mt-3 text-slate-500">
                      Create your first trading note.
                    </p>

                    <button
                      onClick={
                        handleCreateNote
                      }
                      className="mt-8 rounded-2xl bg-[#0b1730] px-6 py-3 font-medium text-blue-400 transition-all hover:bg-[#132347]"
                    >

                      Create Note

                    </button>

                  </div>

                </div>

              )}

            </div>

            {/* RIGHT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

          </div>

          {/* BOTTOM SAFE ZONE */}

          <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

        </div>

      </div>

    </main>
  );
}