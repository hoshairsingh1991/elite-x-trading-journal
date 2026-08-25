"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Note,
  NoteBlock,
} from "@/types/note";

import {
  Editor,
} from "@tiptap/core";

import {
  createNoteBlockInSupabase,
  updateNoteBlockInSupabase,
  deleteNoteBlockFromSupabase,
} from "@/lib/storage/supabaseNoteStorage";

import NoteBlockEditor from "@/components/notes/NoteBlockEditor";

import {
  Trash2,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type Props = {
  noteId: string;

  blocks: NoteBlock[];

  attachments: Note["attachments"];

  onBlocksChange: (
    blocks: NoteBlock[]
  ) => void;

onActiveBlockEditorChange: (
  editor: Editor | null,
  blockId: string | null
) => void;

  activeBlockStyle: {
    fontSize: number;
    color: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    textAlign: string;
  };
};


// =====================================================
// DRAG STATE
// =====================================================

type DragState = {
  blockId: string;

  offsetX: number;
  offsetY: number;
};

// =====================================================
// RESIZE STATE
// =====================================================

type ResizeState = {
  blockId: string;

  startX: number;
  startY: number;

  startWidth: number;
  startHeight: number;

  startPositionX: number;
  startPositionY: number;
};

// =====================================================
// COMPONENT
// =====================================================

export default function NoteBlockCanvas({

  noteId,

  blocks,

  attachments,

  onBlocksChange,

  onActiveBlockEditorChange,

  activeBlockStyle,

}: Props) {
  const canvasRef =
    useRef<HTMLDivElement | null>(null);

  const [
    selectedBlockId,
    setSelectedBlockId,
  ] = useState<string | null>(null);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);


  // ===================================================
  // DRAG STATE
  // ===================================================

const dragStateRef =
  useRef<DragState | null>(null);

const resizeStateRef =
  useRef<ResizeState | null>(null);


// ===================================================
// DEBOUNCE TIMERS
// ===================================================

  const updateTimersRef =
    useRef<
      Map<
        string,
        ReturnType<typeof setTimeout>
      >
    >(
      new Map()
    );


  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {

    return () => {

      updateTimersRef.current.forEach(
        (timer) =>
          clearTimeout(timer)
      );

      updateTimersRef.current.clear();

    };

  }, []);


  // ===================================================
  // DESELECT WHEN CLICKING OUTSIDE
  // ===================================================

  useEffect(() => {

    function handleDocumentPointerDown(
      event: PointerEvent
    ) {

      const target =
        event.target as Node | null;

      if (
        canvasRef.current &&
        target &&
        canvasRef.current.contains(target)
      ) {

        return;
      }

      setSelectedBlockId(
        null
      );
    }


    document.addEventListener(
      "pointerdown",
      handleDocumentPointerDown
    );

    return () => {

      document.removeEventListener(
        "pointerdown",
        handleDocumentPointerDown
      );

    };

  }, []);


  // ===================================================
  // PERSIST BLOCK
  // ===================================================

  function scheduleBlockUpdate(
    block: NoteBlock
  ) {

    const existingTimer =
      updateTimersRef.current.get(
        block.id
      );

    if (
      existingTimer
    ) {

      clearTimeout(
        existingTimer
      );
    }


    const timer =
      setTimeout(
        async () => {

          updateTimersRef.current.delete(
            block.id
          );

          await updateNoteBlockInSupabase(
            block
          );

        },
        500
      );


    updateTimersRef.current.set(
      block.id,
      timer
    );
  }


  // ===================================================
  // CREATE BLOCK
  // ===================================================

  async function handleCreateBlock() {

    if (
      isCreating
    ) {

      return;
    }

    setIsCreating(
      true
    );

    try {

      const now =
        new Date().toISOString();


      // =================================================
      // FIND SAFE STARTING POSITION
      // =================================================

      const nextIndex =
        blocks.length;


      const block: NoteBlock = {

        id:
          crypto.randomUUID(),

        noteId:
          noteId,

        type:
          "text",

positionX:
  32 + (
    nextIndex % 3
  ) * 40,

positionY:
  32 + (
    Math.floor(
      nextIndex / 3
    ) * 160
  ),

        width:
          320,

        height:
          120,

        zIndex:
          getNextZIndex(),

content:
  "",

// =================================================
// DEFAULT TEXT STYLE
// =================================================

fontSize:
  13,

color:
  "#ffffff",

fontWeight:
  "400",

fontStyle:
  "normal",

textDecoration:
  "none",

textAlign:
  "left",

createdAt:
  now,

updatedAt:
  now,

      };


      const createdBlock =
        await createNoteBlockInSupabase(
          block
        );


      if (
        !createdBlock
      ) {

        return;
      }


      const updatedBlocks = [
        ...blocks,
        createdBlock,
      ];


      onBlocksChange(
        updatedBlocks
      );


      setSelectedBlockId(
        createdBlock.id
      );

    } finally {

      setIsCreating(
        false
      );

    }
  }


  // ===================================================
  // NEXT Z INDEX
  // ===================================================

  function getNextZIndex(): number {

    if (
      blocks.length === 0
    ) {

      return 1000;
    }


    const highest =
      Math.max(
        ...blocks.map(
          (block) =>
            block.zIndex
        )
      );


    return Math.max(
      highest + 1,
      1000
    );
  }


  // ===================================================
  // BRING BLOCK TO FRONT
  // ===================================================

  function bringBlockToFront(
    block: NoteBlock
  ) {

    const nextZIndex =
      getNextZIndex();


    const updatedBlock: NoteBlock = {

      ...block,

      zIndex:
        nextZIndex,

      updatedAt:
        new Date().toISOString(),

    };


    onBlocksChange(
      blocks.map(
        (item) =>
          item.id ===
          block.id
            ? updatedBlock
            : item
      )
    );


    scheduleBlockUpdate(
      updatedBlock
    );
  }


  // ===================================================
  // DELETE BLOCK
  // ===================================================

  async function handleDeleteBlock(
    blockId: string
  ) {

    const existingTimer =
      updateTimersRef.current.get(
        blockId
      );

    if (
      existingTimer
    ) {

      clearTimeout(
        existingTimer
      );

      updateTimersRef.current.delete(
        blockId
      );
    }


    await deleteNoteBlockFromSupabase(
      blockId
    );


    const updatedBlocks =
      blocks.filter(
        (block) =>
          block.id !==
          blockId
      );


    onBlocksChange(
      updatedBlocks
    );


    if (
      selectedBlockId ===
      blockId
    ) {

      setSelectedBlockId(
        null
      );
    }
  }


  // ===================================================
  // UPDATE BLOCK POSITION
  // ===================================================

  function updateBlockPosition(
    block: NoteBlock,
    positionX: number,
    positionY: number
  ) {

    const updatedBlock: NoteBlock = {

      ...block,

      positionX,

      positionY,

      updatedAt:
        new Date().toISOString(),

    };


    onBlocksChange(
      blocks.map(
        (item) =>
          item.id ===
          block.id
            ? updatedBlock
            : item
      )
    );


    scheduleBlockUpdate(
      updatedBlock
    );
  }


  // ===================================================
  // START DRAG
  // ===================================================

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    block: NoteBlock
  ) {

    if (
      event.button !== 0
    ) {

      return;
    }


    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {

      return;
    }


    const canvasRect =
      canvas.getBoundingClientRect();


    const pointerX =
      event.clientX -
      canvasRect.left;


    const pointerY =
      event.clientY -
      canvasRect.top;


    dragStateRef.current = {

      blockId:
        block.id,

      offsetX:
        pointerX -
        block.positionX,

      offsetY:
        pointerY -
        block.positionY,

    };


    setSelectedBlockId(
      block.id
    );


    bringBlockToFront(
      block
    );


    event.currentTarget.setPointerCapture(
      event.pointerId
    );

  }


  // ===================================================
  // DRAG BLOCK
  // ===================================================

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {

    const dragState =
      dragStateRef.current;

    if (
      !dragState
    ) {

      return;
    }


    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {

      return;
    }


    const block =
      blocks.find(
        (item) =>
          item.id ===
          dragState.blockId
      );

    if (
      !block
    ) {

      return;
    }


    const canvasRect =
      canvas.getBoundingClientRect();


    const pointerX =
      event.clientX -
      canvasRect.left;


    const pointerY =
      event.clientY -
      canvasRect.top;


    const positionX =
      Math.max(
        0,
        pointerX -
          dragState.offsetX
      );


    const positionY =
      Math.max(
        0,
        pointerY -
          dragState.offsetY
      );


    updateBlockPosition(
      block,
      positionX,
      positionY
    );

  }


  // ===================================================
  // END DRAG
  // ===================================================

  function handlePointerUp(
    event: React.PointerEvent<HTMLDivElement>
  ) {

    dragStateRef.current =
      null;


    try {

      event.currentTarget.releasePointerCapture(
        event.pointerId
      );

    } catch {

      // Pointer capture may already
      // have been released.

    }

  }


  // ===================================================
  // UPDATE BLOCK CONTENT
  // ===================================================

  function handleBlockContentChange(
    block: NoteBlock,
    content: string
  ) {

    const updatedBlock: NoteBlock = {

      ...block,

      content,

      updatedAt:
        new Date().toISOString(),

    };


    onBlocksChange(
      blocks.map(
        (item) =>
          item.id ===
          block.id
            ? updatedBlock
            : item
      )
    );


    scheduleBlockUpdate(
      updatedBlock
    );
  }

