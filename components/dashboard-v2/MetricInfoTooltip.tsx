import { useState } from "react";

type MetricInfoTooltipProps = {
  definition: string;
  formula: string;
  calculation: string;
  interpretation: string;
};

export default function MetricInfoTooltip({
  definition,
  formula,
  calculation,
  interpretation,
}: MetricInfoTooltipProps) {

  const [isOpen, setIsOpen] =
    useState(false);

  return (
<div
  className="
    relative
    -translate-x-1
    -translate-y-0.5
  "
  onMouseEnter={() =>
    setIsOpen(true)
  }
  onMouseLeave={() =>
    setIsOpen(false)
  }
>
      <button
        type="button"
        className="
          flex
          h-4
          w-4
          items-center
          justify-center
          rounded-full
          border
          border-slate-600
          text-[10px]
          text-slate-400
          transition-colors
          hover:border-cyan-400
          hover:text-cyan-400
        "
      >
        i
      </button>

      {isOpen && (
<div
   className="
    absolute
    left-0
    top-10
    z-50
    w-[350px]
    rounded-[16px]
    border
    border-white/10
    bg-[#040d1a]/20
    backdrop-blur-3xl
    px-5
    py-4
    shadow-[0_0_30px_rgba(0,0,0,0.45)]
  "
>
<div
  className="
    space-y-4
    translate-x-3
  "
>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Definition
              </p>
              <p className="text-[13px] text-slate-200">
                {definition}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Formula
              </p>
              <p className="text-[13px] text-slate-200">
                {formula}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Your Calculation
              </p>
              <p className="text-[13px] text-slate-300">
                {calculation}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Interpretation
              </p>
              <p className="text-[13px] text-slate-300">
                {interpretation}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}