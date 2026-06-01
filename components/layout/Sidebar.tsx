"use client";

import Link from "next/link";

import Image from "next/image";

import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CandlestickChart,
  CalendarDays,
  Wallet,
  BarChart3,
  Settings,
  NotebookPen,
  FileSpreadsheet,
} from "lucide-react";

const navItems = [
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
    href: "/calendar",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    title: "Expenses",
    icon: Wallet,
    href: "/expenses",
  },
  {
    title: "IBKR Import",
    icon: FileSpreadsheet,
    href: "/ibkr-import",
  },
];

export default function Sidebar() {

  const pathname =
    usePathname();

  return (

    <aside className="flex h-[calc(100vh-40px)] w-[255px] flex-col justify-between rounded-[32px] border border-white/[0.04] bg-[#07101a] py-7 shadow-[0_0_30px_rgba(0,0,0,0.22)]">

      {/* ================================================= */}
      {/* TOP SECTION */}
      {/* ================================================= */}

      <div className="flex flex-1 flex-col">

        {/* ================================================= */}
        {/* LOGO ZONE */}
        {/* ================================================= */}

        <div className="flex h-[190px] items-center justify-center px-6">

          <div className="flex items-center gap-4">

            <Image
              src="/logo.svg"
              alt="Elite X"
              width={58}
              height={58}
              priority
              className="rounded-2xl"
            />

            <div className="flex flex-col">

              <h1 className="text-[28px] font-black tracking-[-0.04em] text-white">
                Elite X
              </h1>

              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-400">
                Trading OS
              </p>

            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="mt-4 flex justify-center">

          <div className="w-[88%] space-y-4">

            {navItems.map((item) => {

              const Icon =
                item.icon;

              const isActive =
                pathname ===
                item.href;

              return (

                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex h-[64px] w-full items-center gap-4 rounded-2xl px-6 transition-all ${
                    isActive
                      ? "bg-[#0b1730] text-slate-400"
                      : "text-slate-500 hover:bg-[#0b1730] hover:text-slate-400"
                  }`}
                >

                  <Icon
                    size={22}
                    className={`${
                      isActive
                        ? "text-blue-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />

                  <span className="text-[16px] font-medium">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ================================================= */}
      {/* BOTTOM */}
      {/* ================================================= */}

      <div className="flex justify-center border-t border-white/[0.04] pt-6">

  <div className="w-[88%]">

    <Link
      href="/settings"
      className={`group flex h-[64px] w-full items-center gap-4 rounded-2xl px-6 transition-all ${
        pathname === "/settings"
          ? "bg-[#0b1730] text-slate-400"
          : "text-slate-500 hover:bg-[#0b1730] hover:text-slate-400"
      }`}
    >

      <Settings
        size={22}
        className={`${
          pathname === "/settings"
            ? "text-blue-400"
            : "group-hover:text-slate-300"
        }`}
      />

      <span className="text-[16px] font-medium">
        Settings
      </span>

    </Link>

  </div>
</div>
    </aside>
  );
}