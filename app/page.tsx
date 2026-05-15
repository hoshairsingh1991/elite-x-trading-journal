import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/dashboard/StatCard";

export default function HomePage() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />

      <section className="flex-1">
        <Topbar />

        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
              title="Loss Rate"
              value="32%"
              change="-1.3% reduction"
              positive
            />

            <StatCard
              title="Commissions"
              value="$482"
              change="+12% expenses"
              positive={false}
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-[#0b1120]/90 p-6 xl:col-span-2">
              <h3 className="text-lg font-semibold text-white">
                Performance Overview
              </h3>

              <div className="mt-6 flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500">
                Charts Coming Soon
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0b1120]/90 p-6">
              <h3 className="text-lg font-semibold text-white">
                Recent Activity
              </h3>

              <div className="mt-6 flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500">
                Trade Feed Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}