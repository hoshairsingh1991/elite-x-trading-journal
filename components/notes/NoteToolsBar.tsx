"use client";

import {
  Editor,
} from "@tiptap/core";


type Props = {
  editor: Editor;
};


export default function NoteToolsBar({
  editor,
}: Props) {

  return (

    <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">

      {/* ========================================= */}
      {/* BOLD */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
        className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-sm font-bold transition-all ${
          editor.isActive(
            "bold"
          )
            ? "bg-[#0b1730] text-white"
            : "bg-[#0b0c1e] text-slate-400 hover:bg-[#111827] hover:text-white"
        }`}
      >
        B
      </button>


      {/* ========================================= */}
      {/* ITALIC */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
        className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-sm italic transition-all ${
          editor.isActive(
            "italic"
          )
            ? "bg-[#0b1730] text-white"
            : "bg-[#0b0c1e] text-slate-400 hover:bg-[#111827] hover:text-white"
        }`}
      >
        I
      </button>


      {/* ========================================= */}
      {/* BULLET LIST */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        }
        className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-sm transition-all ${
          editor.isActive(
            "bulletList"
          )
            ? "bg-[#0b1730] text-white"
            : "bg-[#0b0c1e] text-slate-400 hover:bg-[#111827] hover:text-white"
        }`}
      >
        •
      </button>


      {/* ========================================= */}
      {/* H1 */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 1,
            })
            .run()
        }
        className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-xs font-semibold transition-all ${
          editor.isActive(
            "heading",
            {
              level: 1,
            }
          )
            ? "bg-[#0b1730] text-white"
            : "bg-[#0b0c1e] text-slate-400 hover:bg-[#111827] hover:text-white"
        }`}
      >
        H1
      </button>


      {/* ========================================= */}
      {/* H2 */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 2,
            })
            .run()
        }
        className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-xs font-semibold transition-all ${
          editor.isActive(
            "heading",
            {
              level: 2,
            }
          )
            ? "bg-[#0b1730] text-white"
            : "bg-[#0b0c1e] text-slate-400 hover:bg-[#111827] hover:text-white"
        }`}
      >
        H2
      </button>


      {/* ========================================= */}
      {/* DIVIDER */}
      {/* ========================================= */}

      <div className="mx-1 h-6 w-px bg-white/[0.06]" />


      {/* ========================================= */}
      {/* BLUE */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setColor("#60a5fa")
            .run()
        }
        aria-label="Blue text"
        title="Blue text"
        className="h-9 w-9 rounded-[8px] bg-blue-400 transition-all hover:scale-105"
      />


      {/* ========================================= */}
      {/* GREEN */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setColor("#4ade80")
            .run()
        }
        aria-label="Green text"
        title="Green text"
        className="h-9 w-9 rounded-[8px] bg-green-400 transition-all hover:scale-105"
      />


      {/* ========================================= */}
      {/* RED */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setColor("#f87171")
            .run()
        }
        aria-label="Red text"
        title="Red text"
        className="h-9 w-9 rounded-[8px] bg-red-400 transition-all hover:scale-105"
      />


      {/* ========================================= */}
      {/* YELLOW */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setColor("#facc15")
            .run()
        }
        aria-label="Yellow text"
        title="Yellow text"
        className="h-9 w-9 rounded-[8px] bg-yellow-400 transition-all hover:scale-105"
      />


      {/* ========================================= */}
      {/* RESET COLOR */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .unsetColor()
            .run()
        }
        className="flex h-9 items-center justify-center rounded-[8px] bg-[#0b0c1e] px-3 text-xs text-slate-400 transition-all hover:bg-[#111827] hover:text-white"
      >
        Reset
      </button>

    </div>
  );
}