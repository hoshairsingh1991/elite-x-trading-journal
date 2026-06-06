export default function SecondaryMetricsRow() {
  return (
    <div className="flex justify-center">
      <div className="w-[98%]">

        <div className="grid grid-cols-6 gap-4">

          {/* STREAK */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
  className="
    flex
    h-full
    flex-col
    items-center
    justify-center
    text-center
  "
>
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Streak
              </p>

              <p className="mt-2 text-[28px] font-semibold text-white">
                4
              </p>

              <p className="mt-2 text-[13px] text-slate-400">
                Winning Days
              </p>
            </div>
          </div>

          {/* RISK STATUS */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
  className="
    flex
    h-full
    flex-col
    items-center
    justify-center
    text-center
  "
>
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Risk Status
              </p>

              <p className="mt-3 text-[24px] font-semibold text-white">
                Normal
              </p>

              <p className="mt-1 text-[13px] text-slate-400">
                Drawdown: --
              </p>
            </div>
          </div>

          {/* CONSISTENCY */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
  className="
    flex
    h-full
    flex-col
    items-center
    justify-center
    text-center
  "
>
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Consistency
              </p>

              <p className="mt-3 text-[24px] font-semibold text-emerald-400">
                Good
              </p>

              <p className="mt-1 text-[13px] text-slate-400">
                Score: --
              </p>
            </div>
          </div>

          {/* MOST TRADED */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
  className="
    flex
    h-full
    flex-col
    items-center
    justify-center
    text-center
  "
>
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Most Traded
              </p>

              <p className="mt-3 text-[24px] font-semibold text-white">
                Tech
              </p>

              <p className="mt-1 text-[13px] text-slate-400">
                --% of trades
              </p>
            </div>
          </div>

          {/* AVG R MULTIPLE */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
  className="
    flex
    h-full
    flex-col
    items-center
    justify-center
    text-center
  "
>
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Avg R Multiple
              </p>

              <p className="mt-3 text-[24px] font-semibold text-white">
                1.42R
              </p>

              <p className="mt-1 text-[13px] text-emerald-400">
                --
              </p>
            </div>
          </div>

          {/* CALMAR RATIO */}

          <div
            className="
              h-[110px]
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#081526]/80
              backdrop-blur-xl
            "
          >
            <div
  className="
    flex
    h-full
    flex-col
    items-center
    justify-center
    text-center
  "
>
              <p className="text-[12px] uppercase tracking-[0.12em] text-slate-500">
                Calmar Ratio
              </p>

              <p className="mt-3 text-[24px] font-semibold text-white">
                1.70
              </p>

              <p className="mt-1 text-[13px] text-emerald-400">
                Excellent
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}