"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NoteAnnotation,
} from "@/types/note";

import {
  createNoteAnnotation,
} from "@/lib/storage/noteAnnotationStorage";


type Props = {
  attachmentId: string;

  annotations: NoteAnnotation[];

  width: number;
  height: number;

  activeTool:
    | "select"
    | "pen";

  penColor: string;

  penWidth: number;

  onAnnotationCreated: (
    attachmentId: string,
    annotation: NoteAnnotation
  ) => void;
};

type Point = {
  x: number;
  y: number;
};


export default function NoteAnnotationCanvas({
  attachmentId,
  annotations,
  width,
  height,
  activeTool,
  penColor,
  penWidth,
  onAnnotationCreated,
}: Props) {

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [
    isDrawing,
    setIsDrawing,
  ] = useState(false);

  const [
    currentPoints,
    setCurrentPoints,
  ] = useState<Point[]>([]);

  const [
    localAnnotations,
    setLocalAnnotations,
  ] = useState<NoteAnnotation[]>(
    annotations
  );

  // =================================================
  // SYNC ANNOTATIONS
  // =================================================

  useEffect(() => {

    setLocalAnnotations(
      (current) => {

        const parentIds =
          new Set(
            annotations.map(
              (annotation) =>
                annotation.id
            )
          );

        const locallyCreated =
          current.filter(
            (annotation) =>
              !parentIds.has(
                annotation.id
              )
          );

        return [
          ...annotations,
          ...locallyCreated,
        ];
      }
    );

  }, [annotations]);

  // =================================================
  // NORMALIZED → PIXEL
  // =================================================

  function normalizedToPixel(
    value: number,
    size: number
  ) {

    return value * size;
  }

  // =================================================
  // PIXEL → NORMALIZED
  // =================================================

  function pixelToNormalized(
    value: number,
    size: number
  ) {

    if (
      size <= 0
    ) {

      return 0;
    }

    return value / size;
  }

  // =================================================
  // DRAW CANVAS
  // =================================================

  function drawCanvas() {

    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {

      return;
    }

    const context =
      canvas.getContext(
        "2d"
      );

    if (
      !context
    ) {

      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // =================================================
    // EXISTING ANNOTATIONS
    // =================================================

    for (
      const annotation of
      localAnnotations
    ) {
      if (
        annotation.type !==
        "pen"
      ) {

        continue;
      }

      if (
        !annotation.points ||
        annotation.points.length < 2
      ) {

        continue;
      }

      context.beginPath();

      annotation.points.forEach(
        (
          point,
          index
        ) => {

          const x =
            normalizedToPixel(
              point.x,
              width
            );

          const y =
            normalizedToPixel(
              point.y,
              height
            );

          if (
            index === 0
          ) {

            context.moveTo(
              x,
              y
            );

          } else {

            context.lineTo(
              x,
              y
            );
          }
        }
      );

      context.strokeStyle =
        annotation.color;

      context.lineWidth =
        annotation.strokeWidth;

      context.lineCap =
        "round";

      context.lineJoin =
        "round";

      context.stroke();
    }

    // =================================================
    // CURRENT DRAWING
    // =================================================

    if (
      currentPoints.length < 2
    ) {

      return;
    }

    context.beginPath();

    currentPoints.forEach(
      (
        point,
        index
      ) => {

        if (
          index === 0
        ) {

          context.moveTo(
            point.x,
            point.y
          );

        } else {

          context.lineTo(
            point.x,
            point.y
          );
        }
      }
    );

context.strokeStyle =
  penColor;

context.lineWidth =
  penWidth;

    context.lineCap =
      "round";

    context.lineJoin =
      "round";

    context.stroke();
  }

  // =================================================
  // REDRAW
  // =================================================

useEffect(() => {

  drawCanvas();

}, [
  localAnnotations,
  width,
  height,
  currentPoints,
  penColor,
  penWidth,
]);

  // =================================================
  // POINTER → CANVAS COORDINATES
  // =================================================

  function getCanvasPoint(
    event:
      React.PointerEvent<HTMLCanvasElement>
  ) {

    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {

      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    return {
      pixelX:
        x,

      pixelY:
        y,

      normalizedX:
        pixelToNormalized(
          x,
          width
        ),

      normalizedY:
        pixelToNormalized(
          y,
          height
        ),
    };
  }

  // =================================================
  // POINTER DOWN
  // =================================================

function handlePointerDown(
  event:
    React.PointerEvent<HTMLCanvasElement>
) {

if (
  activeTool !== "pen"
) {

  return;
}

event.preventDefault();
event.stopPropagation();

const point =

      getCanvasPoint(
        event
      );

    if (
      !point
    ) {

      return;
    }

    setIsDrawing(
      true
    );

    setCurrentPoints([
      {
        x:
          point.pixelX,

        y:
          point.pixelY,
      },
    ]);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  // =================================================
  // POINTER MOVE
  // =================================================

function handlePointerMove(
  event:
    React.PointerEvent<HTMLCanvasElement>
) {

if (
  activeTool !== "pen" ||
  !isDrawing
) {

  return;
}

event.stopPropagation();

const point =
      getCanvasPoint(
        event
      );

    if (
      !point
    ) {

      return;
    }

    setCurrentPoints(
      (current) => [
        ...current,

        {
          x:
            point.pixelX,

          y:
            point.pixelY,
        },
      ]
    );
  }

  // =================================================
  // POINTER UP
  // =================================================

async function handlePointerUp(
  event:
    React.PointerEvent<HTMLCanvasElement>
) {

if (
  activeTool !== "pen" ||
  !isDrawing
) {

  return;
}

event.stopPropagation();

const point =
      getCanvasPoint(
        event
      );

    setIsDrawing(
      false
    );

    event.currentTarget.releasePointerCapture(
      event.pointerId
    );

    if (
      !point
    ) {

      setCurrentPoints(
        []
      );

      return;
    }

    // =================================================
    // BUILD NORMALIZED POINTS
    // =================================================

    const normalizedPoints =
      [
        ...currentPoints,
        {
          x:
            point.pixelX,

          y:
            point.pixelY,
        },
      ]
        .map(
          (item) => ({
            x:
              pixelToNormalized(
                item.x,
                width
              ),

            y:
              pixelToNormalized(
                item.y,
                height
              ),
          })
        );

    // =================================================
    // IGNORE VERY SHORT STROKES
    // =================================================

    if (
      normalizedPoints.length < 2
    ) {

      setCurrentPoints(
        []
      );

      return;
    }

    // =================================================
    // CALCULATE BOUNDS
    // =================================================

    const xs =
      normalizedPoints.map(
        (item) =>
          item.x
      );

    const ys =
      normalizedPoints.map(
        (item) =>
          item.y
      );

    const minX =
      Math.min(
        ...xs
      );

    const maxX =
      Math.max(
        ...xs
      );

    const minY =
      Math.min(
        ...ys
      );

    const maxY =
      Math.max(
        ...ys
      );

    // =================================================
    // CREATE ANNOTATION
    // =================================================

    const annotation:
      Omit<
        NoteAnnotation,
        "id" |
        "createdAt" |
        "updatedAt"
      > = {

attachmentId:
  attachmentId,

      type:
        "pen",

      positionX:
        minX,

      positionY:
        minY,

      width:
        Math.max(
          maxX -
            minX,
          0.001
        ),

      height:
        Math.max(
          maxY -
            minY,
          0.001
        ),

      rotation:
        0,

color:
  penColor,

strokeWidth:
  penWidth,

      points:
        normalizedPoints,

      text:
        null,

      fontSize:
        null,

      fontWeight:
        null,

      fontStyle:
        null,

      textDecoration:
        null,

      textAlign:
        null,
    };

    // =================================================
    // SAVE ANNOTATION
    // =================================================

    const createdAnnotation =
      await createNoteAnnotation(
        annotation
      );

    if (
      !createdAnnotation
    ) {

      console.error(
        "FAILED TO SAVE PEN ANNOTATION"
      );

      return;
    }

    setLocalAnnotations(
      (current) => [
        ...current,
        createdAnnotation,
      ]
    );

    onAnnotationCreated(
      attachmentId,
      createdAnnotation
    );

    // =================================================
    // RESET LOCAL DRAWING
    // =================================================

    setCurrentPoints(
      []
    );
  }

  // =================================================
  // EMPTY STATE
  // =================================================

  if (
    width <= 0 ||
    height <= 0
  ) {

    return null;
  }

  // =================================================
  // RENDER
  // =================================================

return (

  <div className="pointer-events-none absolute inset-0 z-30">



    <canvas
      ref={
        canvasRef
      }
      width={
        width
      }
      height={
        height
      }
className="absolute inset-0 z-10 h-full w-full touch-none"
style={{
  pointerEvents:
    activeTool === "pen"
      ? "auto"
      : "none",

cursor:
  activeTool === "pen"
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20z' fill='%23f8fafc' stroke='%230b1421' stroke-width='1.5'/%3E%3Cpath d='M14.5 7.5l2 2' stroke='%230b1421' stroke-width='1.5'/%3E%3C/svg%3E") 3 21, auto`
    : "grab",
}}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        handlePointerUp
      }
      onPointerCancel={
        handlePointerUp
      }
    />

  </div>

  );
}