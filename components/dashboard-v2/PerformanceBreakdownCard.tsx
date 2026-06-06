export default function PerformanceBreakdownCard() {
  return (
    <div
      className="
        h-[480px]
        overflow-hidden
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl
      "
    >
      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[10px]" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-8 pt-7">
        <div className="relative left-4">
          <h3 className="text-[16px] font-semibold text-white">
            Performance Breakdown
          </h3>

          <p className="mt-2 text-[15px] text-slate-500">
            Trading distribution analysis
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* DONUT + LEGEND */}
      {/* ================================================= */}

      <div className="mt-10 flex justify-center">
        <div className="w-[90%]">

          <div className="flex items-center justify-center gap-10">

            {/* DONUT PLACEHOLDER */}

            <div
              className="
                h-[180px]
                w-[180px]
                rounded-full
                border-4
                border-white/[0.08]
              "
            />

            {/* LEGEND PLACEHOLDER */}

            <div className="flex flex-1 flex-col gap-5">

              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className="
                          h-2.5
                          w-2.5
                          rounded-full
                          bg-white/[0.25]
                        "
                      />

                      <div
                        className="
                          h-4
                          w-24
                          rounded
                          bg-white/[0.04]
                        "
                      />
                    </div>

                    <div
                      className="
                        h-4
                        w-16
                        rounded
                        bg-white/[0.04]
                      "
                    />
                  </div>
                )
              )}

            </div>

          </div>

        </div>
      </div>

      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[35px]" />

      {/* ================================================= */}
      {/* BOTTOM METRICS */}
      {/* ================================================= */}

      <div className="flex justify-center">
        <div className="w-[90%]">

          <div className="grid grid-cols-3 gap-6">

            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    flex
                    flex-col
                    items-center
                  "
                >
                  <div
                    className="
                      h-4
                      w-24
                      rounded
                      bg-white/[0.04]
                    "
                  />

                  <div
                    className="
                      mt-4
                      h-7
                      w-16
                      rounded
                      bg-white/[0.04]
                    "
                  />
                </div>
              )
            )}

          </div>

        </div>
      </div>

    </div>
  );
}