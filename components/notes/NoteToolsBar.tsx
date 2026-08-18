"use client";

import {
  AlignCenter,
  ChevronDown,
  Circle,
  Eraser,
  Highlighter,
  Italic,
  Minus,
  MousePointer2,
  PenLine,
  Redo2,
  Square,
  Strikethrough,
  Type,
  Underline,
  Undo2,
} from "lucide-react";

import {
  Editor,
} from "@tiptap/core";

import UnderlineExtension from "@tiptap/extension-underline";

type Props = {
  editor: Editor;

  activeAnnotationTool:
    | "select"
    | "pen";

  onAnnotationToolChange: (
    tool:
      | "select"
      | "pen"
  ) => void;
};

export default function NoteToolsBar({
  editor,
  activeAnnotationTool,
  onAnnotationToolChange,
}: Props) {

  // -------------------------------------------------
  // UI-ONLY CHECKPOINT
  // -------------------------------------------------
  //
  // Keep the shared editor connection intact.
  // Commands will be wired after the visual design
  // is approved.
  //
  void editor;


return (

  <div className="relative left-[-8px] top-[6px] w-full">

    {/* ================================================= */}
    {/* TOOLBAR ROW */}
    {/* ================================================= */}

    <div className="flex min-h-[38px] w-full items-center gap-2">

      {/* ================================================= */}
      {/* TEXT SIZE GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-2">

        <button
          type="button"
          title="Text size"
          className="flex h-full min-w-[62px] items-center justify-center gap-1 rounded-[6px] px-2 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Type
            size={14}
            strokeWidth={1.7}
          />

          <span>
            16
          </span>

          <ChevronDown
            size={11}
            strokeWidth={1.8}
            className="text-slate-500"
          />

        </button>

      </div>


      {/* ================================================= */}
      {/* TEXT FORMATTING GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center gap-0.5 rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

<button
  type="button"
  title="Bold"
  onClick={() =>
    editor
      .chain()
      .focus()
      .toggleBold()
      .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] text-[12px] font-bold transition-colors ${
    editor.isActive("bold")
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  B
</button>

<button
  type="button"
  title="Italic"
  onClick={() =>
    editor
      .chain()
      .focus()
      .toggleItalic()
      .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    editor.isActive("italic")
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <Italic
    size={14}
    strokeWidth={1.8}
  />
</button>

<button
  type="button"
  title="Underline"
  onClick={() =>
    editor
      .chain()
      .focus()
      .toggleUnderline()
      .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    editor.isActive("underline")
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <Underline
    size={14}
    strokeWidth={1.8}
  />
</button>

<button
  type="button"
  title="Strikethrough"
  onClick={() =>
    editor
      .chain()
      .focus()
      .toggleStrike()
      .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    editor.isActive("strike")
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <Strikethrough
    size={14}
    strokeWidth={1.8}
  />
</button>

      </div>


      {/* ================================================= */}
      {/* LIST + ALIGNMENT GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center gap-0.5 rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

        <button
          type="button"
          title="Bullet list"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Circle
            size={7}
            fill="currentColor"
            strokeWidth={0}
          />

        </button>

        <button
          type="button"
          title="Numbered list"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[10px] font-semibold text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          1.
        </button>

        <button
          type="button"
          title="Alignment"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <AlignCenter
            size={14}
            strokeWidth={1.8}
          />

        </button>

      </div>


      {/* ================================================= */}
      {/* TEXT COLOR GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

        <button
          type="button"
          title="Text color"
          className="relative flex h-8 min-w-[42px] items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Type
            size={14}
            strokeWidth={1.8}
          />

          <span className="absolute bottom-[6px] left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-blue-400" />

          <ChevronDown
            size={10}
            strokeWidth={1.8}
            className="ml-1 text-slate-500"
          />

        </button>

      </div>


      {/* ================================================= */}
      {/* ANNOTATION GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] min-w-0 flex-1 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

        {/* SELECT */}

        <button
          type="button"
          title="Select"
          className="flex h-8 items-center gap-1.5 rounded-[6px] border border-blue-400/40 bg-[#0b1730] px-3 text-[10px] font-medium text-blue-300 transition-colors hover:bg-[#102044]"
        >

          <MousePointer2
            size={14}
            strokeWidth={1.8}
          />

          <span>
            Select
          </span>

        </button>


        {/* PEN */}

<button
  type="button"
  title="Pen"
  onClick={() =>
    onAnnotationToolChange(
      activeAnnotationTool === "pen"
        ? "select"
        : "pen"
    )
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    activeAnnotationTool === "pen"
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>

  <PenLine
    size={14}
    strokeWidth={1.8}
  />

</button>


        {/* LINE */}

        <button
          type="button"
          title="Line"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Minus
            size={15}
            strokeWidth={1.8}
          />

        </button>


        {/* ARROW */}

        <button
          type="button"
          title="Arrow"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <span className="text-[16px] leading-none">
            ↗
          </span>

        </button>


        {/* ZONE */}

        <button
          type="button"
          title="Zone"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Square
            size={14}
            strokeWidth={1.7}
          />

        </button>


        {/* HIGHLIGHT */}

        <button
          type="button"
          title="Highlight"
          className="relative flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Highlighter
            size={14}
            strokeWidth={1.8}
          />

          <span className="absolute bottom-[5px] h-[2px] w-3 rounded-full bg-yellow-300" />

        </button>


        {/* ERASER */}

        <button
          type="button"
          title="Eraser"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Eraser
            size={14}
            strokeWidth={1.8}
          />

        </button>

      </div>


      {/* ================================================= */}
      {/* STROKE WIDTH GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

        <button
          type="button"
          title="Stroke width"
          className="flex h-8 min-w-[54px] items-center justify-center gap-1.5 rounded-[6px] px-2 text-[10px] font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <span className="flex h-3 w-3 items-center justify-center">
            <span className="h-[3px] w-3 rounded-full bg-slate-300" />
          </span>

          2

          <ChevronDown
            size={10}
            strokeWidth={1.8}
            className="text-slate-500"
          />

        </button>

      </div>


      {/* ================================================= */}
      {/* HISTORY GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center gap-0.5 rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

        <button
          type="button"
          title="Undo"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Undo2
            size={14}
            strokeWidth={1.8}
          />

        </button>

        <button
          type="button"
          title="Redo"
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Redo2
            size={14}
            strokeWidth={1.8}
          />

        </button>

      </div>


      {/* ================================================= */}
      {/* MORE */}
      {/* ================================================= */}

      <button
        type="button"
        title="More tools"
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] text-slate-400 transition-colors hover:border-white/[0.1] hover:bg-[#101a28] hover:text-white"
      >

        <span className="text-sm tracking-[0.2em]">
          ···
        </span>

      </button>

    </div>

{/* ================================================= */}
{/* TOOLBAR DIVIDER */}
{/* ================================================= */}

<div className="relative top-[5px] mt-3 h-px w-full bg-white/[0.06]" />

  </div>
  );
}