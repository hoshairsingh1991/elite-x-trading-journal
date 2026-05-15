import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] p-5 text-white">
      
      {/* Workspace Container */}
      <div className="flex min-h-[calc(100vh-40px)] gap-5 rounded-[36px] border border-blue-500/10 bg-[#030b1a] p-5 shadow-2xl shadow-blue-950/20">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Workspace */}
        <section className="flex-1 overflow-y-auto rounded-[30px] border border-blue-500/10 bg-[#020817] p-8">
          
          <div className="mx-auto max-w-[1800px]">
            
            {/* Header */}
            <div className="mb-10 flex items-start justify-between">
              
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-blue-400">
                  ELITE X TERMINAL
                </p>

                <h1 className="mt-4 text-6xl font-black tracking-tight">
                  Performance Dashboard
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
                  Monitor trading performance, analyze profitability,
                  track expenses, and review trading activity from a
                  unified professional trading workspace.
                </p>
              </div>

              <div className="flex items-center gap-4">
                
                <button className="rounded-2xl border border-blue-500/10 bg-slate-900/60 px-6 py-4 text-sm text-slate-300 transition-all hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white">
                  Last 30 Days
                </button>

                <button className="blue-glow rounded-2xl bg-blue-500 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-600">
                  Add Trade
                </button>

              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              
              <StatCard
                title="Net P&L"
                value="$12,480"
                change="+4.2% this month"
                positive
              />

              <StatCard
                title="Win Rate"
                value="68%"
                change="+2.1% improvement"
                positive
              />

              <StatCard
                title="Profit Factor"
                value="2.14"
                change="+0.32 increase"
                positive
              />

              <StatCard
                title="Expenses"
                value="$482"
                change="+12% this month"
                positive={false}
              />

            </div>

            {/* Main Layout */}
            <div className="mt-8 grid grid-cols-[1.65fr_0.75fr] gap-6">
              
              {/* LEFT SIDE */}
              <div className="space-y-6">
                
                {/* Performance Chart */}
                <div className="glass-card rounded-[32px] p-8">
                  
                  <div className="flex items-start justify-between">
                    
                    <div>
                      <h2 className="text-3xl font-bold">
                        Performance Overview
                      </h2>

                      <p className="mt-3 text-slate-400">
                        Daily and cumulative trading performance
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-500/10 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                      LIVE
                    </div>

                  </div>

                  <div className="mt-8">
                    <PerformanceChart />
                  </div>

                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* Insights */}
                  <div className="glass-card rounded-[32px] p-8">
                    
                    <h3 className="text-2xl font-bold">
                      Trading Insights
                    </h3>

                    <p className="mt-3 text-slate-400">
                      Trading behavior analytics
                    </p>

                    <div className="mt-8 flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-blue-500/10 bg-slate-950/30">
                      <p className="text-slate-500">
                        Insight Modules
                      </p>
                    </div>

                  </div>

                  {/* Expense Tracking */}
                  <div className="glass-card rounded-[32px] p-8">
                    
                    <h3 className="text-2xl font-bold">
                      Expense Tracking
                    </h3>

                    <p className="mt-3 text-slate-400">
                      Subscription and platform costs
                    </p>

                    <div className="mt-8 flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-blue-500/10 bg-slate-950/30">
                      <p className="text-slate-500">
                        Expense Analytics
                      </p>
                    </div>

                  </div>

                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">
                
                {/* Activity */}
                <div className="glass-card rounded-[32px] p-8">
                  
                  <h3 className="text-2xl font-bold">
                    Recent Activity
                  </h3>

                  <p className="mt-3 text-slate-400">
                    Latest trading updates
                  </p>

                  <div className="mt-8 flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-blue-500/10 bg-slate-950/30">
                    <p className="text-slate-500">
                      Trade Feed
                    </p>
                  </div>

                </div>

                {/* Calendar */}
                <div className="glass-card rounded-[32px] p-8">
                  
                  <h3 className="text-2xl font-bold">
                    Trading Calendar
                  </h3>

                  <p className="mt-3 text-slate-400">
                    Daily performance tracking
                  </p>

                  <div className="mt-8 flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-blue-500/10 bg-slate-950/30">
                    <p className="text-slate-500">
                      Calendar Module
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}