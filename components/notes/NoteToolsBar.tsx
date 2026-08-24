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

  activeBlockEditor: Editor | null;

  activeBlockId: string | null;

  noteId: string;

  onAddTextBlock: () => void;

    activeBlockStyle: {
    fontSize: number;
    color: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    textAlign: string;
  };

  onBlockStyleChange: (
    style: {
      fontSize: number;
      color: string;
      fontWeight: string;
      fontStyle: string;
      textDecoration: string;
      textAlign: string;
    }
  ) => void;

activeAnnotationTool:
  | "select"
  | "pen"
  | "line"
  | "arrow"
  | "zone"
  | "highlight"
  | "eraser";

onAnnotationToolChange: (
  tool:
    | "select"
    | "pen"
    | "line"
    | "arrow"
    | "zone"
    | "highlight"
    | "eraser"
) => void;

  penColor: string;

  onPenColorChange: (
    color: string
  ) => void;

  penWidth: number;

  onPenWidthChange: (
    width: number
  ) => void;

  onDrawingUndo: () => void;

onDrawingRedo: () => void;
};



export default function NoteToolsBar({
  editor,
  activeBlockEditor,
  activeBlockId,
  noteId,
  onAddTextBlock,
  activeBlockStyle,
  onBlockStyleChange,
  activeAnnotationTool,
  onAnnotationToolChange,
  penColor,
  onPenColorChange,
penWidth,
onPenWidthChange,
onDrawingUndo,
onDrawingRedo,
}: Props) {

  const activeEditor =
    activeBlockEditor ?? editor;

  const [
    isTextSizeOpen,
    setIsTextSizeOpen,
  ] = useState(false);

const [
  isTextColorOpen,
  setIsTextColorOpen,
] = useState(false);

const [
  isDrawingSettingsOpen,
  setIsDrawingSettingsOpen,
] = useState(false);

const drawingSettingsRef =
  useRef<HTMLDivElement | null>(null);

  const textSizeRef =
  useRef<HTMLDivElement | null>(null);

const textColorRef =
  useRef<HTMLDivElement | null>(null);

useEffect(() => {

  if (
    !isDrawingSettingsOpen &&
    !isTextSizeOpen &&
    !isTextColorOpen
  ) {

    return;
  }

  function handleOutsideClick(
    event: PointerEvent
  ) {

    const target =
      event.target as Node;

    const clickedInsideTextSize =
      textSizeRef.current?.contains(
        target
      );

    const clickedInsideTextColor =
      textColorRef.current?.contains(
        target
      );

    const clickedInsideDrawingSettings =
      drawingSettingsRef.current?.contains(
        target
      );

    if (
      clickedInsideTextSize ||
      clickedInsideTextColor ||
      clickedInsideDrawingSettings
    ) {

      return;
    }

    setIsTextSizeOpen(
      false
    );

    setIsTextColorOpen(
      false
    );

    setIsDrawingSettingsOpen(
      false
    );
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
  isDrawingSettingsOpen,
  isTextSizeOpen,
  isTextColorOpen,
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

  // =================================================
  // EDITOR SAFETY
  // =================================================

  if (
    !activeEditor ||
    activeEditor.isDestroyed
  ) {

    return;
  }

  const state =
    activeEditor.state;

  if (
    !state
  ) {

    return;
  }

  const textStyleMark =
    state.schema.marks.textStyle;

  if (
    !textStyleMark
  ) {

    return;
  }

  // =================================================
  // SAFE EXISTING MARKS
  // =================================================

  const selection =
    state.selection;

  const existingStoredMarks =
    state.storedMarks ??
    (
      selection &&
      "$from" in selection &&
      selection.$from
        ? selection.$from.marks()
        : []
    );

  const filteredMarks =
    existingStoredMarks.filter(
      (mark) =>
        mark.type !==
        textStyleMark
    );

  // =================================================
  // CREATE FONT SIZE MARK
  // =================================================

  const fontSizeMark =
    textStyleMark.create({
      fontSize,
    });

  // =================================================
  // FINAL EDITOR SAFETY
  // =================================================

  if (
    activeEditor.isDestroyed ||
    !activeEditor.view
  ) {

    return;
  }

  activeEditor.view.dispatch(
    state.tr.setStoredMarks([
      ...filteredMarks,
      fontSizeMark,
    ])
  );
}


useEffect(() => {

const storageKey =
  activeBlockId
    ? `elite-x-note-font-size-${noteId}-block-${activeBlockId}`
    : `elite-x-note-font-size-${noteId}-note`;

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

    activeEditor.state.doc.descendants(
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
  activeBlockEditor,
  activeBlockId,
  noteId,
]);

useEffect(() => {
  const currentColor =
    activeEditor.getAttributes("textStyle")?.color;

  if (
    typeof currentColor === "string" &&
    currentColor.length > 0
  ) {
    setSelectedTextColor(
      currentColor
    );
  }
}, [
  activeEditor,
]);


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

<div
  ref={
    textSizeRef
  }
  className="relative"
>

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
  activeBlockId
    ? `elite-x-note-font-size-${noteId}-block-${activeBlockId}`
    : `elite-x-note-font-size-${noteId}-note`;

activeEditor
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
    activeEditor
      .chain()
      .focus()
      .toggleBold()
      .run()
  }
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[12px] font-bold transition-colors ${
    activeEditor.isActive("bold")
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
  activeEditor
    .chain()
    .focus()
    .toggleItalic()
    .run()
}
 className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] transition-colors ${
    activeEditor.isActive("italic")
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
  activeEditor
    .chain()
    .focus()
    .toggleUnderline()
    .run()
}
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center  rounded-[6px] transition-colors max-[1535px]:w-7 ${
    activeEditor.isActive("underline")
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
  activeEditor
    .chain()
    .focus()
    .toggleStrike()
    .run()
}
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center  rounded-[6px] transition-colors max-[1535px]:w-7 ${
    activeEditor.isActive("strike")
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


activeEditor
  .chain()
  .focus()
  .toggleBulletList()
  .run();
}}
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] transition-colors ${
   activeEditor.isActive("bulletList")
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
  activeEditor
    .chain()
    .focus()
    .toggleOrderedList()
    .run();
}}
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[10px] font-semibold transition-colors ${
    activeEditor.isActive("orderedList")
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
activeEditor
  .chain()
  .focus()
  .setTextAlign(
    "left"
  )
  .run()
  }
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
 activeEditor.isActive({
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
activeEditor
  .chain()
  .focus()
  .setTextAlign(
    "center"
  )
  .run()
  }
  className={`flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
activeEditor.isActive({
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
activeEditor
  .chain()
  .focus()
  .setTextAlign(
    "right"
  )
  .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
activeEditor.isActive({
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
activeEditor
  .chain()
  .focus()
  .setTextAlign(
    "justify"
  )
  .run()
  }
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] text-[11px] font-semibold transition-colors ${
activeEditor.isActive({
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

<div
  ref={
    textColorRef
  }
  className="relative flex h-[38px] shrink-0 items-center rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-1.5"
>

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

activeEditor
  .chain()
  .focus()
  .setMark(
    "textStyle",
    {
      color:
        color.value,
    }
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
  setIsDrawingSettingsOpen(false);
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
  ref={drawingSettingsRef}
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

        setIsDrawingSettingsOpen(
          false
        );

        return;
      }

      // Select → Pen
      onAnnotationToolChange(
        "pen"
      );

setIsDrawingSettingsOpen(
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


{isDrawingSettingsOpen && (

 <div className="absolute left-[-20px] top-[42px] z-50 h-[215px] w-[207px] rounded-[10px] border border-white/[0.08] bg-[#0b1421] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">

    {/* ============================================= */}
    {/* PEN SETTINGS TITLE */}
    {/* ============================================= */}

<div className="relative left-[10px] top-[6px] mb-4 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
  Drawing Settings
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
  onClick={() => {

    onAnnotationToolChange(
      "line"
    );

    setIsDrawingSettingsOpen(
      true
    );

  }}
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    activeAnnotationTool === "line"
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
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
  onClick={() => {

    onAnnotationToolChange(
      "arrow"
    );

    setIsDrawingSettingsOpen(
      true
    );

  }}
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    activeAnnotationTool === "arrow"
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>

          <span className="text-[16px] leading-none">
            ↗
          </span>

        </button>


        {/* ZONE */}

<button
  type="button"
  title="Zone"
  onClick={() => {

    onAnnotationToolChange(
      "zone"
    );

    setIsDrawingSettingsOpen(
      true
    );

  }}
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    activeAnnotationTool === "zone"
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
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
  onClick={() => {

    onAnnotationToolChange(
      "highlight"
    );

    setIsDrawingSettingsOpen(
      true
    );

  }}
  className={`relative flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    activeAnnotationTool === "highlight"
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
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
  onClick={() => {

    onAnnotationToolChange(
      "eraser"
    );

    setIsDrawingSettingsOpen(
      false
    );

  }}
  className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
    activeAnnotationTool === "eraser"
      ? "bg-[#0b1730] text-blue-300"
      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
  }`}
>

          <Eraser
            size={14}
            strokeWidth={1.8}
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
  onClick={
    onDrawingUndo
  }
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
  onClick={
    onDrawingRedo
  }
  className="flex h-8 w-8 max-[1535px]:w-7 items-center justify-center rounded-[6px] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
>

          <Redo2
            size={14}
            strokeWidth={1.8}
          />

        </button>

      </div>


{/* ================================================= */}
{/* ADD TEXT BLOCK */}
{/* ================================================= */}

<button
  type="button"
  title="Add text block"
  aria-label="Add text block"
  onClick={
    onAddTextBlock
  }
  className="flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-white/[0.06] bg-[#0b1421] px-3 text-slate-400 transition-colors hover:border-white/[0.1] hover:bg-[#101a28] hover:text-white"
>

  <Type
    size={14}
    strokeWidth={1.8}
  />

  <span className="text-[10px] font-medium">
    Text Block
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