// ===================================================
// RESIZE BLOCK
// ===================================================

function handleResizePointerDown(
  event: React.PointerEvent<HTMLDivElement>,
  block: NoteBlock
) {

  if (
    event.button !== 0
  ) {

    return;
  }

  event.stopPropagation();

  resizeStateRef.current = {

    blockId:
      block.id,

    startX:
      event.clientX,

    startY:
      event.clientY,

    startWidth:
      block.width,

    startHeight:
      block.height,

    startPositionX:
      block.positionX,

    startPositionY:
      block.positionY,

  };

  setSelectedBlockId(
    block.id
  );

  event.currentTarget.setPointerCapture(
    event.pointerId
  );
}


// ===================================================
// RESIZE MOVE
// ===================================================

function handleResizePointerMove(
  event: React.PointerEvent<HTMLDivElement>
) {

  const resizeState =
    resizeStateRef.current;

  if (
    !resizeState
  ) {

    return;
  }

  const canvas =
    canvasRef.current;

  if (
    !canvas
  ) {

    return;
  }

  const block =
    blocks.find(
      (item) =>
        item.id ===
        resizeState.blockId
    );

  if (
    !block
  ) {

    return;
  }

  const canvasRect =
    canvas.getBoundingClientRect();

  const MIN_WIDTH =
    180;

  const MIN_HEIGHT =
    100;

  const CANVAS_GAP =
    32;

  const deltaX =
    event.clientX -
    resizeState.startX;

  const deltaY =
    event.clientY -
    resizeState.startY;

  const availableWidth =
    Math.max(
      MIN_WIDTH,
      canvasRect.width -
        resizeState.startPositionX -
        CANVAS_GAP
    );

  const newWidth =
    Math.min(
      Math.max(
        MIN_WIDTH,
        resizeState.startWidth +
          deltaX
      ),
      availableWidth
    );

  const newHeight =
    Math.max(
      MIN_HEIGHT,
      resizeState.startHeight +
        deltaY
    );

  const updatedBlock: NoteBlock = {

    ...block,

    width:
      newWidth,

    height:
      newHeight,

    updatedAt:
      new Date().toISOString(),

  };

  onBlocksChange(
    blocks.map(
      (item) =>
        item.id ===
        block.id
          ? updatedBlock
          : item
    )
  );

  scheduleBlockUpdate(
    updatedBlock
  );
}


