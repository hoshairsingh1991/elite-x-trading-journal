export default function EquityCurveCard() {
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

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold tracking-[0.12em] text-slate-400">
              EQUITY CURVE
            </h3>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[15px] text-slate-300">
                Net Account Value (USD)
              </span>

              <div className="h-4 w-4 rounded-full border border-slate-600" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-16 rounded-xl bg-white/[0.04]" />
            <div className="h-8 w-24 rounded-xl bg-white/[0.04]" />
            <div className="h-8 w-20 rounded-xl bg-white/[0.04]" />
          </div>
        </div>

        {/* ================================================= */}
        {/* CHART PLACEHOLDER */}
        {/* ================================================= */}

        <div
          className="
            mt-6
            h-[405px]
            rounded-[18px]
            border
            border-white/[0.03]
          "
        />

        {/* ================================================= */}
        {/* KPI STRIP PLACEHOLDER */}
        {/* ================================================= */}

        <div className="mt-6 grid grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="text-[11px] text-slate-500">
                Placeholder
              </div>

              <div className="mt-2 h-5 w-16 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    
  );
}