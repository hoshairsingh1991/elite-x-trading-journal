import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/dashboard/StatCard";

export default function HomePage() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />

      <section className="flex-1">
        <Topbar />

        <div className="px-14 py-12">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-10 grid gap-8 xl:grid-cols-3">
            <div className="glass-card rounded-3xl p-8 xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white">
                    Performance Overview
                  </h3>

                  <p className="mt-3 text-base text-slate-400">
                    Daily and cumulative trading performance
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/10 bg-blue-500/10 px-5 py-3 text-sm text-blue-300">
                  LIVE PREVIEW
                </div>
              </div>

              <div className="mt-10 flex h-[520px] items-center justify-center rounded-3xl border border-dashed border-blue-500/15 bg-slate-950/30 text-slate-500">
                Advanced Charts Coming Soon
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8">
              <h3 className="text-3xl font-bold text-white">
                Recent Activity
              </h3>

              <p className="mt-3 text-base text-slate-400">
                Latest trades and updates
              </p>

              <div className="mt-10 flex h-[520px] items-center justify-center rounded-3xl border border-dashed border-blue-500/15 bg-slate-950/30 text-slate-500">
                Trade Feed Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}