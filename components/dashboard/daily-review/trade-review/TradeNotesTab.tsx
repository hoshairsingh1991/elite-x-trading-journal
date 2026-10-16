"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";

import {
  Bold,
  CheckCircle2,
  ChevronDown,
  Eraser,
  FileText,
  Italic,
  List,
  ListOrdered,
  Minus,
  Palette,
  Plus,
  Save,
  Undo2,
  Trash2,
  Underline,
} from "lucide-react";

import { Trade } from "@/types/trade";

import type { Editor } from "@tiptap/core";

import DailyReviewTradeNotesEditor from "@/components/dashboard/daily-review/trade-review/DailyReviewTradeNotesEditor";

import {
  createDailyReviewTradeNote,
  deleteDailyReviewTradeNote,
  loadDailyReviewTradeNotes,
  updateDailyReviewTradeNote,
} from "@/lib/storage/supabaseDailyReviewTradeNoteStorage";

import {
  DailyReviewTradeNote,
} from "@/types/dailyReviewTradeNote";



interface TradeNotesTabProps {
  trade: Trade;
}



export default function TradeNotesTab({
  trade,
}: TradeNotesTabProps) {

    const currentTradeIdRef = useRef(trade.id);

  useLayoutEffect(() => {
    currentTradeIdRef.current = trade.id;
  }, [trade.id]);

  const [note, setNote] =
    useState("");

    const [noteEditor, setNoteEditor] =
  useState<Editor | null>(null);

  const [isTextSizeOpen, setIsTextSizeOpen] =
  useState(false);

  const textSizeDropdownRef = useRef<HTMLDivElement | null>(null);

const [selectedFontSize, setSelectedFontSize] =
  useState("12");

  const [isTextColorOpen, setIsTextColorOpen] =
  useState(false);

const [selectedTextColor, setSelectedTextColor] =
  useState("#f8fafc");

const textColors = [
  { name: "White", value: "#f8fafc" },
  { name: "Slate", value: "#cbd5e1" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Cyan", value: "#22d3ee" },
  { name: "Green", value: "#4ade80" },
  { name: "Yellow", value: "#facc15" },
  { name: "Orange", value: "#fb923c" },
  { name: "Red", value: "#f87171" },
  { name: "Purple", value: "#c084fc" },
  { name: "Pink", value: "#f472b6" },
];

  useEffect(() => {
  if (!noteEditor || noteEditor.isDestroyed) {
    return;
  }

  const syncSelectedFontSize = () => {
    const fontSize =
      noteEditor.getAttributes("textStyle")?.fontSize;

    const normalizedFontSize =
      typeof fontSize === "string"
        ? fontSize.replace(/px$/i, "")
        : "";

    setSelectedFontSize(normalizedFontSize || "12");
  };

  // Read the size at the current cursor position.
  syncSelectedFontSize();

  // Update when the cursor moves or the document changes.
  noteEditor.on("selectionUpdate", syncSelectedFontSize);
  noteEditor.on("transaction", syncSelectedFontSize);

  return () => {
    noteEditor.off("selectionUpdate", syncSelectedFontSize);
    noteEditor.off("transaction", syncSelectedFontSize);
  };
}, [noteEditor]);

useEffect(() => {
  if (!isTextSizeOpen) {
    return;
  }

  const handlePointerDown = (event: PointerEvent) => {
    const dropdown = textSizeDropdownRef.current;

    if (
      dropdown &&
      !dropdown.contains(event.target as Node)
    ) {
      setIsTextSizeOpen(false);
    }
  };

  document.addEventListener("pointerdown", handlePointerDown);

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown);
  };
}, [isTextSizeOpen]);

const [noteTitle, setNoteTitle] =
  useState("");

const [activeNoteId, setActiveNoteId] =
  useState<string | null>(null);

  const [savedLocally, setSavedLocally] =
    useState(false);

  const [pastNotes, setPastNotes] =
    useState<DailyReviewTradeNote[]>([]);

    const [loadError, setLoadError] =
  useState<string | null>(null);

const [isSaving, setIsSaving] =
  useState(false);

const [deletingNoteId, setDeletingNoteId] =
  useState<string | null>(null);

const [pendingDeleteNoteId, setPendingDeleteNoteId] =
  useState<string | null>(null);

const [isConfirmingDelete, setIsConfirmingDelete] =
  useState(false);

  const [isClearConfirmationOpen, setIsClearConfirmationOpen] =
  useState(false);

