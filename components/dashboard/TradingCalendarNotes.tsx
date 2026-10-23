"use client";

import {
  useCallback,
  useEffect,
  useMemo,
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
  LoaderCircle,
  Minus,
  Palette,
  Plus,
  Search,
  Trash2,
  Underline,
  Undo2,
  X,
} from "lucide-react";

import type { Editor } from "@tiptap/core";

import DailyReviewTradeNotesEditor from "@/components/dashboard/daily-review/trade-review/DailyReviewTradeNotesEditor";

import {
  createDailyNoteInSupabase,
  deleteDailyNoteFromSupabase,
  loadDailyNotesFromSupabase,
  updateDailyNoteInSupabase,
  type DailyNote,
} from "@/lib/storage/supabaseDailyNotesStorage";

interface TradingCalendarNotesProps {
  selectedDate: string | null;
  onSelectedDateChange: (date: string | null) => void;
  onNotesChanged: (date: string, hasNote: boolean) => void;
}

const TEXT_SIZES = [
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
  "32",
];

const TEXT_COLORS = [
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

function getPlainNoteText(content: string): string {
  return content
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function isEmptyNote(content: string): boolean {
  return getPlainNoteText(content).length === 0;
}

function formatNoteDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return date;
  }

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatNoteTime(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMonthDay(
  date: string,
): { month: string; day: string } {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return { month: "NOTE", day: "—" };
  }

  const parsedDate = new Date(year, month - 1, day);

  return {
    month: parsedDate
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    day: String(parsedDate.getDate()).padStart(2, "0"),
  };
}

function getNoteCardText(
  content: string,
): { title: string; preview: string } {
  const plainText = getPlainNoteText(content);

  const lines = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    const title =
      lines[0].length > 42
        ? `${lines[0].slice(0, 42).trim()}…`
        : lines[0];

    return {
      title,
      preview: lines.slice(1).join(" ") || "Session notes",
    };
  }

  if (plainText.length > 72) {
    const words = plainText.split(/\s+/);
    let title = "";

    while (
      words.length > 0 &&
      `${title} ${words[0]}`.trim().length <= 36
    ) {
      title = `${title} ${words.shift()}`.trim();
    }

    return {
      title: title || "Session note",
      preview: words.join(" ") || plainText,
    };
  }

  return {
    title: "Session note",
    preview: plainText || "No text preview",
  };
}

export default function TradingCalendarNotes({
  selectedDate,
  onSelectedDateChange,
  onNotesChanged,
}: TradingCalendarNotesProps) {
  const [activeDate, setActiveDate] =
    useState<string | null>(selectedDate);

const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
const [noteInput, setNoteInput] = useState("");
const [noteTitle, setNoteTitle] = useState("");
const [savedContent, setSavedContent] = useState("");
const [savedTitle, setSavedTitle] = useState("");


  const [editor, setEditor] = useState<Editor | null>(null);

const [pastNotes, setPastNotes] = useState<DailyNote[]>([]);
const [isLoadingPastNotes, setIsLoadingPastNotes] = useState(true);
  const [search, setSearch] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isTextSizeOpen, setIsTextSizeOpen] =
    useState(false);

  const [isTextColorOpen, setIsTextColorOpen] =
    useState(false);

  const [isClearConfirmationOpen, setIsClearConfirmationOpen] =
    useState(false);

    const [pendingDeleteDate, setPendingDeleteDate] =
  useState<string | null>(null);

const [deletingNoteDate, setDeletingNoteDate] =
  useState<string | null>(null);

const [isConfirmingDelete, setIsConfirmingDelete] =
  useState(false);

  const [selectedFontSize, setSelectedFontSize] =
    useState("12");

  const [selectedTextColor, setSelectedTextColor] =
    useState("#f8fafc");

  const [visibleNoteCount, setVisibleNoteCount] =
    useState(8);

  const textSizeDropdownRef =
    useRef<HTMLDivElement | null>(null);

  const textColorDropdownRef =
    useRef<HTMLDivElement | null>(null);

  const requestId = useRef(0);

const dirty =
  noteInput !== savedContent ||
  noteTitle !== savedTitle;

const savedLocally =
  activeNoteId !== null && !dirty;

useEffect(() => {
  setActiveDate(selectedDate);
  setActiveNoteId(null);
  setNoteInput("");
  setNoteTitle("");
  setSavedContent("");
  setSavedTitle("");
  setIsTextSizeOpen(false);
  setIsTextColorOpen(false);
  setIsClearConfirmationOpen(false);
}, [selectedDate]);