// ===================================================
// RESIZE END
// ===================================================

function handleResizePointerUp(
  event: React.PointerEvent<HTMLDivElement>
) {

  resizeStateRef.current =
    null;

  try {

    event.currentTarget.releasePointerCapture(
      event.pointerId
    );

  } catch {

    // Pointer capture may already
    // have been released.

  }
}

// ===================================================
// UPDATE SELECTED BLOCK STYLE
// ===================================================

function updateSelectedBlockStyle(
  style: Partial<NoteBlock>
) {

  if (
    !selectedBlockId
  ) {

    return;
  }

  const block =
    blocks.find(
      (item) =>
        item.id ===
        selectedBlockId
    );

  if (
    !block
  ) {

    return;
  }

  const updatedBlock: NoteBlock = {

    ...block,

    ...style,

    updatedAt:
      new Date().toISOString(),

  };

  onBlocksChange(
    blocks.map(
      (item) =>
        item.id ===
        block.id
          ? updatedBlock
          : item
    )
  );

  scheduleBlockUpdate(
    updatedBlock
  );
}



  // ===================================================
  // KEYBOARD DELETE
  // ===================================================

  function handleBlockKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    block: NoteBlock
  ) {

    if (
      event.key !== "Delete" &&
      event.key !== "Backspace"
    ) {

      return;
    }


    // Only delete an empty block.
    // Normal text editing must remain safe.

    if (
      block.content.trim() !== ""
    ) {

      return;
    }


    event.preventDefault();

    handleDeleteBlock(
      block.id
    );
  }


  // ===================================================
  // RENDER
  // =====================================================

  return (

    <div
      ref={
        canvasRef
      }

      className="
        pointer-events-none
        absolute
        inset-0
        z-[100]
        min-h-[1600px]
        w-full
      "

onPointerMove={(
  event
) => {

  if (
    resizeStateRef.current
  ) {

    handleResizePointerMove(
      event
    );

    return;
  }

  handlePointerMove(
    event
  );

}}

onPointerUp={(
  event
) => {

  if (
    resizeStateRef.current
  ) {

    handleResizePointerUp(
      event
    );

    return;
  }

  handlePointerUp(
    event
  );

}}

onPointerCancel={(
  event
) => {

  if (
    resizeStateRef.current
  ) {

    handleResizePointerUp(
      event
    );

    return;
  }

  handlePointerUp(
    event
  );

}}
    >



      {/* ============================================= */}
      {/* BLOCKS */}
      {/* ============================================= */}

      {blocks.map(
        (block) => {

          const isSelected =
            selectedBlockId ===
            block.id;

            const isEmpty =
  block.content.trim() === "";

          return (

            <div
              key={
                block.id
              }

className={`
  group
  pointer-events-auto
  absolute
  overflow-hidden
  rounded-[8px]
  border
  ${
    isSelected
      ? "border-blue-400/60 ring-1 ring-blue-400/40"
      : isEmpty
        ? "border-dashed border-white/[0.18]"
        : "border-transparent"
  }
`}

              style={{
                left:
                  block.positionX,

                top:
                  block.positionY,

                width:
                  block.width,

                height:
                  block.height,

                zIndex:
                  1000 +
                  block.zIndex,

                touchAction:
                  "none",
              }}

              onClick={(
                event
              ) => {

                event.stopPropagation();

                setSelectedBlockId(
                  block.id
                );

              }}
            >

{/* ===================================== */}
{/* BLOCK ACTIONS */}
{/* ===================================== */}

{isSelected && (

  <button
    type="button"
    title="Delete text block"
    aria-label="Delete text block"
    onClick={(event) => {

      event.stopPropagation();

      handleDeleteBlock(
        block.id
      );

    }}
    className="
      absolute
      right-2
      top-2
      z-20
      flex
      h-7
      w-7
      items-center
      justify-center
      rounded-[6px]
      border
      border-white/[0.06]
      bg-[#07111d]/90
      text-slate-500
      opacity-0
      transition-all
      hover:border-red-400/30
      hover:bg-red-500/10
      hover:text-red-400
      group-hover:opacity-100
    "
  >

    <Trash2
      size={14}
      strokeWidth={1.8}
    />

  </button>

)}


              {/* ===================================== */}
              {/* DRAG HANDLE */}
              {/* ===================================== */}

              <div
                onPointerDown={(
                  event
                ) =>
                  handlePointerDown(
                    event,
                    block
                  )
                }

className="
  absolute
  -top-[1px]
  left-0
  right-0
  z-20
  h-5
  cursor-move
  select-none
"
                aria-label="Move text block"
              />


{/* ===================================== */}
{/* TEXT */}
{/* ===================================== */}

<div
  className="
    relative
    h-full
    w-full
    bg-transparent
  "
  style={{
    padding: "10px",
  }}
  onPointerDown={(event) => {

    event.stopPropagation();

    setSelectedBlockId(
      block.id
    );

  }}
>

{isEmpty && (
  <div
    className="
      pointer-events-none
      absolute
      left-[10px]
      top-[10px]
      z-10
      text-[13px]
      font-medium
      text-slate-600
    "
  >
    Click to type...
  </div>
)}

<NoteBlockEditor
  content={
    block.content
  }

  onChange={(
    content
  ) => {

    handleBlockContentChange(
      block,
      content
    );

  }}

  onFocus={(
    editor
  ) => {

    setSelectedBlockId(
      block.id
    );

    onActiveBlockEditorChange(
      editor,
      block.id
    );

  }}

  onEditorReady={(
    editor
  ) => {

    void editor;

  }}
/>
</div>


{/* ===================================== */}
{/* RESIZE HANDLE */}
{/* ===================================== */}

{isSelected && (

  <div
    onPointerDown={(
      event
    ) =>
      handleResizePointerDown(
        event,
        block
      )
    }
    className="
      absolute
      bottom-[-5px]
      right-[-5px]
      z-30
      h-3
      w-3
      cursor-se-resize
      rounded-[2px]
      border
      border-blue-300
      bg-blue-400
    "
    aria-label="Resize text block"
  />

)}

            </div>

          );

        }
      )}


    </div>

  );

}