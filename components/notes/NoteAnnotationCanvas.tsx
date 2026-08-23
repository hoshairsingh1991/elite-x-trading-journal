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
  Eraser,
  Highlighter,
} from "lucide-react";

import {
  createNoteAnnotation,
  deleteNoteAnnotation,
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
  highlightCursorPosition,
  setHighlightCursorPosition,
] = useState<Point | null>(null);

const [
  eraserHoveringAnnotation,
  setEraserHoveringAnnotation,
] = useState<string | null>(null);

  const [
    localAnnotations,
    setLocalAnnotations,
  ] = useState<NoteAnnotation[]>(
    annotations
  );

const deletedAnnotationIds =
  useRef<Set<string>>(
    new Set()
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

for (
  const id of
  deletedAnnotationIds.current
) {

  if (
    !parentIds.has(id)
  ) {

    deletedAnnotationIds.current.delete(
      id
    );

  }

}

const locallyCreated =
  current.filter(
    (annotation) =>
      !parentIds.has(
        annotation.id
      ) &&
      !deletedAnnotationIds.current.has(
        annotation.id
      )
  );



return [
  ...annotations.filter(
    (annotation) =>
      !deletedAnnotationIds.current.has(
        annotation.id
      )
  ),
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
  activeTool !== "arrow" &&
  activeTool !== "zone"
) {

  setLineStartPoint(
    null
  );
}

if (
  activeTool !== "pen" &&
  activeTool !== "highlight" &&
  activeTool !== "line" &&
  activeTool !== "arrow" &&
  activeTool !== "zone"
) {

  setCurrentPoints(
    []
  );
}

}, [
  activeTool,
]);

// =================================================
// RESET HIGHLIGHT CURSOR WHEN TOOL CHANGES
// =================================================