const refreshPastNotes = useCallback(async () => {
  setIsLoadingPastNotes(true);

  try {
    const notes = await loadDailyNotesFromSupabase();

    setPastNotes(
      [...notes]
        .filter(
          (item) =>
            item.title.trim().length > 0 ||
            !isEmptyNote(item.note),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
  } catch (error) {
    console.error("Failed to load daily notes:", error);
  } finally {
    setIsLoadingPastNotes(false);
  }
}, []);

  useEffect(() => {
    void refreshPastNotes();
  }, [refreshPastNotes]);

  useEffect(() => {
    if (!isTextSizeOpen && !isTextColorOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        isTextSizeOpen &&
        !textSizeDropdownRef.current?.contains(target)
      ) {
        setIsTextSizeOpen(false);
      }

      if (
        isTextColorOpen &&
        !textColorDropdownRef.current?.contains(target)
      ) {
        setIsTextColorOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, [isTextSizeOpen, isTextColorOpen]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const syncSelectedFontSize = () => {
      const fontSize =
        editor.getAttributes("textStyle")?.fontSize;

      const normalizedFontSize =
        typeof fontSize === "string"
          ? fontSize.replace(/px$/i, "")
          : "";

      setSelectedFontSize(normalizedFontSize || "12");
    };

    const syncSelectedTextColor = () => {
      const currentColor =
        editor.getAttributes("textStyle")?.color;

      setSelectedTextColor(
        typeof currentColor === "string" && currentColor
          ? currentColor
          : "#f8fafc",
      );
    };

    syncSelectedFontSize();
    syncSelectedTextColor();

    editor.on("selectionUpdate", syncSelectedFontSize);
    editor.on("transaction", syncSelectedFontSize);
    editor.on("selectionUpdate", syncSelectedTextColor);
    editor.on("transaction", syncSelectedTextColor);

    return () => {
      editor.off("selectionUpdate", syncSelectedFontSize);
      editor.off("transaction", syncSelectedFontSize);
      editor.off("selectionUpdate", syncSelectedTextColor);
      editor.off("transaction", syncSelectedTextColor);
    };
  }, [editor]);

const notesForActiveDate = useMemo(
  () => pastNotes.filter((item) => item.date === activeDate),
  [pastNotes, activeDate],
);

const filteredNotes = useMemo(() => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return notesForActiveDate;
  }

  return notesForActiveDate.filter((item) => {
    const cardText = getNoteCardText(item.note);

return (
  item.date.toLowerCase().includes(query) ||
  formatNoteDate(item.date).toLowerCase().includes(query) ||
  item.title.toLowerCase().includes(query) ||
  cardText.title.toLowerCase().includes(query) ||
  getPlainNoteText(item.note).toLowerCase().includes(query)
);
  });
}, [notesForActiveDate, search]);

  const closeModal = () => {
    if (
      dirty &&
      !window.confirm("Discard your unsaved note changes?")
    ) {
      return;
    }

    requestId.current += 1;

    setEditor(null);
    setIsTextSizeOpen(false);
    setIsTextColorOpen(false);
    setIsClearConfirmationOpen(false);
    setNoteInput("");
    setSavedContent("");
    setActiveDate(null);

    onSelectedDateChange(null);
  };

  const switchDate = (date: string) => {
    if (date === activeDate) {
      return;
    }

    if (
      dirty &&
      !window.confirm("Discard your unsaved note changes?")
    ) {
      return;
    }

    setEditor(null);
    setIsTextSizeOpen(false);
    setIsTextColorOpen(false);
    setActiveDate(date);

    onSelectedDateChange(date);
  };


const openPastNote = (note: DailyNote) => {
  if (
    saving ||
    loadingNote ||
    isConfirmingDelete ||
    deletingNoteDate !== null
  ) {
    return;
  }

  if (
    dirty &&
    !window.confirm(
      "Discard your unsaved changes and open this note?",
    )
  ) {
    return;
  }

  setActiveDate(note.date);
  setActiveNoteId(note.id);
  setNoteTitle(note.title);
  setSavedTitle(note.title);
  setNoteInput(note.note);
  setSavedContent(note.note);

  if (editor && !editor.isDestroyed) {
    editor.commands.setContent(note.note || "");
  }

  setIsTextSizeOpen(false);
  setIsTextColorOpen(false);
  setIsClearConfirmationOpen(false);
};

const handleNewNote = () => {
  if (
    !activeDate ||
    saving ||
    loadingNote ||
    isConfirmingDelete ||
    deletingNoteDate !== null
  ) {
    return;
  }

  if (
    dirty &&
    !window.confirm(
      "Discard your unsaved changes and start a new note?",
    )
  ) {
    return;
  }

  setActiveNoteId(null);
  setNoteInput("");
  setNoteTitle("");
  setSavedContent("");
  setSavedTitle("");
  setEditor(null);
  setIsTextSizeOpen(false);
  setIsTextColorOpen(false);
  setIsClearConfirmationOpen(false);
};

const saveNote = async () => {
  if (!activeDate || saving || loadingNote) {
    return;
  }

  const content = isEmptyNote(noteInput) ? "" : noteInput;
  const title = noteTitle.trim();

  if (!title && !content) {
    window.alert("Add a title or some note content before saving.");
    return;
  }

  setSaving(true);

  try {
    const savedNote = activeNoteId
      ? await updateDailyNoteInSupabase(
          activeNoteId,
          activeDate,
          title,
          content,
        )
      : await createDailyNoteInSupabase(
          activeDate,
          title,
          content,
        );

    if (!savedNote) {
      window.alert("Unable to save this note. Please try again.");
      return;
    }

    setActiveNoteId(savedNote.id);
    setNoteTitle(savedNote.title);
    setSavedTitle(savedNote.title);
    setNoteInput(savedNote.note);
    setSavedContent(savedNote.note);

    onNotesChanged(activeDate, true);

    await refreshPastNotes();
  } catch (error) {
    console.error("Failed to save session note:", error);

    window.alert("Unable to save this note. Please try again.");
  } finally {
    setSaving(false);
  }
};

const deleteNote = async () => {
  if (!activeNoteId || !activeDate || saving || loadingNote) {
    return;
  }

  if (
    !window.confirm(
      "Delete this session note? This cannot be undone.",
    )
  ) {
    return;
  }

  setSaving(true);

  try {
    const deleted = await deleteDailyNoteFromSupabase(activeNoteId);

    if (!deleted) {
      window.alert("Unable to delete this note. Please try again.");
      return;
    }

    const hasOtherNotes = pastNotes.some(
      (item) =>
        item.id !== activeNoteId &&
        item.date === activeDate,
    );

    setActiveNoteId(null);
    setNoteInput("");
    setNoteTitle("");
    setSavedContent("");
    setSavedTitle("");

    if (editor && !editor.isDestroyed) {
      editor.commands.clearContent();
    }

    onNotesChanged(activeDate, hasOtherNotes);

    await refreshPastNotes();
  } catch (error) {
    console.error("Failed to delete session note:", error);

    window.alert("Unable to delete this note. Please try again.");
  } finally {
    setSaving(false);
  }
};

// OPEN PAST NOTE DELETE CONFIRMATION
const requestDeletePastNote = (noteId: string) => {
  if (
    saving ||
    loadingNote ||
    isConfirmingDelete ||
    deletingNoteDate !== null
  ) {
    return;
  }

  setPendingDeleteDate(noteId);
};

// CONFIRM DELETE PAST NOTE
const confirmDeletePastNote = async () => {
  const noteId = pendingDeleteDate;

  if (
    !noteId ||
    saving ||
    loadingNote ||
    isConfirmingDelete ||
    deletingNoteDate !== null
  ) {
    return;
  }

  const noteToDelete = pastNotes.find(
    (note) => note.id === noteId,
  );

  if (!noteToDelete) {
    setPendingDeleteDate(null);
    return;
  }

  setIsConfirmingDelete(true);

  try {
    const deleted = await deleteDailyNoteFromSupabase(noteId);

    if (!deleted) {
      window.alert(
        "Unable to delete this note. Please try again.",
      );
      return;
    }

    // Close confirmation and start the exit animation.
    setPendingDeleteDate(null);
    setDeletingNoteDate(noteId);

    // Keep the calendar indicator if another note shares this date.
    const hasOtherNotes = pastNotes.some(
      (note) =>
        note.id !== noteId &&
        note.date === noteToDelete.date,
    );

    onNotesChanged(noteToDelete.date, hasOtherNotes);

    // Clear the editor only if this exact note is active.
    if (activeNoteId === noteId) {
      if (editor && !editor.isDestroyed) {
        editor.commands.clearContent();
      }

      setActiveNoteId(null);
      setNoteInput("");
      setNoteTitle("");
      setSavedContent("");
      setSavedTitle("");
    }

    // Let the 220ms exit animation finish.
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 220);
    });

    // Remove only this note from the sidebar.
    setPastNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId),
    );

    setDeletingNoteDate(null);
  } catch (error) {
    console.error(
      "Failed to delete past session note:",
      error,
    );

    window.alert(
      "Unable to delete this note. Please try again.",
    );
  } finally {
    setIsConfirmingDelete(false);
  }
};

