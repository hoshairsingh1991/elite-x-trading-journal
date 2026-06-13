"use client";

import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";

/* =====================================================
   KPI CARD FINE TUNING
   ===================================================== */

// Move entire icon + content group
const cardContentX = "translate-x-10";
const cardContentY = "translate-y-0";

// Move icon independently
const iconOffsetX = "-translate-x-3";
const iconOffsetY = "translate-y-0";

// Move text block independently
const textOffsetX = "translate-x-0";
const textOffsetY = "translate-y-0";

// Move three-dot menu
const menuOffsetX = "translate-x-0";
const menuOffsetY = "translate-y-0";

interface ExpenseKpiCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  value: string;
  trend: string;
  trendColor?: "green" | "red";
  badge?: string;
}

export default function ExpenseKpiCard({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  trend,
  trendColor = "green",
  badge,
}: ExpenseKpiCardProps) {
  return (
    <div
      className="
        relative
        overflow-hidden
        h-[138px]
        rounded-[20px]
        border border-white/10
        bg-white/[0.03]
        p-6
        transition-all
        duration-200
        hover:border-white/20
        hover:bg-white/[0.045]
      "
    >
      {/* Three-dot menu */}
      <button
        className={`
          absolute
          right-5
          top-5
          text-slate-500
          transition-colors
          hover:text-slate-300

          ${menuOffsetX}
          ${menuOffsetY}
        `}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Main content */}
<div
  className={`
    flex
    h-full
    items-center
    gap-6

    ${cardContentX}
    ${cardContentY}
  `}
>
        {/* Icon */}
        <div
          className={`
            flex
            h-[56px]
            w-[56px]
            shrink-0
            items-center
            justify-center
            rounded-full

            ${iconBg}

            ${iconOffsetX}
            ${iconOffsetY}
          `}
        >
          {icon}
        </div>

        {/* Text */}
        <div
          className={`
            flex
            min-w-0
            flex-1
            flex-col
            justify-center

            ${textOffsetX}
            ${textOffsetY}
          `}
        >
          <div className="flex items-center gap-6">
            <h3 className="truncate text-[17px] font-semibold text-white">
              {title}
            </h3>

            {badge && (
              <span className="rounded-md bg-blue-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {badge}
              </span>
            )}
          </div>

          <p className="mt-1 text-[13px] text-slate-400">
            {subtitle}
          </p>

          <div className="mt-2 text-[22px] font-bold tracking-tight text-white">
            {value}
          </div>

          <div
            className={`mt-2 text-[13px] ${
              trendColor === "green"
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {trend}
          </div>
        </div>
       </div>
  </div>
);
}