"use client";

import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";

/* =====================================================
   KPI CARD FINE TUNING
   ===================================================== */

// Move entire icon + content group
const cardContentX = "translate-x-20";
const cardContentY = "translate-y-0";

// Move icon independently
const iconOffsetX = "-translate-x-14";
const iconOffsetY = "translate-y-12";

// Move text block independently
const textOffsetX = "-translate-x-9";
const textOffsetY = "translate-y-4";

// Move three-dot menu
const menuOffsetX = "translate-x-0";
const menuOffsetY = "translate-y-0";

/* =====================================================
   VALUE + TREND FINE TUNING
   ===================================================== */

// Main KPI value (e.g. C$842.29)
const valueOffsetX = "translate-x-6";
const valueOffsetY = "-translate-y-7";

// Trend text (e.g. ↑ 3.1% vs Previous 30 Days)
const trendOffsetX = "translate-x-6";
const trendOffsetY = "-translate-y-5";

/* =====================================================
   BADGE FINE TUNING
   ===================================================== */

// Position
const badgeOffsetX = "translate-x-10";
const badgeOffsetY = "translate-y-0";

// Size
const badgeWidth = "w-[42px]"; // e.g. w-[42px]
const badgeHeight = "h-[28px]"; // e.g. h-[18px]

// Padding
const badgePaddingX = "px-2";
const badgePaddingY = "py-0.5";

// Typography
const badgeTextSize = "text-[9px]";
const badgeRounded = "rounded-md";

// Card dimensions
const cardHeight = "h-[150px]";
const cardRadius = "rounded-[22px]";

interface ExpenseKpiCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  value: string;
  trend: string;
  trendColor?: "green" | "red" | "amber" | "slate";
  badge?: string;

  // Future use
  clickable?: boolean;
  onClick?: () => void;
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

  clickable = false,
  onClick,
}: ExpenseKpiCardProps) {
  return (
<div
  onClick={onClick}
  className={`
    group
    relative

    z-0
    hover:z-50

    ${cardHeight}

    overflow-visible

    ${cardRadius}

    border
    border-white/10
    bg-white/[0.035]

    px-5
    py-5

    transition-all
    duration-200

    hover:-translate-y-[1px]
    hover:border-white/20
    hover:bg-white/[0.05]

    ${
      clickable
        ? "cursor-pointer"
        : ""
    }
  `}
>
      {/* Menu */}
      <button
        className={`
          absolute
          right-4
          top-4
          text-slate-500
          opacity-0
          transition-all
          duration-200
          group-hover:opacity-100

          ${menuOffsetX}
          ${menuOffsetY}
        `}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <div
        className={`
          flex
          h-full
          flex-col
          justify-between

          ${cardContentX}
          ${cardContentY}
        `}
      >
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
                flex
                h-[52px]
                w-[52px]
                items-center
                justify-center
                rounded-2xl
                ${iconBg}

                ${iconOffsetX}
                ${iconOffsetY}
              `}
            >
              {icon}
            </div>

            <div
              className={`
                ${textOffsetX}
                ${textOffsetY}
              `}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-white">
                  {title}
                </h3>

{badge && (
  <span
    className={`
      inline-flex
      items-center
      justify-center

      ${badgeWidth}
      ${badgeHeight}
      ${badgePaddingX}
      ${badgePaddingY}

      ${badgeRounded}
      ${badgeTextSize}

      border border-blue-400/20
      bg-blue-500/10
      font-bold
      uppercase
      tracking-[0.15em]
      text-blue-300

      ${badgeOffsetX}
      ${badgeOffsetY}
    `}
  >
    {badge}
  </span>
)}
              </div>

              <p className="mt-0.5 text-[12px] text-slate-500">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div>
<div
  className={`
    text-[27px]
    font-bold
    tracking-tight
    text-white

    ${valueOffsetX}
    ${valueOffsetY}
  `}
>
  {value}
</div>

<p
  className={`
    mt-2
    text-[12px]
    font-medium
${
  trendColor === "green"
    ? "text-emerald-400"
    : trendColor === "red"
    ? "text-red-400"
    : trendColor === "amber"
    ? "text-amber-400"
    : "text-slate-400"
}

    ${trendOffsetX}
    ${trendOffsetY}
  `}
>
  {trend}
</p>
        </div>
      </div>
    </div>
  );
}