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
  | "pen"
  | "line"
  | "arrow";

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
  lineStartPoint,
  setLineStartPoint,
] = useState<Point | null>(null);

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
// RESET LINE STATE WHEN TOOL CHANGES
// =================================================

useEffect(() => {

if (
  activeTool !== "line" &&
  activeTool !== "arrow"
) {

  setLineStartPoint(
    null
  );

  setCurrentPoints(
    []
  );
}

}, [
  activeTool,
]);

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
  annotation.type !== "pen" &&
  annotation.type !== "line" &&
  annotation.type !== "arrow"
) {

  continue;
}

      if (
        !annotation.points ||
        annotation.points.length < 2
      ) {

        continue;
      }

const startPoint =
  annotation.points[0];

const endPoint =
  annotation.points[
    annotation.points.length - 1
  ];

const startX =
  normalizedToPixel(
    startPoint.x,
    width
  );

const startY =
  normalizedToPixel(
    startPoint.y,
    height
  );

const endX =
  normalizedToPixel(
    endPoint.x,
    width
  );

const endY =
  normalizedToPixel(
    endPoint.y,
    height
  );

context.strokeStyle =
  annotation.color;

context.fillStyle =
  annotation.color;

context.lineWidth =
  annotation.strokeWidth;

context.lineCap =
  "round";

context.lineJoin =
  "round";

context.beginPath();

context.moveTo(
  startX,
  startY
);

context.lineTo(
  endX,
  endY
);

context.stroke();

if (
  annotation.type === "arrow"
) {

  const angle =
    Math.atan2(
      endY - startY,
      endX - startX
    );

  const arrowLength =
    Math.max(
      10,
      annotation.strokeWidth * 4
    );

  const arrowAngle =
    Math.PI / 7;

  context.beginPath();

  context.moveTo(
    endX,
    endY
  );

  context.lineTo(
    endX -
      arrowLength *
      Math.cos(
        angle - arrowAngle
      ),
    endY -
      arrowLength *
      Math.sin(
        angle - arrowAngle
      )
  );

  context.lineTo(
    endX -
      arrowLength *
      Math.cos(
        angle + arrowAngle
      ),
    endY -
      arrowLength *
      Math.sin(
        angle + arrowAngle
      )
  );

  context.closePath();

  context.fill();
}
    }

// =================================================
// CURRENT DRAWING
// =================================================

if (
  currentPoints.length < 2
) {

  return;
}

context.strokeStyle =
  penColor;

context.lineWidth =
  penWidth;

context.lineCap =
  "round";

context.lineJoin =
  "round";

if (
  activeTool === "pen"
) {

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

  context.stroke();

}

if (
  activeTool === "line" ||
  activeTool === "arrow"
) {

  const start =
    currentPoints[0];

  const end =
    currentPoints[
      currentPoints.length - 1
    ];

  context.beginPath();

  context.moveTo(
    start.x,
    start.y
  );

  context.lineTo(
    end.x,
    end.y
  );

  context.stroke();

  if (
    activeTool === "arrow"
  ) {

    const angle =
      Math.atan2(
        end.y - start.y,
        end.x - start.x
      );

    const arrowLength =
      Math.max(
        10,
        penWidth * 4
      );

    const arrowAngle =
      Math.PI / 7;

    context.fillStyle =
      penColor;

    context.beginPath();

    context.moveTo(
      end.x,
      end.y
    );

    context.lineTo(
      end.x -
        arrowLength *
        Math.cos(
          angle - arrowAngle
        ),
      end.y -
        arrowLength *
        Math.sin(
          angle - arrowAngle
        )
    );

    context.lineTo(
      end.x -
        arrowLength *
        Math.cos(
          angle + arrowAngle
        ),
      end.y -
        arrowLength *
        Math.sin(
          angle + arrowAngle
        )
    );

    context.closePath();

    context.fill();
  }

}
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

async function handlePointerDown(
  event:
    React.PointerEvent<HTMLCanvasElement>
) {

if (
  activeTool !== "pen" &&
  activeTool !== "line" &&
  activeTool !== "arrow"
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

  // =================================================
  // LINE TOOL
  // =================================================

if (
  activeTool === "line" ||
  activeTool === "arrow"
) {

    if (
      !lineStartPoint
    ) {

      setLineStartPoint({

        x:
          point.pixelX,

        y:
          point.pixelY,

      });

      setCurrentPoints([

        {
          x:
            point.pixelX,

          y:
            point.pixelY,
        },

        {
          x:
            point.pixelX,

          y:
            point.pixelY,
        },

      ]);

      return;
    }

    const startPoint =
      lineStartPoint;

    const endPoint = {

      x:
        point.pixelX,

      y:
        point.pixelY,

    };

    const normalizedPoints =
      [
        startPoint,
        endPoint,
      ].map(
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
  activeTool === "arrow"
    ? "arrow"
    : "line",

      positionX:
        minX,

      positionY:
        minY,

      width:
        Math.max(
          maxX - minX,
          0.001
        ),

      height:
        Math.max(
          maxY - minY,
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

    const createdAnnotation =
      await createNoteAnnotation(
        annotation
      );

    if (
      !createdAnnotation
    ) {

console.error(
  `FAILED TO SAVE ${
    activeTool === "arrow"
      ? "ARROW"
      : "LINE"
  } ANNOTATION`
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

    setLineStartPoint(
      null
    );

    setCurrentPoints(
      []
    );

    return;
  }

  // =================================================
  // PEN TOOL
  // =================================================

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

  // =================================================
  // LINE PREVIEW
  // =================================================

if (
  activeTool === "line" ||
  activeTool === "arrow"
) {

    if (
      !lineStartPoint
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

    setCurrentPoints([

      {
        x:
          lineStartPoint.x,

        y:
          lineStartPoint.y,
      },

      {
        x:
          point.pixelX,

        y:
          point.pixelY,
      },

    ]);

    return;
  }

  // =================================================
  // PEN
  // =================================================

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
  ].map(
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
  activeTool === "pen" ||
  activeTool === "line" ||
  activeTool === "arrow"
    ? "auto"
    : "none",

cursor:
  activeTool === "pen"
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M4 20l4.5-1 10-10a2.1 2.1 0 0 1 3 3l-10 10L4 20z' fill='%23f8fafc' stroke='%230b1421' stroke-width='1.5'/%3E%3Cpath d='M14.5 7.5l2 2' stroke='%230b1421' stroke-width='1.5'/%3E%3C/svg%3E") 3 21, auto`
    : activeTool === "line" ||
      activeTool === "arrow"
      ? "crosshair"
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