import { useEffect, useRef, useState } from "react";

import type {
  PerformanceBreakdownData,
} from "@/lib/analytics/performanceBreakdownAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

type PerformanceBreakdownCardProps = {
  performanceBreakdownAnalytics: PerformanceBreakdownData;
  reportingCurrency: string;
};

type BreakdownView = "mix" | "weekday" | "symbol";

type MixRow = {
  asset: string;
  leftLabel: string;
  leftTrades: number;
  rightLabel: string;
  rightTrades: number;
};

type WeekdayRow = {
  day: string;
  trades: number;
  pnl: number;
};

type SymbolRow = {
  symbol: string;
  asset: string;
  trades: number;
  pnl: number;
  badge: string;
  badgeColor: string;
};

/*
 * UI preview fixtures.
 *
 * These values are for layout development only.
 * Wire these breakdowns to canonical analytics later.
 * The commissions footer already uses the supplied analytics.
 */

const MIX_PREVIEW_ROWS: MixRow[] = [
  {
    asset: "Stocks",
    leftLabel: "LONG",
    leftTrades: 42,
    rightLabel: "SHORT",
    rightTrades: 28,
  },
  {
    asset: "Options",
    leftLabel: "CALLS",
    leftTrades: 64,
    rightLabel: "PUTS",
    rightTrades: 58,
  },
  {
    asset: "Crypto",
    leftLabel: "LONG",
    leftTrades: 15,
    rightLabel: "SHORT",
    rightTrades: 11,
  },
  {
    asset: "Forex",
    leftLabel: "LONG",
    leftTrades: 6,
    rightLabel: "SHORT",
    rightTrades: 4,
  },
  {
    asset: "Futures",
    leftLabel: "LONG",
    leftTrades: 12,
    rightLabel: "SHORT",
    rightTrades: 9,
  },
  {
    asset: "Other",
    leftLabel: "LONG",
    leftTrades: 3,
    rightLabel: "SHORT",
    rightTrades: 2,
  },
];

const WEEKDAY_PREVIEW_ROWS: WeekdayRow[] = [
  { day: "Mon", trades: 18, pnl: 42 },
  { day: "Tue", trades: 27, pnl: -18 },
  { day: "Wed", trades: 14, pnl: 36 },
  { day: "Thu", trades: 32, pnl: 68 },
  { day: "Fri", trades: 21, pnl: -12 },
];

const SYMBOL_PREVIEW_ROWS: SymbolRow[] = [
  {
    symbol: "QQQ",
    asset: "Options",
    trades: 68,
    pnl: 482.16,
    badge: "Q",
    badgeColor: "#2563eb",
  },
  {
    symbol: "TSLA",
    asset: "Stocks",
    trades: 54,
    pnl: -124.32,
    badge: "T",
    badgeColor: "#dc2626",
  },
  {
    symbol: "NVDA",
    asset: "Stocks",
    trades: 42,
    pnl: 318.4,
    badge: "N",
    badgeColor: "#65a30d",
  },
  {
    symbol: "AAPL",
    asset: "Stocks",
    trades: 38,
    pnl: 96.28,
    badge: "A",
    badgeColor: "#475569",
  },
  {
    symbol: "MSFT",
    asset: "Stocks",
    trades: 24,
    pnl: -56.12,
    badge: "M",
    badgeColor: "#2563eb",
  },
  {
    symbol: "SPY",
    asset: "Options",
    trades: 20,
    pnl: 44.76,
    badge: "S",
    badgeColor: "#dc2626",
  },
  {
    symbol: "BTCUSDT",
    asset: "Crypto",
    trades: 12,
    pnl: 26.14,
    badge: "₿",
    badgeColor: "#d97706",
  },
  {
    symbol: "EURUSD",
    asset: "Forex",
    trades: 9,
    pnl: -18.42,
    badge: "€",
    badgeColor: "#2563eb",
  },
  {
    symbol: "AMD",
    asset: "Stocks",
    trades: 17,
    pnl: 64.25,
    badge: "A",
    badgeColor: "#475569",
  },
  {
    symbol: "IWM",
    asset: "Options",
    trades: 15,
    pnl: -32.18,
    badge: "I",
    badgeColor: "#2563eb",
  },
  {
    symbol: "ETHUSDT",
    asset: "Crypto",
    trades: 13,
    pnl: 41.60,
    badge: "Ξ",
    badgeColor: "#7c3aed",
  },
  {
    symbol: "GBPUSD",
    asset: "Forex",
    trades: 7,
    pnl: 12.45,
    badge: "£",
    badgeColor: "#2563eb",
  },
  {
    symbol: "ES",
    asset: "Futures",
    trades: 6,
    pnl: -21.30,
    badge: "E",
    badgeColor: "#d97706",
  },
];

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
    <span
      aria-label="Performance breakdown information"
      title="Breakdown values are grouped by the selected view and date range."
      className="
        inline-flex h-[14px] w-[14px] shrink-0
        items-center justify-center rounded-full
        border border-slate-500
        text-[10px] font-medium leading-none
        text-slate-400
      "
    >
      i
    </span>
  );
}

