import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ProductShowcase from "./ProductShowcase";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-16 lg:pb-24 xl:pt-20 xl:pb-28">
      {/* ========================================================= */}
      {/* BACKGROUND AMBIENT GLOW                                  */}
      {/* ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          -z-10
          h-[750px]
          w-full
          max-w-6xl
          bg-[radial-gradient(circle_at_top_right,#2563eb_0,transparent_70%)]
          opacity-25
          blur-3xl
        "
      />

      {/* ========================================================= */}
      {/* MAIN HERO CONTAINER                                      */}
      {/* ========================================================= */}

      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-14">

          {/* ===================================================== */}
          {/* HERO EDITORIAL                                       */}
          {/* ===================================================== */}

          <div className="lg:col-span-5 flex min-w-0 flex-col text-left">
            {/* ================================================= */}
            {/* EYEBROW                                           */}
            {/* ================================================= */}
<div
  className="
    relative
    left-[0px]
    top-[0px]
    translate-x-[40px]
    translate-y-[-100px]
    mb-7
    inline-flex
    h-[30px]
    w-[220px]
    items-center
    justify-center
    gap-2
    rounded-[8px]
    border
    border-emerald-500/25
    bg-emerald-500/[0.08]
    px-3.5
    py-1.5
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.09em]
    text-emerald-400
  "
>
  <span className="size-1.5 rounded-full bg-emerald-400" />

  <span>
    Built for serious traders
  </span>
</div>

{/* ================================================= */}
{/* PRIMARY HEADLINE                                  */}
{/* ================================================= */}

<h1
  className="
    relative
    left-[0px]
    top-[0px]
    translate-x-[40px]
    translate-y-[-70px]
    w-[560px]
    max-w-full
    text-[48px]
    font-semibold
    leading-[1.08]
    tracking-[-0.035em]
    text-white
"
>
  <span className="block">
    Know your trading.
  </span>

  <span className="mt-[0px] block">
    Build{" "}
    <span
      className="
        bg-gradient-to-r
        from-[#4F8CFF]
        to-cyan-400
        bg-clip-text
        text-transparent
      "
    >
      your edge.
    </span>
  </span>
</h1>

{/* ================================================= */}
{/* SUPPORTING COPY                                  */}
{/* ================================================= */}

<p
  className="
    relative
    left-[50px]
    top-[-50px]
    mt-6
    w-[510px]
    max-w-full
    text-[15px]
    leading-7
    text-slate-400
  "
>
  Elite X turns your executions into a complete performance
  system — combining analytics, multi-account tracking,
  journaling and trading-business intelligence in one platform.
</p>

{/* ================================================= */}
{/* CTA ROW                                          */}
{/* ================================================= */}

<div className="relative mt-8 flex items-center gap-5">

  {/* ================================================= */}
  {/* PRIMARY CTA                                      */}
  {/* ================================================= */}

  <Link
    href="/login"
    className="
      relative
      left-[50px]
      top-[-30px]
      flex
      h-[40px]
      w-[180px]
      items-center
      justify-center
      gap-2.5
      rounded-[10px]
      bg-gradient-to-r
      from-[#4F46E5]
      via-[#4F8CFF]
      to-[#06B6D4]
      text-[13px]
      font-semibold
      text-white
      shadow-[0_10px_30px_rgba(79,140,255,0.18)]
      transition-all
      hover:brightness-[1.04]
    "
  >
    <span>
      Start Free Trial
    </span>

    <ArrowRight className="size-[15px]" />
  </Link>


  {/* ================================================= */}
  {/* SECONDARY CTA                                    */}
  {/* ================================================= */}

  <Link
    href="#showcase"
    className="
      relative
      left-[80px]
      top-[-30px]
      flex
      h-[40px]
      w-[180px]
      items-center
      justify-center
      gap-2.5
      rounded-[10px]
      border
      border-white/[0.10]
      bg-white/[0.02]
      text-[13px]
      font-semibold
      text-slate-300
      transition-all
      hover:border-white/[0.16]
      hover:bg-white/[0.04]
      hover:text-white
    "
  >
    <span>
      Explore Platform
    </span>

    <span
      className="
        flex
        size-[17px]
        items-center
        justify-center
        rounded-[8px]
        border
        border-white/[0.12]
        text-[9px]
      "
    >
      <ArrowRight className="size-[9px]" />
    </span>
  </Link>

</div>

            {/* ================================================= */}
            {/* TRUST ROW                                        */}
            {/* ================================================= */}

            <div
  className="
    relative
    left-[50px]
    top-[10px]
    mt-8
    flex
    flex-wrap
    items-center
    gap-x-6
    gap-y-3
  "
>
              {/* No credit card */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-[15px] text-emerald-400" />

                <span className="text-[12px] font-medium text-slate-400">
                  No credit card required
                </span>
              </div>

              {/* Free trial */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-[15px] text-emerald-400" />

                <span className="text-[12px] font-medium text-slate-400">
                  14-day free trial
                </span>
              </div>

              {/* Cancellation */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-[15px] text-emerald-400" />

                <span className="text-[12px] font-medium text-slate-400">
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* PRODUCT SHOWCASE                                     */}
          {/* ===================================================== */}

          <div
            className="
              relative
              left-[300px]
              lg:col-span-7
              w-full
            "
          >
            <ProductShowcase />
          </div>

        </div>
      </div>
    </section>
  );
}