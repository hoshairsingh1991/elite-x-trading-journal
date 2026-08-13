import Image from "next/image";
import {
  LayoutDashboard,
  Table,
  Calendar,
  Receipt,
} from "lucide-react";

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
    iconColor:
      "text-blue-400 border-blue-500/20 bg-blue-500/10",
    title: "Performance Dashboard",
    description:
      "Track performance, analyze metrics and understand your edge.",
    imageSrc:
      "/images/showcase/dashboard-approved.webp",
  },
  {
    id: "trades",
    icon: Table,
    iconColor:
      "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    title: "Trade History",
    description:
      "Review every trade with full details across all accounts.",
    imageSrc:
      "/images/showcase/trade-history.webp",
  },
  {
    id: "calendar",
    icon: Calendar,
    iconColor:
      "text-purple-400 border-purple-500/20 bg-purple-500/10",
    title: "Trading Calendar",
    description:
      "Visualize your daily performance and spot recurring patterns.",
    imageSrc: null,
    placeholderText:
      "Calendar Marketing Asset Pending",
  },
  {
    id: "expenses",
    icon: Receipt,
    iconColor:
      "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    title: "Expense Management",
    description:
      "Track all trading costs, commissions, subscriptions and tax expenses.",
    imageSrc:
      "/images/showcase/expenses.webp",
  },
];

export default function TradingIntelligenceSection() {
  return (
    <section className="w-full pt-16 pb-[180px] lg:pt-24 lg:pb-[220px]">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10">

        {/* ===================================================== */}
        {/* MAIN INTELLIGENCE LAYOUT                              */}
        {/* ===================================================== */}

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">

{/* ===================================================== */}
{/* LEFT EDITORIAL                                       */}
{/* ===================================================== */}

<div
  className="
    relative
    left-[0px]
    top-[0px]
    lg:col-span-3
    flex
    flex-col
    text-left
  "
>
  {/* ================================================= */}
  {/* EYEBROW                                           */}
  {/* ================================================= */}

  <span
    className="
      relative
      left-[50px]
      top-[50px]
      inline-block
      w-fit
      text-[11px]
      font-bold
      uppercase
      tracking-[0.14em]
      text-[#4F8CFF]
    "
  >
    COMPLETE TRADING INTELLIGENCE
  </span>

  {/* ================================================= */}
  {/* HEADLINE                                          */}
  {/* ================================================= */}

<h2
  className="
    relative
    left-[50px]
    top-[60px]
    mt-3
    w-[520px]
    text-[30px]
    font-semibold
    leading-[1.16]
    tracking-[-0.025em]
    text-white
  "
>
  <span className="block whitespace-nowrap">
    Everything you need to
  </span>

  <span className="block whitespace-nowrap">
    run your{" "}
    <span
      className="
        bg-gradient-to-r
        from-[#4F8CFF]
        to-cyan-400
        bg-clip-text
        text-transparent
      "
    >
      trading business
    </span>
  </span>
</h2>

  {/* ================================================= */}
  {/* SUPPORTING COPY                                  */}
  {/* ================================================= */}

  <p
    className="
      relative
      left-[50px]
      top-[70px]
      mt-5
      w-[360px]
      max-w-full
      text-[13px]
      leading-6
      text-slate-400
    "
  >
    From trade execution to profitability analysis, Elite X gives you
    complete visibility across performance, costs, and opportunities.
  </p>
</div>

          {/* =================================================== */}
          {/* RIGHT PRODUCT GRID                                  */}
          {/* =================================================== */}

          <div className="lg:col-span-9">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {productCards.map((card) => {
                const IconComponent = card.icon;

                return (
<div
  key={card.id}
  className="
    relative
    left-[150px]
    top-[20px]
    group
    flex
    min-w-0
    flex-col
    overflow-hidden
    rounded-[10px]
    border
    border-white/[0.08]
    bg-[#07111C]/90
    p-4
    shadow-[0_8px_25px_rgba(0,0,0,0.3)]
    transition-all
    hover:border-blue-500/30
    hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]
  "
>
                    {/* ================================================= */}
                    {/* CARD HEADER                                       */}
                    {/* ================================================= */}

                    <div>
                      <div
                        className={`
                          flex
                          size-9
                          items-center
                          justify-center
                          rounded-[8px]
                          border
                          ${card.iconColor}
                        `}
                      >
                        <IconComponent className="size-[17px]" />
                      </div>

                      <h3 className="mt-3 text-[14px] font-semibold leading-tight tracking-[-0.01em] text-white">
                        {card.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-[10px] leading-[1.5] text-slate-400">
                        {card.description}
                      </p>
                    </div>

                    {/* ================================================= */}
                    {/* SCREENSHOT                                       */}
                    {/* ================================================= */}

                    <div
                      className="
                        relative
                        mt-4
                        h-[128px]
                        w-full
                        overflow-hidden
                        rounded-[8px]
                        border
                        border-white/[0.08]
                        bg-[#030814]
                      "
                    >
                      {card.imageSrc ? (
                        <Image
                          src={card.imageSrc}
                          alt={`Elite X ${card.title} Product Feature`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 240px"
                          quality={90}
                          className="
                            object-contain
                            object-top
                            p-1
                            transition-transform
                            duration-300
                            group-hover:scale-[1.02]
                          "
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center bg-[#07111C]/50 p-4 text-center">
                          <div className="mb-2 flex size-9 items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#0B1220]">
                            <IconComponent className="size-4 text-purple-400/80" />
                          </div>

                          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-500">
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

{/* ===================================================== */}
{/* SUPPORTING TOOLS                                     */}
{/* ===================================================== */}

<div
  className="
    relative
    left-[300px]
    top-[60px]
    mt-6
    flex
    flex-col
    items-center
  "
>
  {/* Heading */}
  <p
    className="
      relative
      left-[0px]
      top-[0px]
      text-[16px]
      font-medium
      text-slate-300
    "
  >
    More tools to help you trade smarter
  </p>

  {/* Tool List */}
  <div
    className="
      relative
      left-[0px]
      top-[10px]
      mt-4
      flex
      flex-wrap
      items-center
      justify-center
      gap-x-8
      gap-y-3
    "
  >
    {/* Notes & Journaling */}
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-[#7C5CFF]" />

      <span className="text-[11px] text-slate-400">
        Notes &amp; Journaling
      </span>
    </div>

    {/* Advanced Analytics */}
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-cyan-400" />

      <span className="text-[11px] text-slate-400">
        Advanced Analytics
      </span>
    </div>

    {/* Watchlist & Alerts */}
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-[#4F8CFF]" />

      <span className="text-[11px] text-slate-400">
        Watchlist &amp; Alerts
      </span>
    </div>

    {/* Manual Trade Entry */}
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-emerald-400" />

      <span className="text-[11px] text-slate-400">
        Manual Trade Entry
      </span>
    </div>

    {/* Multi-Currency Support */}
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-cyan-400" />

      <span className="text-[11px] text-slate-400">
        Multi-Currency Support
      </span>
    </div>

    {/* Custom Reports */}
    <div className="flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-emerald-400" />

      <span className="text-[11px] text-slate-400">
        Custom Reports
      </span>
    </div>
  </div>
</div>

        {/* ===================================================== */}
        {/* SECTION / FOOTER SPACING                             */}
        {/* ===================================================== */}

        <div
          className="
            relative
            left-[0px]
            top-[0px]
            h-[80px]
          "
        />
      </div>
    </section>
  );
}