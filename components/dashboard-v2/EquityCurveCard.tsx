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
            Equity Curve
          </h3>

          <p className="mt-2 text-[15px] text-slate-500">
            Net Account Value (USD)
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* CONTROLS */}
      {/* ================================================= */}

<div className="mt-7 flex justify-end px-12">
  <div className="relative bottom-10 flex items-center">

    <div className="relative right-10">
      <button
        className="
          h-[35px]
          min-w-[60px]
          rounded-[14px]
          border
          border-cyan-400/20
          bg-cyan-500/10
          px-5
          text-[14px]
          font-semibold
          text-cyan-300
        "
      >
        Linear
      </button>
    </div>

    <div className="relative right-9.5">
      <button
        className="
          h-[35px]
          min-w-[100px]
          rounded-[14px]
          border
          border-white/[0.08]
          bg-white/[0.03]
          px-5
          text-[14px]
          font-semibold
          text-slate-400
        "
      >
        Logarithmic
      </button>
    </div>

    <div className="relative right-6">
      <button
        className="
          h-[35px]
          min-w-[80px]
          rounded-[14px]
          border
          border-white/[0.08]
          bg-white/[0.03]
          px-5
          text-[14px]
          font-semibold
          text-slate-400
        "
      >
        Compare
      </button>
    </div>

  </div>
</div>



      {/* ================================================= */}
      {/* CHART PLACEHOLDER */}
      {/* ================================================= */}

      <div className="relative bottom-6 mt-6 px-12">
<div className="flex justify-center">
  <div
    className="
      h-[320px]
      w-[95%]
      rounded-[20px]
      border
      border-white/[0.05]
      bg-white/[0.02]
    "
  />
</div>
      </div>

{/* ================================================= */}
{/* KPI STRIP */}
{/* ================================================= */}

<div className="mt-6 flex justify-center">
  <div className="relative left-6 w-[95%]">
    <div className="grid grid-cols-6 gap-6">
      {[
        "Starting",
        "Ending",
        "Net Change",
        "% Change",
        "High",
        "Low",
      ].map((label) => (
        <div key={label}>
          <p className="text-[12px] uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>

          <div className="mt-3 h-5 w-20 rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  );
}