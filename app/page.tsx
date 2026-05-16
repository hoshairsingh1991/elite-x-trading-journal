"use client";

import Sidebar from "@/components/layout/Sidebar";
import TradingCalendar from "@/components/dashboard/TradingCalendar";

import {
  Upload,
  Plus,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#020617] text-white">
      
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <div className="p-4">
        <Sidebar />
      </div>

      {/* ================================================= */}
      {/* GAP */}
      {/* ================================================= */}

      <div className="w-6 shrink-0" />

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pt-4 pr-4">
        
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="relative right-6 flex h-[70px] shrink-0 items-center justify-end gap-4 border-b border-white/[0.05] px-6 pb-3">
          
          {/* Upload CSV */}

          <button className="flex h-[46px] items-center gap-3 rounded-[18px] border border-white/[0.06] bg-[#0b1730] px-5 text-[14px] font-semibold text-slate-200 transition-all hover:bg-[#13203a]">
            <Upload size={17} />
            Upload IBKR CSV
          </button>

          {/* Add Trade */}

          <button className="flex h-[46px] min-w-[150px] items-center justify-center gap-3 rounded-[18px] border border-blue-400/30 bg-blue-500 px-5 text-[14px] font-bold text-white shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-600">
            <Plus size={17} />
            Add Trade
          </button>
        </div>

        {/* ================================================= */}
        {/* HEADER BOTTOM GAP */}
        {/* ================================================= */}

        <div className="h-6 shrink-0" />

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="flex-1 overflow-y-auto px-8 pt-8 pb-8">
          
          {/* ================================================= */}
          {/* TOP SECTION */}
          {/* ================================================= */}

          <div className="flex gap-8">
            
            {/* ================================================= */}
            {/* LEFT SIDE */}
            {/* ================================================= */}

            <div className="flex w-[70%] flex-col gap-8">
              
              {/* ================================================= */}
              {/* ACCOUNT OVERVIEW */}
              {/* ================================================= */}

              <div className="rounded-[26px] bg-[#071427] p-5 shadow-[0_0_40px_rgba(0,0,0,0.18)]">
                
                <div className="rounded-[22px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">
                  
                  {/* HEADER */}

                  <div className="relative left-4">
                    <h1 className="text-[30px] font-black tracking-tight text-white">
                      Account Overview
                    </h1>
                  </div>

                  {/* KPI GRID */}

                  <div className="mt-10 grid grid-cols-3 gap-6">
                    
                    {[
                      {
                        title: "Net Liquid Value",
                        value: "$12,480",
                        sub: "+4.2% this month",
                        color: "text-emerald-400",
                      },
                      {
                        title: "Gross P&L",
                        value: "$9,842",
                        sub: "+2.1% increase",
                        color: "text-emerald-400",
                      },
                      {
                        title: "Total Expenses",
                        value: "$482",
                        sub: "+12% this month",
                        color: "text-red-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="p-2"
                      >
                        <div className="relative left-2">
                          
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            {item.title}
                          </p>

                          <h2 className="mt-4 text-[42px] font-black tracking-tight text-white">
                            {item.value}
                          </h2>

                          <p className={`mt-3 text-sm font-bold ${item.color}`}>
                            {item.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* PERFORMANCE + PNL ANALYTICS */}
              {/* ================================================= */}

              <div className="grid grid-cols-2 gap-8">
                
                {/* ================================================= */}
                {/* PERFORMANCE */}
                {/* ================================================= */}

                <div className="rounded-[26px] bg-[#071427] p-5 shadow-[0_0_40px_rgba(0,0,0,0.18)]">
                  
                  <div className="rounded-[22px] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] p-8">
                    
                    {/* HEADER */}

                    <div className="relative left-4">
                      <h2 className="text-[25px] font-black tracking-tight text-white">
                        Trading Performance
                      </h2>
                    </div>

                    {/* MODULE */}

                    <div className="mt-10">
                      
                      <div className="flex items-center justify-between">
                        
                        <div className="relative left-2">
                          <p className="text-sm text-slate-400">
                            Win Rate
                          </p>

                          <h3 className="mt-3 text-[38px] font-black tracking-tight text-white">
                            68%
                          </h3>
                        </div>

                        <div className="flex h-[95px] w-[95px] items-center justify-center rounded-full border-[8px] border-blue-500">
                          <span className="text-lg font-bold text-white">
                            68%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* PNL ANALYTICS */}
                {/* ================================================= */}

                <div className="rounded-[26px] bg-[#071427] p-5 shadow-[0_0_40px_rgba(0,0,0,0.18)]">
                  
                  <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-white/[0.08]">
                    
                    <div className="text-center">
                      
                      <h2 className="text-[26px] font-black tracking-tight text-white">
                        P&L Analytics
                      </h2>

                      <p className="mt-3 text-sm text-slate-500">
                        Coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* RIGHT EMPTY SPACE */}
            {/* ================================================= */}

            <div className="w-[30%] shrink-0" />
          </div>

          {/* ================================================= */}
          {/* GAP */}
          {/* ================================================= */}

          <div className="h-8" />

          {/* ================================================= */}
          {/* FULL WIDTH CALENDAR */}
          {/* ================================================= */}

          <TradingCalendar />
        </div>
      </section>
    </main>
  );
}