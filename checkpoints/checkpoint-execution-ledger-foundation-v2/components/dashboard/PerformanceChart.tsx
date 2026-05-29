"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", pnl: 120 },
  { day: "Tue", pnl: 340 },
  { day: "Wed", pnl: 210 },
  { day: "Thu", pnl: 480 },
  { day: "Fri", pnl: 390 },
  { day: "Mon", pnl: 620 },
  { day: "Tue", pnl: 710 },
  { day: "Wed", pnl: 640 },
  { day: "Thu", pnl: 820 },
  { day: "Fri", pnl: 980 },
];

export default function PerformanceChart() {
  return (
    <div className="h-[480px] w-full rounded-[28px] border border-blue-500/10 bg-[#020817] p-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="colorPnl"
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

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
          />

          <XAxis
            dataKey="day"
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#020817",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "16px",
              color: "#fff",
            }}
          />

          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#3b82f6"
            strokeWidth={4}
            fill="url(#colorPnl)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}