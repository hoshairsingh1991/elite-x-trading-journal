import { Activity, Zap, Layers, BarChart3, Lock } from "lucide-react";

const capabilities = [
  {
    icon: Activity,
    title: "Complete Trading System",
    subtitle: "Performance + Business",
  },
  {
    icon: Zap,
    title: "IBKR Integration",
    subtitle: "Real-time sync",
  },
  {
    icon: Layers,
    title: "Multi-Account Tracking",
    subtitle: "Everything in one place",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    subtitle: "Deep performance insights",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    subtitle: "Your data, always protected",
  },
];

export default function CapabilityStrip() {
  return (
    <section className="w-full pb-12 pt-2">
      <div 
        className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10"
      >
        {/* Continuous Institutional Capability Rail */}
        <div className="w-full rounded-xl border border-white/[0.07] bg-[#07111C] p-4 lg:py-3.5 lg:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-white/[0.06]">
            {capabilities.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3.5 px-2 lg:px-5 first:pl-1 last:pr-1"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-[#4F8CFF]">
                    <IconComponent className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-tight text-white leading-tight">
                      {item.title}
                    </span>
                    <span className="mt-0.5 text-xs font-normal text-slate-400 leading-tight">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