const canSave =
  (
    noteTitle.trim().length > 0 ||
    note.trim().length > 0 ||
    activeNoteId !== null
  ) &&
  !isSaving;



  // =====================================================
  // LOAD EXISTING NOTES FOR SELECTED TRADE
  // =====================================================

  useEffect(() => {
    let cancelled = false;

setNoteTitle("");
setNote("");
setSavedLocally(false);
setActiveNoteId(null);
setPastNotes([]);
setLoadError(null);

    async function loadNotes() {
      if (!trade.id) {
        setPastNotes([]);
        return;
      }

      try {
        const notes =
          await loadDailyReviewTradeNotes(
            trade.id
          );

        if (!cancelled) {
          setPastNotes(notes);
          setLoadError(null);
        }
      } catch (error) {
        console.error(
          "FAILED TO LOAD DAILY REVIEW TRADE NOTES:",
          error
        );

        if (!cancelled) {
          setPastNotes([]);
          setLoadError(
            "Unable to load saved notes. Please try again."
          );
        }
      }
    }

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [trade.id]);

// =====================================================
// SAVE NOTE
// =====================================================

async function handleSave() {
  if (!canSave) {
    return;
  }

  const saveTradeId = trade.id;
  const saveNoteId = activeNoteId;
  const title = noteTitle.trim() || "Trade note";
  const content = note;

  setIsSaving(true);

  try {
    // UPDATE EXISTING NOTE
    if (saveNoteId) {
      const updatedNote = await updateDailyReviewTradeNote(
        saveNoteId,
        title,
        content
      );

      if (!updatedNote) {
        return;
      }

      // Prevent a previous trade's save from updating the current UI.
      if (currentTradeIdRef.current !== saveTradeId) {
        return;
      }

      setPastNotes((currentNotes) =>
        currentNotes.map((savedNote) =>
          savedNote.id === updatedNote.id
            ? updatedNote
            : savedNote
        )
      );

      setSavedLocally(true);
      return;
    }

    // CREATE NOTE ON FIRST SAVE
    const createdNote = await createDailyReviewTradeNote(
      saveTradeId,
      title,
      content
    );

    if (!createdNote) {
      return;
    }

    // Ignore stale results if the selected trade has changed.
    if (currentTradeIdRef.current !== saveTradeId) {
      return;
    }

    setPastNotes((currentNotes) => [
      createdNote,
      ...currentNotes,
    ]);

    setActiveNoteId(createdNote.id);
    setNoteTitle(createdNote.title);
    setSavedLocally(true);
  } catch (error) {
    console.error(
      "FAILED TO SAVE DAILY REVIEW TRADE NOTE:",
      error
    );
  } finally {
    setIsSaving(false);
  }
}


// =====================================================
// OPEN DELETE CONFIRMATION
// =====================================================

function handleDelete(noteId: string) {
  if (isSaving || deletingNoteId !== null) {
    return;
  }

  setPendingDeleteNoteId(noteId);
}

// =====================================================
// CONFIRM DELETE NOTE
// =====================================================

async function confirmDeleteNote() {
  if (
    !pendingDeleteNoteId ||
    isSaving ||
    isConfirmingDelete ||
    deletingNoteId !== null
  ) {
    return;
  }

  const noteId = pendingDeleteNoteId;

  setIsConfirmingDelete(true);

  try {
    const deleted =
      await deleteDailyReviewTradeNote(noteId);

    if (!deleted) {
      return;
    }

    // CLOSE CONFIRMATION MODAL
    setPendingDeleteNoteId(null);

    // START DELETE ANIMATION
    setDeletingNoteId(noteId);

    // REMOVE NOTE AFTER ANIMATION
    window.setTimeout(() => {
      setPastNotes((currentNotes) =>
        currentNotes.filter(
          (savedNote) => savedNote.id !== noteId
        )
      );

      // CLEAR EDITOR IF THIS NOTE WAS SELECTED
      if (activeNoteId === noteId) {
        setNoteTitle("");
        setNote("");
        setActiveNoteId(null);
        setSavedLocally(false);
      }

      setDeletingNoteId(null);
    }, 220);
  } catch (error) {
    console.error("FAILED TO DELETE DAILY REVIEW TRADE NOTE:", error);
  } finally {
    setIsConfirmingDelete(false);
  }
}

// =====================================================
// SELECT AN EXISTING NOTE
// =====================================================

function handleSelectNote(savedNote: DailyReviewTradeNote) {
  if (isSaving) {
    return;
  }

  const hasUnsavedChanges =
    !savedLocally &&
    (
      noteTitle.trim().length > 0 ||
      note.length > 0 ||
      activeNoteId !== null
    );

  if (hasUnsavedChanges) {
    const confirmed = window.confirm(
      "You have unsaved changes. Discard them and open this note?"
    );

    if (!confirmed) {
      return;
    }
  }

setNoteTitle(savedNote.title || "Trade note");
setNote(savedNote.content);
setActiveNoteId(savedNote.id);
setSavedLocally(true);
}

// =====================================================
// START A NEW NOTE
// =====================================================


function handleNewNote() {
  if (isSaving) {
    return;
  }

  const hasUnsavedChanges =
    !savedLocally &&
    (
      noteTitle.trim().length > 0 ||
      note.length > 0 ||
      activeNoteId !== null
    );

  if (hasUnsavedChanges) {
    const confirmed = window.confirm(
      "You have unsaved changes. Discard them and start a new note?"
    );

    if (!confirmed) {
      return;
    }
  }

  setNoteTitle("");
  setNote("");
  setActiveNoteId(null);
  setSavedLocally(false);
}


// =====================================================
// CLEAR EDITOR
// =====================================================

function handleClearEditor() {
  if (isSaving || note.length === 0) {
    return;
  }

  setIsClearConfirmationOpen(true);
}

// =====================================================
// CONFIRM CLEAR EDITOR
// =====================================================

function confirmClearEditor() {
  if (isSaving) {
    return;
  }

  setNote("");
  setSavedLocally(false);
  setIsClearConfirmationOpen(false);
}

return (
  <div
    className="
      flex
      h-full
      min-h-0
      w-full
      flex-col
      gap-3
      px-[14px]
      pb-5
    "
  >
    {/* TRADE NOTES */}

      <section
        className="
          flex
          h-[480px]
          shrink-0
          flex-col
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          px-5
          py-5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2.5
              translate-x-[8px]
              translate-y-[6px]
            "
          >
            <FileText
              size={17}
              strokeWidth={1.9}
              className="text-slate-200"
            />

            <h4
              className="
                text-[13px]
                font-semibold
                text-slate-100
              "
            >
              Trade Notes
            </h4>
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              translate-x-[-8px]
              translate-y-[6px]
            "
          >
            <span
              className={
                savedLocally
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {savedLocally
                ? "Saved"
                : "Draft"}
            </span>

            <CheckCircle2
              size={15}
              strokeWidth={1.8}
              className={
                savedLocally
                  ? "text-emerald-400"
                  : "text-slate-600"
              }
            />
          </div>
        </div>

        <div
          className="
            mt-3
            flex
            h-[400px]
            shrink-0
            w-[calc(100%-14px)]
            flex-col
            translate-x-[7px]
            translate-y-[12px]
            overflow-hidden
            rounded-[8px]
            border
            border-white/[0.08]
            bg-[#091521]
          "
        >



{/* TITLE TOP SPACING */}
<div className="h-[14px] shrink-0" />

{/* NOTE TITLE */}
<div className="relative box-border w-[calc(100%_-_14px)] shrink-0 translate-x-[8px]">
  <label
    htmlFor="daily-review-trade-note-title"
    className="absolute left-[12px] top-[-4px] z-10 bg-[#091521] px-1.5 text-[11px] leading-none text-slate-400"
  >
    Note Title
  </label>

  <input
    id="daily-review-trade-note-title"
    type="text"
    value={noteTitle}
    onChange={(event) => {
      setNoteTitle(event.target.value);
      setSavedLocally(false);
    }}
    placeholder="Enter a title..."
    aria-label="Note title"
    disabled={isSaving}
    maxLength={42}
style={{
  borderRadius: "6px",
  paddingLeft: "10px",
  position: "relative",
  top: "3px",
}}
className="box-border h-[30px] w-full rounded-[8px] border border-violet-400/40 bg-transparent px-3.5 pt-1 text-[13px] font-medium text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-violet-400 focus:shadow-[0_0_12px_rgba(139,92,246,0.12)]"
  />
</div>

{/* TITLE BOTTOM SPACING */}
<div className="h-[4px] shrink-0" />

        
{/* EDITOR TOOLBAR */}
<div
  className="
    relative
    z-20
    box-border
    flex
    w-[calc(100%-8px)]
    h-10
    items-center
    gap-0.5
    rounded-t-[6px]
    border-b
    border-white/[0.06]
    px-2.5
    translate-x-[8px]
    transition-all
    duration-200
    ease-out
    hover:bg-white/[0.015]
    hover:border-white/[0.12]
  "
>
{/* TEXT SIZE */}
<div
  ref={textSizeDropdownRef}
  className="relative shrink-0"
>
  <button
    type="button"
    title="Text size"
    aria-label="Text size"
    onClick={() => {
      setIsTextSizeOpen((current) => !current);
    }}
className="
  group
  relative
  flex
  h-7
  w-[52px]
  shrink-0
  items-center
  justify-between
  rounded-[6px]
  border
  border-white/[0.08]
  px-1.5
  text-[10px]
  text-slate-300
  transition-all
  duration-200
  ease-out
  hover:-translate-y-[1px]
  hover:scale-[1.02]
  hover:bg-white/[0.07]
  hover:text-white
  hover:shadow-[0_0_8px_rgba(148,163,184,0.10)]
  active:translate-y-0
  active:scale-[0.98]
"
  >
    <span className="relative left-[6px]">
      {selectedFontSize} px
    </span>

<ChevronDown
  size={12}
  className="text-slate-400 transition-colors duration-200 group-hover:text-slate-200"
/>
  </button>

  {isTextSizeOpen && (
    <div
      className="
        absolute
        left-0
        top-[32px]
        z-50
        w-[54px]
        overflow-hidden
        rounded-[8px]
        border
        border-white/[0.08]
        bg-[#0b1421]
        p-1
        shadow-[0_16px_40px_rgba(0,0,0,0.35)]
      "
    >
      {["12", "14", "16", "18", "20", "24", "28", "32"].map(
        (size) => (
          <button
            key={size}
            type="button"
            onClick={() => {
              noteEditor
                ?.chain()
                .focus()
                .setMark("textStyle", {
                  fontSize: `${size}px`,
                })
                .updateAttributes("listItem", {
                  fontSize: `${size}px`,
                })
                .run();

              setSelectedFontSize(size);
              setIsTextSizeOpen(false);
            }}
className={`
  flex
  h-[24px]
  w-full
  items-center
  justify-between
  rounded-[6px]
  px-2
  text-[11px]
  font-medium
  transition-all
  duration-200
  ease-out
  hover:translate-x-[1px]
  hover:bg-white/[0.06]
  hover:text-white
  active:scale-[0.98]
  ${
    selectedFontSize === size
      ? "bg-[#0b1730]/70 text-blue-300"
      : "text-slate-300"
  }
`}
          >
            <span className="relative left-[4px]">
  {size} px
</span>

{selectedFontSize === size && (
  <span className="relative right-[6px] text-blue-300">
    ✓
  </span>
)}
          </button>
        )
      )}
    </div>
  )}
</div>

  {/* BOLD / ITALIC / UNDERLINE */}
  <div className="flex shrink-0 items-center gap-0">
<ToolbarButton
  label="Bold"
  onClick={() => {
    noteEditor?.chain().focus().toggleBold().run();
  }}
>
  <Bold size={15} />
</ToolbarButton>

<ToolbarButton
  label="Italic"
  onClick={() => {
    noteEditor?.chain().focus().toggleItalic().run();
  }}
>
  <Italic size={16} />
</ToolbarButton>

<ToolbarButton
  label="Underline"
  onClick={() => {
    noteEditor?.chain().focus().toggleUnderline().run();
  }}
>
  <Underline size={15} />
</ToolbarButton>
  </div>

  {/* FORMATTING DIVIDER */}
  <span className="mx-1 h-5 w-px shrink-0 bg-white/[0.06]" />

{/* TEXT COLOR */}
<div className="relative shrink-0">
  <ToolbarButton
    label="Text color"
    onClick={() => {
      setIsTextColorOpen((current) => !current);
    }}
  >
    <Palette size={15} />
  </ToolbarButton>

  {isTextColorOpen && (
    <div
      className="
        absolute
        left-0
        top-[32px]
        z-50
        w-[148px]
        rounded-[8px]
        border
        border-white/[0.08]
        bg-[#0b1421]
        p-2
        shadow-[0_16px_40px_rgba(0,0,0,0.35)]
      "
    >
      <div className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
        Text Color
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {textColors.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.name}
            aria-label={`Text color: ${color.name}`}
            onClick={() => {
              noteEditor
                ?.chain()
                .focus()
                .setMark("textStyle", {
                  color: color.value,
                })
                .run();

              setSelectedTextColor(color.value);
              setIsTextColorOpen(false);
            }}
            className={`
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              border
              transition-all
              ${
                selectedTextColor === color.value
                  ? "border-white/80"
                  : "border-white/[0.08] hover:border-white/40"
              }
            `}
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: color.value,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )}
</div>

  {/* LIST DIVIDER */}
  <span className="mx-1 h-5 w-px shrink-0 bg-white/[0.06]" />

  {/* LIST / DIVIDER / NUMBERED LIST */}
  <div className="flex shrink-0 items-center gap-0">
  <ToolbarButton
  label="Bulleted list"
  onClick={() => {
    noteEditor?.chain().focus().toggleBulletList().run();
  }}
>
  <List size={16} />
</ToolbarButton>

   <ToolbarButton
  label="Horizontal divider"
  onClick={() => {
    noteEditor?.chain().focus().setHorizontalRule().run();
  }}
>
  <Minus size={16} />
</ToolbarButton>

<ToolbarButton
  label="Numbered list"
  onClick={() => {
    noteEditor?.chain().focus().toggleOrderedList().run();
  }}
>
  <ListOrdered size={16} />
</ToolbarButton>
  </div>

  {/* CLEAR EDITOR DIVIDER */}
  <span className="mx-1 h-5 w-px shrink-0 bg-white/[0.06]" />



  {/* CLEAR EDITOR BUTTON */}
  <div className="absolute right-[18px] top-1/2 flex -translate-y-1/2 items-center">
    <button
      type="button"
      onClick={handleClearEditor}
      disabled={note.length === 0 || isSaving}
      title="Clear editor"
      aria-label="Clear editor"
      className="
        group
        flex
        h-6
        w-6
        shrink-0
        items-center
        justify-center
        rounded-[5px]
        border
        border-transparent
        text-red-400
        transition-all
        duration-200
        ease-out
        hover:scale-110
        hover:border-red-400/25
        hover:bg-red-500/10
        hover:text-red-300
        hover:shadow-[0_0_12px_rgba(248,113,113,0.18)]
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-red-400/50
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      <Eraser
        size={15}
        strokeWidth={1.9}
        className="
          transition-transform
          duration-200
          group-hover:-rotate-12
          group-hover:scale-110
        "
      />
    </button>

{/* UNDO BUTTON */}
<button
  type="button"
  onClick={() => {
    noteEditor?.chain().focus().undo().run();
  }}
  disabled={!noteEditor || isSaving}
  title="Undo"
  aria-label="Undo"
  className="
    group
    relative
    left-[3px]
    flex
    h-6
    w-6
    shrink-0
    items-center
    justify-center
    rounded-[5px]
    border
    border-transparent
    text-slate-300
    transition-all
    duration-200
    ease-out
    hover:scale-110
    hover:border-slate-400/25
    hover:bg-white/[0.06]
    hover:text-white
    hover:shadow-[0_0_12px_rgba(148,163,184,0.16)]
    active:scale-95
    focus-visible:outline-none
    focus-visible:ring-1
    focus-visible:ring-slate-400/50
    disabled:cursor-not-allowed
    disabled:opacity-40
  "
>
  <Undo2
    size={15}
    strokeWidth={1.9}
    className="
      transition-transform
      duration-200
      group-hover:scale-110
    "
  />
</button>
  </div>
</div>

          <div
            className="
              box-border
              min-h-0
              flex-1
              w-full
            "
            style={{
              padding: "10px",
            }}
          >
<DailyReviewTradeNotesEditor
  content={note}
  editable={!isSaving}
  onChange={(content) => {
    setNote(content);
    setSavedLocally(false);
  }}
  onEditorReady={setNoteEditor}
/>
          </div>
        </div>

<div
  className="
    mt-3
    flex
    justify-end
    gap-2
    translate-x-[-10px]
    translate-y-[20px]
  "
>
{/* NEW NOTE */}

<button
  type="button"
  onClick={handleNewNote}
  disabled={isSaving}
  className="
    group
    relative
    flex
    h-8
    w-[84px]
    items-center
    justify-center
    gap-1
    overflow-hidden
    rounded-[7px]
    border
    border-violet-400/30
    bg-gradient-to-r
    from-violet-500/[0.14]
    to-blue-500/[0.10]
    text-[10px]
    font-semibold
    text-violet-200
    shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
    transition-all
    duration-200
    hover:border-violet-300/50
    hover:from-violet-500/25
    hover:to-blue-500/20
    hover:text-white
    hover:shadow-[0_0_12px_rgba(139,92,246,0.16)]
    active:scale-[0.97]
    disabled:cursor-not-allowed
    disabled:opacity-45
  "
>
  <Plus
    size={14}
    strokeWidth={2.2}
    className="
      text-violet-300
      transition-transform
      duration-200
      group-hover:rotate-90
      group-hover:text-white
    "
  />

  <span>New Note</span>
</button>

  {/* SAVE NOTE */}

  <button
    type="button"
    onClick={handleSave}
    disabled={!canSave}
    className="
      flex
      h-8
      w-[100px]
      items-center
      justify-center
      gap-2
      rounded-[7px]
      bg-blue-500
      px-3.5
      text-[11px]
      font-semibold
      text-white
      transition
      hover:bg-blue-400
      disabled:cursor-not-allowed
      disabled:opacity-45
    "
  >
    <Save
      size={15}
      strokeWidth={2}
    />

    {isSaving ? "Saving..." : "Save Note"}
  </button>
</div>
      </section>

{/* PAST NOTES */}

<section
  className="
    flex
    h-[210px]
    shrink-0
    flex-col
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    p-4
  "
>
  {/* HEADER */}

  <div
    className="
      flex
      shrink-0
      items-center
      gap-2.5
      translate-x-[8px]
      translate-y-[6px]
    "
  >
    <FileText
      size={17}
      strokeWidth={1.9}
      className="text-slate-200"
    />

    <h4
      className="
        text-[13px]
        font-semibold
        text-slate-100
      "
    >
      Past Notes ({pastNotes.length})
    </h4>
  </div>

  {/* NOTES LIST */}

<div
  className="
    relative
    mt-4
    min-h-0
    flex-1
    w-full
    overflow-y-auto
    left-[-4px]
  "
>
{pastNotes.length === 0 ? (
  <div
    className="
      relative
      left-[10px]
      top-[18px]
      flex
      h-[160px]
      w-[calc(100%-14px)]
      shrink-0
      items-center
      justify-center
      rounded-[7px]
      border
      border-dashed
      border-white/[0.08]
      text-center
    "
  >
    <p
      className="
        text-[11px]
        font-medium
        text-slate-400
      "
    >
      {loadError ?? "No saved notes yet"}
    </p>
  </div>
) : (
<div
  className="
    relative
    left-[8px]
    flex
    w-[calc(100%-14px)]
    flex-col
    gap-2
  "
>
        {pastNotes.map((savedNote) => {

const title =
  savedNote.title?.trim() || "Trade note";

const preview =
  savedNote.content
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|div|h[1-6])\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();


const savedDate =
  new Date(
    savedNote.updatedAt
  );

          const formattedDate =
            savedDate.toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

          const formattedTime =
            savedDate.toLocaleTimeString(
              undefined,
              {
                hour: "numeric",
                minute: "2-digit",
              }
            );

return (
  <div
    key={savedNote.id}
    role="button"
    tabIndex={0}
    aria-pressed={activeNoteId === savedNote.id}
    onClick={() => handleSelectNote(savedNote)}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelectNote(savedNote);
      }
    }}
className={`
  group
  relative
  top-[10px]
  h-[52px]
  shrink-0
  overflow-hidden
  rounded-[7px]
  border
  transform-gpu
  transition-all
  duration-200
  ease-out
  ${
    deletingNoteId === savedNote.id
      ? "translate-x-[12px] scale-95 opacity-0 pointer-events-none border-red-500/60 bg-red-500/[0.08] shadow-[0_0_16px_rgba(239,68,68,0.22)]"
      : activeNoteId === savedNote.id
        ? "border-violet-400/35 bg-violet-500/[0.06]"
        : "border-white/[0.08] bg-[#091521]"
  }
  px-3
  py-2.5
  cursor-pointer
  ${
    deletingNoteId !== savedNote.id
      ? "hover:-translate-y-[2px] hover:border-violet-300/50 hover:bg-[#0c1a2a] hover:shadow-[0_4px_14px_rgba(139,92,246,0.14)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-400/50"
      : ""
  }
`}
>
  {/* NOTE HEADER */}

<div
  className="
    flex
    
    items-start
    justify-between
    gap-3
  "
>
  {/* NOTE CONTENT */}

  <div
    className="
      relative
      left-[6px]
      top-[4px]
      min-w-0
      flex-1
    "
  >
<p
className="
  truncate
  text-[11px]
  font-semibold
  text-sky-200
  transition-colors
  duration-200
  group-hover:text-cyan-200
"
>
  {title}
</p>

    {/* NOTE PREVIEW */}

    {preview && (
      <p
        className="
          mt-1
          line-clamp-2
          text-[10px]
          leading-3.5
          text-slate-400
        "
      >
        {preview}
      </p>
    )}
  </div>

{/* DATE / TIME */}

<span
  className="
    relative
    left-[-8px]
    top-[6px]
    shrink-0
    whitespace-nowrap
    text-[9px]
    text-slate-500
  "
>
  {formattedDate}{" "}
  {formattedTime}
</span>

<button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    void handleDelete(savedNote.id);
  }}
  aria-label="Delete note"
  title="Delete note"
className="
  absolute
  right-[6px]
  top-[26px]
  flex
  h-[18px]
  w-[18px]
  items-center
  justify-center
  rounded-[4px]
  text-red-400
  opacity-0
  scale-90
  pointer-events-none
  transition-all
  duration-200
  ease-out
  hover:bg-red-500/10
  hover:text-red-300
  group-hover:opacity-100
  group-hover:scale-100
  group-hover:pointer-events-auto
  focus-visible:opacity-100
  focus-visible:scale-100
  focus-visible:pointer-events-auto
"
>
  <Trash2
    size={12}
    strokeWidth={1.9}
  />
</button>
</div>
            </div>
          );
        })}
      </div>
    )}
  </div>
      </section>

      {/* DELETE CONFIRMATION MODAL */}
      {pendingDeleteNoteId !== null &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[9999]
              flex
              items-center
              justify-center
              bg-black/75
              p-4
              backdrop-blur-[5px]
            "
            onClick={() => {
              if (!isConfirmingDelete) {
                setPendingDeleteNoteId(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-note-modal-title"
className="
  w-full
  max-w-[320px]
  min-h-[220px]
  rounded-[8px]
  border
  border-slate-700/70
  bg-gradient-to-br
  from-[#0d1625]
  to-[#080e19]
  p-6
  shadow-[0_24px_80px_rgba(0,0,0,0.65)]
  animate-in
  fade-in
  zoom-in-95
  duration-200
"
              onClick={(event) => event.stopPropagation()}
            >
              {/* CENTERED DELETE ICON */}
              <div className="flex justify-center">
                <div
className="
  relative
  left-[0px]
  top-[16px]
  flex
  h-[40px]
  w-[40px]
  items-center
  justify-center
  rounded-full
  border
  border-red-500/40
  bg-red-500/[0.09]
  text-red-400
  shadow-[0_0_35px_rgba(239,68,68,0.10)]
"
                >
                  <Trash2 size={24} strokeWidth={1.8} />
                </div>
              </div>

              {/* CENTERED TITLE */}
              <h3
                id="delete-note-modal-title"
className="
  relative
  left-[0px]
  top-[30px]
  mt-6
  text-center
  text-[20px]
  font-semibold
  tracking-tight
  text-white
"
              >
                Delete this note?
              </h3>

              {/* WARNING MESSAGE */}
              <p
className="
  relative
  left-[0px]
  top-[36px]
  mx-auto
  mt-4
  max-w-[320px]
  text-center
  text-[13px]
  leading-[22px]
  text-slate-400
"
              >
                This note will be permanently deleted.
                <span className="block">
                  This action cannot be undone.
                </span>
              </p>

              {/* DIVIDER */}
              <div
className="
  relative
  top-[44px]
  mt-7
  h-px
  w-full
  bg-gradient-to-r
  from-transparent
  via-slate-700/70
  to-transparent
"
              />

              {/* ACTION BUTTONS */}
              <div className="relative left-[30px] top-[56px] mt-6 flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPendingDeleteNoteId(null)}
                  disabled={isConfirmingDelete}
className="
  flex
  h-[36px]
  w-[100px]
  shrink-0
  items-center
  justify-center
  rounded-[8px]
  border
  border-slate-700
  bg-white/[0.02]
  px-3
  text-[12px]
  font-medium
  text-slate-300
  transition-all
  duration-200
  hover:border-slate-500
  hover:bg-white/[0.06]
  hover:text-white
  active:scale-[0.98]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void confirmDeleteNote()}
                  disabled={isConfirmingDelete}
className="
  flex
  h-[36px]
  w-[140px]
  shrink-0
  items-center
  justify-center
  gap-2
  rounded-[8px]
  border
  border-red-400/30
  bg-gradient-to-r
  from-red-600
  to-red-500
  px-3
  text-[12px]
  font-semibold
  text-white
  shadow-[0_4px_18px_rgba(239,68,68,0.15)]
  transition-all
  duration-200
  hover:from-red-500
  hover:to-red-400
  hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]
  active:scale-[0.98]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                >
                  <Trash2 size={17} strokeWidth={1.9} />
                  {isConfirmingDelete
                    ? "Deleting..."
                    : "Delete note"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CLEAR EDITOR CONFIRMATION MODAL */}
      {isClearConfirmationOpen &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[9999]
              flex
              items-center
              justify-center
              bg-black/75
              p-4
              backdrop-blur-[5px]
            "
            onClick={() => {
              if (!isSaving) {
                setIsClearConfirmationOpen(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-editor-modal-title"
              className="
                w-full
                max-w-[320px]
                min-h-[220px]
                rounded-[8px]
                border
                border-slate-700/70
                bg-gradient-to-br
                from-[#0d1625]
                to-[#080e19]
                p-6
                shadow-[0_24px_80px_rgba(0,0,0,0.65)]
                animate-in
                fade-in
                zoom-in-95
                duration-200
              "
              onClick={(event) => event.stopPropagation()}
            >
              {/* CENTERED CLEAR ICON */}
              <div className="flex justify-center">
                <div
                  className="
                    relative
                    left-[0px]
                    top-[16px]
                    flex
                    h-[40px]
                    w-[40px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-red-500/40
                    bg-red-500/[0.09]
                    text-red-400
                    shadow-[0_0_35px_rgba(239,68,68,0.10)]
                  "
                >
                  <Eraser size={24} strokeWidth={1.8} />
                </div>
              </div>

              {/* CENTERED TITLE */}
              <h3
                id="clear-editor-modal-title"
                className="
                  relative
                  left-[0px]
                  top-[30px]
                  mt-6
                  text-center
                  text-[20px]
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Clear all text?
              </h3>

              {/* WARNING MESSAGE */}
              <p
                className="
                  relative
                  left-[0px]
                  top-[36px]
                  mx-auto
                  mt-4
                  max-w-[320px]
                  text-center
                  text-[13px]
                  leading-[22px]
                  text-slate-400
                "
              >
                This will clear all text from the editor.
                <span className="block">
                  Your saved note will not be deleted.
                </span>
              </p>

              {/* DIVIDER */}
              <div
                className="
                  relative
                  top-[44px]
                  mt-7
                  h-px
                  w-full
                  bg-gradient-to-r
                  from-transparent
                  via-slate-700/70
                  to-transparent
                "
              />

              {/* ACTION BUTTONS */}
              <div className="relative left-[30px] top-[56px] mt-6 flex gap-3 sm:gap-4">
                {/* CANCEL BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    setIsClearConfirmationOpen(false)
                  }
                  disabled={isSaving}
                  className="
                    flex
                    h-[36px]
                    w-[100px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[8px]
                    border
                    border-slate-700
                    bg-white/[0.02]
                    px-3
                    text-[12px]
                    font-medium
                    text-slate-300
                    transition-all
                    duration-200
                    hover:border-slate-500
                    hover:bg-white/[0.06]
                    hover:text-white
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                {/* CONFIRM CLEAR BUTTON */}
                <button
                  type="button"
                  onClick={confirmClearEditor}
                  disabled={isSaving}
                  className="
                    flex
                    h-[36px]
                    w-[140px]
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-[8px]
                    border
                    border-red-400/30
                    bg-gradient-to-r
                    from-red-600
                    to-red-500
                    px-3
                    text-[12px]
                    font-semibold
                    text-white
                    shadow-[0_4px_18px_rgba(239,68,68,0.15)]
                    transition-all
                    duration-200
                    hover:from-red-500
                    hover:to-red-400
                    hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Eraser size={17} strokeWidth={1.9} />
                  Clear text
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>

  );
}



function ToolbarButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
<button
  type="button"
  title={label}
  aria-label={label}
  onMouseDown={(event) => event.preventDefault()}
  onClick={onClick}
className="
  flex
  h-7
  w-6
  shrink-0
  items-center
  justify-center
  rounded-[5px]
  text-slate-300
  transition-all
  duration-200
  ease-out
  hover:-translate-y-[1px]
  hover:scale-105
  hover:bg-white/[0.07]
  hover:text-white
  hover:shadow-[0_0_8px_rgba(148,163,184,0.10)]
  active:translate-y-0
  active:scale-95
"
>
      {children}
    </button>
  );
}