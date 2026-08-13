import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import ProductShowcase from "./ProductShowcase";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-16 lg:pb-24 xl:pt-20 xl:pb-28">
      {/* Background Subtle Ambient Glow behind Product Stage */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute right-0 top-0 -z-10 h-[750px] w-full max-w-6xl opacity-25 blur-3xl bg-[radial-gradient(circle_at_top_right,#2563eb_0,transparent_70%)]" 
      />

      {/* Main Responsive Grid Container - Balanced 37/63 Hero Composition */}
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* Left Column (~37% Usable Width / 5 Cols): Hero Copy & CTAs */}
          <div className="lg:col-span-5 flex flex-col text-left">
            {/* 1. Eyebrow Badge */}
            <div className="mb-7 sm:mb-8 inline-flex items-center gap-2 self-start rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-400 uppercase">
              <Cpu className="size-3.5" />
              <span>Next-Gen Trading OS &amp; P&amp;L Engine</span>
            </div>

            {/* 2. Primary Headline */}
            <h1 className="flex flex-col gap-2.5 sm:gap-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-[58px] leading-[1.08]">
              <span>Know your trading.</span>
              <span>
                Build <span className="bg-gradient-to-r from-[#4F8CFF] to-cyan-400 bg-clip-text text-transparent">your edge.</span>
              </span>
            </h1>

            {/* 3. Supporting Paragraph */}
            <p className="mt-6 sm:mt-7 text-base text-slate-300 sm:text-lg leading-relaxed max-w-lg">
              Elite X turns your executions into a complete performance system — combining analytics, multi-account tracking, journaling, and trading-business intelligence in one platform.
            </p>

            {/* 4. Action CTAs Cluster */}
            <div className="mt-8 sm:mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-blue-600 px-7 text-sm font-bold text-white shadow-[0_0_25px_rgba(79,140,255,0.3)] transition-all hover:opacity-95 hover:shadow-[0_0_30px_rgba(79,140,255,0.45)]"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/login"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b1220] px-7 text-sm font-semibold text-slate-300 transition-all hover:bg-[#131f38] hover:text-white"
              >
                <span>Sign In</span>
              </Link>
            </div>

            {/* 5. Trust & Benefit Indicators */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-blue-400" />
                <span>Multi-Currency Accounting</span>
              </div>
              <span className="text-slate-700">•</span>
              <div>
                <span>Deterministic P&amp;L Engine</span>
              </div>
            </div>
          </div>

          {/* Right Column (~63% Usable Width / 7 Cols): Visually Dominant Product Stage */}
          <div className="lg:col-span-7 w-full">
            <ProductShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
