import { useEffect, useRef, useState } from "react";

import type {
  PerformanceBreakdownData,
} from "@/lib/analytics/performanceBreakdownAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import AssetIcon from "@/components/common/AssetIcon";

import MetricInfoTooltip from "./MetricInfoTooltip";

type PerformanceBreakdownCardProps = {
  performanceBreakdownAnalytics: PerformanceBreakdownData;
  reportingCurrency: string;
};

type BreakdownView = "mix" | "weekday" | "symbol";

type BreakdownMetric =
  | "trades"
  | "netPnl"
  | "winRate"
  | "commissions";

type MixRow = {
  asset: string;
  leftLabel: string;
  leftTrades: number;
  rightLabel: string;
  rightTrades: number;
  leftCompletedTrades: number;
  rightCompletedTrades: number;
  leftPnl: number;
  rightPnl: number;
  leftWinRate: number;
  rightWinRate: number;
  leftCommissions: number;
  rightCommissions: number;
};

type WeekdayRow = {
  day: string;
  trades: number;
  pnl: number;
  winRate: number;
  commissions: number;
};

type SymbolRow = {
  symbol: string;
  asset: string;
  trades: number;
  pnl: number;
  winRate: number;
  commissions: number;
  badge: string;
  badgeColor: string;
};

const SYMBOL_BADGE_COLORS = [
  "#2563eb",
  "#d97706",
  "#65a30d",
  "#475569",
  "#7c3aed",
  "#0891b2",
];

function getSymbolBadgeColor(symbol: string): string {
  const hash = symbol
    .toUpperCase()
    .split("")
    .reduce(
      (total, character) =>
        total + character.charCodeAt(0),
      0
    );

  return SYMBOL_BADGE_COLORS[
    hash % SYMBOL_BADGE_COLORS.length
  ];
}



const HEAT_COLORS = [
  { background: "#0c1726", border: "#1b2c40" },
  { background: "#102131", border: "#1b3448" },
  { background: "#10303b", border: "#1b4350" },
  { background: "#0c4b45", border: "#126457" },
  { background: "#08745b", border: "#0b8b6b" },
];

const VIEW_TABS: {
  id: BreakdownView;
  label: string;
}[] = [
  { id: "mix", label: "Mix" },
  { id: "weekday", label: "Weekday" },
  { id: "symbol", label: "Symbol" },
];

const METRIC_OPTIONS: {
  value: BreakdownMetric;
  label: string;
}[] = [
  { value: "trades", label: "Trades" },
  { value: "netPnl", label: "Net P&L" },
  { value: "winRate", label: "Win Rate" },
  { value: "commissions", label: "Commissions" },
];

function getHeatStyle(
  value: number,
  maxValue: number
) {
  if (value <= 0 || maxValue <= 0) {
    return HEAT_COLORS[0];
  }

  const ratio = value / maxValue;

  const level =
    ratio >= 0.85
      ? 4
      : ratio >= 0.55
        ? 3
        : ratio >= 0.3
          ? 2
          : ratio >= 0.12
            ? 1
            : 0;

  return HEAT_COLORS[level];
}

function getWeekdayPnlStyle(
  value: number,
  maxAbsPnl: number
) {
  const ratio =
    maxAbsPnl > 0 ? Math.abs(value) / maxAbsPnl : 0;

  if (value > 0) {
    if (ratio >= 0.75) {
      return {
        backgroundColor: "#08745b",
        borderColor: "#0b8b6b",
      };
    }

    if (ratio >= 0.55) {
      return {
        backgroundColor: "#0c5b4b",
        borderColor: "#127560",
      };
    }

    return {
      backgroundColor: "#103a3b",
      borderColor: "#1b5354",
    };
  }

  if (value < 0) {
    if (ratio >= 0.25) {
      return {
        backgroundColor: "#6b2434",
        borderColor: "#b64050",
      };
    }

    return {
      backgroundColor: "#47212c",
      borderColor: "#86404d",
    };
  }

  return {
    backgroundColor: "#0c1726",
    borderColor: "#1b2c40",
  };
}

function getWeekdayWinRateStyle(value: number) {
  if (value >= 70) {
    return {
      backgroundColor: "#08745b",
      borderColor: "#0b8b6b",
    };
  }

  if (value >= 60) {
    return {
      backgroundColor: "#0c5b4b",
      borderColor: "#127560",
    };
  }

  if (value >= 50) {
    return {
      backgroundColor: "#103a3b",
      borderColor: "#1b5354",
    };
  }

  if (value >= 40) {
    return {
      backgroundColor: "#47212c",
      borderColor: "#86404d",
    };
  }

  return {
    backgroundColor: "#6b2434",
    borderColor: "#b64050",
  };
}

function formatSignedCurrency(
  value: number,
  currencySymbol: string
) {
  const sign =
    value > 0 ? "+" : value < 0 ? "−" : "";

  return `${sign}${currencySymbol}${Math.abs(value).toFixed(2)}`;
}

