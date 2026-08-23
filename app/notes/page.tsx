"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Editor,
} from "@tiptap/core";

import Sidebar from "@/components/layout/Sidebar";

import TiptapEditor from "@/components/notes/TiptapEditor";
import NoteToolsBar from "@/components/notes/NoteToolsBar";
import NoteTradeSelector from "@/components/notes/NoteTradeSelector";
import NoteLinkedTrades from "@/components/notes/NoteLinkedTrades";
import NoteAttachmentCanvas from "@/components/notes/NoteAttachmentCanvas";

import {
  uploadNoteAttachment,
  deleteNoteAttachment,
  updateNoteAttachmentLayout,
} from "@/lib/storage/noteAttachmentStorage";

import NoteBlockCanvas from "@/components/notes/NoteBlockCanvas";

import {
  Plus,
  Trash2,
  ImagePlus,
  Search,
  SlidersHorizontal,
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
  createNoteBlockInSupabase,
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

  const noteTitleMeasureRef =
  useRef<HTMLSpanElement | null>(null);

  const [
  noteTitleWidth,
  setNoteTitleWidth,
] = useState(0);

const [
  isUploadingAttachment,
  setIsUploadingAttachment,
] = useState(false);


const [
  activeAnnotationTool,
  setActiveAnnotationTool,
] = useState<
  "select"
  | "pen"
  | "line"
  | "arrow"
  | "zone"
  | "highlight"
>("select");



const [
  penColor,
  setPenColor,
] = useState("#ef4444");

const [
  penWidth,
  setPenWidth,
] = useState(2);

const [
  tiptapEditor,
  setTiptapEditor,
] = useState<Editor | null>(
  null
);
  
const [
  activeBlockEditor,
  setActiveBlockEditor,
] = useState<Editor | null>(
  null
);

const [
  activeBlockId,
  setActiveBlockId,
] = useState<string | null>(
  null
);

const [
  activeBlockStyle,
  setActiveBlockStyle,
] = useState({
  fontSize: 13,
  color: "#ffffff",
  fontWeight: "400",
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "left",
});

const [
  isTradeSelectorOpen,
  setIsTradeSelectorOpen,
] = useState(false);

    const [
    openNoteMenuId,
    setOpenNoteMenuId,
  ] = useState<string | null>(null);

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

    useEffect(() => {

  if (
    !noteTitleMeasureRef.current ||
    !selectedNote
  ) {

    setNoteTitleWidth(
      0
    );

    return;
  }

  setNoteTitleWidth(
    noteTitleMeasureRef.current
      .getBoundingClientRect()
      .width
  );

}, [
  selectedNote?.title,
  selectedNoteId,
]);

// =================================================
// NOTE SIDEBAR DATE GROUPING
// =================================================

function getDateKey(
  date: Date
): string {

  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");
}

function getNoteGroupLabel(
  dateString: string
): string {

  const date =
    new Date(
      dateString
    );

  const now =
    new Date();

  const todayKey =
    getDateKey(
      now
    );

  const yesterday =
    new Date(
      now
    );

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const yesterdayKey =
    getDateKey(
      yesterday
    );

  const noteKey =
    getDateKey(
      date
    );

  if (
    noteKey ===
    todayKey
  ) {

    return "TODAY";
  }

  if (
    noteKey ===
    yesterdayKey
  ) {

    return "YESTERDAY";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).toUpperCase();
}

function getNoteTime(
  dateString: string
): string {

  return new Date(
    dateString
  ).toLocaleTimeString(
    undefined,
    {
      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );
}

// =================================================
// GROUP NOTES BY UPDATED DATE
// =================================================

const groupedNotes =
  notes.reduce(
    (
      groups,
      note
    ) => {

      const label =
        getNoteGroupLabel(
          note.updatedAt
        );

      if (
        !groups[label]
      ) {

        groups[label] = [];
      }

      groups[label].push(
        note
      );

      return groups;

    },
    {} as Record<
      string,
      Note[]
    >
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
// UPDATE NOTE BLOCKS
// =================================================

function handleBlocksChange(
  updatedBlocks: Note["blocks"]
) {

  if (
    !selectedNote
  ) {

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

                blocks:
                  updatedBlocks,
              }
            : note
      )
  );
}

// =================================================
// CREATE TEXT BLOCK
// =================================================

async function handleAddTextBlock() {

  console.log(
    "ADD TEXT BLOCK CLICKED"
  );

  if (
    !selectedNote
  ) {

    console.log(
      "NO SELECTED NOTE"
    );

    return;
  }

  const now =
    new Date().toISOString();

  const newBlock = {

    id:
      crypto.randomUUID(),

    noteId:
      selectedNote.id,

    type:
      "text",

    positionX:
      40,

    positionY:
      40,

    width:
      320,

    height:
      120,

    zIndex:
      selectedNote.blocks.length,

content:
  "",

// =================================================
// DEFAULT TEXT STYLE
// =================================================

fontSize:
  13,

color:
  "#ffffff",

fontWeight:
  "400",

fontStyle:
  "normal",

textDecoration:
  "none",

textAlign:
  "left",

createdAt:
  now,

updatedAt:
  now,

  };

  console.log(
    "CREATING TEXT BLOCK:",
    newBlock
  );

  const createdBlock =
    await createNoteBlockInSupabase(
      newBlock
    );

  console.log(
    "CREATED TEXT BLOCK:",
    createdBlock
  );

  if (
    !createdBlock
  ) {

    console.error(
      "TEXT BLOCK CREATION FAILED"
    );

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

                blocks: [
                  ...note.blocks,
                  createdBlock,
                ],
              }
            : note
      )
  );

  console.log(
    "TEXT BLOCK ADDED TO LOCAL NOTE STATE"
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

   <main className="flex h-screen min-h-0 w-full gap-[18px] overflow-hidden bg-[#020817] px-[18px] pb-[36px] pt-[18px] text-white">
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar />

      {/* ================================================= */}
      {/* NOTES LAYOUT */}
      {/* ================================================= */}

  <div className="grid h-[calc(100vh-40px)] min-h-0 min-w-0 flex-1 grid-cols-[clamp(300px,24vw,340px)_minmax(0,1fr)] gap-[18px] overflow-hidden translate-y-[22px] pr-[18px]">

        {/* ================================================= */}
        {/* NOTES SIDEBAR */}
        {/* ================================================= */}

        <div className="mr-[18px] flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#07111d]">

          {/* TOP SAFE ZONE */}

          <div className="h-[0px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

{/* MAIN CONTENT */}

<div className="flex min-h-0 flex-1">

            {/* LEFT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

            {/* CONTENT */}

<div className="flex min-h-0 flex-1 flex-col overflow-hidden">

{/* ============================================= */}
{/* HEADER */}
{/* ============================================= */}

<div className="relative flex h-[78px] shrink-0 items-center justify-between px-5">

  <div>

    <h1 className="text-[20px] font-bold leading-none text-white">
      Notes
    </h1>

    <p className="mt-2 text-[13px] leading-none text-slate-500">
      Your trading journal
    </p>

  </div>

  <button
    type="button"
    onClick={
      handleCreateNote
    }
    aria-label="Create note"
    title="Create note"
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#0b0c1e] text-blue-400 transition-colors hover:border-white/[0.12] hover:bg-[#0b1730]"
  >

    <Plus
      size={19}
      strokeWidth={2}
    />

  </button>

  <div className="absolute bottom-[8px] left-0 right-0 h-px bg-white/[0.06]" />

</div>

{/* ============================================= */}
{/* SEARCH / ACTIONS */}
{/* ============================================= */}

<div className="flex h-[56px] shrink-0 translate-y-[-4px] items-center gap-2 px-5">

<div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] focus-within:border-white/[0.12]">

  <div className="flex h-9 w-9 shrink-0 items-center justify-center">

    <Search
      size={15}
      strokeWidth={1.8}
      className="text-slate-500"
    />

  </div>

  <input
    type="text"
    placeholder="Search notes..."
    className="h-9 min-w-0 flex-1 border-none bg-transparent pr-3 text-xs text-white outline-none placeholder:text-slate-500"
  />

