import MetricInfoTooltip from "./MetricInfoTooltip";

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

  const getScoreColor = (value: number) => {
  if (value >= 80) {
    return "text-emerald-400";
  }

  if (value >= 65) {
    return "text-green-400";
  }

  if (value >= 50) {
    return "text-sky-500";
  }

  return "text-red-400";
};

  return (
    <div
      className="
        flex
        h-[106px]
        z-[9999]
        flex-col
rounded-[8px]
border
border-white/[0.06]
bg-[#0b1220]
        px-4
        py-3.5

        transition-all
        duration-200

        hover:-translate-y-[2px]
        hover:border-cyan-500/20
        hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]
      "
    >

<div
  className="
    translate-x-2
    translate-y-2
    flex
    items-center
    gap-2
  "
>
  <p
    className="
      text-[10px]
      font-semibold
      uppercase
      tracking-[0.12em]
      text-slate-500
    "
  >
    Trading Score
  </p>

  <MetricInfoTooltip
    definition="Composite trading performance score."

    formula="Profitability + Consistency + Risk + Reliability"

    calculation={`${score} / 100`}

    interpretation={
      score >= 85
        ? "Elite"
        : score >= 70
        ? "Strong"
        : score >= 50
        ? "Average"
        : "Needs Improvement"
    }
  />
</div>

<div
  className="
    grid
    min-w-0
    grid-cols-[190px_minmax(0,1fr)]
    items-center
    gap-2
  "
>
<div
  className="
    flex
    shrink-0
    items-center
    translate-x-7
    translate-y-1
  "
>

  <div className="relative h-[62px] w-[62px]">

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
    text-[19px]
    font-bold
    leading-none
    text-white
  "
>
  {score}
</div>

</div>

<div
  className="
    ml-2
    translate-y-5
    shrink-0
    text-center
    text-[15px]
    font-medium
    leading-none
    text-slate-300
  "
>
  / 100
</div>



</div>

<div
  className="
    min-w-0
    w-[170px]
    -translate-y-1
    flex
    flex-col
    gap-1
    text-[12px]
  "
>
          <div className="flex justify-between gap-5">
            <span className="w-[70px] text-slate-350">
              Profit
            </span>
            <span className={getScoreColor(profitability)}>
              {profitability}
            </span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="w-[70px] text-slate-350">
              Consistency
            </span>
            <span className={getScoreColor(consistency)}>
  {consistency}
</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="w-[70px] text-slate-350">
              Risk
            </span>
            <span className={getScoreColor(risk)}>
  {risk}
</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="w-[70px] text-slate-350">
              Reliability
            </span>
            <span className={getScoreColor(reliability)}>
  {reliability}
</span>
          </div>
        </div>

      </div>

    </div>
  );
}