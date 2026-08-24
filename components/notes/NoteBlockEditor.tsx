"use client";

import {
  useEffect,
} from "react";

import {
  useEditor,
  EditorContent,
} from "@tiptap/react";

import {
  Editor,
  Extension,
} from "@tiptap/core";

import StarterKit from "@tiptap/starter-kit";

import {
  TextStyle,
} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

const FontSizeExtension =
  Extension.create({
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

onFocus: (
  editor: Editor
) => void;

onEditorReady: (
  editor: Editor
) => void;
};


export default function NoteBlockEditor({
  content,
  onChange,
  onFocus,
  onEditorReady,
}: Props) {

  const editor =
    useEditor({

extensions: [

  StarterKit,

  TextStyle,

  FontSizeExtension,

  Color,

  Underline,

  TextAlign.configure({
    types: [
      "paragraph",
    ],
  }),

],

      content,

      immediatelyRender:
        false,

editorProps: {

  attributes: {

    class:
      "h-full w-full outline-none [&_ul]:list-disc [&_ul]:list-inside [&_ul]:ml-0 [&_ol]:list-decimal [&_ol]:list-inside [&_ol_li>p]:inline [&_ul_li>p]:inline",

  },

handleKeyDown(
  view,
  event
) {

  if (
    event.key !== "Tab"
  ) {

    return false;
  }

  event.preventDefault();

  if (
    !editor ||
    editor.isDestroyed
  ) {

    return false;
  }

  editor
    .chain()
    .focus()
    .insertContent(
      "\u00A0\u00A0\u00A0\u00A0"
    )
    .run();

  return true;
},

},

      onUpdate: ({
        editor,
      }) => {

        onChange(
          editor.getHTML()
        );

      },

onFocus: ({
  editor,
}) => {

  onFocus(
    editor
  );

},

    });

      // ===================================================
  // EXPOSE EDITOR INSTANCE
  // ===================================================

  useEffect(() => {

    if (
      !editor
    ) {

      return;
    }

    onEditorReady(
      editor
    );

  }, [
    editor,
    onEditorReady,
  ]);

  // ===================================================
  // KEEP EDITOR CONTENT IN SYNC
  // ===================================================

  useEffect(() => {

    if (
      !editor
    ) {

      return;
    }

    const currentContent =
      editor.getHTML();

    if (
      currentContent ===
      content
    ) {

      return;
    }

    editor.commands.setContent(
      content,
      {
        emitUpdate:
          false,
      }
    );

  }, [
    editor,
    content,
  ]);


  if (
    !editor
  ) {

    return null;
  }


  return (

    <EditorContent
      editor={
        editor
      }
      className="
        h-full
        w-full
        overflow-auto
        bg-transparent
        text-[13px]
        leading-5
        text-white
      "
    />

  );

}