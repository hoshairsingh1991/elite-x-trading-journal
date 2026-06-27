"use client";

import React from "react";

type ChartItem = {
  label: string;
  manualExpenses: number;
  commissions: number;
  totalCosts: number;
};

interface ExpensesOverTimeChartProps {
  chartData: ChartItem[];
  chartMax: number;
  maxMonthlyExpense: number;

  hoveredMonth: string | null;
  setHoveredMonth: (month: string | null) => void;

  hoveredSeries: "manual" | "commission" | null;
  setHoveredSeries: (
    value: "manual" | "commission" | null
  ) => void;

  animateChart: boolean;

  currencySymbol: string;

  viewMode: "MONTHLY" | "YEARLY";
  setViewMode: (mode: "MONTHLY" | "YEARLY") => void;

  titleX: string;
  titleY: string;

  legendX: string;
  legendY: string;

  controlsX: string;
  controlsY: string;

  chartX: string;
  chartY: string;

  periodToggleWidth: string;
  periodToggleHeight: string;

  tooltipX: string;
  tooltipY: string;

  tooltipCardX: string;
  tooltipCardY: string;

  monthX: string;
  monthY: string;

  topDividerX: string;
  topDividerY: string;

  bottomDividerX: string;
  bottomDividerY: string;

  manualRowX: string;
  manualRowY: string;
  manualDotX: string;
  manualDotY: string;
  manualLabelX: string;
  manualLabelY: string;
  manualValueX: string;
  manualValueY: string;

  commissionRowX: string;
  commissionRowY: string;
  commissionDotX: string;
  commissionDotY: string;
  commissionLabelX: string;
  commissionLabelY: string;
  commissionValueX: string;
  commissionValueY: string;

  totalRowX: string;
  totalRowY: string;
  totalLabelX: string;
  totalLabelY: string;
  totalValueX: string;
  totalValueY: string;
}

