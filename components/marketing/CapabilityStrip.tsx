import {
  Activity,
  Zap,
  Layers,
  BarChart3,
  Lock,
} from "lucide-react";

const capabilities = [
  {
    icon: Activity,
    title: "Complete",
    titleSecond: "Trading System",
    subtitle: "Performance + Business",
    iconClass:
      "border-blue-500/20 bg-blue-500/10 text-[#4F8CFF]",
    x: 30,
    y: 0,
  },
  {
    icon: Zap,
    title: "IBKR",
    titleSecond: "Integration",
    subtitle: "Real-time sync",
    iconClass:
      "border-blue-500/20 bg-blue-500/10 text-[#4F8CFF]",
    x: 30,
    y: 0,
  },
  {
    icon: Layers,
    title: "Multi-Account",
    titleSecond: "Tracking",
    subtitle: "Everything in one place",
    iconClass:
      "border-blue-500/20 bg-blue-500/10 text-[#4F8CFF]",
    x: 30,
    y: 0,
  },
  {
    icon: BarChart3,
    title: "Advanced",
    titleSecond: "Analytics",
    subtitle: "600+ insights",
    iconClass:
      "border-purple-500/20 bg-purple-500/10 text-[#A78BFA]",
    x: 30,
    y: 0,
  },
  {
    icon: Lock,
    title: "Secure &",
    titleSecond: "Private",
    subtitle: "Your data, always protected",
    iconClass:
      "border-purple-500/20 bg-purple-500/10 text-[#A78BFA]",
    x: 30,
    y: 0,
  },
];

export default function CapabilityStrip() {
  return (
    <section className="w-full pb-12 pt-2">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10">
        {/* ===================================================== */}
        {/* CAPABILITY RAIL                                      */}
        {/* ===================================================== */}

        <div
          className="
            relative
            left-[300px]
            top-[0px]
            h-[102px]
            w-full
            rounded-[10px]
            border
            border-white/[0.07]
            bg-[#07111C]/95
            px-6
            shadow-[0_10px_30px_rgba(0,0,0,0.22)]
          "
        >
         <div className="grid h-full grid-cols-[1fr_1fr_1.08fr_1fr_1fr_1fr]">
            {/* ================================================= */}
            {/* CAPABILITY ITEMS                                  */}
            {/* ================================================= */}

            {capabilities.map((item, index) => {
              const IconComponent = item.icon;

              return (
<div
  key={item.title}
  className={`
    flex
    h-full
    items-center
    ${
      index === 0
        ? "pl-0 pr-6"
        : "border-l border-white/[0.06] px-6"
    }
  `}
>
  {/* MOVABLE CONTENT ONLY */}
  <div
    className="relative flex items-center gap-3.5"
    style={{
      left: `${item.x}px`,
      top: `${item.y}px`,
    }}
  >
    {/* Icon */}
    <div
      className={`
        flex
        size-10
        shrink-0
        items-center
        justify-center
        rounded-[10px]
        border
        ${item.iconClass}
      `}
    >
      <IconComponent className="size-[18px]" />
    </div>

    {/* Text */}
    <div className="min-w-0">
      <p className="text-[13px] font-semibold leading-[1.15] tracking-[-0.01em] text-white">
        {item.title}
      </p>

      <p className="text-[13px] font-semibold leading-[1.15] tracking-[-0.01em] text-white">
        {item.titleSecond}
      </p>

<p
  className="
    relative
    top-[8px]
    text-[10px]
    leading-none
    text-slate-400
  "
>
  {item.subtitle}
</p>
    </div>
  </div>
</div>
              );
            })}

{/* ================================================= */}
{/* SOCIAL PROOF / RATING                            */}
{/* ================================================= */}

<div
  className="
    relative
    flex
    h-full
    items-center
    border-l
    border-white/[0.06]
    px-6
  "
>
  {/* MOVABLE CONTENT ONLY */}
  <div
    className="
      relative
      left-[30px]
      top-[0px]
    "
  >
    {/* Stars */}
    <div className="flex items-center gap-1">
      <span className="text-[17px] leading-none text-amber-400">
        ★
      </span>

      <span className="text-[17px] leading-none text-amber-400">
        ★
      </span>

      <span className="text-[17px] leading-none text-amber-400">
        ★
      </span>

      <span className="text-[17px] leading-none text-amber-400">
        ★
      </span>

      <span className="text-[17px] leading-none text-amber-400">
        ★
      </span>
    </div>

{/* Rating */}
<p
  className="
    relative
    top-[4px]
    mt-1
    text-[13px]
    leading-none
    text-slate-300
  "
>
  <span className="font-semibold text-white">
    4.9/5
  </span>{" "}
  from 1,200+ traders
</p>

    {/* Trust */}
<p
  className="
    relative
    top-[8px]
    mt-1.5
    text-[10px]
    leading-none
    text-slate-400
  "
>
  Trusted by serious traders worldwide
</p>
  </div>
</div>
          </div>
        </div>
      </div>
    </section>
  );
}