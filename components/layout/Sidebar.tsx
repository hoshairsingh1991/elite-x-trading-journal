import {
  LayoutDashboard,
  History,
  Upload,
  PlusCircle,
  BarChart3,
  Wallet,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "Trade History",
    icon: History,
  },
  {
    title: "Import CSV",
    icon: Upload,
  },
  {
    title: "Manual Entry",
    icon: PlusCircle,
  },
  {
    title: "Analytics",
    icon: BarChart3,
  },
  {
    title: "Expenses",
    icon: Wallet,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar-glow sticky top-0 flex h-screen w-[320px] flex-col border-r border-blue-500/10 bg-[#040b18]/95 px-8 py-10 backdrop-blur-xl">
      <div>
        <div className="blue-glow mb-10 rounded-3xl border border-blue-500/20 bg-blue-500/10 p-7">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Elite X
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Professional Trading Journal
          </p>
        </div>

        <button className="blue-glow mb-10 w-full rounded-2xl bg-blue-500 py-4 text-base font-semibold text-white transition-all hover:bg-blue-600">
          + Add Trade
        </button>
      </div>

      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all ${
                item.active
                  ? "border-blue-500/30 bg-blue-500/15 text-white"
                  : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className="transition-all group-hover:scale-110"
              />

              <span className="text-base font-medium tracking-wide">
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-blue-500/10 bg-slate-900/40 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          V1 Status
        </p>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[18%] rounded-full bg-blue-500" />
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Foundation Phase
        </p>
      </div>
    </aside>
  );
}