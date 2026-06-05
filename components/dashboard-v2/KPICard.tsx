type KPICardProps = {
  title: string;
  value: string;
  subtitle?: string;
  sparkline?: React.ReactNode;
  histogram?: React.ReactNode;

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
  size = "large",

  valueColor = "default",
  subtitleColor = "default",

  titleOffset = "translate-y-3",
  valueOffset = "-translate-y-6",
  subtitleOffset = "-translate-y-15",
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
        flex
        flex-col
        justify-between
        rounded-[18px]
        border
        border-white/[0.05]
        bg-[#09182d]
        px-5
        ${
          size === "large"
            ? "h-[170px] py-5"
            : "h-[120px] py-4"
        }
      `}
    >
      {/* TITLE */}

      <p
        className={`
          translate-x-3
          ${titleOffset}
          text-[13px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-slate-500
        `}
      >
        {title}
      </p>

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
              ? "text-[32px]"
              : "text-[24px]"
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
          translate-x-3.5
          ${subtitleOffset}
          min-h-[10px]
          text-[14px]
          ${subtitleClasses[subtitleColor]}
        `}
      >
        {subtitle ?? ""}
      </div>
    </div>
  );
}