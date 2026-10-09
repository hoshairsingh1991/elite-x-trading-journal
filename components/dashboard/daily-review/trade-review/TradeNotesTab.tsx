"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Bold,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Italic,
  Link,
  List,
  Plus,
  Save,
  Trash2,
  Underline,
} from "lucide-react";

import { Trade } from "@/types/trade";

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


  const [note, setNote] =
    useState("");

const [activeNoteId, setActiveNoteId] =
  useState<string | null>(null);

  const [savedLocally, setSavedLocally] =
    useState(false);

  const [pastNotes, setPastNotes] =
    useState<DailyReviewTradeNote[]>([]);

  const [isSaving, setIsSaving] =
    useState(false);

  const canSave =
    note.trim().length > 0 &&
    !isSaving;



  // =====================================================
  // LOAD EXISTING NOTES FOR SELECTED TRADE
  // =====================================================

  useEffect(() => {
    let cancelled = false;

setNote("");
setSavedLocally(false);
setActiveNoteId(null);

    async function loadNotes() {
      if (!trade.id) {
        setPastNotes([]);
        return;
      }

      const notes =
        await loadDailyReviewTradeNotes(
          trade.id
        );

      if (!cancelled) {
        setPastNotes(notes);
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

  setIsSaving(true);

  try {
    // UPDATE EXISTING NOTE
    if (activeNoteId) {
      const updatedNote =
        await updateDailyReviewTradeNote(
          activeNoteId,
          note
        );

      if (!updatedNote) {
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
    const createdNote =
      await createDailyReviewTradeNote(
        trade.id,
        note
      );

    if (createdNote) {
      setPastNotes((currentNotes) => [
        createdNote,
        ...currentNotes,
      ]);

      setActiveNoteId(createdNote.id);
      setSavedLocally(true);
    }
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
// DELETE NOTE
// =====================================================

async function handleDelete(
  noteId: string
) {
  const confirmed =
    window.confirm(
      "Delete this trade note?\n\nThis action cannot be undone."
    );

  if (!confirmed) {
    return;
  }

  const deleted =
    await deleteDailyReviewTradeNote(
      noteId
    );

  if (!deleted) {
    return;
  }

setPastNotes((currentNotes) =>
  currentNotes.filter(
    (savedNote) =>
      savedNote.id !== noteId
  )
);

if (activeNoteId === noteId) {
  setNote("");
  setActiveNoteId(null);
  setSavedLocally(false);
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
    (note.length > 0 || activeNoteId !== null);

  if (hasUnsavedChanges) {
    const confirmed = window.confirm(
      "You have unsaved changes. Discard them and open this note?"
    );

    if (!confirmed) {
      return;
    }
  }

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

  if (
  !savedLocally &&
  (note.length > 0 || activeNoteId !== null)
) {
    const confirmed = window.confirm(
      "You have unsaved changes. Discard them and start a new note?"
    );

    if (!confirmed) {
      return;
    }
  }

  setNote("");
  setActiveNoteId(null);
  setSavedLocally(false);
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
          {/* EDITOR TOOLBAR */}

          <div
            className="
              flex
              h-10
              items-center
              gap-1.5
              border-b
              border-white/[0.06]
              px-2.5
              translate-x-[8px]
            "
          >
            <button
              type="button"
              title="Text style"
              className="
                flex
                h-7
                w-[80px]
                items-center
                justify-between
                rounded-[6px]
                border
                border-white/[0.08]
                px-2
                text-[11px]
                text-slate-300
              "
            >
              <span className="relative left-[8px]">
                Normal
              </span>

              <ChevronDown
                size={14}
                className="text-slate-400"
              />
            </button>

            <div
              className="
                ml-1
                flex
                items-center
                gap-0.5
              "
            >
              <ToolbarButton label="Bold">
                <Bold size={15} />
              </ToolbarButton>

              <ToolbarButton label="Italic">
                <Italic size={16} />
              </ToolbarButton>

              <ToolbarButton label="Underline">
                <Underline size={15} />
              </ToolbarButton>
            </div>

            <span
              className="
                mx-1
                h-5
                w-px
                bg-white/[0.06]
              "
            />

            <ToolbarButton label="Bulleted list">
              <List size={16} />
            </ToolbarButton>

            <ToolbarButton label="Add link">
              <Link size={16} />
            </ToolbarButton>
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
            <textarea
              value={note}
              onChange={(event) => {
                setNote(
                  event.target.value
                );

                setSavedLocally(false);
              }}
              placeholder="Write your notes about this trade..."
              className="
                h-full
                w-full
                resize-none
                bg-transparent
                px-0
                py-0
                text-[12px]
                leading-5
                text-slate-200
                outline-none
                placeholder:text-slate-500
              "
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
      No saved notes yet
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
          const lines =
            savedNote.content
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean);

          const title =
            lines[0] || "Trade note";

          const preview =
            lines.length > 1
              ? lines.slice(1).join(" ")
              : "";

          const savedDate =
            new Date(
              savedNote.createdAt
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
  ${
    activeNoteId === savedNote.id
      ? "border-violet-400/35 bg-violet-500/[0.06]"
      : "border-white/[0.08] bg-[#091521]"
  }
  px-3
  py-2.5
  cursor-pointer
  transition-all
  duration-200
  ease-out
  hover:-translate-y-[2px]
  hover:border-violet-300/50
  hover:bg-[#0c1a2a]
  hover:shadow-[0_4px_14px_rgba(139,92,246,0.14)]
  active:translate-y-0
  active:scale-[0.99]
  focus-visible:outline-none
  focus-visible:ring-1
  focus-visible:ring-violet-400/50
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
        text-slate-100
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
          leading-4
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
    </div>
  );
}



function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={`${label} will be added later`}
      aria-label={label}
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-[5px]
        text-slate-300
        transition
        hover:bg-white/[0.06]
        hover:text-white
      "
    >
      {children}
    </button>
  );
}