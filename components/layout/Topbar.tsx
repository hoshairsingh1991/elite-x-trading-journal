export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-[#070b18]/60 px-8 py-5 backdrop-blur-xl">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Professional trading analytics overview
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-slate-700 bg-[#0b1120] px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white">
          Today
        </button>

        <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
          Add Trade
        </button>
      </div>
    </header>
  );
}