function InfoMark() {
  return (
    <MetricInfoTooltip
      width={480}
      roomy
      definition="Compare performance by asset class and trade direction in Mix, weekday in Weekday, or individual ticker in Symbol."

      formula="Win Rate = Winning Completed Trades ÷ Completed Trades × 100. Net P&L = Sum of Completed-Trade P&L. Commissions = Sum of Recorded Fees."

      calculation="P&L and commissions use your selected reporting currency. Mix and Symbol trade counts and commissions include open trades; Weekday counts and commissions use completed trades only. Net P&L and Win Rate use completed trades in every view."

      interpretation="Colours reflect the selected metric. Net P&L colours indicate profit or loss, while Win Rate colours represent win-rate ranges. A high win rate does not guarantee profitability."

      className="translate-x-0 translate-y-0"
    />
  );
}

export default function PerformanceBreakdownCard({
  performanceBreakdownAnalytics,
  reportingCurrency,
}: PerformanceBreakdownCardProps) {
const [activeView, setActiveView] =
  useState<BreakdownView>("mix");

  const [selectedMetric, setSelectedMetric] =
  useState<BreakdownMetric>("trades");

const [isMetricMenuOpen, setIsMetricMenuOpen] =
  useState(false);

  const metricDropdownRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  if (!isMetricMenuOpen) return;

  const handleOutsideClick = (event: PointerEvent) => {
    const target = event.target;

    if (
      target instanceof Node &&
      !metricDropdownRef.current?.contains(target)
    ) {
      setIsMetricMenuOpen(false);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsMetricMenuOpen(false);
    }
  };

  document.addEventListener("pointerdown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("pointerdown", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, [isMetricMenuOpen]);

const symbolRowsRef = useRef<HTMLDivElement | null>(null);

const [symbolScrollbarWidth, setSymbolScrollbarWidth] =
  useState(0);

useEffect(() => {
  if (activeView !== "symbol") {
    setSymbolScrollbarWidth(0);
    return;
  }

  const element = symbolRowsRef.current;

  if (!element) return;

  const updateScrollbarWidth = () => {
    const hasOverflow =
      element.scrollHeight > element.clientHeight + 1;

    const scrollbarWidth = Math.max(
      0,
      element.offsetWidth - element.clientWidth
    );

    setSymbolScrollbarWidth(
      hasOverflow ? scrollbarWidth : 0
    );
  };

  updateScrollbarWidth();

  const resizeObserver = new ResizeObserver(
    updateScrollbarWidth
  );

  resizeObserver.observe(element);

  const mutationObserver = new MutationObserver(
    updateScrollbarWidth
  );

  mutationObserver.observe(element, {
    childList: true,
  });

  return () => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
}, [activeView]);

  const currencySymbol =
    getCurrencySymbol(reportingCurrency);

    const MIX_PREVIEW_ROWS: MixRow[] =
  performanceBreakdownAnalytics.mixRows;

const WEEKDAY_PREVIEW_ROWS: WeekdayRow[] =
  performanceBreakdownAnalytics.weekdayRows;

const SYMBOL_PREVIEW_ROWS: SymbolRow[] =
  performanceBreakdownAnalytics.symbolRows.map(
    (row) => ({
      ...row,
      badge: row.symbol.slice(0, 1).toUpperCase() || "?",
      badgeColor: getSymbolBadgeColor(row.symbol),
    })
  );

  const commissionTotal = Math.abs(
    performanceBreakdownAnalytics.commissions ?? 0
  );

  const maxMixTrades = Math.max(
    ...MIX_PREVIEW_ROWS.flatMap((row) => [
      row.leftTrades,
      row.rightTrades,
    ])
  );

  const maxMixAbsPnl = Math.max(
  ...MIX_PREVIEW_ROWS.flatMap((row) => [
    Math.abs(row.leftPnl),
    Math.abs(row.rightPnl),
  ]),
  1
);

const maxMixWinRate = Math.max(
  ...MIX_PREVIEW_ROWS.flatMap((row) => [
    row.leftWinRate,
    row.rightWinRate,
  ]),
  1
);

const maxMixCommissions = Math.max(
  ...MIX_PREVIEW_ROWS.flatMap((row) => [
    row.leftCommissions,
    row.rightCommissions,
  ]),
  1
);

const maxWeekdayAbsPnl = Math.max(
  ...WEEKDAY_PREVIEW_ROWS.map((row) => Math.abs(row.pnl))
);

const maxWeekdayTrades = Math.max(
  ...WEEKDAY_PREVIEW_ROWS.map((row) => row.trades)
);

const maxWeekdayCommissions = Math.max(
  ...WEEKDAY_PREVIEW_ROWS.map((row) => row.commissions),
  1
);

  const maxSymbolTrades = Math.max(
    ...SYMBOL_PREVIEW_ROWS.map((row) => row.trades)
  );

  const maxSymbolAbsPnl = Math.max(
  ...SYMBOL_PREVIEW_ROWS.map((row) => Math.abs(row.pnl)),
  1
);

const maxSymbolCommissions = Math.max(
  ...SYMBOL_PREVIEW_ROWS.map((row) => row.commissions),
  1
);

const maxSymbolWinRate = Math.max(
  ...SYMBOL_PREVIEW_ROWS.map((row) => row.winRate),
  1
);

  return (
    <section
      aria-label="Performance breakdown"
      className="
        box-border flex h-[432px] w-full flex-col
        overflow-hidden rounded-[8px]
        border border-white/[0.06]
        bg-[#0b1220] text-slate-100
        transition-colors duration-200
        hover:border-white/[0.12]
      "
      style={{
        padding: "10px 11px 8px",
      }}
    >
      {/* HEADER */}

      <div className="flex min-h-[20px] items-center gap-[5px]">
        <h3
          className="
            text-[16px] font-semibold leading-[20px]
            text-white
          "
        >
          Performance Breakdown
        </h3>

        <InfoMark />
      </div>



      {/* NAVIGATION AND METRIC */}

      <div
        className="
          mt-[8px] grid h-[28px] shrink-0
          grid-cols-[minmax(0,1.55fr)_minmax(100px,1fr)]
          gap-[7px]
        "
      >
<div
  className="
relative
left-[0px]
top-[8px]
grid
h-full
min-w-0
grid-cols-[0.78fr_1.1fr_0.92fr]
overflow-hidden
    rounded-[6px]
    border
    border-[#263a50]
    bg-[#081321]
  "
>
          {VIEW_TABS.map((tab) => {
            const isActive = activeView === tab.id;

            return (
<button
  key={tab.id}
  type="button"
  aria-pressed={isActive}
  onClick={() => setActiveView(tab.id)}
  className={`
relative
top-[0px]
h-full
min-w-0
border-r
    border-[#263a50]
    px-[3px]
    text-[11px]
    font-medium

    transition-all
    duration-200
    ease-out

    last:border-r-0

    focus-visible:outline-none
    focus-visible:ring-1
    focus-visible:ring-inset
    focus-visible:ring-sky-400

    motion-reduce:transition-none

    ${
      isActive
        ? "rounded-[6px] border border-[#2788ff] bg-gradient-to-b from-[#1764b8] to-[#10417d] text-white hover:brightness-110 hover:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.22),0_0_8px_rgba(37,99,235,0.18)]"
        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 hover:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.12)]"
    }
  `}
>
  {tab.label}
</button>
            );
          })}
        </div>

{/* TRADES DROPDOWN */}

<div
  ref={metricDropdownRef}
  className="
    relative
    left-[0px]
    top-[8px]
    z-50
    min-w-0
  "
>
        <button
          type="button"
          aria-label="Heatmap metric"
          aria-haspopup="listbox"
          aria-expanded={isMetricMenuOpen}
          onClick={() =>
            setIsMetricMenuOpen((open) => !open)
          }
          className="
            relative
            flex
            h-full
            w-full
            items-center
            appearance-none
            rounded-[7px]
            border
            border-[#263a50]
            bg-[#0b1727]
            text-left
            text-[12px]
            font-semibold
            text-slate-300
            outline-none
            transition-colors
            duration-200
            hover:border-[#36536e]
            hover:bg-[#102033]
            focus-visible:ring-1
            focus-visible:ring-sky-400
          "
        >
          <span
            className="
              relative
              left-[8px]
              top-[0px]
              truncate
            "
          >
            {METRIC_OPTIONS.find(
              (option) => option.value === selectedMetric
            )?.label ?? "Trades"}
          </span>
        </button>

        {/* DROPDOWN ARROW */}

        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="
            pointer-events-none
            absolute
            right-[8px]
            top-1/2
            h-[12px]
            w-[12px]
            -translate-y-1/2
            text-slate-500
          "
          fill="none"
        >
          <path
            d="m3.5 6 4.5 4 4.5-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* DROPDOWN OPTIONS */}

        {isMetricMenuOpen && (
          <div
            role="listbox"
            aria-label="Select heatmap metric"
            className="
              absolute
              right-0
              top-full
              z-50
              mt-[6px]
              min-w-[115px]
              overflow-hidden
              rounded-[7px]
              border
              border-[#263a50]
              bg-[#0b1727]
              py-[4px]
              shadow-[0_8px_24px_rgba(0,0,0,0.45)]
            "
          >
            {METRIC_OPTIONS.map((option) => {
              const isSelected =
                selectedMetric === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedMetric(option.value);
                    setIsMetricMenuOpen(false);
                  }}
                  className={`
relative
flex
w-full
items-center
justify-center
px-[10px]
                    py-[8px]
                    text-left
                    text-[12px]
                    font-medium
                    transition-colors
                    duration-150
                    ${
                      isSelected
                        ? "bg-[#12304a] text-white"
                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >
                  <span>{option.label}</span>

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute right-[10px] text-sky-400"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>

      {/* MIX */}

      {activeView === "mix" && (
        <div className="relative mt-[8px] flex min-h-0 flex-1 flex-col">
          <div
            className="
              grid grid-cols-[55px_minmax(0,1fr)_minmax(0,1fr)]
              gap-[4px]
            "
          >
<div
  className="
    relative
    left-[0px]
    top-[16px]
    flex
    items-center
    text-[10px]
    font-medium
    uppercase
    tracking-[0.12em]
    text-slate-500
  "
>
  Asset
</div>

<div
  className="
    relative
    left-[0px]
    top-[16px]
    col-span-2
    flex
    items-center
    text-[10px]
    font-medium
    uppercase
    tracking-[0.1em]
    text-slate-500
  "
>
  Trade type ·{" "}
  {selectedMetric === "trades"
    ? "Number of trades"
    : selectedMetric === "netPnl"
      ? "Net P&L"
      : selectedMetric === "winRate"
        ? "Win Rate"
        : "Commissions"}
</div>
          </div>

          <div
  role="region"
  aria-label="Asset mix breakdown rows"
  tabIndex={0}
  className="
    absolute
    left-[0px]
    right-[0px]
    top-[14px]
    bottom-[24px]
    flex
    flex-col
    gap-[10px]
    overflow-y-auto
    overflow-x-hidden
    pr-[2px]
    focus-visible:outline-none
    focus-visible:ring-1
    focus-visible:ring-sky-500/40
  "
  style={{
    scrollbarWidth: "thin",
    scrollbarColor: "#334155 transparent",
  }}
>
{MIX_PREVIEW_ROWS.map((row) => {
  const leftPnlStyle = getWeekdayPnlStyle(
    row.leftPnl,
    maxMixAbsPnl
  );

  const rightPnlStyle = getWeekdayPnlStyle(
    row.rightPnl,
    maxMixAbsPnl
  );

  const leftWinRateStyle = getWeekdayWinRateStyle(
    row.leftWinRate
  );

  const rightWinRateStyle = getWeekdayWinRateStyle(
    row.rightWinRate
  );

  const leftHeat =
    selectedMetric === "trades"
      ? getHeatStyle(row.leftTrades, maxMixTrades)
      : selectedMetric === "netPnl"
        ? {
            background: leftPnlStyle.backgroundColor,
            border: leftPnlStyle.borderColor,
          }
        : selectedMetric === "winRate"
          ? {
              background: leftWinRateStyle.backgroundColor,
              border: leftWinRateStyle.borderColor,
            }
          : getHeatStyle(
              row.leftCommissions,
              maxMixCommissions
            );

  const rightHeat =
    selectedMetric === "trades"
      ? getHeatStyle(row.rightTrades, maxMixTrades)
      : selectedMetric === "netPnl"
        ? {
            background: rightPnlStyle.backgroundColor,
            border: rightPnlStyle.borderColor,
          }
        : selectedMetric === "winRate"
          ? {
              background: rightWinRateStyle.backgroundColor,
              border: rightWinRateStyle.borderColor,
            }
          : getHeatStyle(
              row.rightCommissions,
              maxMixCommissions
            );

              const leftActivityRatio = Math.min(
    1,
    Math.max(
      0,
      selectedMetric === "trades"
        ? row.leftTrades / Math.max(maxMixTrades, 1)
        : selectedMetric === "netPnl"
          ? Math.abs(row.leftPnl) / maxMixAbsPnl
          : selectedMetric === "winRate"
            ? row.leftWinRate / maxMixWinRate
            : row.leftCommissions / maxMixCommissions
    )
  );

  const leftTypeRgb =
    row.leftLabel === "CALLS"
      ? "14, 165, 233"
      : row.leftLabel === "PUTS"
        ? "168, 85, 247"
        : row.leftLabel === "LONG"
          ? "16, 185, 129"
          : "251, 113, 133";

  const leftBackgroundOpacity =
    0.12 + leftActivityRatio * 0.22;

    const rightActivityRatio = Math.min(
  1,
  Math.max(
    0,
    selectedMetric === "trades"
      ? row.rightTrades / Math.max(maxMixTrades, 1)
      : selectedMetric === "netPnl"
        ? Math.abs(row.rightPnl) / maxMixAbsPnl
        : selectedMetric === "winRate"
          ? row.rightWinRate / maxMixWinRate
          : row.rightCommissions / maxMixCommissions
  )
);

const rightTypeRgb =
  row.rightLabel === "CALLS"
    ? "14, 165, 233"
    : row.rightLabel === "PUTS"
      ? "168, 85, 247"
      : row.rightLabel === "LONG"
        ? "16, 185, 129"
        : "244, 63, 94";

const rightBackgroundOpacity =
  0.12 + rightActivityRatio * 0.22;

  return (
                <div
                  key={row.asset}
className="
  grid h-[38px] shrink-0
  grid-cols-[55px_minmax(0,1fr)_minmax(0,1fr)]
  gap-[4px]
"
                >
<div
  className="
    relative
    left-[0px]
    top-[24px]
    flex
    min-w-0
    items-center
    pr-[2px]
    text-[11px]
    font-medium
    text-slate-300
  "
>
  <span className="truncate">
    {row.asset}
  </span>
</div>

<div
  className="
    relative
    left-[-6px]
    top-[24px]
    flex
    min-w-0
    items-center
    justify-between
    rounded-[4px]
    border
    px-[8px]

    transition-all
    duration-200
    ease-out

    hover:-translate-y-[2px]
    hover:brightness-110
    hover:shadow-[0_0_0_1px_rgba(56,189,248,0.16),0_4px_10px_rgba(0,0,0,0.22)]

    motion-reduce:transition-none
  "
style={{
  backgroundColor:
    (selectedMetric === "trades" && row.leftTrades === 0) ||
    (selectedMetric === "winRate" && row.leftWinRate === 0) ||
    (selectedMetric === "commissions" && row.leftCommissions === 0)
      ? "rgba(148, 163, 184, 0.04)"
      : selectedMetric === "netPnl"
        ? leftHeat.background
        : `rgba(${leftTypeRgb}, ${leftBackgroundOpacity})`,
  borderColor:
    (selectedMetric === "trades" && row.leftTrades === 0) ||
    (selectedMetric === "winRate" && row.leftWinRate === 0) ||
    (selectedMetric === "commissions" && row.leftCommissions === 0)
      ? "#263548"
      : selectedMetric === "netPnl"
        ? leftHeat.border
        : `rgba(${leftTypeRgb}, 0.45)`,
}}
>
<span
  className="
    relative
    left-[6px]
    truncate
    text-[9px]
    font-semibold
    tracking-[0.04em]
    text-[#9cb9ca]
  "
>
  {row.leftLabel}
</span>

<span
className={`
  relative
  left-[-8px]
  top-[0px]
  ml-[3px]
  text-[14px]
  font-semibold
  tabular-nums
  ${
    selectedMetric === "netPnl"
      ? row.leftPnl > 0
        ? "text-emerald-400"
        : row.leftPnl < 0
          ? "text-rose-400"
          : "text-slate-300"
      : "text-slate-100"
  }
`}
>
 {selectedMetric === "trades"
  ? row.leftTrades
  : selectedMetric === "netPnl"
    ? formatSignedCurrency(row.leftPnl, currencySymbol)
    : selectedMetric === "winRate"
      ? `${row.leftWinRate.toFixed(1)}%`
      : `${currencySymbol}${row.leftCommissions.toFixed(2)}`}
</span>
                  </div>

<div
  className="
    relative
    left-[0px]
    top-[24px]
    flex
    min-w-0
    items-center
    justify-between
    rounded-[4px]
    border
    px-[8px]
    transition-all
    duration-200
    ease-out
    hover:-translate-y-[2px]
    hover:brightness-110
    hover:shadow-[0_0_0_1px_rgba(56,189,248,0.16),0_4px_10px_rgba(0,0,0,0.22)]

    motion-reduce:transition-none
  "
style={{
  backgroundColor:
    (selectedMetric === "trades" && row.rightTrades === 0) ||
    (selectedMetric === "winRate" && row.rightWinRate === 0) ||
    (selectedMetric === "commissions" && row.rightCommissions === 0)
      ? "rgba(148, 163, 184, 0.04)"
      : selectedMetric === "netPnl"
        ? rightHeat.background
        : `rgba(${rightTypeRgb}, ${rightBackgroundOpacity})`,
  borderColor:
    (selectedMetric === "trades" && row.rightTrades === 0) ||
    (selectedMetric === "winRate" && row.rightWinRate === 0) ||
    (selectedMetric === "commissions" && row.rightCommissions === 0)
      ? "#263548"
      : selectedMetric === "netPnl"
        ? rightHeat.border
        : `rgba(${rightTypeRgb}, 0.45)`,
}}
>
<span
  className="
    relative
    left-[6px]
    truncate
    text-[9px]
    font-semibold
    tracking-[0.04em]
    text-[#9cb9ca]
  "
>
  {row.rightLabel}
</span>

<span
className={`
  relative
  left-[-8px]
  top-[0px]
  ml-[3px]
  text-[14px]
  font-semibold
  tabular-nums
  ${
    selectedMetric === "netPnl"
      ? row.rightPnl > 0
        ? "text-emerald-400"
        : row.rightPnl < 0
          ? "text-rose-400"
          : "text-slate-300"
      : "text-slate-100"
  }
`}
>
  {selectedMetric === "trades"
  ? row.rightTrades
  : selectedMetric === "netPnl"
    ? formatSignedCurrency(row.rightPnl, currencySymbol)
    : selectedMetric === "winRate"
      ? `${row.rightWinRate.toFixed(1)}%`
      : `${currencySymbol}${row.rightCommissions.toFixed(2)}`}
</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKDAY */}

     {activeView === "weekday" && (
  <div
    className="
      relative
      left-[0px]
      top-[24px]
      mt-[8px]
      flex
      min-h-0
      flex-1
      flex-col
      overflow-hidden
    "
  >
          <div
            className="
              grid grid-cols-[55px_minmax(0,1fr)]
              gap-[4px] text-[10px] font-medium
              uppercase tracking-[0.1em] text-slate-500
            "
          >
<div className="relative left-[10px] top-[-4px]">
  Weekday
</div>

<div className="relative top-[-4px] text-right">
<span
  className={
    selectedMetric === "netPnl"
      ? "relative left-[-12px]"
      : selectedMetric === "winRate"
        ? "relative left-[-8px]"
        : "relative left-[0px]"
  }
>
    {selectedMetric === "trades"
      ? "Number of trades"
      : selectedMetric === "netPnl"
        ? "Net P&L"
        : selectedMetric === "winRate"
          ? "Win rate"
          : "Commissions"}
  </span>
</div>
          </div>

<div
  className="
    mt-[5px]
    flex
    flex-col
    gap-[8px]
  "
>
{WEEKDAY_PREVIEW_ROWS.map((row) => {
  const tradesHeatStyle = getHeatStyle(
    row.trades,
    maxWeekdayTrades
  );

  const commissionsHeatStyle = getHeatStyle(
  row.commissions,
  maxWeekdayCommissions
);

const isZeroValue =
  (selectedMetric === "trades" &&
    row.trades === 0) ||
  (selectedMetric === "netPnl" &&
    row.pnl === 0) ||
  (selectedMetric === "winRate" &&
    row.winRate === 0) ||
  (selectedMetric === "commissions" &&
    row.commissions === 0);

const pnlStyle = isZeroValue
  ? {
      backgroundColor: "rgba(148, 163, 184, 0.04)",
      borderColor: "#263548",
    }
  : selectedMetric === "trades"
    ? {
        backgroundColor: tradesHeatStyle.background,
        borderColor: tradesHeatStyle.border,
      }
    : selectedMetric === "netPnl"
      ? getWeekdayPnlStyle(
          row.pnl,
          maxWeekdayAbsPnl
        )
      : selectedMetric === "winRate"
        ? getWeekdayWinRateStyle(row.winRate)
        : selectedMetric === "commissions"
          ? {
              backgroundColor: commissionsHeatStyle.background,
              borderColor: commissionsHeatStyle.border,
            }
          : {
              backgroundColor: "#0c1726",
              borderColor: "#1b2c40",
            };

  return (
<div
  key={row.day}
className="
  grid
  h-[40px]
  shrink-0
  grid-cols-[76px_minmax(0,1fr)]
  gap-[4px]
"
>
<div className="relative left-[10px] flex min-w-0 items-center">
  <span className="text-[11px] font-medium text-slate-200">
    {row.day}
  </span>
</div>

<div
className="
    relative
    flex
    w-full
    min-w-0
    items-center
    justify-end
    overflow-hidden
    rounded-[7px]
    border
        transition-all
    duration-200
    ease-out
    hover:-translate-y-[2px]
    hover:brightness-110
    hover:shadow-[0_0_0_1px_rgba(56,189,248,0.16),0_4px_10px_rgba(0,0,0,0.22)]
    motion-reduce:transition-none
    transition-[filter,box-shadow]
    duration-150
    ease-out
    hover:brightness-105
    hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]
  "
  style={{
    backgroundColor: pnlStyle.backgroundColor,
    borderColor: pnlStyle.borderColor,
  }}
>
  <span
    className="
relative
left-[-16px]
z-10
ml-auto
pr-[9px]
      text-[14px]
      font-semibold
      tabular-nums
      text-slate-100
    "
  >
{selectedMetric === "trades"
  ? row.trades
  : selectedMetric === "netPnl"
    ? formatSignedCurrency(row.pnl, currencySymbol)
    : selectedMetric === "winRate"
      ? `${row.winRate.toFixed(1)}%`
      : selectedMetric === "commissions"
        ? `${currencySymbol}${row.commissions.toFixed(2)}`
        : "—"}
  </span>
</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SYMBOL */}

      {activeView === "symbol" && (
        <div
          className="
            relative
            left-[8px]
            top-[18px]
            mt-[8px]
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          {/* SYMBOL TABLE HEADER */}

          <div
            className={`
              grid
              ${
                selectedMetric === "trades"
                  ? "grid-cols-[72px_minmax(0,1fr)_30px]"
                  : selectedMetric === "winRate"
                    ? "grid-cols-[72px_minmax(0,1fr)_58px]"
                    : "grid-cols-[72px_minmax(0,1fr)_76px]"
              }
              gap-[4px]
              text-[9px]
              font-medium
              uppercase
              tracking-[0.08em]
              text-slate-500
            `}
          >
            <div>Symbol</div>

            <div>Activity</div>

<div
  className="relative whitespace-nowrap text-right"
  style={{
    left:
      selectedMetric === "trades"
        ? symbolScrollbarWidth > 0
          ? `${-symbolScrollbarWidth - 26}px`
          : "-26px"
        : symbolScrollbarWidth > 0
          ? `${-symbolScrollbarWidth - 6}px`
          : selectedMetric === "netPnl"
            ? "-16px"
            : selectedMetric === "winRate"
              ? "-12px"
              : "-0px",
  }}
>
  {selectedMetric === "trades"
    ? "Trades"
    : selectedMetric === "netPnl"
      ? "Net P&L"
      : selectedMetric === "winRate"
        ? "Win Rate"
        : "Commissions"}
</div>
          </div>

          {/* SYMBOL ROWS */}

          <div
            ref={symbolRowsRef}
            role="region"
            aria-label="Symbol breakdown rows"
            tabIndex={0}
            className="
              absolute
              left-[0px]
              right-[0px]
              top-[15px]
              bottom-[30px]
              flex
              flex-col
              gap-[8px]
              overflow-y-auto
              overflow-x-hidden
              overscroll-contain
              pr-[2px]
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-sky-500/40
            "
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#334155 transparent",
            }}
          >
            {SYMBOL_PREVIEW_ROWS.map((row) => {
const hasPreviewMetric = true;

const activityRatio =
  selectedMetric === "trades"
    ? row.trades / maxSymbolTrades
    : selectedMetric === "netPnl"
      ? Math.abs(row.pnl) / maxSymbolAbsPnl
      : selectedMetric === "winRate"
        ? row.winRate / maxSymbolWinRate
        : row.commissions / maxSymbolCommissions;

const activityBackground =
  (selectedMetric === "netPnl" && row.pnl < 0) ||
  (selectedMetric === "winRate" && row.winRate < 50)
    ? "linear-gradient(90deg, #8f3344, #ef4444)"
    : "linear-gradient(90deg, #116b62, #10b981)";

const metricValue =
  selectedMetric === "trades"
    ? String(row.trades)
    : selectedMetric === "netPnl"
      ? formatSignedCurrency(row.pnl, currencySymbol)
      : selectedMetric === "winRate"
        ? `${row.winRate.toFixed(1)}%`
        : `${currencySymbol}${row.commissions.toFixed(2)}`;

const metricValueColor =
  selectedMetric === "netPnl"
    ? row.pnl > 0
      ? "text-emerald-400"
      : row.pnl < 0
        ? "text-rose-400"
        : "text-slate-300"
    : selectedMetric === "winRate"
      ? row.winRate >= 50
        ? "text-emerald-400"
        : "text-rose-400"
      : "text-slate-200";

              return (
<div
  key={row.symbol}
  className={`
    grid
    grid-cols-[80px_minmax(0,1fr)_66px]
    min-h-[28px]
    shrink-0
    items-center
    gap-[4px]
    border-b
    border-white/[0.035]
    last:border-b-0
    transition-all
    duration-200
    ease-out
    hover:-translate-y-[2px]
    hover:brightness-110
    motion-reduce:transition-none
  `}
>
                  {/* SYMBOL NAME */}

                  <div className="flex min-w-0 items-center gap-[8px]">
<AssetIcon
  ticker={row.symbol}
  assetType={row.asset === "Mixed" ? "Stocks" : row.asset}
  size="sm"
/>

                    <span
                      className="
                        min-w-0
                        truncate
                        text-[10px]
                        font-medium
                        text-slate-200
                      "
                    >
                      {row.symbol}
                    </span>
                  </div>

                  {/* SELECTED METRIC ACTIVITY BAR */}

                  <div
                    className="
                      h-[8px]
                      min-w-0
                      overflow-hidden
                      rounded-full
                      bg-[#102033]
                    "
                  >
                    {hasPreviewMetric && (
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${activityRatio * 100}%`,
                          background: activityBackground,
                        }}
                      />
                    )}
                  </div>

                  {/* SELECTED METRIC VALUE */}

                  <span
                    className={`
                      relative
                      left-[0px]
                      truncate
                      text-right
                      text-[9px]
                      font-semibold
                      tabular-nums
                      ${metricValueColor}
                    `}
style={{
  left:
    selectedMetric === "trades"
      ? symbolScrollbarWidth > 0
        ? "-30px"
        : "-30px"
      : selectedMetric === "netPnl"
        ? symbolScrollbarWidth > 0
          ? "-10px"
          : "-20px"
        : selectedMetric === "winRate"
          ? symbolScrollbarWidth > 0
            ? "-20px"
            : "-22px"
          : selectedMetric === "commissions"
            ? symbolScrollbarWidth > 0
              ? "-26px"
              : "-22px"
            : symbolScrollbarWidth > 0
              ? "-4px"
              : "0px",
}}
                  >
                    {metricValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

{/* ================================================= */}
{/* COMMISSIONS FOOTER */}
{/* ================================================= */}

<div
  className="
    relative
    mt-[9px]
    shrink-0
    pt-[9px]
  "
>
  {/* DIVIDER — INDEPENDENT Y CONTROL */}

  <div
    className="
      absolute
      left-0
      right-0
      top-[-16px]
      h-px
      bg-[#203248]
    "
  />

{/* COMMISSION CARD — PREMIUM STYLE */}

<div
  className="
    relative
    left-[0px]
    top-[-8px]
    flex
    h-[46px]
    items-center
    justify-between
    overflow-hidden
    rounded-[8px]
    border
    border-[#2a465e]
    bg-[linear-gradient(110deg,#11283b_0%,#0d1b2a_55%,#0b1624_100%)]
    px-[9px]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_4px_12px_rgba(0,0,0,0.16)]
    transition-all
    duration-200
    ease-out
    hover:-translate-y-[2px]
    hover:border-[#365a75]
    hover:brightness-110
    hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_14px_rgba(0,0,0,0.22)]
    motion-reduce:transition-none
  "
>
  {/* SUBTLE ACCENT */}

  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      left-0
      top-[7px]
      bottom-[7px]
      w-[2px]
      rounded-r-full
      bg-gradient-to-b
      from-sky-400/80
      via-cyan-400/60
      to-emerald-400/50
    "
  />

  {/* COMMISSION VALUE */}

  <div
    className="
      relative
      left-[10px]
      flex
      min-w-0
      items-center
      gap-[8px]
    "
  >
    <span
      className="
        flex
        h-[22px]
        w-[22px]
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-sky-300/20
        bg-[linear-gradient(135deg,#164b69,#12354b)]
        text-[13px]
        font-semibold
        leading-none
        text-sky-400
        shadow-[0_0_10px_rgba(56,189,248,0.08)]
      "
    >
      #
    </span>

    <div className="flex min-w-0 flex-col justify-center">
      <span
        className="
          text-[10px]
          font-medium
          uppercase
          leading-[12px]
          tracking-[0.08em]
          text-slate-400
        "
      >
        Total commissions
      </span>

      <span
        className="
          relative
          top-[4px]
          text-[16px]
          font-semibold
          leading-[18px]
          tracking-[-0.02em]
          tabular-nums
          text-slate-100
        "
      >
        {currencySymbol}
        {commissionTotal.toFixed(2)}
      </span>
    </div>
  </div>

  {/* PERIOD INDICATOR */}

<span
className="
  relative
  left-[-10px]
  ml-[6px]
  inline-flex
  h-[22px]
  w-[80px]
  shrink-0
  items-center
  justify-center
  rounded-[6px]
  border
  border-white/[0.07]
  bg-[#122337]
  text-[9px]
  font-medium
  leading-none
  text-slate-400
  transition-all
  duration-200
  ease-out
  hover:border-[#365a75]
  hover:bg-[#172c40]
  hover:text-slate-200
  hover:shadow-[0_0_0_1px_rgba(56,189,248,0.10)]
"
>
  Selected period
</span>
</div>
</div>

{/* ================================================= */}
{/* HEATMAP LEGEND */}
{/* ================================================= */}


<div
  className="
    relative
    left-[0px]
    top-[0px]
    mt-[8px]
    shrink-0
    antialiased
  "
  style={{
    fontFamily: "Arial, Helvetica, sans-serif",
  }}
>
  {/* LEGEND TITLE */}

  <p
    className="
      relative
      left-[0px]
      top-[0px]
      text-[11px]
      font-semibold
      leading-[13px]
      text-slate-500
    "
  >
    Heat intensity = activity level
  </p>

  {/* HEAT SCALE + LABELS */}

  <div
    className="
      relative
      left-[0px]
      top-[2px]
      mt-[5px]
      flex
      items-center
      gap-[5px]
    "
  >
    {/* HEAT INTENSITY LEVELS */}

    {HEAT_COLORS.slice(0, 4).map((color, index) => (
      <span
        key={color.background}
        className="
          relative
          left-[0px]
          top-[0px]
          h-[8px]
          w-[25px]
          shrink-0
          rounded-[3px]
          border
        "
        style={{
          backgroundColor: color.background,
          borderColor: color.border,
          opacity: index === 0 ? 0.85 : 1,
        }}
      />
    ))}

    {/* LOWER ACTIVITY */}

    <span
      className="
        relative
        left-[10px]
        top-[0px]
        ml-[3px]
        whitespace-nowrap
        text-[10px]
        font-normal
        leading-[12px]
        text-slate-400
      "
    >
      Fewer trades
    </span>

    {/* HIGHER ACTIVITY */}

    <span
      className="
        relative
        left-[60px]
        top-[0px]
        ml-auto
        whitespace-nowrap
        text-[10px]
        font-normal
        leading-[12px]
        text-slate-400
      "
    >
      More trades
    </span>
  </div>
</div>
    </section>
  );
}