export default function PerformanceBreakdownCard({
  performanceBreakdownAnalytics,
  reportingCurrency,
}: PerformanceBreakdownCardProps) {
const [activeView, setActiveView] =
  useState<BreakdownView>("mix");

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

  const commissionTotal = Math.abs(
    performanceBreakdownAnalytics.commissions ?? 0
  );

  const maxMixTrades = Math.max(
    ...MIX_PREVIEW_ROWS.flatMap((row) => [
      row.leftTrades,
      row.rightTrades,
    ])
  );

const maxWeekdayAbsPnl = Math.max(
  ...WEEKDAY_PREVIEW_ROWS.map((row) => Math.abs(row.pnl))
);

  const maxSymbolTrades = Math.max(
    ...SYMBOL_PREVIEW_ROWS.map((row) => row.trades)
  );

  return (
    <section
      aria-label="Performance breakdown"
      className="
        box-border flex h-[400px] w-full flex-col
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
          className="
            relative
            left-[0px]
            top-[8px]
            min-w-0
          "
        >
<button
  type="button"
  aria-label="Heatmap metric"
  disabled
  className="
    h-full
    w-full
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
    disabled:cursor-default
    disabled:opacity-100
  "
>
  <span
    className="
      relative
      left-[8px]
      top-[0px]
    "
  >
    Trades
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
        </div>
      </div>

      {/* MIX */}

      {activeView === "mix" && (
        <div className="mt-[8px] min-h-0 flex-1">
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
  Trade type · Number of trades
</div>
          </div>

          <div className="mt-[4px] flex min-h-0 flex-1 flex-col gap-[6px]">
            {MIX_PREVIEW_ROWS.map((row) => {
              const leftHeat = getHeatStyle(
                row.leftTrades,
                maxMixTrades
              );

              const rightHeat = getHeatStyle(
                row.rightTrades,
                maxMixTrades
              );

              return (
                <div
                  key={row.asset}
className="
  grid min-h-[28px] flex-1
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

    hover:-translate-y-[1px]
    hover:brightness-110
    hover:shadow-[0_0_0_1px_rgba(56,189,248,0.16),0_4px_10px_rgba(0,0,0,0.22)]

    motion-reduce:transition-none
  "
  style={{
    backgroundColor: leftHeat.background,
    borderColor: leftHeat.border,
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
  className="
    relative
    left-[-8px]
    top-[0px]
    ml-[3px]
    text-[14px]
    font-semibold
    tabular-nums
    text-slate-100
  "
>
  {row.leftTrades}
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

    hover:-translate-y-[1px]
    hover:brightness-110
    hover:shadow-[0_0_0_1px_rgba(56,189,248,0.16),0_4px_10px_rgba(0,0,0,0.22)]

    motion-reduce:transition-none
  "
  style={{
    backgroundColor: rightHeat.background,
    borderColor: rightHeat.border,
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
  className="
    relative
    left-[-8px]
    top-[0px]
    ml-[3px]
    text-[14px]
    font-semibold
    tabular-nums
    text-slate-100
  "
>
  {row.rightTrades}
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
      top-[20px]
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
<div className="relative top-[-4px]">
  Weekday
</div>

<div className="relative top-[-4px] text-right">
  Number of trades
</div>
          </div>

<div
  className="
    mt-[5px]
    flex
    flex-col
    gap-[6px]
  "
>
{WEEKDAY_PREVIEW_ROWS.map((row) => {
  const pnlStyle = getWeekdayPnlStyle(
    row.pnl,
    maxWeekdayAbsPnl
  );

  return (
<div
  key={row.day}
  className="
    grid
    h-[36px]
    shrink-0
    grid-cols-[55px_minmax(0,1fr)]
    gap-[4px]
  "
>
                  <div className="flex min-w-0 flex-col justify-center">
                    <span className="text-[11px] font-medium text-slate-200">
                      {row.day}
                    </span>

                    <span
                      className={`
                        text-[9px] font-medium tabular-nums
                        ${
                          row.pnl >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      `}
                    >
                      P&amp;L{" "}
                      {formatSignedCurrency(row.pnl, currencySymbol)}
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
    {row.trades}
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
      left-[0px]
      top-[14px]
      mt-[8px]
      flex
      min-h-0
      flex-1
      flex-col
    "
  >
    <div
      className="
        grid grid-cols-[62px_56px_minmax(0,1fr)_25px]
        gap-[4px] text-[9px] font-medium
        uppercase tracking-[0.08em] text-slate-500
      "
    >
      <div>Symbol</div>
      <div
  className="
    relative
    left-[8px]
  "
>
  P&amp;L
</div>
      <div>Activity</div>
<div
  className="
    relative
    text-right
  "
  style={{
    left:
      symbolScrollbarWidth > 0
        ? `${-symbolScrollbarWidth - 6}px`
        : "0px",
  }}
>
  #
</div>
    </div>

<div
  ref={symbolRowsRef}
  role="region"
  aria-label="Symbol breakdown rows"
  tabIndex={0}
  className="
    absolute
    left-[0px]
    right-[0px]
    top-[18px]
    bottom-[30px]
    flex
    flex-col
    gap-[4.5px]
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
            {SYMBOL_PREVIEW_ROWS.map((row) => (
              <div
                key={row.symbol}
className="
  grid
  min-h-[27px]
  shrink-0
  grid-cols-[62px_56px_minmax(0,1fr)_25px]
  items-center
  gap-[4px]
  border-b
  border-white/[0.035]
  last:border-b-0
"
              >
                <div className="flex min-w-0 items-center gap-[4px]">
                  <span
                    className="
                      flex h-[16px] w-[16px] shrink-0
                      items-center justify-center
                      rounded-[4px] text-[9px]
                      font-semibold text-white
                    "
                    style={{
                      backgroundColor: row.badgeColor,
                    }}
                  >
                    {row.badge}
                  </span>

                  <span
                    className="
                      min-w-0 truncate text-[10px]
                      font-medium text-slate-200
                    "
                  >
                    {row.symbol}
                  </span>
                </div>

                <span
                  className={`
                    truncate text-[9px] font-medium tabular-nums
                    ${
                      row.pnl >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  `}
                >
                  {formatSignedCurrency(row.pnl, currencySymbol)}
                </span>

                <div className="h-[8px] min-w-0 overflow-hidden rounded-full bg-[#102033]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(row.trades / maxSymbolTrades) * 100}%`,
                      background:
                        "linear-gradient(90deg, #116b62, #10b981)",
                    }}
                  />
                </div>

<span
  className="
    relative
    text-right
    text-[11px]
    font-semibold
    tabular-nums
    text-slate-200
  "
  style={{
    left: symbolScrollbarWidth > 0 ? "-4px" : "0px",
  }}
>
  {row.trades}
</span>
              </div>
            ))}
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

  {/* COMMISSION CARD — INDEPENDENT Y CONTROL */}

<div
  className="
    relative
    left-[0px]
    top-[-8px]
    flex
    h-[46px]
    items-center
    justify-between
    rounded-[8px]
    border
    border-[#20374c]
    bg-[#0d1b2a]
    px-[9px]

    transition-all
    duration-200
    ease-out

    hover:-translate-y-[1px]
    hover:border-[#2b4c69]
    hover:bg-[#102033]
    hover:shadow-[0_4px_12px_rgba(0,0,0,0.22)]

    motion-reduce:transition-none
  "
>
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
          h-[20px]
          w-[20px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#123d57]
          text-[13px]
          font-medium
          leading-none
          text-sky-400
        "
      >
        #
      </span>

      <div className="flex min-w-0 flex-col justify-center">
        <span className="text-[11px] leading-[13px] text-slate-400">
          Total commissions
        </span>

<span
  className="
    relative
    left-[0px]
    top-[2px]
    text-[16px]
    font-semibold
    leading-[18px]
    tabular-nums
    text-slate-300
  "
>
  {currencySymbol}
  {commissionTotal.toFixed(2)}
</span>
      </div>
    </div>

<span
  className="
    relative
    left-[-10px]
    ml-[6px]
    shrink-0
    text-[10px]
    text-slate-400
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