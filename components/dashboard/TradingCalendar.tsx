"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const days = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

export default function TradingCalendar() {
  return (
    <div className="w-[calc(100%-24px)] rounded-[26px] bg-[#071427] p-5 shadow-[0_0_40px_rgba(0,0,0,0.18)]">
      
      {/* ================================================= */}
      {/* INNER PANEL */}
      {/* ================================================= */}

      <div className="rounded-[22px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">
        
        {/* ================================================= */}
        {/* TOP */}
        {/* ================================================= */}

        <div className="flex items-start justify-between gap-6">
          
          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="relative left-8 top-3 flex items-center gap-4">
            
            {/* PREV */}

            <button className="flex h-[42px] w-[42px] items-center justify-center rounded-[18px] border border-white/[0.05] bg-[#0b1730] text-slate-400 transition-all hover:border-blue-500/30 hover:text-white">
              <ChevronLeft size={18} />
            </button>

            {/* MONTH */}

            <div>
              <h2 className="text-[30px] font-black tracking-tight text-white">
                May 2026
              </h2>

              <p className="mt-1 text-sm text-blue-400">
                Current Month
              </p>
            </div>

            {/* NEXT */}

            <button className="flex h-[42px] w-[42px] items-center justify-center rounded-[18px] border border-white/[0.05] bg-[#0b1730] text-slate-400 transition-all hover:border-blue-500/30 hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ================================================= */}
          {/* RIGHT STATS */}
          {/* ================================================= */}

          <div className="relative right-18 top-3 flex items-center gap-6">
            
            {/* MONTHLY P&L */}

            <div className="flex-shrink-0 px-2 py-2">
              <div className="relative left-2">
                
                <p className="text-xs text-slate-500">
                  Monthly P&L
                </p>

                <p className="mt-2 text-[28px] font-black text-red-400">
                  -$719.18
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/[0.06]" />

            {/* DAY WIN */}

            <div className="flex-shrink-0 px-2 py-2">
              <div className="relative left-2">
                
                <p className="text-xs text-slate-500">
                  Day Win %
                </p>

                <p className="mt-2 text-[28px] font-black text-white">
                  0%
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/[0.06]" />

            {/* TRADING DAYS */}

            <div className="flex-shrink-0 px-2 py-2">
              <div className="relative left-2">
                
                <p className="text-xs text-slate-500">
                  Trading Days
                </p>

                <p className="mt-2 text-[28px] font-black text-white">
                  6
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/[0.06]" />

            {/* TOTAL TRADES */}

            <div className="flex-shrink-0 px-2 py-2">
              <div className="relative left-2">
                
                <p className="text-xs text-slate-500">
                  Total Trades
                </p>

                <p className="mt-2 text-[28px] font-black text-white">
                  31
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* GAP */}
        {/* ================================================= */}

        <div className="h-10" />

        {/* ================================================= */}
        {/* DAYS */}
        {/* ================================================= */}

        <div className="relative left-2 grid grid-cols-7 gap-4">
          
          {days.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold tracking-[0.22em] text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* ================================================= */}
        {/* GAP */}
        {/* ================================================= */}

        <div className="h-4" />

        {/* ================================================= */}
        {/* CALENDAR GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-7 gap-4">
          
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className="h-[118px] rounded-[18px] border border-white/[0.04] bg-[#09182d]/80 p-4 transition-all hover:border-blue-500/30"
            >
              <div className="relative left-1 flex h-full flex-col justify-between">
                
                {/* DAY */}

                <span className="text-sm font-bold text-white">
                  {i + 1}
                </span>

                {/* EMPTY AREA FOR FUTURE PNL */}

                <div />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}