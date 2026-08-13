import Image from "next/image";
import { LayoutDashboard, Table, Calendar, Receipt } from "lucide-react";

interface ProductCard {
  id: string;
  icon: typeof LayoutDashboard;
  iconColor: string;
  title: string;
  description: string;
  imageSrc: string | null;
  placeholderText?: string;
}

const productCards: ProductCard[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    iconColor: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    title: "Performance Dashboard",
    description: "Track performance, analyze metrics and understand your edge.",
    imageSrc: "/images/showcase/dashboard-approved.webp",
  },
  {
    id: "trades",
    icon: Table,
    iconColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    title: "Trade History",
    description: "Review every trade with full details across all accounts.",
    imageSrc: "/images/showcase/trade-history.webp",
  },
  {
    id: "calendar",
    icon: Calendar,
    iconColor: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    title: "Trading Calendar",
    description: "Visualize your daily performance and spot recurring patterns.",
    imageSrc: null,
    placeholderText: "Calendar Marketing Asset Pending",
  },
  {
    id: "expenses",
    icon: Receipt,
    iconColor: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    title: "Expense Management",
    description: "Track all trading costs, commissions, subscriptions and tax expenses.",
    imageSrc: "/images/showcase/expenses.webp",
  },
];

export default function TradingIntelligenceSection() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column (~33% Width / 4 Cols): Section Heading & Editorial Copy */}
          <div className="lg:col-span-4 flex flex-col text-left lg:pt-2">
            {/* Eyebrow */}
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F8CFF]">
              COMPLETE TRADING INTELLIGENCE
            </span>

            {/* Headline */}
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-4xl xl:text-[44px] leading-[1.12]">
              Everything you need to<br />
              run your <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">trading business</span>
            </h2>

            {/* Supporting Paragraph */}
            <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
              From trade execution to profitability analysis, Elite X gives you complete visibility across performance, costs, and opportunities.
            </p>
          </div>

          {/* Right Column (~67% Width / 8 Cols): 2 x 2 Product Cards Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {productCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.id}
                    className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#07111C]/90 p-6 shadow-[0_8px_25px_rgba(0,0,0,0.3)] transition-all hover:border-blue-500/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                  >
                    {/* Top Info */}
                    <div>
                      <div className={`flex size-10 items-center justify-center rounded-xl border ${card.iconColor}`}>
                        <IconComponent className="size-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold tracking-tight text-white">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* 16:10 Screenshot Stage / Neutral Placeholder */}
                    <div className="mt-6 relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#030814]">
                      {card.imageSrc ? (
                        <Image
                          src={card.imageSrc}
                          alt={`Elite X ${card.title} Product Feature`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                          quality={90}
                          className="object-contain object-top p-1 transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        /* Restrained Neutral Placeholder for Calendar */
                        <div className="flex size-full flex-col items-center justify-center p-6 text-center bg-[#07111C]/50">
                          <div className="mb-2.5 flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b1220] text-slate-500">
                            <IconComponent className="size-5 text-purple-400/80" />
                          </div>
                          <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                            {card.placeholderText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
