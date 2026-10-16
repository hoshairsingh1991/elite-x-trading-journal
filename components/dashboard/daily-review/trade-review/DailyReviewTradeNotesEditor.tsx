"use client";

import { useEffect, useState } from "react";

import {
  Editor,
  Extension,
} from "@tiptap/core";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import TextAlign from "@tiptap/extension-text-align";

import { TextStyle } from "@tiptap/extension-text-style";

import Underline from "@tiptap/extension-underline";

import { Color } from "@tiptap/extension-color";


/* =====================================================
   FONT SIZE EXTENSION
   Reuses the production Notes configuration.
===================================================== */

const FontSizeExtension = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: [
          "textStyle",
          "listItem",
        ],

        attributes: {
          fontSize: {
            default: null,

            parseHTML: (element) =>
              element.style.fontSize || null,

            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});


/* =====================================================
   PROPS
===================================================== */

type Props = {
  content: string;

  onChange: (content: string) => void;

  onEditorReady?: (editor: Editor | null) => void;

  editable: boolean;
};


/* =====================================================
   LEGACY CONTENT SUPPORT
   Convert existing plain-text notes into paragraphs.
   Preserve existing rich-text HTML when reopening notes.
===================================================== */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeEditorContent(content: string): string {
  if (!content) {
    return "<p></p>";
  }

  const containsRichText =
    /<(p|ul|ol|li|strong|b|em|i|u|s|strike|span|br|hr|h[1-6])(?:\s|>)/i.test(
      content
    );

  if (containsRichText) {
    return content;
  }

  return content
    .split(/\r?\n/)
    .map((line) =>
      line.length > 0
        ? `<p>${escapeHtml(line)}</p>`
        : "<p><br></p>"
    )
    .join("");
}


/* =====================================================
   EDITOR COMPONENT
===================================================== */

export default function DailyReviewTradeNotesEditor({
  content,
  onChange,
  onEditorReady,
  editable,
}: Props) {
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const editor = useEditor({
    immediatelyRender: true,

    // Prevent editing during an active save.
    editable,

extensions: [
  StarterKit,
  TextStyle,
  Underline,
  FontSizeExtension,
  Color,

  TextAlign.configure({
    types: [
      "heading",
      "paragraph",
    ],
  }),
],

    content: normalizeEditorContent(content),

    editorProps: {
      attributes: {
        class:
  "box-border h-full min-h-full w-full outline-none text-[12px] leading-5 text-slate-200 [&_p]:my-0 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:ml-0 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:ml-0 [&_ol_li>p]:inline [&_ul_li>p]:inline [&_ol>li]:text-[inherit] [&_ul>li]:text-[inherit] [&_li]:my-0 [&_hr]:border-white/[0.15]",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });


  /* ===================================================
     SYNC WHEN SELECTING, CLEARING, OR LOADING A NOTE
  =================================================== */

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const nextContent = normalizeEditorContent(content);

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }

    setIsEditorEmpty(editor.isEmpty);
  }, [editor, content]);


  /* ===================================================
     SYNC PLACEHOLDER WITH EDITOR TRANSACTIONS
  =================================================== */

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const syncEmptyState = () => {
      setIsEditorEmpty(editor.isEmpty);
    };

    syncEmptyState();

    editor.on("transaction", syncEmptyState);

    return () => {
      editor.off("transaction", syncEmptyState);
    };
  }, [editor]);


  /* ===================================================
     EXPOSE EDITOR TO THE PARENT TOOLBAR
  =================================================== */

  useEffect(() => {
    if (!onEditorReady) {
      return;
    }

    onEditorReady(editor ?? null);

    return () => {
      onEditorReady(null);
    };
  }, [
    editor,
    onEditorReady,
  ]);


  /* ===================================================
     RENDER
     Parent controls editor height and padding.
  =================================================== */

return (
  <div className="relative h-full min-h-0 w-full">
<EditorContent
  editor={editor}
  className="h-full min-h-0 w-full overflow-y-auto notes-scrollbar"
/>

    {isEditorEmpty && (
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          select-none
          text-[12px]
          leading-5
          text-slate-500
        "
      >
        Write your notes about this trade...
      </div>
    )}
  </div>
);
}