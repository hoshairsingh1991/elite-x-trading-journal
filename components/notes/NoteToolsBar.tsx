"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
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


type Props = {
  editor: Editor;

  noteId: string;

  activeAnnotationTool:
    | "select"
    | "pen";

  onAnnotationToolChange: (
    tool:
      | "select"
      | "pen"
  ) => void;

  penColor: string;

  onPenColorChange: (
    color: string
  ) => void;

  penWidth: number;

  onPenWidthChange: (
    width: number
  ) => void;
};

export default function NoteToolsBar({
  editor,
  noteId,
  activeAnnotationTool,
  onAnnotationToolChange,
  penColor,
  onPenColorChange,
  penWidth,
  onPenWidthChange,
}: Props) {

  const [
    isTextSizeOpen,
    setIsTextSizeOpen,
  ] = useState(false);

const [
  isTextColorOpen,
  setIsTextColorOpen,
] = useState(false);

const [
  isPenSettingsOpen,
  setIsPenSettingsOpen,
] = useState(false);

const penSettingsRef =
  useRef<HTMLDivElement | null>(null);

useEffect(() => {

  if (!isPenSettingsOpen) {
    return;
  }

  function handleOutsideClick(
    event: PointerEvent
  ) {

    const target =
      event.target as Node;

    if (
      penSettingsRef.current &&
      !penSettingsRef.current.contains(
        target
      )
    ) {

      setIsPenSettingsOpen(
        false
      );
    }
  }

  document.addEventListener(
    "pointerdown",
    handleOutsideClick
  );

  return () => {

    document.removeEventListener(
      "pointerdown",
      handleOutsideClick
    );

  };

}, [
  isPenSettingsOpen,
]);

const [
  selectedTextColor,
  setSelectedTextColor,
] = useState("#f8fafc");

const textColors = [
  {
    name: "White",
    value: "#f8fafc",
  },
  {
    name: "Slate",
    value: "#cbd5e1",
  },
  {
    name: "Blue",
    value: "#60a5fa",
  },
  {
    name: "Cyan",
    value: "#22d3ee",
  },
  {
    name: "Green",
    value: "#4ade80",
  },
  {
    name: "Yellow",
    value: "#facc15",
  },
  {
    name: "Orange",
    value: "#fb923c",
  },
  {
    name: "Red",
    value: "#f87171",
  },
  {
    name: "Purple",
    value: "#c084fc",
  },
  {
    name: "Pink",
    value: "#f472b6",
  },
];

const [
  selectedFontSize,
  setSelectedFontSize,
] = useState("16");


function applyTypingFontSize(
  size: string
) {

  const fontSize =
    `${size}px`;

  const textStyleMark =
    editor.schema.marks.textStyle;

  if (
    !textStyleMark
  ) {

    return;
  }

  const existingStoredMarks =
    editor.state.storedMarks ||
    editor.state.selection.$from.marks();

  const filteredMarks =
    existingStoredMarks.filter(
      (mark) =>
        mark.type !==
        textStyleMark
    );

  const fontSizeMark =
    textStyleMark.create({
      fontSize,
    });

  editor.view.dispatch(
    editor.state.tr.setStoredMarks([
      ...filteredMarks,
      fontSizeMark,
    ])
  );
}


useEffect(() => {

  const storageKey =
    `elite-x-note-font-size-${noteId}`;

  const savedSize =
    window.localStorage.getItem(
      storageKey
    );

  let initialSize =
    savedSize ||
    "";

  // -------------------------------------------------
  // FIRST-TIME NOTE INITIALIZATION
  // -------------------------------------------------
  //
  // If this note has never had a saved editor size,
  // inspect its existing content once and use the
  // last explicit font size found in the document.
  //
  // Otherwise default to 16px.
  //

  if (!initialSize) {

    let documentSize =
      "";

    editor.state.doc.descendants(
      (node) => {

        if (
          !node.isText
        ) {

          return;
        }

        for (
          const mark of node.marks
        ) {

          if (
            mark.type.name ===
              "textStyle" &&
            typeof mark.attrs?.fontSize ===
              "string"
          ) {

            documentSize =
              mark.attrs.fontSize.replace(
                "px",
                ""
              );
          }

        }

      }
    );

    initialSize =
      documentSize ||
      "16";

    window.localStorage.setItem(
      storageKey,
      initialSize
    );
  }

  // -------------------------------------------------
  // SET TOOLBAR STATE
  // -------------------------------------------------

  setSelectedFontSize(
    initialSize
  );

  // -------------------------------------------------
  // SET TYPING STATE
  // -------------------------------------------------
  //
  // Important:
  // This makes NEW text typed in this note use
  // the note's remembered font size.
  //

const frameId =
  requestAnimationFrame(() => {

    applyTypingFontSize(
      initialSize
    );

  });

return () => {

  cancelAnimationFrame(
    frameId
  );

};

}, [
  editor,
  noteId,
]);

useEffect(() => {
  const currentColor = editor.getAttributes("textStyle")?.color;

  if (typeof currentColor === "string" && currentColor.length > 0) {
    setSelectedTextColor(currentColor);
  }
}, [editor]);


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

<div className="relative">

  <button
    type="button"
    title="Text size"
    onClick={() =>
      setIsTextSizeOpen(
        (current) => !current
      )
    }
    className="flex h-full min-w-[62px] items-center justify-center gap-1 rounded-[6px] px-2 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
  >

    <Type
      size={14}
      strokeWidth={1.7}
    />

    <span>
      {selectedFontSize}
    </span>

    <ChevronDown
      size={11}
      strokeWidth={1.8}
      className="text-slate-500"
    />

  </button>

  {isTextSizeOpen && (

    <div className="absolute left-0 top-[42px] z-50 w-[88px] overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#0b1421] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">

      {[
        "12",
        "14",
        "16",
        "18",
        "20",
        "24",
        "28",
        "32",
      ].map(
        (size) => (

          <button
            key={
              size
            }
            type="button"
            onClick={() => {

const storageKey =
  `elite-x-note-font-size-${noteId}`;

editor
  .chain()
  .focus()
  .setMark(
    "textStyle",
    {
      fontSize:
        `${size}px`,
    }
  )
  .updateAttributes(
    "listItem",
    {
      fontSize:
        `${size}px`,
    }
  )
  .run();

applyTypingFontSize(
  size
);

window.localStorage.setItem(
  storageKey,
  size
);

setSelectedFontSize(
  size
);

setIsTextSizeOpen(
  false
);

            }}
            className={`flex w-full items-center rounded-[6px] px-3 py-2 text-[11px] transition-colors ${
              selectedFontSize === size
                ? "bg-[#0b1730] text-blue-300"
                : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
            }`}
          >

            {size}px

          </button>

        )
      )}

    </div>

  )}

</div>

      </div>


      {/* ================================================= */}
      {/* TEXT FORMATTING GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] shrink-0 items-center gap-0.5 rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5 max-[1535px]:gap-0 max-[1535px]:px-1">

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
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center  rounded-[6px] text-[12px] font-bold transition-colors ${
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
 className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] transition-colors ${
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
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center  rounded-[6px] transition-colors max-[1535px]:w-7 ${
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
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center  rounded-[6px] transition-colors max-[1535px]:w-7 ${
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
onClick={() => {


  editor
    .chain()
    .focus()
    .toggleBulletList()
    .run();
}}
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] transition-colors ${
    editor.isActive("bulletList")
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
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
onClick={() => {
  console.log(
    "Ordered list available:",
    editor
      .can()
      .chain()
      .focus()
      .toggleOrderedList()
      .run()
  );

  editor
    .chain()
    .focus()
    .toggleOrderedList()
    .run();
}}
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[10px] font-semibold transition-colors ${
    editor.isActive("orderedList")
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  1.
</button>

<div className="relative flex w-auto shrink-0 items-center gap-0">

{/* ALIGN LEFT */}

<button
  type="button"
  title="Align left"
  onClick={() =>
    editor
      .chain()
      .focus()
      .setTextAlign(
        "left"
      )
      .run()
  }
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
    editor.isActive({
      textAlign: "left",
    })
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <AlignLeft
    size={14}
    strokeWidth={1.8}
  />
</button>


{/* ALIGN CENTER */}

<button
  type="button"
  title="Align center"
  onClick={() =>
    editor
      .chain()
      .focus()
      .setTextAlign(
        "center"
      )
      .run()
  }
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
    editor.isActive({
      textAlign: "center",
    })
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <AlignCenter
    size={14}
    strokeWidth={1.8}
  />
</button>


{/* ALIGN RIGHT */}

<button
  type="button"
  title="Align right"
  onClick={() =>
    editor
      .chain()
      .focus()
      .setTextAlign(
        "right"
      )
      .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
    editor.isActive({
      textAlign: "right",
    })
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <AlignRight
    size={14}
    strokeWidth={1.8}
  />
</button>


{/* JUSTIFY */}

<button
  type="button"
  title="Justify"
  onClick={() =>
    editor
      .chain()
      .focus()
      .setTextAlign(
        "justify"
      )
      .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
    editor.isActive({
      textAlign: "justify",
    })
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <AlignJustify
    size={14}
    strokeWidth={1.8}
  />
</button>

  

</div>

      </div>


{/* ================================================= */}
{/* TEXT COLOR GROUP */}
{/* ================================================= */}

<div className="relative flex h-[38px] shrink-0 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5">

  <button
    type="button"
    title="Text color"
    onClick={() =>
      setIsTextColorOpen(
        (current) => !current
      )
    }
    className="relative flex h-8 min-w-[52px] items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
  >

    <Type
      size={14}
      strokeWidth={1.8}
    />

    <span
      className="absolute bottom-[5px] left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full"
      style={{
        backgroundColor:
          selectedTextColor,
      }}
    />

    <ChevronDown
      size={10}
      strokeWidth={1.8}
      className="ml-1 text-slate-500"
    />

  </button>


  {/* ================================================= */}
  {/* COLOR DROPDOWN */}
  {/* ================================================= */}

  {isTextColorOpen && (

    <div className="absolute left-0 top-[42px] z-50 w-[148px] rounded-[8px] border border-white/[0.08] bg-[#0b1421] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">

      <div className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
        Text Color
      </div>

      <div className="grid grid-cols-5 gap-1.5">

        {textColors.map(
          (color) => (

            <button
              key={
                color.value
              }
              type="button"
              title={
                color.name
              }
              onClick={() => {

                editor
                  .chain()
                  .focus()
                  .setColor(
                    color.value
                  )
                  .run();

                setSelectedTextColor(
                  color.value
                );

                setIsTextColorOpen(
                  false
                );

              }}
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                selectedTextColor ===
                color.value
                  ? "border-white/80"
                  : "border-white/[0.08] hover:border-white/40"
              }`}
            >

              <span
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    color.value,
                }}
              />

            </button>

          )
        )}

      </div>

    </div>

  )}

</div>

      {/* ================================================= */}
      {/* ANNOTATION GROUP */}
      {/* ================================================= */}

      <div className="flex h-[38px] min-w-0 flex-1 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1">

        {/* SELECT */}

<button
  type="button"
  title="Select"
  onClick={() => {
    onAnnotationToolChange("select");
    setIsPenSettingsOpen(false);
  }}
  className={`flex h-8 w-auto shrink-0 items-center justify-center gap-1.5 rounded-[6px] border px-3 text-[10px] font-medium transition-colors max-[1535px]:w-8 max-[1535px]:px-0 ${
    activeAnnotationTool === "select"
      ? "border-blue-400/40 bg-[#0b1730] text-blue-300"
      : "border-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>
  <MousePointer2
    size={14}
    strokeWidth={1.8}
  />

  <span className="max-[1535px]:hidden">
    Select
  </span>
</button>


        {/* PEN */}

<div
  ref={penSettingsRef}
  className="relative shrink-0"
>

  <button
    type="button"
    title="Pen"
    onClick={() => {

      if (
        activeAnnotationTool === "pen"
      ) {

        // Pen → Select
        onAnnotationToolChange(
          "select"
        );

        setIsPenSettingsOpen(
          false
        );

        return;
      }

      // Select → Pen
      onAnnotationToolChange(
        "pen"
      );

      setIsPenSettingsOpen(
        true
      );

    }}
    className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors max-[1535px]:w-7 ${
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


{isPenSettingsOpen && (

 <div className="absolute left-[-20px] top-[42px] z-50 h-[215px] w-[207px] rounded-[10px] border border-white/[0.08] bg-[#0b1421] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">

    {/* ============================================= */}
    {/* PEN SETTINGS TITLE */}
    {/* ============================================= */}

    <div className="relative left-[10px] top-[6px] mb-4 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
  Pen Settings
</div>



{/* ============================================= */}
{/* COLOR */}
{/* ============================================= */}

<div className="relative left-[8px] top-[10px] h-[100px] w-[190px] rounded-[8px] border border-white/[0.05] bg-[#09111d] px-4 py-3">

  {/* COLOR WORD */}

  <div className="relative left-[4px] top-[4px] mb-3 text-[12px] font-medium text-slate-400">
    Color
  </div>


  {/* COLOR OPTIONS */}

  <div className="relative left-[2px] top-[8px] grid grid-cols-5 gap-2">

    {[
      "#ef4444",
      "#f97316",
      "#facc15",
      "#4ade80",
      "#22d3ee",
      "#60a5fa",
      "#a78bfa",
      "#f472b6",
      "#f8fafc",
      "#000000",
    ].map(
      (color) => (

        <button
          key={color}
          type="button"
          title={color}
          onClick={() => {
            onPenColorChange(
              color
            );
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
            penColor === color
              ? "border-white bg-white/[0.08]"
              : "border-white/[0.08] hover:border-white/40 hover:bg-white/[0.04]"
          }`}
        >

          <span
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor:
                color,
            }}
          />

        </button>

      )
    )}

  </div>

</div>


{/* ============================================= */}
{/* WIDTH */}
{/* ============================================= */}

<div className="relative left-[6px] top-[20px] h-[70px] w-[190px] rounded-[8px] border border-white/[0.05] bg-[#09111d] p-3">

  {/* WIDTH WORD */}

  <div className="relative left-[4px] top-[4px] mb-3 text-[10px] font-medium text-slate-400">
    Width
  </div>


  {/* WIDTH OPTIONS */}

  <div className="relative left-[0px] top-[10px] flex items-center justify-between gap-2">

    {[
      1,
      2,
      3,
      4,
      6,
    ].map(
      (width) => (

        <button
          key={width}
          type="button"
          title={`${width}px`}
          onClick={() => {
            onPenWidthChange(
              width
            );
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-all ${
            penWidth === width
              ? "border-blue-400/50 bg-[#0b1730]"
              : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]"
          }`}
        >

          <span
            className="rounded-full bg-slate-300"
            style={{
              width: `${Math.min(
                width * 2,
                12
              )}px`,
              height: `${Math.min(
                width,
                6
              )}px`,
            }}
          />

        </button>

      )
    )}

  </div>

</div>

  </div>

)}

</div>


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

      <div className="flex h-[38px] shrink-0 items-center gap-0.5 rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5 max-[1535px]:gap-0 max-[1535px]:px-1">

        <button
          type="button"
          title="Undo"
         className="flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >

          <Undo2
            size={14}
            strokeWidth={1.8}
          />

        </button>

        <button
          type="button"
          title="Redo"
          className="flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
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