</div>

  <button
    type="button"
    aria-label="Note filters"
    title="Note filters"
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] text-slate-400 transition-colors hover:border-white/[0.12] hover:text-white"
  >

    <SlidersHorizontal
      size={15}
      strokeWidth={1.8}
    />

  </button>

</div>

{/* ============================================= */}
{/* NOTES LIST */}
{/* ============================================= */}

<div className="notes-scrollbar relative mt-[22px] flex min-w-0 flex-1 translate-y-[0px] flex-col overflow-y-auto overflow-x-hidden">

  <div className="relative left-[0px] space-y-[34px] pt-3">

{Object.entries(
  groupedNotes
).map(
  ([
    groupLabel,
    groupNotes,
  ], groupIndex) => (

<section
  key={
    groupLabel
  }
  className="relative"
>
  {groupIndex > 0 && (
    <div className="h-[10px] shrink-0" />
  )}

{/* ===================================== */}
{/* DATE GROUP */}
{/* ===================================== */}

<div className="px-1">

  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
    {groupLabel}
  </p>

</div>

{/* ===================================== */}
{/* GAP BELOW DATE GROUP */}
{/* ===================================== */}

<div className="h-[6px] shrink-0" />

{/* ===================================== */}
{/* NOTE CARDS */}
{/* ===================================== */}

<div className="flex flex-col gap-3">

            {groupNotes.map(
              (
                note
              ) => {

                const isActive =
                  note.id ===
                  selectedNoteId;

                const preview =
                  note.content
                    .replace(
                      /<[^>]+>/g,
                      ""
                    )
                    .trim();

                const linkedTrade =
                  note.tradeLinks.length >
                  0
                    ? availableTrades.find(
                        (trade) =>
                          trade.id ===
                          note.tradeLinks[0].tradeId
                      )
                    : undefined;

                return (

                  <button
                    key={
                      note.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedNoteId(
                        note.id
                      )
                    }
className={`group relative min-h-[80px] w-full rounded-[8px] border px-3 py-4 text-left transition-all ${
  isActive
    ? "border-blue-500/60 bg-[#0b1220]"
    : "border-white/[0.06] bg-[#0b1220] hover:border-white/[0.12] hover:bg-[#0b1730]"
}`}
                  >

{/* ================================= */}
{/* CARD HEADER */}
{/* ================================= */}

<div className="relative left-[8px] translate-y-[-12px] flex items-start gap-2">

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[13px] font-semibold leading-5 text-white">
                          {note.title}
                        </p>

                      </div>

<p className="relative left-[-20px] translate-y-[-0px] shrink-0 pt-[1px] text-[10px] text-slate-500">
  {getNoteTime(
    note.updatedAt
  )}
</p>

                    </div>

{/* ================================= */}
{/* PREVIEW / TRADE STATE */}
{/* ================================= */}

<div className="relative left-[8px] mt-2 translate-y-[-8px] min-h-[16px]">

                      {linkedTrade ? (

                        <div className="flex items-center gap-2">

                          <span className="text-[11px] font-medium text-slate-400">
                            Trade linked
                          </span>

                          {linkedTrade.ticker && (

                            <span className="rounded-[4px] bg-[#0b0c1e] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                              {linkedTrade.ticker}
                            </span>

                          )}

                        </div>

                      ) : (

                        <p className="line-clamp-2 text-[11px] leading-4 text-slate-500">
                          {preview ||
                            "Empty note"}
                        </p>

                      )}

                    </div>

{/* ================================= */}
{/* CARD DELETE ACTION */}
{/* ================================= */}

<span
  role="button"
  tabIndex={0}
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      note.id ===
      selectedNoteId
    ) {
      handleDeleteNote();
    }
  }}
  onKeyDown={(event) => {

    if (
      (
        event.key ===
        "Enter"
      ) ||
      (
        event.key ===
        " "
      )
    ) {

      event.preventDefault();
      event.stopPropagation();

      if (
        note.id ===
        selectedNoteId
      ) {
        handleDeleteNote();
      }
    }
  }}
 className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1 cursor-pointer items-center justify-center rounded-[6px] text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
  title="Delete note"
  aria-label="Delete note"
>

  <Trash2
    size={16}
    strokeWidth={1.8}
  />

</span>
                  </button>

                );
              }
            )}

          </div>

        </section>

      )
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

       <div
  className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#07111d]"
  style={{
    marginRight: "20px",
    width: "calc(100% - 20px)",
  }}
