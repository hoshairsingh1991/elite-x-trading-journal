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
        rounded-[16px]
        border
        border-white/[0.05]
        bg-[#09182d]
        px-4

        transition-all
        duration-200

        hover:-translate-y-[2px]
        hover:border-cyan-500/20
        hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]

        ${
          size === "large"
            ? "h-[126px] py-3.5"
            : "h-[106px] py-3.5"
        }
      `}
    >
      {/* TITLE */}

      <div
        className={`
          translate-x-2.5
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
            tracking-[0.12em]
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
          translate-x-2.5
          ${valueOffset}
          font-bold
          leading-none
          ${valueClasses[valueColor]}
          ${
            size === "large"
              ? "text-[23px]"
              : "text-[19px]"
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
            bottom-0
            left-0
            right-0
            px-2
            pb-0.5
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
            bottom-0
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
          translate-x-2.5
          ${subtitleOffset}
          min-h-[8px]
          text-[12px]
          leading-none
          ${subtitleClasses[subtitleColor]}
        `}
      >
        {subtitle ?? ""}
      </div>
    </div>
  );
}
