import { useState } from "react";

type KPISparklineProps = {
  data: number[];
  color?: string;
};

export default function KPISparkline({
  data,
  color = "#34d399",
}: KPISparklineProps) {

  const gradientId =
  `sparkFill-${color?.replace("#", "")}`;

  const [isHovered, setIsHovered] =
  useState(false);

  if (data.length < 2) {
  return null;
}

  console.log(
  "Sparkline:",
  data.length,
  data
);

  const smoothedData = data.map((_, index) => {
    const start = Math.max(0, index - 2);
    const end = Math.min(
      data.length,
      index + 3
    );

    const slice = data.slice(start, end);

    return (
      slice.reduce(
        (sum, value) => sum + value,
        0
      ) / slice.length
    );
  });

const chartData = smoothedData;

  const min = Math.min(...chartData);
  const max = Math.max(...chartData);

  const coordinates = chartData.map(
  (value, index) => {

    const x =
      (index / (chartData.length - 1)) *
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

let path = `M ${coordinates[0].x} ${coordinates[0].y}`;

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

  return (
<svg
  viewBox="0 0 100 100"
  className="h-[55px] w-full"
  preserveAspectRatio="none"
  onMouseEnter={() =>
    setIsHovered(true)
  }
  onMouseLeave={() =>
    setIsHovered(false)
  }
>

    <defs>
      <linearGradient
  id={gradientId}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor={color}
          stopOpacity={
  isHovered
    ? 0.45
    : 0.28
}
        />    
        <stop
          offset="100%"
          stopColor={color}
          stopOpacity="0"
        />
      </linearGradient>
    </defs>

    <path
      d={`${path}
      L 100 100
      L 0 100
      Z`}
      fill={`url(#${gradientId})`}
    />

<path
  d={path}
  fill="none"
  stroke={color}
  strokeWidth={
    isHovered
      ? 1.8
      : 1
  }
  strokeLinecap="round"
  strokeLinejoin="round"
  className="
    transition-all
    duration-200
  "
/>

  </svg>
);
}