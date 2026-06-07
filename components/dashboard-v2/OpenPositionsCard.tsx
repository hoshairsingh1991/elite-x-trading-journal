export default function OpenPositionsCard() {
  return (
    <div
      className="
        h-[220px]
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

   <div className="px-8 pt-5">

  <div className="flex items-center justify-between">

    <h3
      className="
        relative
        left-4
        text-[16px]
        font-semibold
        text-white
      "
    >
      Open Positions (3)
    </h3>

    <button
      className="
        relative
        right-4
        text-[13px]
        font-medium
        text-cyan-400
        transition-colors
        hover:text-cyan-300
      "
    >
      View all
    </button>

  </div>

</div>

  {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[12px]" />

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="mt-6 flex justify-center">
        <div className="w-[90%]">

          {/* HEADER ROW */}

          <div
            className="
              grid
              grid-cols-4
              text-[11px]
              uppercase
              tracking-[0.12em]
              text-slate-500
            "
          >
            <div>Symbol</div>

            <div>Direction</div>

            <div>Size</div>

            <div className="text-right">
              Unrealized P&L
            </div>
          </div>

          {/* DATA ROWS */}

          <div className="mt-4">

            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    grid
                    grid-cols-4
                    items-center
                    border-t
                    border-white/[0.04]
                    py-3
                  "
                >
                  <div className="h-4 w-12 rounded bg-white/[0.04]" />

                  <div className="h-4 w-16 rounded bg-white/[0.04]" />

                  <div className="h-4 w-10 rounded bg-white/[0.04]" />

                  <div className="flex justify-end">
                    <div className="h-4 w-14 rounded bg-white/[0.04]" />
                  </div>
                </div>
              )
            )}

          </div>

        </div>
      </div>
    </div>
  );
}