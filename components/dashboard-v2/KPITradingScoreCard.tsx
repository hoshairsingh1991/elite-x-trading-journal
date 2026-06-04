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
    text-[36px]
            font-bold
            leading-none
            text-slate-100
          "
        >
          {score}
        </div>

       <div
  className="
    -translate-x-10
    -translate-y-2
    flex
    flex-col
    gap-1.5
    text-[13px]
  "
>
          <div className="flex justify-between gap-12">
            <span className="text-slate-400"> 
              Profit
            </span>
            <span className="text-emerald-400">
              {profitability}
            </span>
          </div>

          <div className="flex justify-between gap-12">
            <span className="text-slate-400">
              Consistency
            </span>
            <span className="text-blue-400">
              {consistency}
            </span>
          </div>

          <div className="flex justify-between gap-12">
            <span className="text-slate-400">
              Risk
            </span>
            <span className="text-emerald-400">
              {risk}
            </span>
          </div>

          <div className="flex justify-between gap-12">
            <span className="text-slate-400">
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