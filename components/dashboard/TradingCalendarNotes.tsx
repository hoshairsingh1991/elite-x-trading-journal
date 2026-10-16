
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Eraser,
  FileText,
  Italic,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Palette,
  Search,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import type { Editor } from "@tiptap/core";

import DailyReviewTradeNotesEditor from "@/components/dashboard/daily-review/trade-review/DailyReviewTradeNotesEditor";
import {
  getDailyNoteFromSupabase,
  loadDailyNotesFromSupabase,
  upsertDailyNoteInSupabase,
} from "@/lib/storage/supabaseDailyNotesStorage";

interface TradingCalendarNotesProps {
  selectedDate: string | null;
  onSelectedDateChange: (date: string | null) => void;
  onNotesChanged: (date: string, hasNote: boolean) => void;
}

const TEXT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

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

function isEmptyNote(content: string): boolean {
  const plainText = content
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .trim();

  return plainText.length === 0;
}

function formatNoteDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TradingCalendarNotes({
  selectedDate,
  onSelectedDateChange,
  onNotesChanged,
}: TradingCalendarNotesProps) {
  const [activeDate, setActiveDate] = useState<string | null>(selectedDate);
  const [noteInput, setNoteInput] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);

  const [pastNotes, setPastNotes] = useState<
    { date: string; note: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("12");
  const [selectedTextColor, setSelectedTextColor] = useState("#f8fafc");

  const sizeRef = useRef<HTMLDivElement | null>(null);
  const colorRef = useRef<HTMLDivElement | null>(null);
  const requestId = useRef(0);

  const dirty = noteInput !== savedContent;

  useEffect(() => {
    setActiveDate(selectedDate);
  }, [selectedDate]);

  const loadNote = useCallback(async (date: string) => {
    const request = ++requestId.current;

    setLoadingNote(true);
    setNoteInput("");
    setSavedContent("");

    try {
      const content = await getDailyNoteFromSupabase(date);

      if (request !== requestId.current) return;

      setNoteInput(content);
      setSavedContent(content);
    } finally {
      if (request === requestId.current) {
        setLoadingNote(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!activeDate) return;

    void loadNote(activeDate);
  }, [activeDate, loadNote]);

  const refreshPastNotes = useCallback(async () => {
    const notes = await loadDailyNotesFromSupabase();

    setPastNotes(
      [...notes]
        .filter((item) => !isEmptyNote(item.note))
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  }, []);

  useEffect(() => {
    void refreshPastNotes();
  }, [refreshPastNotes]);

  useEffect(() => {
    if (!sizeOpen && !colorOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (sizeOpen && !sizeRef.current?.contains(target)) {
        setSizeOpen(false);
      }

      if (colorOpen && !colorRef.current?.contains(target)) {
        setColorOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [sizeOpen, colorOpen]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const syncFontSize = () => {
      const value = editor.getAttributes("textStyle")?.fontSize;
      setSelectedFontSize(
        typeof value === "string" ? value.replace(/px$/i, "") || "12" : "12"
      );
    };

    const syncTextColor = () => {
      const value = editor.getAttributes("textStyle")?.color;
      setSelectedTextColor(
        typeof value === "string" && value ? value : "#f8fafc"
      );
    };

    syncFontSize();
    syncTextColor();

    editor.on("selectionUpdate", syncFontSize);
    editor.on("transaction", syncFontSize);
    editor.on("selectionUpdate", syncTextColor);
    editor.on("transaction", syncTextColor);

    return () => {
      editor.off("selectionUpdate", syncFontSize);
      editor.off("transaction", syncFontSize);
      editor.off("selectionUpdate", syncTextColor);
      editor.off("transaction", syncTextColor);
    };
  }, [editor]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return pastNotes;

    return pastNotes.filter(
      (item) =>
        item.date.toLowerCase().includes(query) ||
        formatNoteDate(item.date).toLowerCase().includes(query) ||
        item.note.replace(/<[^>]*>/g, " ").toLowerCase().includes(query)
    );
  }, [pastNotes, search]);

  const closeModal = () => {
    if (dirty && !window.confirm("Discard your unsaved note changes?")) {
      return;
    }

    requestId.current += 1;
    setEditor(null);
    setSizeOpen(false);
    setColorOpen(false);
    setNoteInput("");
    setSavedContent("");
    setActiveDate(null);
    onSelectedDateChange(null);
  };

  const switchDate = async (date: string) => {
    if (date === activeDate) return;

    if (dirty && !window.confirm("Discard your unsaved note changes?")) {
      return;
    }

    setEditor(null);
    setSizeOpen(false);
    setColorOpen(false);
    setActiveDate(date);
    onSelectedDateChange(date);
  };

  const saveNote = async () => {
    if (!activeDate || saving) return;

    setSaving(true);

    try {
      const content = isEmptyNote(noteInput) ? "" : noteInput;

      await upsertDailyNoteInSupabase(activeDate, content);

      setNoteInput(content);
      setSavedContent(content);
      onNotesChanged(activeDate, content.length > 0);

      await refreshPastNotes();
    } catch (error) {
      console.error("Failed to save session note:", error);
      window.alert("Unable to save this note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!activeDate) return;

    if (!window.confirm("Delete this session note? This cannot be undone.")) {
      return;
    }

    setSaving(true);

    try {
      await upsertDailyNoteInSupabase(activeDate, "");
      setNoteInput("");
      setSavedContent("");
      onNotesChanged(activeDate, false);
      await refreshPastNotes();
    } catch (error) {
      console.error("Failed to delete session note:", error);
      window.alert("Unable to delete this note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!activeDate) return null;

  const toolbarButton =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025] text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section className="flex max-h-[92vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#0b1424] shadow-[0_25px_100px_rgba(0,0,0,0.65)]">
        <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-300">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight text-slate-100">
                Session Notes
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {formatNoteDate(activeDate)}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close session notes"
            onClick={closeModal}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_300px] md:overflow-hidden">
          <div className="flex min-h-[360px] min-w-0 flex-col border-b border-white/[0.07] p-4 sm:p-5 md:min-h-0 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
                  Note editor
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Record your trading decisions and observations.
                </p>
              </div>
              {dirty && (
                <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-2 py-1 text-[10px] font-semibold text-amber-300">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="relative z-20 flex flex-wrap items-center gap-1 rounded-t-lg border border-white/[0.07] bg-[#0e1a2d] p-2">
              <div className="relative" ref={sizeRef}>
                <button
                  type="button"
                  title="Text size"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSizeOpen((value) => !value);
                    setColorOpen(false);
                  }}
                  className="flex h-8 min-w-[64px] items-center justify-between gap-2 rounded-md border border-white/[0.07] px-2 text-xs text-slate-200 hover:bg-white/[0.05]"
                >
                  {selectedFontSize}px <ChevronDown size={12} />
                </button>

                {sizeOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-20 overflow-y-auto rounded-lg border border-white/10 bg-[#101c30] p-1 shadow-xl">
                    {TEXT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          editor?.chain().focus().setMark("textStyle", {
                            fontSize: `${size}px`,
                          }).updateAttributes("listItem", {
                            fontSize: `${size}px`,
                          }).run();
                          setSelectedFontSize(String(size));
                          setSizeOpen(false);
                        }}
                        className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-white/[0.06]"
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={colorRef}>
                <button
                  type="button"
                  title="Text color"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setColorOpen((value) => !value);
                    setSizeOpen(false);
                  }}
                  className="flex h-8 w-9 items-center justify-center rounded-md border border-white/[0.07] text-slate-300 hover:bg-white/[0.05]"
                >
                  <Palette size={15} />
                  <span
                    className="absolute bottom-[5px] h-[2px] w-3"
                    style={{ backgroundColor: selectedTextColor }}
                  />
                </button>

                {colorOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border border-white/10 bg-[#101c30] p-1 shadow-xl">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          editor?.chain().focus().setColor(color.value).run();
                          setSelectedTextColor(color.value);
                          setColorOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-white/[0.06]"
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-white/20"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-1 h-5 w-px bg-white/10" />

              <button
                type="button"
                title="Bold"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                title="Italic"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                title="Underline"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <Underline size={15} />
              </button>

              <div className="mx-1 h-5 w-px bg-white/10" />

              <button
                type="button"
                title="Bullet list"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                title="Numbered list"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered size={15} />
              </button>
              <button
                type="button"
                title="Insert divider"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              >
                <Minus size={15} />
              </button>
              <button
                type="button"
                title="Undo"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().undo().run()}
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                title="Clear formatting"
                className={toolbarButton}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
              >
                <Eraser size={15} />
              </button>
            </div>

            <div className="min-h-[220px] flex-1 overflow-y-auto rounded-b-lg border border-t-0 border-white/[0.07] bg-[#0a1322]">
              {loadingNote ? (
                <div className="flex h-full min-h-[220px] items-center justify-center gap-2 text-xs text-slate-500">
                  <LoaderCircle size={15} className="animate-spin" />
                  Loading note…
                </div>
              ) : (
                <DailyReviewTradeNotesEditor
                  content={noteInput}
                  onChange={setNoteInput}
                  onEditorReady={setEditor}
                  editable={!saving}
                />
              )}
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Notes are saved separately for each calendar date.
            </p>
          </div>

          <aside className="flex min-h-[260px] min-w-0 flex-col bg-[#0a1220] md:min-h-0">
            <div className="border-b border-white/[0.07] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                    Past Notes
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {pastNotes.length} saved{" "}
                    {pastNotes.length === 1 ? "note" : "notes"}
                  </p>
                </div>
                <FileText size={16} className="text-slate-500" />
              </div>

              <div className="relative mt-3">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search notes or dates…"
                  className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0e1a2c] pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-400/40"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredNotes.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <FileText size={22} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-medium text-slate-400">
                    {search ? "No matching notes" : "No past notes yet"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Saved notes will appear here.
                  </p>
                </div>
              ) : (
                filteredNotes.map((item) => {
                  const active = item.date === activeDate;
                  const preview = item.note
                    .replace(/<br\s*\/?>/gi, " ")
                    .replace(/<\/(p|div|li)>/gi, " ")
                    .replace(/<[^>]*>/g, " ")
                    .replace(/&nbsp;/gi, " ")
                    .replace(/\s+/g, " ")
                    .trim();

                  return (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => void switchDate(item.date)}
                      className={`mb-1 w-full rounded-lg border p-3 text-left transition ${
                        active
                          ? "border-blue-400/25 bg-blue-500/[0.09]"
                          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            active ? "text-blue-300" : "text-slate-300"
                          }`}
                        >
                          {formatNoteDate(item.date)}
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-3 break-words text-[11px] leading-4 text-slate-500">
                        {preview || "No text preview"}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-[#0d1728] px-4 py-3 sm:px-6">
          <div>
            {!isEmptyNote(noteInput) && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void deleteNote()}
                className="rounded-lg border border-red-400/15 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/[0.08] disabled:opacity-50"
              >
                Delete note
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={closeModal}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || loadingNote || !dirty}
              onClick={() => void saveNote()}
              className="flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/15 px-4 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving && <LoaderCircle size={13} className="animate-spin" />}
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
