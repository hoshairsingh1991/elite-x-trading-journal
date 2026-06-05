type KPITradingScoreCardProps = {
  score: number;

  profitability: number;

  consistency: number;

  risk: number;

  reliability: number;
};

export default function KPITradingScoreCard({
  score,
  profitability,
  consistency,
  risk,
  reliability,
}: KPITradingScoreCardProps) {

  return (
  <div
  className="
    flex
    h-[118px]
    flex-col
    rounded-[18px]
    border
    border-white/[0.05]
    bg-[#09182d]
    px-5
    py-4

    transition-all
    duration-200

    hover:-translate-y-[2px]
    hover:border-cyan-500/20
    hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]
  "
>

      <p
        className="
          translate-x-3
          translate-y-3
          text-[13px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-slate-500
        "
      >
        Trading Score
      </p>

      <div className="flex items-center justify-between">

<div
  className="
    translate-x-10
    translate-y-3
  "
>

  <div className="relative h-[80px] w-[80px]">

    <svg
      className="absolute inset-0"
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#14243d"
        strokeWidth="8"
      />

<defs>
  <linearGradient
    id="scoreGradient"
    x1="0%"
    y1="0%"
    x2="100%"
    y2="0%"
  >
    <stop
      offset="0%"
      stopColor="#2563eb"
    />
    <stop
      offset="100%"
      stopColor="#34d399"
    />
  </linearGradient>
</defs>

      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="url(#scoreGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={264}
        strokeDashoffset={
          264 -
          (264 * score) / 100
        }
        transform="rotate(-90 50 50)"
      />
    </svg>

<div
  className="
    absolute
    inset-0
    flex
    items-center
    justify-center
    text-[22px]
    font-bold
    text-white
  "
>
  {score}
</div>

</div>

<div
  className="
    translate-x-13
    -translate-y-5
    text-center
    text-[18px]
    font-medium
    text-slate-300
  "
>
   / 100
</div>



</div>

       <div
  className="
    -translate-x-14
    -translate-y-2
    flex
    flex-col
    gap-1.5
    text-[13px]
  "
>
          <div className="flex justify-between gap-25">
            <span className="w-[90px] text-slate-400">
              Profit
            </span>
            <span className="text-emerald-400">
              {profitability}
            </span>
          </div>

          <div className="flex justify-between gap-25">
            <span className="w-[90px] text-slate-400">
              Consistency
            </span>
            <span className="text-blue-400">
              {consistency}
            </span>
          </div>

          <div className="flex justify-between gap-25">
            <span className="w-[90px] text-slate-400">
              Risk
            </span>
            <span className="text-emerald-400">
              {risk}
            </span>
          </div>

          <div className="flex justify-between gap-25">
            <span className="w-[90px] text-slate-400">
              Reliability
            </span>
            <span className="text-yellow-400">
              {reliability}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}