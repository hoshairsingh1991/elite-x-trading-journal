import {
  LayoutDashboard,
  History,
  Upload,
  PlusCircle,
  BarChart3,
  Wallet,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    label: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        active: true,
      },
    ],
  },

  {
    label: "TRADING",
    items: [
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
    ],
  },

  {
    label: "ANALYTICS",
    items: [
      {
        title: "Analytics",
        icon: BarChart3,
      },
      {
        title: "Expenses",
        icon: Wallet,
      },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[255px] flex-col border-r border-[#13203a] bg-[#050816] px-4 py-5">
      
      {/* Top Brand Card */}
      <div className="rounded-3xl border border-[#173056] bg-gradient-to-b from-[#111827] to-[#0a1020] px-5 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[30px] font-black tracking-tight text-white">
              Elite X
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Trading Journal
            </p>
          </div>

          <ChevronRight
            size={18}
            className="text-slate-600"
          />
        </div>

        {/* Add Trade Button */}
        <button className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-500 py-3 text-sm font-medium text-white transition-all hover:bg-blue-600">
          + Add Trade
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 overflow-y-auto">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.label}>
              
              {/* Section Label */}
              <p className="mb-3 px-2 text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                {section.label}
              </p>

              {/* Nav Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                        item.active
                          ? "bg-blue-500/10 text-white"
                          : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={`${
                            item.active
                              ? "text-blue-400"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        />

                        <span className="text-[14px] font-medium">
                          {item.title}
                        </span>
                      </div>

                      {!item.active && (
                        <ChevronRight
                          size={14}
                          className="text-slate-700 opacity-0 transition-all group-hover:opacity-100"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Footer */}
      <div className="border-t border-white/5 pt-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
          Elite X V1
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Local-first analytics platform for discretionary traders.
        </p>
      </div>
    </aside>
  );
}