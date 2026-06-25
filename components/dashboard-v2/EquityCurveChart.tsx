

"use client";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

// =================================================
// LOCAL DATE PARSER
// =================================================

function parseLocalDate(
  dateString: string
) {
  const cleanDate =
    dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

  const [
    year,
    month,
    day,
  ] = cleanDate
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EquityCurveChartProps = {
  data: {
    date: string;
    equity: number;
  }[];

  reportingCurrency: string;
};

export default function EquityCurveChart({
  data,
  reportingCurrency,
}: EquityCurveChartProps) {

const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

return (
  <ResponsiveContainer
    width="100%"
    height={260}
  >
      <AreaChart
        data={data}
        margin={{
          top: 12,
          right: 8,
          left: -10,
          bottom: 0,
        }}
      >
        {/* GRID */}

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
        />

{/* ================================================= */}
{/* X AXIS */}
{/* ================================================= */}

<XAxis
  dataKey="date"
  height={22}
  tickMargin={6}
  tick={{
    fill: "#64748b",
    fontSize: 11,
  }}
  dx={-6}
  axisLine={false}
  tickLine={false}
  minTickGap={55}
  tickFormatter={(value) => {

    if (value === "Start") {
      return "";
    }

    const date =
      parseLocalDate(value);

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }}
/>

{/* Y AXIS */}

<YAxis
  domain={[
    (dataMin: number) => dataMin,
    (dataMax: number) => dataMax * 1.1,
  ]}
  tick={{
    fill: "#64748b",
    fontSize: 11,
  }}
  axisLine={false}
  tickLine={false}
  width={52}
  tickFormatter={(value: number) => {

    const absValue =
      Math.abs(value);

    if (absValue >= 1000000) {
      return `${currencySymbol}${(
        absValue / 1000000
      ).toFixed(1)}M`;
    }

    if (absValue >= 1000) {
      return `${currencySymbol}${(
        absValue / 1000
      ).toFixed(1)}K`;
    }

    return `${currencySymbol}${Math.round(
      absValue
    )}`;
  }}
/>

{/* TOOLTIP */}

<Tooltip
  labelFormatter={(label) => {

    if (label === "Start") {
      return "Starting Point";
    }

    const date =
      parseLocalDate(label);

    return date.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }}

  formatter={(value) => {

    const numericValue =
      Number(value);

    const formatted =
      numericValue >= 0
        ? `${currencySymbol}${numericValue.toFixed(2)}`
        : `-${currencySymbol}${Math.abs(
            numericValue
          ).toFixed(2)}`;

    return [
      formatted,
      "Equity",
    ];
  }}

  contentStyle={{
    background: "#0f172a",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    padding: "8px 10px",
  }}
/>

{/* AREA */}

<Area
  type="monotone"
  dataKey="equity"
  stroke="#3b82f6"
  strokeWidth={2.5}
  fill="url(#equityGradient)"
  fillOpacity={1}
  baseValue="dataMin"
/>

{/* GRADIENT */}

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
      stopOpacity={0.55}
    />

    <stop
      offset="100%"
      stopColor="#3b82f6"
      stopOpacity={0.06}
    />
  </linearGradient>
</defs>

</AreaChart>
</ResponsiveContainer>
  );
}