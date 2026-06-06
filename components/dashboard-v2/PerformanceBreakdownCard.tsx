export default function PerformanceBreakdownCard() {
 return (
    <div
      className="
        h-[500px]
        overflow-hidden
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl
      "
    >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div>
          <h3 className="text-[15px] font-semibold text-white">
            Performance Breakdown
          </h3>
        </div>

        {/* ================================================= */}
        {/* DONUT + LEGEND AREA */}
        {/* ================================================= */}

        <div className="mt-8 flex items-center gap-6">
          {/* Donut Placeholder */}

          <div
            className="
              h-[180px]
              w-[180px]
              rounded-full
              border-4
              border-white/[0.08]
            "
          />

          {/* Legend Placeholder */}

          <div className="flex flex-1 flex-col gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.25]" />

                  <div className="h-4 w-24 rounded bg-white/[0.04]" />
                </div>

                <div className="h-4 w-16 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM METRICS */}
        {/* ================================================= */}

        <div className="mt-10 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <div className="h-4 w-20 rounded bg-white/[0.04]" />

              <div className="mt-3 h-6 w-10 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    
  );
}