const handleClearEditor = () => {
  if (
    saving ||
    loadingNote ||
    isEmptyNote(noteInput)
  ) {
    return;
  }

  setIsClearConfirmationOpen(true);
};

const confirmClearEditor = () => {
  if (saving) {
    return;
  }

  if (editor && !editor.isDestroyed) {
    editor.chain().focus().clearContent().run();
  } else {
    setNoteInput("");
  }

  setIsClearConfirmationOpen(false);
};

if (!activeDate) {
  return null;
}

const toolbarButton =
  "flex h-7 w-6 shrink-0 items-center justify-center rounded-[5px] text-slate-300 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:scale-105 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_8px_rgba(148,163,184,0.10)] active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400/50 disabled:cursor-not-allowed disabled:opacity-40";

const visibleNotes = filteredNotes.slice(
  0,
  visibleNoteCount,
);

const savedStatus = saving
  ? "Saving changes…"
  : dirty
    ? "Unsaved changes"
    : isLoadingPastNotes
      ? "Loading notes…"
      : notesForActiveDate.length === 0
        ? "No saved notes for this date"
        : `${notesForActiveDate.length} ${
            notesForActiveDate.length === 1 ? "note" : "notes"
          } saved for this date`;

return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/75
        p-3
        backdrop-blur-sm
        sm:p-5
        lg:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      {/* SESSION NOTES MODAL */}
      <section
        className="
          flex
          h-[60vh]
          max-h-[660px]
          w-[60vw]
          max-w-[920px]
          flex-col
          overflow-hidden
          rounded-[8px]
          border
          border-[#1a314a]
          bg-[#081321]
          shadow-[0_28px_100px_rgba(0,0,0,0.72)]
        "
      >
        {/* OUTER MODAL HEADER */}
        <header
          className="
            relative
            flex
            shrink-0
            items-center
            justify-between
            px-5
            py-3
            sm:px-6
          "
        >
          {/* SESSION NOTES ICON, TITLE AND DATE */}
          <div
            className="
              relative
              left-[8px]
              top-[4px]
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {/* ICON */}
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-[8px]
                border
                border-[#203954]
                bg-[#0b1a2d]
                text-[#38a8ff]
              "
            >
              <FileText size={22} strokeWidth={1.8} />
            </div>

            {/* TITLE AND DATE */}
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
                Session Notes
              </h2>

              <p className="mt-0.5 truncate text-xs font-medium text-[#91afd3] sm:text-sm">
                {formatNoteDate(activeDate)}
              </p>
            </div>
          </div>

{/* HEADER ACTIONS: NEW NOTE + CLOSE */}
<div className="relative right-[10px] top-[4px] flex shrink-0 items-center gap-2">
{/* NEW NOTE BUTTON */}
<button
  type="button"
  onClick={handleNewNote}
  disabled={saving || loadingNote}
  className="
    group
    relative
    overflow-hidden
    flex
    h-8
    w-[90px]
      shrink-0
      items-center
      justify-center
      gap-1.5
      rounded-[8px]
      border
      border-violet-400/30
      bg-gradient-to-r
      from-violet-500/[0.14]
      to-blue-500/[0.10]
      text-[11px]
      font-semibold
      text-violet-200
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

  {/* CLOSE BUTTON */}
  <button
    type="button"
    aria-label="Close session notes"
    onClick={closeModal}
    className="
      flex
      h-8
      w-8
      shrink-0
      items-center
      justify-center
      rounded-[8px]
      border
      border-[#20344c]
      bg-[#0b192a]
      text-slate-300
      transition-all
      duration-200
      hover:border-blue-400/35
      hover:bg-blue-500/10
      hover:text-white
      active:scale-95
    "
  >
    <X size={17} strokeWidth={1.7} />
  </button>
</div>

          {/* HEADER DIVIDER */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              bottom-[-8px]
              h-px
              bg-[#1a2b40]
            "
          />
        </header>

        {/* EDITOR AND PAST NOTES */}
        <div
          className="
            grid
            min-h-0
            flex-1
            grid-cols-1
            gap-3
            overflow-y-auto
            px-3
            py-2.5
            sm:px-4
            md:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]
            md:grid-rows-[minmax(0,1fr)]
            md:overflow-hidden
          "
        >
          {/* MAIN EDITOR OUTER CARD */}
<div
  className="
    flex
    h-[calc(100%_-_22px)]
    min-h-0
    min-w-0
    w-[100%]
    translate-y-[14px]
    translate-x-[5px]
    flex-col
    justify-self-center
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    px-3
    py-3
  "
>
            {/* SEPARATE EDITOR HEADER */}
            <div
              className="
                flex
                shrink-0
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
                  {savedLocally ? "Saved" : "Draft"}
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

{/* INSET EDITOR SURFACE — SAME IDEA AS TRADE NOTES */}
<div
className="
  relative
  mt-3
  flex
  h-[calc(100%_-_36px)]
  translate-y-[10px]
  max-h-full
  max-w-full
  min-h-0
  w-[calc(100%-16px)]
  shrink-0
  translate-x-[8px]
  flex-col
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
<div className="relative box-border w-[calc(100%-14px)] shrink-0 translate-x-[8px]">
  <label
    htmlFor="session-note-title"
    className="absolute left-[12px] top-[-4px] z-10 bg-[#091521] px-1.5 text-[11px] leading-none text-slate-400"
  >
    Note Title
  </label>

  <input
    id="session-note-title"
    type="text"
    value={noteTitle}
    onChange={(event) => setNoteTitle(event.target.value)}
    placeholder="Enter a title..."
    aria-label="Note title"
    maxLength={40}
    disabled={saving || loadingNote}
    style={{
      borderRadius: "6px",
      paddingLeft: "10px",
    }}
    className="relative top-[3px] box-border h-[30px] w-full rounded-[8px] border border-violet-400/40 bg-transparent px-3.5 pt-1 text-[13px] font-medium text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-violet-400 focus:shadow-[0_0_12px_rgba(139,92,246,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
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
                  h-10
                  w-[calc(100%-8px)]
                  shrink-0
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
                  hover:border-white/[0.12]
                  hover:bg-white/[0.015]
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
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() => {
                      setIsTextSizeOpen((current) => !current);
                      setIsTextColorOpen(false);
                    }}
                    disabled={!editor || saving || loadingNote}
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
                      disabled:cursor-not-allowed
                      disabled:opacity-40
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
                      {TEXT_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onMouseDown={(event) =>
                            event.preventDefault()
                          }
                          onClick={() => {
                            editor
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
                      ))}
                    </div>
                  )}
                </div>

                {/* BOLD / ITALIC / UNDERLINE */}
                <div className="flex shrink-0 items-center gap-1">
                  <ToolbarButton
                    label="Bold"
                    disabled={!editor || saving}
                    onClick={() =>
                      editor?.chain().focus().toggleBold().run()
                    }
                  >
                    <Bold size={15} />
                  </ToolbarButton>

                  <ToolbarButton
                    label="Italic"
                    disabled={!editor || saving}
                    onClick={() =>
                      editor?.chain().focus().toggleItalic().run()
                    }
                  >
                    <Italic size={16} />
                  </ToolbarButton>

                  <ToolbarButton
                    label="Underline"
                    disabled={!editor || saving}
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                  >
                    <Underline size={15} />
                  </ToolbarButton>
                </div>

                {/* FORMATTING DIVIDER */}
                <span className="mx-1 h-5 w-px shrink-0 bg-white/[0.06]" />

                {/* TEXT COLOR */}
                <div
                  className="relative shrink-0"
                  ref={textColorDropdownRef}
                >
                  <ToolbarButton
                    label="Text color"
                    disabled={!editor || saving}
                    onClick={() => {
                      setIsTextColorOpen((current) => !current);
                      setIsTextSizeOpen(false);
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
                        {TEXT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            title={color.name}
                            aria-label={`Text color: ${color.name}`}
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() => {
                              editor
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
                    disabled={!editor || saving}
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List size={16} />
                  </ToolbarButton>

                  <ToolbarButton
                    label="Horizontal divider"
                    disabled={!editor || saving}
                    onClick={() =>
                      editor?.chain().focus().setHorizontalRule().run()
                    }
                  >
                    <Minus size={16} />
                  </ToolbarButton>

                  <ToolbarButton
                    label="Numbered list"
                    disabled={!editor || saving}
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered size={16} />
                  </ToolbarButton>
                </div>

                {/* CLEAR AND UNDO CONTROLS */}
                <div className="absolute right-[18px] top-1/2 flex -translate-y-1/2 items-center">
                  <button
                    type="button"
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={handleClearEditor}
                    disabled={
                      isEmptyNote(noteInput) ||
                      saving ||
                      loadingNote
                    }
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

                  <button
                    type="button"
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() =>
                      editor?.chain().focus().undo().run()
                    }
                    disabled={!editor || saving}
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

              {/* EDITOR CONTENT */}
              <div
                className="
                  box-border
                  min-h-0
                  flex-1
                  w-full
                  overflow-y-auto
                "
                style={{ padding: "10px" }}
              >
                {loadingNote ? (
                  <div className="flex h-full min-h-[180px] items-center justify-center gap-2 text-xs text-slate-500">
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                    Loading note…
                  </div>
                ) : (
                  <DailyReviewTradeNotesEditor
                    content={noteInput}
                    editable={!saving}
                    onChange={setNoteInput}
                    onEditorReady={setEditor}
                  />
                )}
              </div>
            </div>
          </div>

{/* PAST NOTES */}
<aside
  className="
    flex
    h-[calc(100%_-_24px)]
    min-h-0
    min-w-0
    w-[97%]
    translate-y-[14px]
    translate-x-[-2px]
    flex-col
    justify-self-center
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
  "
>
            {/* PAST NOTES HEADER */}
            <div
              className="
                relative
                flex
                shrink-0
                items-center
                justify-between
                gap-2
                px-3
                py-3
              "
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  size={17}
                  strokeWidth={1.9}
                  className="
                    relative
                    left-[6px]
                    top-[5px]
                    shrink-0
                    text-slate-200
                  "
                />

                <h4
                  className="
                    relative
                    left-[4px]
                    top-[5px]
                    whitespace-nowrap
                    text-[13px]
                    font-semibold
                    text-slate-100
                  "
                >
                  Past Notes ({notesForActiveDate.length})
                </h4>
              </div>

{/* SAVE STATUS — PAST NOTES HEADER */}
<div
  className={`
    relative
    top-[4px]
    left-[-14px]
    flex
    shrink-0
    items-center
    gap-2
    text-[10px]
    ${
      dirty
        ? "text-amber-300"
        : "text-slate-500"
    }
  `}
>
  <span>{savedStatus}</span>

  <span
    className={`
      h-1.5
      w-1.5
      shrink-0
      rounded-full
      ${
        saving
          ? "animate-pulse bg-blue-400"
          : dirty
            ? "bg-amber-400"
            : "bg-emerald-400"
      }
    `}
  />
</div>

              {/* PAST NOTES HEADER DIVIDER */}
              <div
                aria-hidden="true"
                className="
                  absolute
                  inset-x-0
                  bottom-[-10px]
                  h-px
                  bg-white/[0.06]
                "
              />
            </div>

            {/* PAST NOTES LIST */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pt-5 pb-2">
              {isLoadingPastNotes ? (
  <div className="flex min-h-[140px] items-center justify-center">
    <LoaderCircle
      size={18}
      className="animate-spin text-slate-500"
    />
  </div>
) : visibleNotes.length === 0 ? (
                <div
                  className="
                  relative
                  left-[8px]
                  top-[18px]
                  flex
                    min-h-[140px]
                    mx-auto
                    w-[95%]
                    items-center
                    justify-center
                    rounded-[7px]
                    border
                    border-dashed
                    border-white/[0.08]
                    px-3
                    text-center
                  "
                >
                  <div className="flex w-full flex-col items-center justify-center">
                    <FileText
                      size={22}
                      className="relative top-[-8px] mx-auto mb-2 text-slate-600"
                    />

                    <p className="text-[11px] font-medium text-slate-400">
                      {search
                        ? "No matching notes"
                        : "No saved notes yet"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Saved notes will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div
  className="
    relative
    top-[18px]
    flex
    w-full
    flex-col
    gap-1.5
  "
>
                  {visibleNotes.map((item) => {
                    const active = item.id === activeNoteId;
const cardText = getNoteCardText(item.note);

const previewText = item.title.trim()
  ? getPlainNoteText(item.note) || "No text preview"
  : cardText.preview;

const itemDate = getMonthDay(item.date);

return (
  <div
    key={item.id}
    role="button"
    tabIndex={0}
    aria-pressed={active}
    onClick={() => openPastNote(item)}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPastNote(item);
      }
    }}
    className={`
                          group
                          relative
                          flex
                          min-h-[58px]
                        w-[96%]
self-center
items-center
gap-4
                          overflow-hidden
                          rounded-[8px]
                          border
                          px-2
                          py-1.5
                          text-left
                          transform-gpu
                          transition-all
                          duration-200
                          ease-out
${
  deletingNoteDate === item.id
    ? "translate-x-[12px] scale-95 opacity-0 pointer-events-none border-red-500/60 bg-red-500/[0.08] shadow-[0_0_16px_rgba(239,68,68,0.22)]"
    : active
      ? "border-blue-300/45 bg-gradient-to-r from-blue-500/[0.14] via-violet-500/[0.07] to-[#091521] shadow-[inset_3px_0_0_rgba(96,165,250,0.65),0_0_14px_rgba(59,130,246,0.08)]"
      : "border-white/[0.08] bg-[#091521] hover:-translate-y-[1px] hover:border-blue-300/35 hover:bg-[#0c1a2a] hover:shadow-[0_4px_14px_rgba(59,130,246,0.10)] active:translate-y-0 active:scale-[0.99]"
}
                        `}
                      >
<span
  className={`
    relative
    left-[8px]
    flex
    h-10
    w-10
    shrink-0
    flex-col
    items-center
    justify-center
    rounded-[8px]
    border
${
  active
    ? "border-blue-400/35 bg-gradient-to-br from-blue-500/[0.24] via-violet-500/[0.18] to-cyan-500/[0.10] shadow-[0_0_12px_rgba(96,165,250,0.08)]"
    : "border-white/[0.08] bg-gradient-to-br from-[#14243a] via-[#101b2c] to-[#0b1625]"
}
  `}
>
                          <span className="text-[9px] font-semibold leading-3 text-sky-300">
                            {itemDate.month}
                          </span>

                          <span className="text-[17px] font-semibold leading-[18px] text-slate-100">
                            {itemDate.day}
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={`
                              block
                              whitespace-nowrap
                              text-[11px]
                              font-semibold
                              transition-colors
                              duration-200
                              ${
                                active
                                  ? "text-sky-200"
                                  : "text-slate-200 group-hover:text-cyan-200"
                              }
                            `}
                          >
                           {item.title.trim() || cardText.title}
                          </span>

                          <span className="relative top-[4px] mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-3.5 text-slate-400">
                            {previewText}
                          </span>
                        </span>

                     <span className="relative left-[36px] top-[8px] shrink-0 self-start pt-0.5 text-[9px] font-medium tabular-nums text-slate-400">
  {formatNoteTime(item.updated_at)}
</span>
                        <button
  type="button"
  aria-label={`Delete note from ${item.date}`}
  title="Delete note"
  disabled={
    saving ||
    loadingNote ||
    isConfirmingDelete ||
    deletingNoteDate !== null
  }
  onClick={(event) => {
    event.stopPropagation();
    requestDeletePastNote(item.id);
  }}
className="
relative
right-1
top-[10px]
flex
h-7
w-7
shrink-0
    items-center
    justify-center
    rounded-[8px]
    border
    border-transparent
    text-slate-500
    opacity-0
    scale-90
    transition-all
    duration-200
    ease-out
    group-hover:opacity-100
    group-hover:scale-100
    hover:border-red-400/25
    hover:bg-red-500/[0.10]
    hover:text-red-300
    focus-visible:opacity-100
    focus-visible:scale-100
    focus-visible:outline-none
    focus-visible:ring-1
    focus-visible:ring-red-400/50
    disabled:pointer-events-none
    disabled:opacity-40
  "
>
  <Trash2 size={14} />
</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredNotes.length > visibleNoteCount && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleNoteCount((count) => count + 8)
                  }
                  className="
                    mt-2
                    flex
                    h-8
                    w-full
                    items-center
                    justify-center
                    rounded-md
                    text-[11px]
                    font-medium
                    text-slate-400
                    transition-all
                    duration-200
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  Load more notes
                  <ChevronDown
                    size={13}
                    className="ml-1"
                  />
                </button>
              )}
            </div>
          </aside>
        </div>

{/* MODAL FOOTER */}
<footer
  className="
    relative
    flex
    h-[44px]
    shrink-0
    flex-none
    flex-wrap
    items-end
    justify-between
    gap-3
    border-t
    border-[#1a2b40]
    bg-[#091626]
    px-4
    py-3
    sm:px-5
  "
>
{/* RESERVED SPACE FOR HEADER NEW NOTE BUTTON */}
<div
  aria-hidden="true"
  className="
    relative
    left-[10px]
    top-[-5px]
    invisible
    h-[32px]
    w-[100px]
    flex-none
  "
/>



<div className="ml-auto flex items-center gap-5">
  <button
    type="button"
    disabled={saving}
    onClick={closeModal}
    className="
      relative
      left-[-0px]
      top-[-5px]
      flex
      h-[32px]
      w-[70px]
      flex-none
      items-center
      justify-center
      rounded-[8px]
      border
      border-slate-700
      bg-white/[0.02]
      text-[11px]
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
  disabled={saving || loadingNote}
  onClick={() => void saveNote()}
  className="
    relative
    left-[-10px]
    top-[-5px]
    flex
    h-[32px]
    w-[100px]
    flex-none
    items-center
    justify-center
    gap-1.5
    rounded-[8px]
    border
    border-blue-400/20
    bg-blue-500
    text-[11px]
    font-semibold
    text-white
    transition-all
    duration-200
    hover:bg-blue-400
    hover:shadow-[0_0_12px_rgba(59,130,246,0.18)]
    active:scale-[0.98]
    disabled:cursor-not-allowed
    disabled:opacity-45
  "
>
  {saving ? (
    <LoaderCircle
      size={13}
      className="animate-spin"
    />
  ) : (
    <CheckCircle2 size={14} />
  )}

  {saving ? "Saving…" : "Save Notes"}
</button>
          </div>
        </footer>
      </section>

{/* PAST NOTE DELETE CONFIRMATION MODAL */}
{pendingDeleteDate !== null &&
  createPortal(
    <div
      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-center
        justify-center
        bg-black/75
        p-4
        backdrop-blur-[5px]
      "
      onClick={() => {
        if (!isConfirmingDelete) {
          setPendingDeleteDate(null);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-past-note-modal-title"
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

        {/* TITLE */}
        <h3
          id="delete-past-note-modal-title"
          className="
            relative
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
          This saved session note will be permanently deleted.
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
        <div
          className="
            relative
            left-[30px]
            top-[56px]
            mt-6
            flex
            gap-3
            sm:gap-4
          "
        >
          <button
            type="button"
            onClick={() => setPendingDeleteDate(null)}
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
            onClick={() => void confirmDeletePastNote()}
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
            {isConfirmingDelete ? "Deleting..." : "Delete note"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )}

      {/* CLEAR EDITOR CONFIRMATION */}
      {isClearConfirmationOpen &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[10000]
              flex
              items-center
              justify-center
              bg-black/75
              p-4
              backdrop-blur-[5px]
            "
            onClick={() => {
              if (!saving) {
                setIsClearConfirmationOpen(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-editor-modal-title"
              className="
                min-h-[220px]
                w-full
                max-w-[320px]
                rounded-[8px]
                border
                border-slate-700/70
                bg-gradient-to-br
                from-[#0d1625]
                to-[#080e19]
                p-6
                shadow-[0_24px_80px_rgba(0,0,0,0.65)]
              "
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex justify-center">
                <div
                  className="
                    relative
                    top-[10px]
                    flex
                    h-10
                    w-10
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

              <h3
                id="clear-editor-modal-title"
                className="
                  relative
                  top-[18px]
                  mt-4
                  text-center
                  text-[20px]
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Clear all text?
              </h3>

              <p
                className="
                  relative
                  top-[20px]
                  mx-auto
                  mt-3
                  max-w-[280px]
                  text-center
                  text-[12px]
                  leading-[20px]
                  text-slate-400
                "
              >
                This will clear all text from the editor.
                <span className="block">
                  Your saved note will not be deleted.
                </span>
              </p>

              <div
                className="
                  relative
                  top-[24px]
                  mt-5
                  h-px
                  w-full
                  bg-gradient-to-r
                  from-transparent
                  via-slate-700/70
                  to-transparent
                "
              />

              <div className="relative top-[28px] mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setIsClearConfirmationOpen(false)
                  }
                  disabled={saving}
                  className="
                    flex
                    h-9
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
                  onClick={confirmClearEditor}
                  disabled={saving}
                  className="
                    flex
                    h-9
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
          document.body,
        )}
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  onClick,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className="
        flex
        h-7
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
        hover:-translate-y-[1px]
        hover:scale-105
        hover:border-slate-400/25
        hover:bg-white/[0.07]
        hover:text-white
        hover:shadow-[0_0_8px_rgba(148,163,184,0.10)]
        active:translate-y-0
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-slate-400/50
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      {children}
    </button>
  );
}