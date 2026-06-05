import { useState } from "react";

type KPIHistogramProps = {
  data: number[];
};

export default function KPIHistogram({
  data,
}: KPIHistogramProps) {

  const [isHovered, setIsHovered] =
    useState(false);

  if (data.length < 2) {
    return null;
  }

  const max =
    Math.max(...data);

  return (
    <div
      className="
        absolute
        bottom-2
        left-0
        right-0
        flex
        h-[48px]
        items-end
        gap-[2px]
        px-3
      "
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
    >
      {data.map(
        (value, index) => {

          const height =
            Math.max(
              4,
              (value / max) * 100
            );

          return (
            <div
              key={index}
              className={`
                flex-1
                rounded-t-[1px]
                transition-all
                duration-200

                ${
                  isHovered
                    ? "bg-violet-400/80"
                    : "bg-violet-500/45"
                }
              `}
              style={{
                height: `${
                  isHovered
                    ? Math.min(
                        height * 1.12,
                        100
                      )
                    : height
                }%`,
              }}
            />
          );
        }
      )}
    </div>
  );
}