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
  | "pen"
  | "line"
  | "arrow"
  | "zone"
  | "highlight"
  | "eraser";

  penColor: string;

  penWidth: number;

  onAnnotationCreated: (
    attachmentId: string,
    annotation: NoteAnnotation
  ) => void;

onAnnotationDeleted: (
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

// =================================================
// SIGNED IMAGE URL CACHE
// =================================================

const signedUrlCache =
  new Map<
    string,
    {
      url: string;
      expiresAt: number;
    }
  >();

const SIGNED_URL_TTL =
  50 * 60 * 1000;

export default function NoteAttachmentCanvas({
  attachments,
  activeAnnotationTool,
  penColor,
  penWidth,
  onAnnotationCreated,
  onAnnotationDeleted,
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
  loadedImageIds,
  setLoadedImageIds,
] = useState<Set<string>>(
  new Set()
);

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

  async function preloadImage(
    image: AttachmentImage
  ): Promise<boolean> {

    return new Promise(
      (resolve) => {

        const element =
          new Image();

        element.onload = () => {

          resolve(
            true
          );

        };

        element.onerror = () => {

          resolve(
            false
          );

        };

        element.src =
          image.url;

      }
    );
  }

  async function loadAttachmentUrls() {

    // =================================================
    // BUILD CACHED RESULTS FIRST
    // =================================================

    const cachedResults: AttachmentImage[] = [];

    const attachmentsNeedingUrls:
      NoteAttachment[] = [];

    const now =
      Date.now();

    for (
      const attachment of attachments
    ) {

      const cached =
        signedUrlCache.get(
          attachment.storagePath
        );

      if (
        cached &&
        cached.expiresAt > now
      ) {

        cachedResults.push({

          id:
            attachment.id,

          url:
            cached.url,

        });

      } else {

        attachmentsNeedingUrls.push(
          attachment
        );

      }
    }

    // =================================================
    // LOAD MISSING URLS IN PARALLEL
    // =================================================

    const urlResults =
      await Promise.all(
        attachmentsNeedingUrls.map(
          async (
            attachment
          ) => {

            const {
              data,
              error,
            } =
              await supabase.storage
                .from(
                  STORAGE_BUCKET
                )
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

              return null;
            }

            const image: AttachmentImage = {

              id:
                attachment.id,

              url:
                data.signedUrl,

            };

            signedUrlCache.set(
              attachment.storagePath,
              {
                url:
                  data.signedUrl,

                expiresAt:
                  Date.now() +
                  SIGNED_URL_TTL,
              }
            );

            return image;
          }
        )
      );

    if (
      cancelled
    ) {

      return;
    }

    const newlyLoadedUrls =
      urlResults.filter(
        (
          result
        ): result is AttachmentImage =>
          Boolean(result)
      );

    const allImages = [
      ...cachedResults,
      ...newlyLoadedUrls,
    ];

    // =================================================
    // PRELOAD ACTUAL IMAGE FILES
    // =================================================

    const preloadResults =
      await Promise.all(
        allImages.map(
          async (
            image
          ) => {

            const loaded =
              await preloadImage(
                image
              );

            return {
              image,
              loaded,
            };

          }
        )
      );

    if (
      cancelled
    ) {

      return;
    }

    const successfullyLoaded =
      preloadResults
        .filter(
          (
            result
          ) =>
            result.loaded
        )
        .map(
          (
            result
          ) =>
            result.image
        );

    const successfullyLoadedIds =
      new Set(
        successfullyLoaded.map(
          (
            image
          ) =>
            image.id
        )
      );

    // =================================================
    // UPDATE LOADED STATE
    // =================================================

    setAttachmentImages(
      successfullyLoaded
    );

    setLoadedImageIds(
      successfullyLoadedIds
    );

    setIsLoading(
      false
    );
  }

  loadAttachmentUrls();

  return () => {

    cancelled = true;

  };

}, [
  attachmentStorageKey,
]);

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
  attachment: NoteAttachment,
  mode:
    | "width"
    | "height"
    | "both"
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

    let nextWidth =
      initialWidth;

    let nextHeight =
      initialHeight;

    // =============================================
    // WIDTH ONLY
    // =============================================

    if (
      mode === "width"
    ) {

      nextWidth =
        Math.max(
          MIN_WIDTH,
          initialWidth +
            deltaX
        );
    }

    // =============================================
    // HEIGHT ONLY
    // =============================================

    if (
      mode === "height"
    ) {

      nextHeight =
        Math.max(
          MIN_HEIGHT,
          initialHeight +
            deltaY
        );
    }

    // =============================================
    // BOTH
    // =============================================

    if (
      mode === "both"
    ) {

      nextWidth =
        Math.max(
          MIN_WIDTH,
          initialWidth +
            deltaX
        );

      nextHeight =
        Math.max(
          MIN_HEIGHT,
          nextWidth /
            aspectRatio
        );
    }

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

    let finalWidth =
      initialWidth;

    let finalHeight =
      initialHeight;

    // =============================================
    // WIDTH ONLY
    // =============================================

    if (
      mode === "width"
    ) {

      finalWidth =
        Math.max(
          MIN_WIDTH,
          initialWidth +
            deltaX
        );
    }

    // =============================================
    // HEIGHT ONLY
    // =============================================

    if (
      mode === "height"
    ) {

      finalHeight =
        Math.max(
          MIN_HEIGHT,
          initialHeight +
            deltaY
        );
    }

    // =============================================
    // BOTH
    // =============================================

    if (
      mode === "both"
    ) {

      finalWidth =
        Math.max(
          MIN_WIDTH,
          initialWidth +
            deltaX
        );

      finalHeight =
        Math.max(
          MIN_HEIGHT,
          finalWidth /
            aspectRatio
        );
    }

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
  className="block h-full w-full select-none object-fill"
