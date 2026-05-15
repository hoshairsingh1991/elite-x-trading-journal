export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-500/10 bg-[#030712]/75 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-14 py-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white">
            Trading Dashboard
          </h2>

          <p className="mt-3 text-base text-slate-400">
            Professional trading analytics and performance overview
          </p>
        </div>

        <div className="flex items-center gap-5">
          <button className="rounded-2xl border border-blue-500/10 bg-slate-900/60 px-6 py-4 text-sm text-slate-300 transition-all hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white">
            Last 30 Days
          </button>

          <button className="blue-glow rounded-2xl bg-blue-500 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-600">
            Add Trade
          </button>
        </div>
      </div>
    </header>
  );
}