export default function ExpensesOverTimeChart({
  chartData,
  chartMax,
  maxMonthlyExpense,

  hoveredMonth,
  setHoveredMonth,

  hoveredSeries,
  setHoveredSeries,

  animateChart,

  currencySymbol,

  viewMode,
  setViewMode,

  titleX,
  titleY,

  legendX,
  legendY,

  controlsX,
  controlsY,

  chartX,
  chartY,

  periodToggleWidth,
  periodToggleHeight,

  tooltipX,
  tooltipY,

  tooltipCardX,
  tooltipCardY,

  monthX,
  monthY,

  topDividerX,
  topDividerY,

  bottomDividerX,
  bottomDividerY,

  manualRowX,
  manualRowY,
  manualDotX,
  manualDotY,
  manualLabelX,
  manualLabelY,
  manualValueX,
  manualValueY,

  commissionRowX,
  commissionRowY,
  commissionDotX,
  commissionDotY,
  commissionLabelX,
  commissionLabelY,
  commissionValueX,
  commissionValueY,

  totalRowX,
  totalRowY,
  totalLabelX,
  totalLabelY,
  totalValueX,
  totalValueY,
}: ExpensesOverTimeChartProps) {

  const CHART = {
    HEIGHT: 220,
    TOP_PADDING: 16,
    X_AXIS_HEIGHT: 28,
    LEFT_AXIS_WIDTH: 56,
    RIGHT_PADDING: 16,
    BAR_WIDTH: 28,
    GRID_LINES: 5,
  };

  const PLOT_HEIGHT =
    CHART.HEIGHT -
    CHART.TOP_PADDING -
    CHART.X_AXIS_HEIGHT;

  const yLabels = Array.from(
    { length: CHART.GRID_LINES + 1 },
    (_, index) =>
      chartMax *
      (1 - index / CHART.GRID_LINES)
  );

  return (
    <div className="-translate-y-14 rounded-[20px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div className={`${titleX} ${titleY}`}>
          <h3 className="text-[14px] font-semibold text-white">
            Expenses Over Time
          </h3>
        </div>

        <div
          className={`
            flex
            overflow-hidden

            ${periodToggleWidth}
            ${periodToggleHeight}

            rounded-xl
            border
            border-white/10
            bg-white/[0.03]

            ${controlsX}
            ${controlsY}
          `}
        >
          <button
            onClick={() => setViewMode("MONTHLY")}
            className={`
              flex-1
              text-[12px]
              transition-all
              duration-200

              ${
                viewMode === "MONTHLY"
                  ? "bg-blue-500/80 font-semibold text-white"
                  : "font-medium text-slate-400 hover:text-white"
              }
            `}
          >
            Monthly
          </button>

          <button
            onClick={() => setViewMode("YEARLY")}
            className={`
              flex-1
              text-[12px]
              transition-all
              duration-200

              ${
                viewMode === "YEARLY"
                  ? "bg-blue-500/80 font-semibold text-white"
                  : "font-medium text-slate-400 hover:text-white"
              }
            `}
          >
            Yearly
          </button>
        </div>

      </div>

      {/* Legend */}
      <div
        className={`
          mt-4
          flex
          items-center
          gap-6
          text-[12px]

          ${legendX}
          ${legendY}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
          <span className="text-blue-300">
            Manual Expenses
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-400">
            Commissions
          </span>
        </div>
      </div>

          {/* Chart */}

      <div className={`mt-5 flex justify-center ${chartX} ${chartY}`}>

        <div
          className="w-[96%] rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent"
          style={{
            paddingTop: CHART.TOP_PADDING,
            paddingBottom: CHART.X_AXIS_HEIGHT,
            paddingLeft: CHART.LEFT_AXIS_WIDTH,
            paddingRight: CHART.RIGHT_PADDING,
          }}
        >

        <div
  className="relative"
  style={{
    height: PLOT_HEIGHT,
  }}
>

  {/* Horizontal Grid */}
  {Array.from({ length: CHART.GRID_LINES + 1 }).map((_, index) => (
    <div
      key={index}
      className="absolute left-0 right-0 border-t border-white/5"
      style={{
        top: (PLOT_HEIGHT / CHART.GRID_LINES) * index,
      }}
    />
  ))}

  {/* Y Axis */}
  <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5" />

  {/* Y Labels */}
  <div
    className="absolute right-full mr-4 top-0 flex flex-col justify-between text-[10px] text-slate-500"
    style={{
      height: PLOT_HEIGHT,
      width: CHART.LEFT_AXIS_WIDTH - 16,
    }}
  >
    {yLabels.map((value, index) => (
      <span key={index}>
        ${value.toFixed(0)}
      </span>
    ))}
  </div>

    {/* Bottom Axis */}
  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />

  {/* Bars */}
  <div
    className="absolute inset-0 flex items-end justify-between"
    style={{
      paddingLeft: 24,
    }}
  >
    {chartData.map((item) => (
      <div
        key={item.label}
        className="flex flex-col items-center justify-end h-full"
      >

        <div
  className="flex flex-col justify-end"
  style={{
    height: PLOT_HEIGHT,
  }}
>
  <div
    onMouseEnter={() => setHoveredSeries("commission")}
    onMouseLeave={() => setHoveredSeries(null)}
    className="
      rounded-t
      bg-emerald-600/80
      transition-all
      duration-300
      hover:bg-emerald-500/90
      hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]
    "
    style={{
      width: CHART.BAR_WIDTH,
      height: animateChart
        ? `${Math.max(
            (item.commissions / maxMonthlyExpense) * PLOT_HEIGHT,
            0
          )}px`
        : "0px",
    }}
  />

  <div
    onMouseEnter={() => setHoveredSeries("manual")}
    onMouseLeave={() => setHoveredSeries(null)}
    className="
      bg-blue-700/75
      transition-all
      duration-300
      hover:bg-blue-500/90
      hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]
    "
    style={{
      width: CHART.BAR_WIDTH,
      height: animateChart
        ? `${Math.max(
            (item.manualExpenses / maxMonthlyExpense) * PLOT_HEIGHT,
            4
          )}px`
        : "0px",
    }}
  />
</div>

        <span className="mt-3 text-[11px] text-slate-500">
          {item.label}
        </span>

      </div>
    ))}
  </div>

</div>

        </div>

      </div>

    </div>
  );
}