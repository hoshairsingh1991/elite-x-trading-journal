type KPICardProps = {
  title: string;
  value: string;
  subtitle?: string;
  sparkline?: React.ReactNode;
  histogram?: React.ReactNode;
  tooltip?: React.ReactNode;

  size?: "large" | "small";

  valueColor?:
    | "default"
    | "green"
    | "red"
    | "blue";

  subtitleColor?:
    | "default"
    | "green"
    | "red"
    | "yellow";

  titleOffset?: string;
  valueOffset?: string;
  subtitleOffset?: string;
};

export default function KPICard({
  title,
  value,
  subtitle,
  sparkline,
  histogram,
  tooltip,
  size = "large",

  valueColor = "default",
  subtitleColor = "default",

  titleOffset = "translate-y-3",
  valueOffset = "-translate-y-5",
  subtitleOffset = "-translate-y-13",
}: KPICardProps) {

  const valueClasses = {
    default: "text-slate-100",
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };

  const subtitleClasses = {
    default: "text-slate-500",
    green: "text-emerald-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
  };

  return (
   <div
  className={`
    relative
    overflow-hidden
    hover:z-50
    flex
    flex-col
        justify-between
        rounded-[18px]
        border
        border-white/[0.05]
        bg-[#09182d]
        px-5

        transition-all
        duration-200

        hover:-translate-y-[2px]
        hover:border-cyan-500/20
        hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]

        ${
  size === "large"
    ? "h-[130px] py-4"
    : "h-[110px] py-4"
}
      `}
    >
      {/* TITLE */}

<div
  className={`
    translate-x-3
    ${titleOffset}
    flex
    items-center
    gap-2
  `}
>
  <p
    className="
      text-[10px]
      font-semibold
      uppercase
      tracking-[0.14em]
      text-slate-500
    "
  >
    {title}
  </p>

  {tooltip}
</div>

      {/* VALUE */}

      <div
        className={`
          translate-x-3
          ${valueOffset}
          font-bold
          leading-tight
          ${valueClasses[valueColor]}
          ${
            size === "large"
              ? "text-[24px]"
              : "text-[20px]"
          }
        `}
      >
        {value}
      </div>

      {/* SPARKLINE */}

      {sparkline && (
        <div
          className="
            absolute
            bottom-1
            left-0
            right-0
            px-3
            pb-1
          "
        >
          {sparkline}
        </div>
      )}

      {/* HISTOGRAM */}

      {histogram && (
        <div
          className="
            absolute
            bottom-1
            left-0
            right-0
          "
        >
          {histogram}
        </div>
      )}

      {/* SUBTITLE */}

      <div
        className={`
          translate-x-3
          ${subtitleOffset}
          min-h-[8px]
          text-[12px]
          ${subtitleClasses[subtitleColor]}
        `}
      >
        {subtitle ?? ""}
      </div>
    </div>
  );
}
