"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  NoteAttachment,
  NoteAnnotation,
} from "@/types/note";

import NoteAnnotationCanvas
from "@/components/notes/NoteAnnotationCanvas";

import { supabase }
from "@/lib/supabase";


import {
  updateNoteAttachmentLayout,
} from "@/lib/storage/noteAttachmentStorage";

import {
  Trash2,
} from "lucide-react";



type Props = {
  attachments: NoteAttachment[];

  activeAnnotationTool:
    | "select"
    | "pen";

  penColor: string;

  penWidth: number;

  onAnnotationCreated: (
    attachmentId: string,
    annotation: NoteAnnotation
  ) => void;

  onDelete: (
    attachment: NoteAttachment
  ) => Promise<void>;

  onLayoutChange: (
    attachment: NoteAttachment,
    layout: {
      positionX: number;
      positionY: number;
      width: number;
      height: number;
    }
  ) => Promise<void>;
};

type AttachmentImage = {
  id: string;
  url: string;
};

const STORAGE_BUCKET =
  "note-attachments";

const MIN_WIDTH = 250;
const MIN_HEIGHT = 180;



export default function NoteAttachmentCanvas({
  attachments,
  activeAnnotationTool,
  penColor,
  penWidth,
  onAnnotationCreated,
  onDelete,
  onLayoutChange,
}: Props) {


      const attachmentStorageKey =
    attachments
      .map(
        (attachment) =>
          `${attachment.id}:${attachment.storagePath}`
      )
      .join("|");
  const [
    attachmentImages,
    setAttachmentImages,
  ] = useState<AttachmentImage[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    localAttachments,
    setLocalAttachments,
  ] = useState<NoteAttachment[]>(
    attachments
  );

  const [
    draggingId,
    setDraggingId,
  ] = useState<string | null>(
    null
  );

  const [
    resizingId,
    setResizingId,
  ] = useState<string | null>(
    null
  );

  // =================================================
  // SYNC LOCAL ATTACHMENTS
  // =================================================

  useEffect(() => {

    setLocalAttachments(
      attachments
    );

  }, [attachments]);

  // =================================================
  // LOAD SECURE IMAGE URLS
  // =================================================

  useEffect(() => {

    let cancelled = false;

    async function loadAttachmentUrls() {

      setIsLoading(true);

      const results: AttachmentImage[] = [];

      for (
        const attachment of attachments
      ) {

        const {
          data,
          error,
        } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(
              attachment.storagePath,
              60 * 60
            );

        if (
          error ||
          !data?.signedUrl
        ) {

          console.error(
            "FAILED TO CREATE NOTE ATTACHMENT URL:",
            error
          );

          continue;
        }

        results.push({
          id:
            attachment.id,

          url:
            data.signedUrl,
        });
      }

      if (!cancelled) {

        setAttachmentImages(
          results
        );

        setIsLoading(false);
      }
    }

    loadAttachmentUrls();

    return () => {

      cancelled = true;
    };

}, [attachmentStorageKey]);

  // =================================================
  // DRAG START
  // =================================================

  function handleDragStart(
    event: React.PointerEvent<HTMLDivElement>,
    attachment: NoteAttachment
  ) {

    event.preventDefault();

    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const initialX =
      attachment.positionX;

    const initialY =
      attachment.positionY;

    setDraggingId(
      attachment.id
    );

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    function handlePointerMove(
      moveEvent: PointerEvent
    ) {

      const deltaX =
        moveEvent.clientX -
        startX;

      const deltaY =
        moveEvent.clientY -
        startY;

      setLocalAttachments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              attachment.id
                ? {
                    ...item,

                    positionX:
                      initialX +
                      deltaX,

                    positionY:
                      initialY +
                      deltaY,
                  }
                : item
          )
      );
    }

    function handlePointerUp(
      upEvent: PointerEvent
    ) {

      const deltaX =
        upEvent.clientX -
        startX;

      const deltaY =
        upEvent.clientY -
        startY;

      const finalX =
        initialX +
        deltaX;

      const finalY =
        initialY +
        deltaY;

      setLocalAttachments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              attachment.id
                ? {
                    ...item,

                    positionX:
                      finalX,

                    positionY:
                      finalY,
                  }
                : item
          )
      );

      setDraggingId(
        null
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );

onLayoutChange(
  attachment,
  {
    positionX:
      finalX,

    positionY:
      finalY,

    width:
      attachment.width,

    height:
      attachment.height,
  }
);
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );
  }

  // =================================================
  // RESIZE START
  // =================================================

  function handleResizeStart(
    event: React.PointerEvent<HTMLDivElement>,
    attachment: NoteAttachment
  ) {

    event.preventDefault();
    event.stopPropagation();

    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const initialWidth =
      attachment.width;

    const initialHeight =
      attachment.height;

      const aspectRatio =
  initialWidth /
  initialHeight;

    setResizingId(
      attachment.id
    );

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    function handlePointerMove(
      moveEvent: PointerEvent
    ) {

      const deltaX =
        moveEvent.clientX -
        startX;

      const deltaY =
        moveEvent.clientY -
        startY;

const nextWidth =
  Math.max(
    MIN_WIDTH,
    initialWidth +
      deltaX
  );

const nextHeight =
  Math.max(
    MIN_HEIGHT,
    nextWidth /
      aspectRatio
  );

      setLocalAttachments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              attachment.id
                ? {
                    ...item,

                    width:
                      nextWidth,

                    height:
                      nextHeight,
                  }
                : item
          )
      );
    }

    function handlePointerUp(
      upEvent: PointerEvent
    ) {

      const deltaX =
        upEvent.clientX -
        startX;

      const deltaY =
        upEvent.clientY -
        startY;

const finalWidth =
  Math.max(
    MIN_WIDTH,
    initialWidth +
      deltaX
  );

const finalHeight =
  Math.max(
    MIN_HEIGHT,
    finalWidth /
      aspectRatio
  );

      setLocalAttachments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              attachment.id
                ? {
                    ...item,

                    width:
                      finalWidth,

                    height:
                      finalHeight,
                  }
                : item
          )
      );

      setResizingId(
        null
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );

onLayoutChange(
  attachment,
  {
    positionX:
      attachment.positionX,

    positionY:
      attachment.positionY,

    width:
      finalWidth,

    height:
      finalHeight,
  }
);
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );
  }

  // =================================================
  // EMPTY STATE
  // =================================================

  if (
    attachments.length === 0
  ) {

    return null;
  }

  // =================================================
  // LOADING STATE
  // =================================================

  if (
    isLoading
  ) {

    return (
      <div className="mt-6 text-sm text-slate-500">
        Loading screenshots...
      </div>
    );
  }

  // =================================================
  // RENDER
  // =================================================

return (

  <div className="pointer-events-none absolute inset-0 z-20">

      {attachmentImages.map(
        (image) => {

          const attachment =
            localAttachments.find(
              (item) =>
                item.id ===
                image.id
            );

          if (!attachment) {

            return null;
          }

          const isDragging =
            draggingId ===
            attachment.id;

          const isResizing =
            resizingId ===
            attachment.id;

          return (

<div
  key={
    attachment.id
  }
  className={`pointer-events-auto group absolute overflow-visible rounded-[12px] ${
                isDragging
                  ? "z-50 cursor-grabbing"
                  : isResizing
                    ? "z-50"
                    : "cursor-grab"
              }`}
              style={{
                left:
                  attachment.positionX,

                top:
                  attachment.positionY,

                width:
                  attachment.width,

                height:
                  attachment.height,
              }}
              onPointerDown={(
                event
              ) =>
                handleDragStart(
                  event,
                  attachment
                )
              }
            >

              {/* ===================================== */}
              {/* DELETE */}
              {/* ===================================== */}

              <button
                type="button"
                onPointerDown={(
                  event
                ) => {
                  event.stopPropagation();
                }}
                onClick={() =>
                  onDelete(
                    attachment
                  )
                }
                title="Delete screenshot"
                aria-label="Delete screenshot"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-[#020817]/90 text-red-400 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/10 group-hover:opacity-100"
              >

                <Trash2
                  size={17}
                  strokeWidth={1.8}
                />

              </button>

              {/* ===================================== */}
              {/* IMAGE */}
              {/* ===================================== */}

<div className="h-full w-full overflow-hidden rounded-[12px]">
  <img
    src={
      image.url
    }
    alt={
      attachment.fileName
    }
    draggable={
      false
    }
    className="block h-full w-full select-none object-contain"
  />
</div>

              {/* ===================================== */}
              {/* ANNOTATION LAYER */}
              {/* ===================================== */}

<NoteAnnotationCanvas
  attachmentId={
    attachment.id
  }
  annotations={
    attachment.annotations
  }
  width={
    attachment.width
  }
  height={
    attachment.height
  }
  activeTool={
    activeAnnotationTool
  }
  penColor={
    penColor
  }
  penWidth={
    penWidth
  }
  onAnnotationCreated={
    onAnnotationCreated
  }
/>

              {/* ===================================== */}
              {/* RESIZE HANDLE */}
              {/* ===================================== */}

              <div
                onPointerDown={(
                  event
                ) =>
                  handleResizeStart(
                    event,
                    attachment
                  )
                }
                className="absolute bottom-2 right-2 z-30 h-5 w-5 cursor-nwse-resize rounded-md border border-white/[0.10] bg-[#020817]/90 opacity-0 transition-opacity group-hover:opacity-100"
                title="Resize screenshot"
                aria-label="Resize screenshot"
              />

            </div>
          );
        }
      )}

    </div>
  );
}