/>
</div>

              {/* ===================================== */}
              {/* ANNOTATION LAYER */}
              {/* ===================================== */}

{loadedImageIds.has(
  attachment.id
) && (

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

    onAnnotationDeleted={
      onAnnotationDeleted
    }

  />

)}

{/* ===================================== */}
{/* WIDTH HANDLE */}
{/* ===================================== */}

<div
  onPointerDown={(
    event
  ) =>
    handleResizeStart(
      event,
      attachment,
      "width"
    )
  }
  className="
    absolute
    right-[-4px]
    top-1/2
    z-30
    h-8
    w-2
    -translate-y-1/2
    cursor-ew-resize
    rounded-full
    bg-white/[0.18]
    opacity-0
    transition-opacity
    group-hover:opacity-100
  "
  title="Resize width"
  aria-label="Resize width"
/>

{/* ===================================== */}
{/* HEIGHT HANDLE */}
{/* ===================================== */}

<div
  onPointerDown={(
    event
  ) =>
    handleResizeStart(
      event,
      attachment,
      "height"
    )
  }
  className="
    absolute
    bottom-[-4px]
    left-1/2
    z-30
    h-2
    w-8
    -translate-x-1/2
    cursor-ns-resize
    rounded-full
    bg-white/[0.18]
    opacity-0
    transition-opacity
    group-hover:opacity-100
  "
  title="Resize height"
  aria-label="Resize height"
/>

{/* ===================================== */}
{/* BOTH HANDLE */}
{/* ===================================== */}

<div
  onPointerDown={(
    event
  ) =>
    handleResizeStart(
      event,
      attachment,
      "both"
    )
  }
className="
  absolute
  bottom-2
  right-2
  z-30
  flex
  h-6
  w-6
  cursor-nwse-resize
  items-center
  justify-center
  rounded-md
  border
  border-slate-400
  bg-slate-300
  text-slate-900
  opacity-0
  shadow-[0_4px_12px_rgba(0,0,0,0.35)]
  transition-all
  group-hover:opacity-100
  hover:border-slate-200
  hover:bg-slate-100
  hover:text-black
"
  title="Resize"
  aria-label="Resize"
>
  <span className="text-[11px] leading-none">
    ↖↘
  </span>
</div>

            </div>
          );
        }
      )}

    </div>
  );
}