>

          {/* TOP SAFE ZONE */}

          <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
            spacer
          </div>

          {/* MAIN CONTENT */}

<div className="flex min-h-0 flex-1">

            {/* LEFT SAFE ZONE */}

            <div className="w-[18px] shrink-0 opacity-0 pointer-events-none select-none">
              spacer
            </div>

{/* CONTENT */}

<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

              {selectedNote ? (

                <>



                  {/* ============================================= */}
                  {/* EDITOR */}
                  {/* ============================================= */}

                  <div className="flex min-h-0 flex-1 overflow-hidden">
<div className="mt-[18px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-8 py-8">
                    

                      <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
                        spacer
                      </div>

{/* ============================================= */}
{/* NOTE HEADER */}
{/* ============================================= */}

<div className="flex min-w-0 items-start justify-between border-b border-white/[0.06] px-6 pb-5">

{/* =========================================== */}
{/* TITLE + LINK TRADE */}
{/* =========================================== */}

<div className="flex min-w-0 flex-1 items-center">

  {/* ========================================= */}
  {/* TITLE */}
  {/* ========================================= */}

  <div className="relative min-w-0">

    <span
      ref={
        noteTitleMeasureRef
      }
      className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre text-[28px] font-black tracking-[-0.03em]"
      aria-hidden="true"
    >
      {selectedNote.title ||
        "Note title..."}
    </span>

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
      className="relative left-[10px] translate-y-[-10px] border-none bg-transparent text-[28px] font-black tracking-[-0.03em] text-white outline-none placeholder:text-slate-600"
      style={{
        width:
          Math.max(
            noteTitleWidth + 4,
            80
          ),
      }}
    />

  </div>

  {/* ========================================= */}
  {/* NOTE ACTIONS */}
  {/* ========================================= */}

 <div className="relative flex items-center gap-2">

    {/* ========================================= */}
    {/* LINK TRADE */}
    {/* ========================================= */}

<button
  type="button"
  onClick={() =>
    setIsTradeSelectorOpen(
      (current) => !current
    )
  }
  className="relative left-[50px] mt-3 flex h-[36px] w-[92px] shrink-0 translate-y-[-10px] items-center justify-center gap-1.5 rounded-[8px] border border-white/[0.12] bg-[#0b1220] px-0 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/[0.22] hover:bg-[#0b0c1e] hover:text-white"
>

      <Plus
        size={13}
        strokeWidth={1.8}
      />

      <span>
        Link Trade
      </span>

    </button>

    {/* ========================================= */}
    {/* ADD SCREENSHOT */}
    {/* ========================================= */}

    <button
      type="button"
      title="Add screenshot"
      aria-label="Add screenshot"
      onClick={() =>
        fileInputRef.current?.click()
      }
      className="relative mt-3 flex left-[50px] h-[36px] w-[36px] shrink-0 translate-y-[-10px] items-center justify-center rounded-[8px] border border-white/[0.12] bg-[#0b1220] text-slate-300 transition-colors hover:border-white/[0.22] hover:bg-[#0b0c1e] hover:text-white"
    >

      <ImagePlus
        size={16}
        strokeWidth={1.8}
      />

    </button>

    {/* ========================================= */}
    {/* TRADE SELECTOR */}
    {/* ========================================= */}

    {isTradeSelectorOpen && (

      <div className="absolute left-[50px] top-[42px] z-50 w-[320px]">

<NoteTradeSelector
  trades={
    availableTrades
  }
  tradeLinks={
    selectedNote.tradeLinks
  }
  isOpen={
    isTradeSelectorOpen
  }
  onOpenChange={
    setIsTradeSelectorOpen
  }
  hideTrigger={
    true
  }
  onAddTrade={
    async (
      tradeId
    ) => {

      await handleAddTrade(
        tradeId
      );

      setIsTradeSelectorOpen(
        false
      );

    }
  }
  onRemoveTrade={
    handleRemoveTrade
  }
/>

      </div>

    )}

  </div>
</div>




{/* =========================================== */}
{/* SAVE STATUS */}
{/* =========================================== */}

  <div className="relative left-[-10px] flex shrink-0 translate-y-[0px] items-center gap-2 pt-2 text-xs">

    <span className="flex items-center gap-1.5 text-emerald-400">

      <span className="flex h-3 w-3 items-center justify-center rounded-full border border-emerald-400">

        <span className="text-[9px] font-bold leading-none">
          ✓
        </span>

      </span>

      Saved

    </span>

    <span className="text-slate-500">
      {getNoteTime(
        selectedNote.updatedAt
      )}
    </span>

  </div>

</div>

{/* ============================================= */}
{/* NOTE TOOLS BAR */}
{/* ============================================= */}

{tiptapEditor && (

  <div className="relative left-4 mt-4 w-[calc(100%-1rem)]">

<NoteToolsBar
  editor={
    tiptapEditor
  }

activeBlockEditor={
  activeBlockEditor
}

activeBlockId={
  activeBlockId
}

noteId={
  selectedNote.id
}

  onAddTextBlock={
    handleAddTextBlock
  }

  activeBlockStyle={
    activeBlockStyle
  }

  onBlockStyleChange={
    setActiveBlockStyle
  }

  activeAnnotationTool={
    activeAnnotationTool
  }

  onAnnotationToolChange={
    setActiveAnnotationTool
  }

  penColor={
    penColor
  }

  onPenColorChange={
    setPenColor
  }

  penWidth={
    penWidth
  }

  onPenWidthChange={
    setPenWidth
  }
/>

  </div>

)}

{/* ============================================= */}
{/* NOTE BODY */}
{/* ============================================= */}

<div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

  {/* ============================================= */}
  {/* LINKED TRADES */}
  {/* ============================================= */}

  <NoteLinkedTrades
    trades={
      availableTrades
    }
    tradeLinks={
      selectedNote.tradeLinks
    }
    onRemoveTrade={
      handleRemoveTrade
    }
  />

  {/* ============================================= */}
  {/* SCREENSHOT UPLOAD */}
  {/* ============================================= */}

  <div className="relative left-4 mt-4">

    <input
      ref={
        fileInputRef
      }
      type="file"
      accept="image/*"
      className="hidden"
      onChange={
        handleUploadAttachment
      }
    />

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
  penColor={
    penColor
  }
  penWidth={
    penWidth
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
{/* NOTE BLOCK CANVAS */}
{/* ============================================= */}

<NoteBlockCanvas
  noteId={
    selectedNote.id
  }

  blocks={
    selectedNote.blocks
  }

  onBlocksChange={
    handleBlocksChange
  }

  onActiveBlockEditorChange={(
    editor,
    blockId
  ) => {

    setActiveBlockEditor(
      editor
    );

    setActiveBlockId(
      blockId
    );

  }}

  activeBlockStyle={
    activeBlockStyle
  }
/>

  {/* ============================================= */}
  {/* TIPTAP EDITOR */}
  {/* ============================================= */}

  <div className="relative left-4 min-h-[400px]">

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
  onEditorReady={
    setTiptapEditor
  }
  onFocus={() => {
    setActiveBlockEditor(
      null
    );
  }}
/>

  </div>

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