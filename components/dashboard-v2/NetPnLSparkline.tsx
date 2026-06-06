"use client";

import { useState } from "react";

// =================================================
// LOCAL DATE PARSER
// =================================================

function parseLocalDate(
  dateString: string
) {

  const cleanDate =
    dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

  const [
    year,
    month,
    day,
  ] = cleanDate
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}


type NetPnLSparklineProps = {
  data: {
    date: string;
    pnl: number;
  }[];
};

export default function NetPnLSparkline({
  data,
}: NetPnLSparklineProps) {

  if (data.length < 2) {
    return null;
  }

  const [hoverIndex, setHoverIndex] =
  useState<number | null>(null);

  const values = data.map(
    point => point.pnl
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  const coordinates = values.map(
    (value, index) => {

      const x =
        (index / (values.length - 1)) *
        100;

      const y =
        max === min
          ? 50
          : 100 -
            ((value - min) /
              (max - min)) *
              100;

      return { x, y };
    }
  );

  let path =
    `M ${coordinates[0].x} ${coordinates[0].y}`;

  for (
    let i = 1;
    i < coordinates.length;
    i++
  ) {

    const prev =
      coordinates[i - 1];

    const curr =
      coordinates[i];

    const cx =
      (prev.x + curr.x) / 2;

    path += `
      C
      ${cx} ${prev.y},
      ${cx} ${curr.y},
      ${curr.x} ${curr.y}
    `;
  }

const hoveredPoint =
  hoverIndex !== null
    ? data[hoverIndex]
    : null;


 return (

<div className="relative h-[55px] w-full">

<svg
  viewBox="0 0 100 100"
  className="h-[55px] w-full"
  preserveAspectRatio="none"

  onMouseMove={(event) => {

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const percentage =
      x / rect.width;

    const index =
      Math.min(
        values.length - 1,
        Math.max(
          0,
          Math.round(
            percentage *
            (values.length - 1)
          )
        )
      );

    setHoverIndex(index);
  }}

  onMouseLeave={() =>
    setHoverIndex(null)
  }
>

      <path
        d={`${path}
        L 100 100
        L 0 100
        Z`}
        fill="rgba(52,211,153,0.18)"
      />

      <path
        d={path}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

{hoverIndex !== null && (

  <circle
    cx={
      coordinates[hoverIndex].x
    }
    cy={
      coordinates[hoverIndex].y
    }
    r="3"
    fill="#34d399"
    stroke="#081526"
    strokeWidth="1.5"
  />

)}

</svg>

{hoveredPoint && hoverIndex !== null && (

  <>

    <div
      className="
        absolute
        z-50

        -translate-x-1/2
        -translate-y-15

        text-center
        pointer-events-none
      "
      style={{
        left: `${coordinates[hoverIndex].x}%`,
        top: `${coordinates[hoverIndex].y}%`,
      }}
    >

      <div
        className="
        rounded-md
        bg-[#081526]/80
        px-1.5
        py-0.5
        backdrop-blur-xl
          text-[14px]
          text-slate-400
        "
      >
        {parseLocalDate(
          hoveredPoint.date
        ).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        )}
      </div>

      <div
        className={`
            rounded-md
        bg-[#081526]/80
        px-1.5
        py-0.5
        backdrop-blur-xl
          text-[14px]
          font-semibold
          ${
            hoveredPoint.pnl >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }
        `}
      >
        ${hoveredPoint.pnl.toFixed(2)}
      </div>

    </div>

    <div
      className={`
        absolute
        h-2.5
        w-2.5
        rounded-full
        border
        pointer-events-none
        ${
          hoveredPoint.pnl >= 0
            ? "bg-emerald-400"
            : "bg-red-400"
        }
      `}
      style={{
        left: `${coordinates[hoverIndex].x}%`,
        top: `${coordinates[hoverIndex].y}%`,
        transform:
          "translate(-50%, -50%)",
        borderColor: "#081526",
      }}
    />

  </>

)}

</div>

);
}