useEffect(() => {

  if (
    activeTool !== "highlight"
  ) {

    setHighlightCursorPosition(
      null
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
// FIND ANNOTATION AT POINT
// =================================================

function findAnnotationAtPoint(
  pixelX: number,
  pixelY: number
): NoteAnnotation | null {

  const normalizedX =
    pixelToNormalized(
      pixelX,
      width
    );

  const normalizedY =
    pixelToNormalized(
      pixelY,
      height
    );

  const hitTolerance =
    Math.max(
      penWidth * 2,
      8
    );

  // Check newest annotations first.
  for (
    let index =
      localAnnotations.length - 1;
    index >= 0;
    index--
  ) {

    const annotation =
      localAnnotations[index];

    if (
      !annotation.points ||
      annotation.points.length < 2
    ) {

      continue;
    }

    // =================================================
    // ZONE
    // =================================================

    if (
      annotation.type === "zone"
    ) {

      const start =
        annotation.points[0];

      const end =
        annotation.points[
          annotation.points.length - 1
        ];

      const minX =
        Math.min(
          start.x,
          end.x
        );

      const maxX =
        Math.max(
          start.x,
          end.x
        );

      const minY =
        Math.min(
          start.y,
          end.y
        );

      const maxY =
        Math.max(
          start.y,
          end.y
        );

      const tolerance =
        hitTolerance /
        Math.max(
          width,
          height
        );

      const nearLeft =
        Math.abs(
          normalizedX -
            minX
        ) <= tolerance;

      const nearRight =
        Math.abs(
          normalizedX -
            maxX
        ) <= tolerance;

      const nearTop =
        Math.abs(
          normalizedY -
            minY
        ) <= tolerance;

      const nearBottom =
        Math.abs(
          normalizedY -
            maxY
        ) <= tolerance;

      const insideHorizontal =
        normalizedX >=
          minX -
            tolerance &&
        normalizedX <=
          maxX +
            tolerance;

      const insideVertical =
        normalizedY >=
          minY -
            tolerance &&
        normalizedY <=
          maxY +
            tolerance;

      if (
        (nearLeft ||
          nearRight) &&
        insideVertical
      ) {

        return annotation;
      }

      if (
        (nearTop ||
          nearBottom) &&
        insideHorizontal
      ) {

        return annotation;
      }

      continue;
    }

    // =================================================
    // PEN / HIGHLIGHT
    // =================================================

    if (
      annotation.type === "pen" ||
      annotation.type === "highlight"
    ) {

      const tolerance =
        hitTolerance /
        Math.max(
          width,
          height
        );

      for (
        let pointIndex = 1;
        pointIndex <
          annotation.points.length;
        pointIndex++
      ) {

        const previous =
          annotation.points[
            pointIndex - 1
          ];

        const current =
          annotation.points[
            pointIndex
          ];

        const minX =
          Math.min(
            previous.x,
            current.x
          );

        const maxX =
          Math.max(
            previous.x,
            current.x
          );

        const minY =
          Math.min(
            previous.y,
            current.y
          );

        const maxY =
          Math.max(
            previous.y,
            current.y
          );

        if (
          normalizedX <
            minX -
              tolerance ||
          normalizedX >
            maxX +
              tolerance ||
          normalizedY <
            minY -
              tolerance ||
          normalizedY >
            maxY +
              tolerance
        ) {

          continue;
        }

        const dx =
          current.x -
          previous.x;

        const dy =
          current.y -
          previous.y;

const lengthSquared =
  dx * dx +
  dy * dy;

if (
  lengthSquared ===
  0
) {

  const distanceToPoint =
    Math.hypot(
      normalizedX -
        previous.x,

      normalizedY -
        previous.y
    );

  const pointTolerance =
    Math.max(
      hitTolerance,
      (
        annotation.strokeWidth *
        4
      ) /
        Math.max(
          width,
          height
        )
    );

  if (
    distanceToPoint <=
    pointTolerance
  ) {

    return annotation;
  }

  continue;
}

        const projection =
          (
            (
              normalizedX -
              previous.x
            ) *
              dx +
            (
              normalizedY -
              previous.y
            ) *
              dy
          ) /
          lengthSquared;

        const clampedProjection =
          Math.max(
            0,
            Math.min(
              1,
              projection
            )
          );

        const closestX =
          previous.x +
          clampedProjection *
            dx;

        const closestY =
          previous.y +
          clampedProjection *
            dy;

        const distance =
          Math.hypot(
            normalizedX -
              closestX,
            normalizedY -
              closestY
          );

        if (
          distance <=
          tolerance
        ) {

          return annotation;
        }
      }

      continue;
    }

    // =================================================
    // LINE / ARROW
    // =================================================

    if (
      annotation.type === "line" ||
      annotation.type === "arrow"
    ) {

      const start =
        annotation.points[0];

      const end =
        annotation.points[
          annotation.points.length - 1
        ];

      const dx =
        end.x -
        start.x;

      const dy =
        end.y -
        start.y;

      const lengthSquared =
        dx * dx +
        dy * dy;

      if (
        lengthSquared ===
        0
      ) {

        continue;
      }

      const projection =
        (
          (
            normalizedX -
            start.x
          ) *
            dx +
          (
            normalizedY -
            start.y
          ) *
            dy
        ) /
        lengthSquared;

      const clampedProjection =
        Math.max(
          0,
          Math.min(
            1,
            projection
          )
        );

      const closestX =
        start.x +
        clampedProjection *
          dx;

      const closestY =
        start.y +
        clampedProjection *
          dy;

      const tolerance =
        hitTolerance /
        Math.max(
          width,
          height
        );

      const distance =
        Math.hypot(
          normalizedX -
            closestX,
          normalizedY -
            closestY
        );

      if (
        distance <=
        tolerance
      ) {

        return annotation;
      }
    }

  }

  return null;
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
  annotation.type !== "arrow" &&
  annotation.type !== "zone" &&
  annotation.type !== "highlight"
) {

  continue;
}

      if (
        !annotation.points ||
        annotation.points.length < 2
      ) {

        continue;
      }

// =================================================
// DRAW EXISTING ANNOTATION
// =================================================

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

// =================================================
// PEN
// =================================================

if (
  annotation.type === "pen"
) {

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

  context.stroke();

  continue;
}


// =================================================
// HIGHLIGHT
// =================================================

if (
  annotation.type === "highlight"
) {

  context.save();

  context.globalAlpha =
    0.35;

  context.strokeStyle =
    annotation.color;

  context.lineWidth =
    Math.max(
      annotation.strokeWidth * 4,
      8
    );

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

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

  context.stroke();

  context.restore();

  continue;
}

// =================================================
// ZONE / RECTANGLE
// =================================================

if (
  annotation.type === "zone"
) {

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

  context.lineWidth =
    annotation.strokeWidth;

  context.strokeRect(
    startX,
    startY,
    endX - startX,
    endY - startY
  );

  continue;
}

// =================================================
// LINE / ARROW
// =================================================

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

// =================================================
// ARROW HEAD
// =================================================

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

// =================================================
// HIGHLIGHT PREVIEW
// =================================================

if (
  activeTool === "highlight"
) {

  context.save();

  context.globalAlpha =
    0.35;

  context.strokeStyle =
    penColor;

  context.lineWidth =
    Math.max(
      penWidth * 4,
      8
    );

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

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

  context.restore();

}

if (
  activeTool === "line" ||
  activeTool === "arrow" ||
  activeTool === "zone"
) {

  const start =
    currentPoints[0];

  const end =
    currentPoints[
      currentPoints.length - 1
    ];

  // =================================================
  // ZONE / RECTANGLE PREVIEW
  // =================================================

  if (
    activeTool === "zone"
  ) {

    context.strokeStyle =
      penColor;

    context.lineWidth =
      penWidth;

    context.strokeRect(
      start.x,
      start.y,
      end.x - start.x,
      end.y - start.y
    );

    return;
  }

  // =================================================
  // LINE / ARROW PREVIEW
  // =================================================

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

  // =================================================
  // ARROW HEAD
  // =================================================

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
  activeTool !== "highlight" &&
  activeTool !== "line" &&
  activeTool !== "arrow" &&
  activeTool !== "zone" &&
  activeTool !== "eraser"
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
// ERASER
// =================================================

if (
  activeTool === "eraser"
) {

  const annotation =
    findAnnotationAtPoint(
      point.pixelX,
      point.pixelY
    );

  if (
    !annotation
  ) {

    return;
  }

  const deleted =
    await deleteNoteAnnotation(
      annotation
    );



  if (
    !deleted
  ) {

    console.error(
      "FAILED TO DELETE NOTE ANNOTATION:",
      annotation.id
    );

    return;
  }

deletedAnnotationIds.current.add(
  annotation.id
);

  setLocalAnnotations(
    (current) =>
      current.filter(
        (item) =>
          item.id !==
          annotation.id
      )
  );

  return;
}

  // =================================================
  // LINE TOOL
  // =================================================

if (
  activeTool === "line" ||
  activeTool === "arrow" ||
  activeTool === "zone"
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
  activeTool === "zone"
    ? "zone"
    : activeTool === "arrow"
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
// FREEHAND TOOL — PEN / HIGHLIGHT
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
// ERASER HOVER DETECTION
// =================================================

if (
  activeTool === "eraser"
) {

  const point =
    getCanvasPoint(
      event
    );

  if (
    point
  ) {

    setHighlightCursorPosition({

      x:
        point.pixelX,

      y:
        point.pixelY,

    });

    const annotation =
      findAnnotationAtPoint(
        point.pixelX,
        point.pixelY
      );

    setEraserHoveringAnnotation(
      annotation?.id ?? null
    );

  } else {

    setEraserHoveringAnnotation(
      null
    );

  }

  return;
}

  // =================================================
  // HIGHLIGHT CURSOR
  // =================================================

  if (
    activeTool === "highlight"
  ) {

    const point =
      getCanvasPoint(
        event
      );

    if (
      point
    ) {

      setHighlightCursorPosition({

        x:
          point.pixelX,

        y:
          point.pixelY,

      });

    }

  }

  // =================================================
  // LINE PREVIEW
  // =================================================

if (
  activeTool === "line" ||
  activeTool === "arrow" ||
  activeTool === "zone"
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
  activeTool !== "pen" &&
  activeTool !== "highlight" ||
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
  (
    activeTool !== "pen" &&
    activeTool !== "highlight"
  ) ||
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
  activeTool === "highlight"
    ? "highlight"
    : "pen",

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

{activeTool === "highlight" &&
  highlightCursorPosition && (

    <div
      className="
        pointer-events-none
        absolute
        z-40
        -translate-x-[4px]
        -translate-y-[18px]
      "
      style={{
        left:
          highlightCursorPosition.x,

        top:
          highlightCursorPosition.y,
      }}
    >

      <Highlighter
        size={14}
        strokeWidth={1.8}
      />

      <span
        className="
          absolute
          left-1/2
          top-[16px]
          h-[2px]
          w-[12px]
          -translate-x-1/2
          rounded-full
        "
        style={{
          backgroundColor:
            penColor,
        }}
      />

    </div>

  )}

{/* ================================================= */}
{/* ERASER CURSOR */}
{/* ================================================= */}

{activeTool === "eraser" && (

  <div
    className="
      pointer-events-none
      absolute
      z-40
      -translate-x-[4px]
      -translate-y-[18px]
    "
    style={{
      left:
        highlightCursorPosition?.x ?? 0,

      top:
        highlightCursorPosition?.y ?? 0,
    }}
  >

    <Eraser
      size={14}
      strokeWidth={1.8}
      className={
        eraserHoveringAnnotation
          ? "text-red-400"
          : "text-slate-300"
      }
    />

    {eraserHoveringAnnotation && (

      <span
        className="
          absolute
          left-1/2
          top-[16px]
          h-[2px]
          w-[12px]
          -translate-x-1/2
          rounded-full
          bg-red-400
        "
      />

    )}

  </div>

)}

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
  activeTool === "arrow" ||
  activeTool === "zone" ||
  activeTool === "highlight" ||
  activeTool === "eraser"
    ? "auto"
    : "none",

cursor:
  activeTool === "pen"
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M4 20l4.5-1 10-10a2.1 2.1 0 0 1 3 3l-10 10L4 20z' fill='%23f8fafc' stroke='%230b1421' stroke-width='1.5'/%3E%3Cpath d='M14.5 7.5l2 2' stroke='%230b1421' stroke-width='1.5'/%3E%3C/svg%3E") 3 21, auto`
: activeTool === "line" ||
  activeTool === "arrow" ||
  activeTool === "zone"
  ? "crosshair"
: activeTool === "highlight"
  ? "none"
: activeTool === "eraser"
  ? "none"
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