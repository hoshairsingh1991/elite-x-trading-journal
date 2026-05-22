"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";

import TiptapEditor from "@/components/notes/TiptapEditor";

import {
  Plus,
  Trash2,
} from "lucide-react";

import { Note } from "@/types/note";

import {
  loadNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/storage/noteStorage";

export default function NotesPage() {

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [
    selectedNoteId,
    setSelectedNoteId,
  ] = useState<string>("");

  // =================================================
  // LOAD NOTES
  // =================================================

  useEffect(() => {

    const storedNotes =
      loadNotes();

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
  // CREATE NOTE
  // =================================================

  function handleCreateNote() {

    const newNote =
      createNote();

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

  function handleDeleteNote() {

    if (
      !selectedNote
    ) {

      return;
    }

    const updatedNotes =
      deleteNote(
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

    const updatedNote = {

      ...selectedNote,

      [field]:
        value,
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

    updateNote(
      updatedNote
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

                  <p className="relative left-2 truncate text-sm font-semibold text-white">
                    {note.title}
                  </p>

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

  <button
  onClick={
    handleDeleteNote
  }
  className="relative right-0 flex h-[48px] w-[120px] items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
>

    <Trash2
      size={17}
    />

    Delete
  </button>
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

            <div className="mt-[18px] flex flex-1 flex-col rounded-[24px] border border-white/[0.04] bg-[#09111d] px-8 py-8">
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

              <div className="relative left-4 mt-8 flex-1 overflow-hidden">

  <TiptapEditor
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