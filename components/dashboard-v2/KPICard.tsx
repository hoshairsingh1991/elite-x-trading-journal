type KPICardProps = {
  title: string;
  value: string;
  subtitle?: string;
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
};

export default function KPICard({
  title,
  value,
  subtitle,
  size = "large",
  valueColor = "default",
  subtitleColor = "default",
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
  ? "h-[122px] py-5"
  : "h-[118px] py-4"
        }
      `}
    >
    {/* TITLE */}

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
  {title}
</p>

{/* VALUE */}

<div
  className={`
    translate-x-3
    translate-y-0
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

{/* SUBTITLE */}

<div
  className={`
    translate-x-4
    -translate-y-2
    min-h-[18px]
    text-[13px]
    ${subtitleClasses[subtitleColor]}
  `}
>
  {subtitle ?? ""}
</div>

    </div>
  );
}