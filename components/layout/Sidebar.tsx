"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CandlestickChart,
  CalendarDays,
  Wallet,
  BarChart3,
  Settings,
  NotebookPen,
  Calculator,
  Bell,
  Monitor,
  CircleHelp,
} from "lucide-react";

const mainItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Trades",
    icon: CandlestickChart,
    href: "/trades",
  },
  {
    title: "Notes",
    icon: NotebookPen,
    href: "/notes",
  },
  {
    title: "Calendar",
    icon: CalendarDays,
    href: "#",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "#",
  },
  {
    title: "Expenses",
    icon: Wallet,
    href: "/expenses",
  },
];

const toolItems = [
{
  title: "Toolkit",
  icon: Calculator,
  href: "#",
},
  {
    title: "Watchlist",
    icon: Monitor,
    href: "#",
  },
  {
    title: "Alerts",
    icon: Bell,
    href: "#",
  },
  {
    title: "Performance",
    icon: BarChart3,
    href: "#",
  },
];

const systemItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Help Center",
    icon: CircleHelp,
    href: "#",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
<aside
  className="
    translate-y-[22px]
    flex
    h-[calc(100vh-40px)]
    w-[180px]
    flex-col
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#07111C]
    shadow-[0_24px_60px_rgba(0,0,0,0.55)]
  "
>
      {/* ================================================= */}
      {/* TOP */}
      {/* ================================================= */}

      <div className="flex flex-1 flex-col pt-4">

        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <div className="flex h-[172px] shrink-0 translate-y-6 items-center justify-center">

          <div className="flex flex-col items-center">

            <div className="flex items-end">

              <span
                className="
                  text-[28px]
                  font-extrabold
                  tracking-[-0.055em]
                  text-white
                "
              >
                Elite
              </span>

              <span
                className="
                  ml-1
                  translate-y-[2px]
                  text-[42px]
                  font-black
                  leading-none
                  tracking-[-0.08em]
                  text-[#4F8CFF]
                "
              >
                X
              </span>

            </div>

            <span
              className="
                mt-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.42em]
                text-[#4F8CFF]/90
              "
            >
              Trading OS
            </span>

          </div>

        </div>

{/* ================================================= */}
{/* NAVIGATION */}
{/* ================================================= */}

<nav className="flex-1 overflow-y-auto overflow-x-hidden pb-8">

  <div className="pl-8 pr-3">

   {/* ================= MAIN ================= */}

<div className="space-y-2">

  {mainItems.map((item) => {

    const Icon = item.icon;
    const isActive = pathname === item.href;

    const content = (
     
  <div className="flex translate-x-[16px] items-center gap-4 transition-all duration-200 group-hover:translate-x-[18px]">
        <Icon
          size={20}
          className={
            isActive
              ? "text-[#4F8CFF]"
              : "text-slate-500 transition-colors group-hover:text-slate-300"
          }
        />

        <span
          className={`text-[14px] font-medium ${
            isActive
              ? "text-white"
              : "text-slate-400 transition-colors group-hover:text-slate-200"
          }`}
        >
          {item.title}
        </span>
      </div>
    );

const className = `
  group
  flex
  h-[46px]
  w-[170px]
  translate-x-0
  items-center
  justify-start
  rounded-[8px]
  border
  transition-all
  duration-150
  ${
    isActive
      ? "border-[#17345E] bg-[#0D1932]"
      : "border-transparent hover:bg-white/[0.03]"
  }
`;

   if (item.href === "#") {
 return (
  <div
    key={item.title}
    className="flex justify-center"
  >
    <button className={className}>
      {content}
    </button>
  </div>
);
}

return (
  <div
    key={item.title}
    className="flex justify-center"
  >
    <Link
      href={item.href}
      className={className}
    >
      {content}
    </Link>
  </div>
);

  })}

</div>
<div className="translate-y-2">
{/* ================= TOOLS ================= */}

<div className="mt-8 border-t border-white/[0.05] pt-7">

  <p className="mb-5 translate-x-8 translate-y-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
  TOOLS
</p>
   

  <div className="space-y-2">

    {toolItems.map((item) => {

      const Icon = item.icon;

      const content = (
        <div className="flex translate-x-[16px] items-center gap-4 transition-all duration-200 group-hover:translate-x-[18px]">
          <Icon
            size={20}
            className="text-slate-500 transition-colors group-hover:text-slate-300"
          />

          <span className="text-[14px] font-medium text-slate-400 transition-colors group-hover:text-slate-200">
            {item.title}
          </span>
        </div>
      );

      const className = `
        group
        flex
        h-[46px]
        w-[170px]
        -translate-x-0
        translate-y-6
        items-center
        justify-start
        rounded-[8px]
        border
        border-transparent
        transition-all
        duration-150
        hover:bg-white/[0.03]
      `;

      return (
        <div
          key={item.title}
          className="flex justify-center"
        >
          <button className={className}>
            {content}
          </button>
        </div>
      );

    })}

  </div>
</div>
</div>
<div className="translate-y-8">
{/* ================= SYSTEM ================= */}

<div className="mt-8 border-t border-white/[0.05] pt-7">

 <p className="mb-5 translate-x-8 translate-y-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
    SYSTEM
  </p>

  <div className="space-y-2">

    {systemItems.map((item) => {

      const Icon = item.icon;
      const isActive = pathname === item.href;

      const content = (
        <div className="flex translate-x-[16px] items-center gap-4 transition-all duration-200 group-hover:translate-x-[18px]">
          <Icon
            size={20}
            className={
              isActive
                ? "text-[#4F8CFF]"
                : "text-slate-500 transition-colors group-hover:text-slate-300"
            }
          />

          <span
            className={`text-[14px] font-medium ${
              isActive
                ? "text-white"
                : "text-slate-400 transition-colors group-hover:text-slate-200"
            }`}
          >
            {item.title}
          </span>
        </div>
      );

      const className = `
        group
        flex
        h-[46px]
        w-[170px]
        -translate-x-0
        translate-y-6
        items-center
        justify-start
        rounded-[8px]
        border
        transition-all
        duration-150
        ${
          isActive
            ? "border-[#17345E] bg-[#0D1932]"
            : "border-transparent hover:bg-white/[0.03]"
        }
      `;

      if (item.href === "#") {
        return (
          <div
            key={item.title}
            className="flex justify-center"
          >
            <button className={className}>
              {content}
            </button>
          </div>
        );
      }

      return (
        <div
          key={item.title}
          className="flex justify-center"
        >
          <Link
            key={item.title}
            href={item.href}
            className={className}
          >
            {content}
          </Link>
        </div>
      );

    })}

  </div>

</div>
</div>
  </div>

</nav>

</div>

{/* ================================================= */}
{/* BOTTOM */}
{/* ================================================= */}

<div className="border-t border-white/[0.05] py-4" />

</aside>
);
}
