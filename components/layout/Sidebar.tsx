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
    <aside className="w-[260px] min-h-screen bg-[#070b18]/95 border-r border-slate-800 p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-wide text-white">
          Elite X
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Trading Journal
        </p>
      </div>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b1120] px-4 py-3 text-slate-300 transition-all hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
            >
              <Icon size={18} />

              <span className="text-sm font-medium">
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}