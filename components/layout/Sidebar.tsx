import {
  LayoutDashboard,
  CandlestickChart,
  CalendarDays,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "Trades",
    icon: CandlestickChart,
  },
  {
    title: "Calendar",
    icon: CalendarDays,
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
    <aside className="flex h-full w-[255px] flex-col justify-between rounded-[32px] border border-white/[0.04] bg-[#07101a] py-7 shadow-[0_0_30px_rgba(0,0,0,0.22)]">
      
      {/* ================================================= */}
      {/* TOP SECTION */}
      {/* ================================================= */}

      <div className="flex flex-1 flex-col">
        
        {/* ================================================= */}
        {/* LOGO ZONE */}
        {/* ================================================= */}

        <div className="flex h-[190px] flex-col items-center justify-center px-6">
          
          <h1 className="text-[44px] font-black tracking-[-0.04em] text-white">
            EliteX
          </h1>

          <p className="mt-2 text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">
            Trading OS
          </p>
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="mt-8 flex justify-center">
          
          <div className="w-[88%] space-y-4">
            
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  className={`group flex h-[64px] w-full items-center gap-4 rounded-2xl px-6 transition-all ${
                    item.active
                      ? "bg-[#0b1730] text-white"
                      : "text-slate-500 hover:bg-[#0b1730] hover:text-white"
                  }`}
                >
                  
                  <Icon
                    size={22}
                    className={`${
                      item.active
                        ? "text-blue-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />

                  <span className="text-[16px] font-medium">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ================================================= */}
      {/* BOTTOM */}
      {/* ================================================= */}

      <div className="flex justify-center border-t border-white/[0.04] pt-6">
        
        <div className="w-[88%]">
          
          <button className="group flex h-[64px] w-full items-center gap-4 rounded-2xl px-6 text-slate-500 transition-all hover:bg-[#0b1730] hover:text-white">
            
            <Settings
              size={22}
              className="group-hover:text-slate-300"
            />

            <span className="text-[16px] font-medium">
              Settings
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}