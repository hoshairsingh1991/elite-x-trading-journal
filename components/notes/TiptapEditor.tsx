"use client";

import {
  useEditor,
  EditorContent,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import { TextStyle } from "@tiptap/extension-text-style";

import { Color } from "@tiptap/extension-color";

type Props = {
  content: string;

  onChange: (
    content: string
  ) => void;
};

export default function TiptapEditor({
  content,
  onChange,
}: Props) {

  const editor =
    useEditor({

      extensions: [
        StarterKit,
        TextStyle,
        Color,
      ],

      content,

      editorProps: {

        attributes: {
          class:
  "min-h-full outline-none text-slate-300 text-[15px] leading-8 [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-4",
        },
      },

      onUpdate({
        editor,
      }) {

        onChange(
          editor.getHTML()
        );
      },
    });

  if (!editor) {

    return null;
  }

  return (

    <div className="flex h-full flex-col">

      {/* ============================================= */}
      {/* TOP SAFE ZONE */}
      {/* ============================================= */}

      <div className="h-[18px] shrink-0 opacity-0 pointer-events-none select-none">
        spacer
      </div>

      {/* ============================================= */}
      {/* TOOLBAR */}
      {/* ============================================= */}

      <div className="mt-[18px] flex items-center gap-2 border-b border-white/[0.04] pb-5">

        {/* ========================================= */}
        {/* BOLD */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
            editor.isActive(
              "bold"
            )
              ? "bg-[#0b1730] text-white"
              : "bg-[#111827] text-slate-400 hover:text-white"
          }`}
        >
          B
        </button>

        {/* ========================================= */}
        {/* ITALIC */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm italic transition-all ${
            editor.isActive(
              "italic"
            )
              ? "bg-[#0b1730] text-white"
              : "bg-[#111827] text-slate-400 hover:text-white"
          }`}
        >
          I
        </button>

        {/* ========================================= */}
        {/* BULLET LIST */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm transition-all ${
            editor.isActive(
              "bulletList"
            )
              ? "bg-[#0b1730] text-white"
              : "bg-[#111827] text-slate-400 hover:text-white"
          }`}
        >
          •
        </button>

        {/* ========================================= */}
        {/* H1 */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
            editor.isActive(
              "heading",
              {
                level: 1,
              }
            )
              ? "bg-[#0b1730] text-white"
              : "bg-[#111827] text-slate-400 hover:text-white"
          }`}
        >
          H1
        </button>

        {/* ========================================= */}
        {/* H2 */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
            editor.isActive(
              "heading",
              {
                level: 2,
              }
            )
              ? "bg-[#0b1730] text-white"
              : "bg-[#111827] text-slate-400 hover:text-white"
          }`}
        >
          H2
        </button>

        {/* ========================================= */}
        {/* BLUE */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setColor("#60a5fa")
              .run()
          }
          className="h-10 w-10 rounded-xl bg-blue-400 transition-all hover:scale-105"
        />

        {/* ========================================= */}
        {/* GREEN */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setColor("#4ade80")
              .run()
          }
          className="h-10 w-10 rounded-xl bg-green-400 transition-all hover:scale-105"
        />

        {/* ========================================= */}
        {/* RED */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setColor("#f87171")
              .run()
          }
          className="h-10 w-10 rounded-xl bg-red-400 transition-all hover:scale-105"
        />

        {/* ========================================= */}
        {/* YELLOW */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setColor("#facc15")
              .run()
          }
          className="h-10 w-10 rounded-xl bg-yellow-400 transition-all hover:scale-105"
        />

        {/* ========================================= */}
        {/* RESET */}
        {/* ========================================= */}

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetColor()
              .run()
          }
          className="flex h-10 items-center justify-center rounded-xl bg-[#111827] px-4 text-xs text-slate-400 transition-all hover:text-white"
        >
          Reset
        </button>
      </div>

      {/* ============================================= */}
      {/* EDITOR */}
      {/* ============================================= */}

      <div className="flex-1 overflow-y-auto pt-6">

        <EditorContent
          editor={editor}
        />
      </div>
    </div>
  );
}