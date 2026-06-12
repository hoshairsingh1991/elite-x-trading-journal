import {
  PerformanceBreakdownData,
} from "@/lib/analytics/performanceBreakdownAnalytics";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


type PerformanceBreakdownCardProps = {
  performanceBreakdownAnalytics: PerformanceBreakdownData;
  reportingCurrency: string;
};

export default function PerformanceBreakdownCard({
  performanceBreakdownAnalytics,
  reportingCurrency,
}: PerformanceBreakdownCardProps) {

const currencySymbol =
  getCurrencySymbol(
    reportingCurrency
  );

  const donutData = [
    {
      name: "Trading P&L",
      value:
        performanceBreakdownAnalytics.grossPnL,
      color: "#41855a",
    },
    {
      name: "Commissions",
      value:
        Math.abs(
          performanceBreakdownAnalytics.commissions
        ),
      color: "#1e6abb",
    },

  ];

  return (  
<div
  className="
    h-[480px]
    overflow-hidden
    rounded-[22px]
    border
    border-white/[0.08]
    bg-[#081526]/80
    backdrop-blur-xl

transition-all
duration-300

hover:-translate-y-1

hover:border-white/[0.14]
hover:bg-[#0A1A2E]/80

hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
  "
>
      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[10px]" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-8 pt-7">
        <div className="relative left-4">
          <h3 className="text-[16px] font-semibold text-white">
            Performance Breakdown
          </h3>

          <p className="mt-2 text-[15px] text-slate-500">
            Trading distribution analysis
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* DONUT + LEGEND */}
      {/* ================================================= */}

      <div className="mt-14 flex justify-center">
        <div className="w-[90%]">

          <div className="relative top-17 flex items-center justify-center gap-10">

            {/* DONUT PLACEHOLDER */}
<div className="relative h-[220px] w-[220px]">

<ResponsiveContainer
  width={220}
  height={220}
>

    <PieChart>

      <Pie
        data={donutData}
        dataKey="value"
        innerRadius={80}
        outerRadius={110}
        paddingAngle={3}
        stroke="none"
      >

        {donutData.map(
          (entry, index) => (
            <Cell
              key={index}
              fill={entry.color}
            />
          )
        )}

      </Pie>

    </PieChart>

  </ResponsiveContainer>

  {/* CENTER LABEL */}

  <div
    className="
      absolute
      inset-0
      flex
      flex-col
      items-center
      justify-center
      pointer-events-none
    "
  >

    <div className="text-[26px] font-bold text-slate-300">
      {currencySymbol}
{performanceBreakdownAnalytics.netTradingPnL.toFixed(2)}
    </div>

    <div
      className="
        mt-1
        text-[12px]
        uppercase
        tracking-[0.16em]
        text-slate-400
      "
    >
      Net P&amp;L
    </div>

  </div>

</div>

            {/* LEGEND */}

            <div className="relative left-2 w-[260px] flex flex-col gap-6">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                  <span className="text-[16px] text-slate-400">
                    Long P&L
                  </span>
                </div>

                <span className="text-[15px] font-medium text-slate-300">
                  {currencySymbol}
{performanceBreakdownAnalytics.longPnL.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                  <span className="text-[16px] text-slate-400">
                    Short P&L
                  </span>
                </div>

                <span className="text-[15px] font-medium text-slate-300">
                  {currencySymbol}
{performanceBreakdownAnalytics.shortPnL.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                  <span className="text-[16px] text-slate-400">
                    Commissions
                  </span>
                </div>

                <span className="text-[15px] font-medium text-slate-300">
{currencySymbol}
{Math.abs(
  performanceBreakdownAnalytics.commissions
).toFixed(2)}
                </span>
              </div>
              
            </div>

          </div>

        </div>
      </div>

      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[130px]" />

{/* ================================================= */}
{/* BOTTOM METRICS */}
{/* ================================================= */}

<div className="flex justify-center">
  <div className="w-[90%]">

    <div className="grid grid-cols-3 gap-6">

      {/* LONG TRADES */}

      <div className="flex flex-col items-center">

        <p className="text-[13px] uppercase tracking-[0.14em] text-slate-500">
          Long Trades
        </p>

        <p className="mt-3 text-[22px] font-semibold text-white">
          {performanceBreakdownAnalytics.longTrades}
        </p>

      </div>

      {/* SHORT TRADES */}

      <div className="flex flex-col items-center">

        <p className="text-[13px] uppercase tracking-[0.14em] text-slate-500">
          Short Trades
        </p>

        <p className="mt-3 text-[22px] font-semibold text-white">
          {performanceBreakdownAnalytics.shortTrades}
        </p>

      </div>

      {/* GROSS P&L */}

      <div className="flex flex-col items-center">

        <p className="text-[13px] uppercase tracking-[0.14em] text-slate-500">
          Gross P&amp;L
        </p>

        <p className="mt-3 text-[22px] font-semibold text-emerald-400">
          {currencySymbol}
{performanceBreakdownAnalytics.grossPnL.toFixed(2)}
        </p>

      </div>

    </div>

  </div>
</div>

    </div>
  );
}