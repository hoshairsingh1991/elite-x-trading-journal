"use client";

import {
  useEditor,
  EditorContent,
} from "@tiptap/react";

import {
  useEffect,
} from "react";

import {
  Editor,
} from "@tiptap/core";

import StarterKit from "@tiptap/starter-kit";

import UnderlineExtension from "@tiptap/extension-underline";

import TextAlign from "@tiptap/extension-text-align";


import {
  TextStyle,
} from "@tiptap/extension-text-style";

import { Extension } from "@tiptap/core";

import { Color } from "@tiptap/extension-color";

const FontSizeExtension =
  Extension.create({
    name: "fontSize",

    addGlobalAttributes() {

      return [
        {
          types: [
            "textStyle",
          ],

          attributes: {

            fontSize: {

              default:
                null,

              parseHTML:
                element =>
                  element.style.fontSize ||
                  null,

              renderHTML:
                attributes => {

                  if (
                    !attributes.fontSize
                  ) {

                    return {};
                  }

                  return {
                    style:
                      `font-size: ${attributes.fontSize}`,
                  };
                },
            },
          },
        },
      ];
    },
  });

type Props = {
  content: string;

  onChange: (
    content: string
  ) => void;

  onEditorReady?: (
    editor: Editor
  ) => void;
};

export default function TiptapEditor({
  content,
  onChange,
  onEditorReady,
}: Props) {

  const editor =
    useEditor({
      immediatelyRender: true,

extensions: [
  StarterKit,
  UnderlineExtension,
  TextStyle,
  FontSizeExtension,
  Color,
  TextAlign.configure({
    types: [
      "heading",
      "paragraph",
    ],
  }),
],

      content,

editorProps: {

  attributes: {
   class:
  "box-border w-full h-full min-h-full outline-none text-slate-300 text-[15px] leading-8 [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:ml-0 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:ml-0 [&_ol_li>p]:inline [&_ul_li>p]:inline",
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

  useEffect(() => {

    if (!editor) {
      return;
    }

    onEditorReady?.(
      editor
    );

  }, [
    editor,
    onEditorReady,
  ]);

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
      {/* EDITOR */}
      {/* ============================================= */}

<div className="min-w-0 flex-1 pt-6">

  <div className="box-border w-full min-w-0 px-6">

<EditorContent
  editor={editor}
  className="w-[calc(100%-35px)] min-w-0 ml-6"
/>

  </div>

</div>
    </div>
  );
}