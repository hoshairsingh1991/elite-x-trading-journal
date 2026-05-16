"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Trade } from "@/types/trade";

interface EquityCurveProps {
  trades: Trade[];
}

export default function EquityCurve({
  trades,
}: EquityCurveProps) {

  // =================================================
  // BUILD EQUITY CURVE DATA
  // =================================================

  let runningPnL = 0;

  const equityData = trades.map((trade) => {

    runningPnL += Number(trade.pnl);

    return {
      date: trade.date,
      equity: runningPnL,
    };
  });

  return (
    <div className="rounded-[22px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="relative left-3">

        <h2 className="text-[25px] font-black tracking-tight text-white">
          Equity Curve
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Portfolio growth performance
        </p>
      </div>

      {/* ================================================= */}
      {/* CHART */}
      {/* ================================================= */}

      <div className="mt-10 h-[420px] w-full min-w-0">

        <ResponsiveContainer
          width="100%"
          height={420}
        >

          <AreaChart
            data={equityData}
            margin={{
              top: 10,
              right: 10,
              left: -25,
              bottom: 0,
            }}
          >

            {/* ================================================= */}
            {/* GRID */}
            {/* ================================================= */}

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />

            {/* ================================================= */}
            {/* X AXIS */}
            {/* ================================================= */}

            <XAxis
              dataKey="date"
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            {/* ================================================= */}
            {/* Y AXIS */}
            {/* ================================================= */}

            <YAxis
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            {/* ================================================= */}
            {/* TOOLTIP */}
            {/* ================================================= */}

            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                color: "white",
              }}
            />

            {/* ================================================= */}
            {/* AREA */}
            {/* ================================================= */}

            <Area
              type="monotone"
              dataKey="equity"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#equityGradient)"
            />

            {/* ================================================= */}
            {/* GRADIENT */}
            {/* ================================================= */}

            <defs>

              <linearGradient
                id="equityGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#3b82f6"
                  stopOpacity={0.4}
                />

                <stop
                  offset="100%"
                  stopColor="#3b82f6"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}