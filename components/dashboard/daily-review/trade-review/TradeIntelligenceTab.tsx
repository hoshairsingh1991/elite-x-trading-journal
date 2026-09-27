"use client";

import { useState } from "react";

import {
  BarChart3,
  Brain,
  FileText,
  Lightbulb,
  Sparkle,
} from "lucide-react";

import TradeIntelligenceGenerated from "./TradeIntelligenceGenerated";

// =====================================================
// TRADE INTELLIGENCE TAB
// =====================================================
//
// Pre-generation state only.
//
// AI generation logic will be added later.
// This component owns all Intelligence-specific UI.
// =====================================================

export default function TradeIntelligenceTab() {
  const [isGenerated, setIsGenerated] = useState(false);

  if (isGenerated) {
    return <TradeIntelligenceGenerated />;
  }

  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-3
      "
    >

      {/* ================================================= */}
      {/* INTELLIGENCE HERO */}
      {/* ================================================= */}

      <section
        className="
          relative
          h-[316px]
          w-[100%]
          overflow-hidden
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#08111f]
          px-4
          pb-5
          pt-4
        "
      >

        {/* ================================================= */}
        {/* ORBIT VISUAL */}
        {/* ================================================= */}

        <div
          className="
            relative
            mx-auto
            h-[190px]
            w-full
          "
        >

          {/* AMBIENT GLOW */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[150px]
              w-[150px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-violet-500/[0.07]
              blur-2xl
            "
          />

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[110px]
              w-[110px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-violet-400/[0.06]
              blur-xl
            "
          />

          {/* LARGE ORBIT */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[68px]
              w-[250px]
              -translate-x-1/2
              -translate-y-1/2
              rotate-[-8deg]
              rounded-[50%]
              border
              border-blue-400/[0.26]
            "
          />

          {/* DIAGONAL ORBIT 1 */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[190px]
              w-[82px]
              -translate-x-1/2
              -translate-y-1/2
              rotate-[34deg]
              rounded-[50%]
              border
              border-violet-400/[0.22]
            "
          />

          {/* DIAGONAL ORBIT 2 */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[190px]
              w-[82px]
              -translate-x-1/2
              -translate-y-1/2
              rotate-[-34deg]
              rounded-[50%]
              border
              border-blue-400/[0.17]
            "
          />

          {/* INNER ORBIT 1 */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[145px]
              w-[58px]
              -translate-x-1/2
              -translate-y-1/2
              rotate-[58deg]
              rounded-[50%]
              border
              border-violet-300/[0.18]
            "
          />

          {/* INNER ORBIT 2 */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[145px]
              w-[58px]
              -translate-x-1/2
              -translate-y-1/2
              rotate-[-58deg]
              rounded-[50%]
              border
              border-cyan-300/[0.13]
            "
          />

          {/* ================================================= */}
          {/* ORBIT NODES */}
          {/* ================================================= */}

          <div
            className="
              absolute
              left-[42px]
              top-[72px]
              h-[5px]
              w-[5px]
              rounded-full
              bg-blue-300
              shadow-[0_0_7px_rgba(96,165,250,0.85)]
            "
          />

          <div
            className="
              absolute
              left-[94px]
              top-[28px]
              h-[4px]
              w-[4px]
              rounded-full
              bg-violet-300
              shadow-[0_0_7px_rgba(167,139,250,0.85)]
            "
          />

          <div
            className="
              absolute
              right-[66px]
              top-[31px]
              h-[4px]
              w-[4px]
              rounded-full
              bg-blue-300
              shadow-[0_0_7px_rgba(96,165,250,0.8)]
            "
          />

          <div
            className="
              absolute
              right-[24px]
              top-[78px]
              h-[5px]
              w-[5px]
              rounded-full
              bg-violet-300
              shadow-[0_0_7px_rgba(167,139,250,0.85)]
            "
          />

          <div
            className="
              absolute
              right-[76px]
              bottom-[21px]
              h-[4px]
              w-[4px]
              rounded-full
              bg-blue-300
              shadow-[0_0_7px_rgba(96,165,250,0.75)]
            "
          />

          <div
            className="
              absolute
              left-[74px]
              bottom-[20px]
              h-[4px]
              w-[4px]
              rounded-full
              bg-violet-300
              shadow-[0_0_7px_rgba(167,139,250,0.75)]
            "
          />

          {/* ================================================= */}
          {/* CENTRAL SPHERE */}
          {/* ================================================= */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[108px]
              w-[108px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              border
              border-violet-300/30
              bg-[radial-gradient(circle_at_32%_28%,rgba(196,181,253,0.48),rgba(129,92,246,0.30)_34%,rgba(91,33,182,0.20)_58%,rgba(8,17,31,0.95)_84%)]
              shadow-[0_0_40px_rgba(139,92,246,0.28),inset_10px_10px_24px_rgba(255,255,255,0.035),inset_-14px_-14px_28px_rgba(76,29,149,0.16)]
            "
          >

            <div
              className="
                absolute
                inset-[10px]
                rounded-full
                border
                border-violet-200/[0.10]
              "
            />

            <div
              className="
                absolute
                inset-[18px]
                rounded-full
                border
                border-cyan-200/[0.06]
              "
            />

            <div
              className="
                absolute
                left-[20px]
                top-[16px]
                h-[22px]
                w-[38px]
                rotate-[-28deg]
                rounded-full
                bg-white/[0.045]
                blur-[6px]
              "
            />

          </div>

          {/* ================================================= */}
          {/* CENTRAL INTELLIGENCE MARK */}
          {/* ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              flex
              -translate-x-1/2
              -translate-y-1/2
              items-center
            "
          >

            <Sparkle
              size={25}
              strokeWidth={1.7}
              fill="currentColor"
              className="
                text-white
                drop-shadow-[0_0_10px_rgba(196,181,253,0.95)]
              "
            />

            <Sparkle
              size={11}
              strokeWidth={1.8}
              fill="currentColor"
              className="
                -translate-x-[2px]
                -translate-y-[9px]
                text-violet-200
                drop-shadow-[0_0_8px_rgba(167,139,250,0.9)]
              "
            />

          </div>

          {/* ================================================= */}
          {/* YOUR TRADE DATA */}
          {/* ================================================= */}

          <div
            className="
              absolute
              left-[8px]
              top-[22px]
              flex
              h-[30px]
              w-[110px]
              items-center
              justify-center
              gap-2
              rounded-[8px]
              border
              border-blue-400/25
              bg-[#0b1628]/95
              shadow-[0_8px_24px_rgba(0,0,0,0.22)]
            "
          >

            <BarChart3
              size={13}
              className="text-sky-300"
            />

            <span
              className="
                text-[10px]
                font-medium
                text-sky-200
              "
            >
              Your Trade Data
            </span>

          </div>

          {/* ================================================= */}
          {/* YOUR REVIEW */}
          {/* ================================================= */}

          <div
            className="
              absolute
              right-[10px]
              top-[22px]
              flex
              h-[30px]
              w-[90px]
              items-center
              justify-center
              gap-2
              rounded-[8px]
              border
              border-violet-400/25
              bg-[#0b1628]/95
              shadow-[0_8px_24px_rgba(0,0,0,0.22)]
            "
          >

            <FileText
              size={13}
              className="text-violet-300"
            />

            <span
              className="
                text-[10px]
                font-medium
                text-violet-200
              "
            >
              Your Review
            </span>

          </div>

          {/* ================================================= */}
          {/* AI ANALYSIS */}
          {/* ================================================= */}

          <div
            className="
              absolute
              bottom-[20px]
              left-[10px]
              flex
              h-[30px]
              w-[90px]
              items-center
              justify-center
              gap-2
              rounded-[8px]
              border
              border-violet-400/25
              bg-[#0b1628]/95
              shadow-[0_8px_24px_rgba(0,0,0,0.22)]
            "
          >

            <Brain
              size={13}
              className="text-violet-300"
            />

            <span
              className="
                text-[10px]
                font-medium
                text-violet-200
              "
            >
              AI Analysis
            </span>

          </div>

          {/* ================================================= */}
          {/* ACTIONABLE INSIGHTS */}
          {/* ================================================= */}

          <div
            className="
              absolute
              bottom-[20px]
              right-[10px]
              flex
              h-[30px]
              w-[118px]
              items-center
              justify-center
              gap-2
              rounded-[8px]
              border
              border-amber-400/25
              bg-[#0b1628]/95
              shadow-[0_8px_24px_rgba(0,0,0,0.22)]
            "
          >

            <Lightbulb
              size={13}
              className="text-amber-300"
            />

            <span
              className="
                text-[10px]
                font-medium
                text-amber-200
              "
            >
              Actionable Insights
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* EYEBROW */}
        {/* ================================================= */}

        <div
          className="
            text-center
            text-[9px]
            font-semibold
            tracking-[0.28em]
            text-slate-500
          "
        >
          TRADE INTELLIGENCE
        </div>

        {/* ================================================= */}
        {/* HEADLINE */}
        {/* ================================================= */}

        <div
          className="
            mt-2
            text-center
          "
        >

          <div
            className="
              text-[23px]
              font-semibold
              leading-[28px]
              tracking-[-0.02em]
              text-white
            "
          >
            Turn your trade into
          </div>

          <div
            className="
              text-[23px]
              font-semibold
              leading-[28px]
              tracking-[-0.02em]
              text-violet-300
            "
          >
            meaningful insights
          </div>

        </div>

        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <p
className="
  relative
  left-1/2
  mt-3
  w-[280px]
  -translate-x-1/2
  translate-y-[3px]
  text-center
  text-[10px]
  leading-[16px]
  text-slate-400
"
        >
          Intelligence analyzes your trade, your review and
          execution data to give you a personalized,
          high-value breakdown — not just a summary of your answers.
        </p>

      </section>

      {/* ================================================= */}
      {/* VALUE PROPOSITION */}
      {/* ================================================= */}

      <section
        className="
          h-[74px]
          w-[100%]
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#08111f]
          px-2
          py-3
        "
      >

        <div
          className="
            grid
            h-full
            grid-cols-3
            divide-x
            divide-white/[0.06]
          "
        >

          {/* ================================================= */}
          {/* DEEPER INSIGHTS */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-start
              gap-2
              pr-2
            "
          >


            <div
              className="
                min-w-0
              "
            >

<div
  className="
    relative
    left-[0px]
    top-[10px]
    w-full
    text-center
    text-[11px]
    font-semibold
    leading-[12px]
    text-white
  "
>
  Deeper Insights
</div>

<div
  className="
    relative
    left-[0px]
    top-[18px]
    mt-1
    w-full
    text-center
    text-[10px]
    leading-[12px]
    text-slate-500
  "
>
  Find what really mattered in this trade.
</div>

            </div>

          </div>

          {/* ================================================= */}
          {/* EXECUTION ANALYSIS */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-start
              gap-2
              px-2
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <div
                className="
                  relative
                  left-[0px]
                  top-[10px]
                  w-full
                  text-center
                  text-[11px]
                  font-semibold
                  leading-[12px]
                  text-white
                "
              >
                Execution Analysis
              </div>

              <div
                className="
                  relative
                  left-[0px]
                  top-[18px]
                  mt-1
                  w-full
                  text-center
                  text-[10px]
                  leading-[12px]
                  text-slate-500
                "
              >
                See strengths, weaknesses and patterns.
              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* ACTIONABLE TAKEAWAYS */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-start
              gap-2
              pl-2
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <div
                className="
                  relative
                  left-[0px]
                  top-[10px]
                  w-full
                  text-center
                  text-[10px]
                  font-semibold
                  leading-[12px]
                  text-white
                "
              >
                Actionable Takeaways
              </div>

              <div
                className="
                  relative
                  left-[0px]
                  top-[18px]
                  mt-1
                  w-full
                  text-center
                  text-[10px]
                  leading-[12px]
                  text-slate-500
                "
              >
                Get clear lessons for future trades.
              </div>

            </div>

          </div>

        </div>

      </section>
      {/* ================================================= */}
      {/* REVIEW GUIDANCE */}
      {/* ================================================= */}

      <section
        className="
          relative
          h-[94px]
          rounded-[8px]
          border
          border-violet-500/25
          bg-[linear-gradient(135deg,rgba(76,29,149,0.18),rgba(15,23,42,0.72))]
          shadow-[inset_0_0_25px_rgba(139,92,246,0.035)]
        "
      >

        {/* ================================================= */}
        {/* REVIEW TITLE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[10px]
            top-[14px]
            w-[320px]
            whitespace-nowrap
            text-center
            text-[12px]
            font-semibold
            text-white
          "
        >
          For the best results, complete your trade review
        </div>

        {/* ================================================= */}
        {/* REVIEW DESCRIPTION */}
        {/* ================================================= */}

        <p
          className="
            absolute
            left-[0px]
            top-[39px]
            w-[320px]
            text-center
            text-[10px]
            leading-[14px]
            text-slate-400
          "
        >
          The more complete your review — context, setup,
          entry, exit, management, psychology, mistakes
          and strengths — the more meaningful and
          trade-specific your insights will be.
        </p>

      </section>

      {/* ================================================= */}
      {/* INTELLIGENCE ENGINE */}
      {/* ================================================= */}

      <section
        className="
          relative
          h-[108px]
          w-full
          overflow-hidden
          rounded-[8px]
          border
          border-violet-400/20
          bg-[linear-gradient(135deg,rgba(24,18,62,0.42),rgba(8,17,31,0.94))]
          shadow-[inset_0_0_28px_rgba(139,92,246,0.035)]
        "
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[11px]
            top-[8px]
            text-[9px]
            font-semibold
            tracking-[0.24em]
            text-violet-300
          "
        >
          INTELLIGENCE ENGINE
        </div>

        <div
          className="
            absolute
            right-[11px]
            top-[8px]
            flex
            items-center
            gap-1.5
            text-[8px]
            font-medium
            tracking-[0.08em]
            text-emerald-300
          "
        >
          <span
            className="
              h-[5px]
              w-[5px]
              rounded-full
              bg-emerald-400
              shadow-[0_0_7px_rgba(52,211,153,0.8)]
              animate-pulse
            "
          />

          READY
        </div>

        {/* ================================================= */}
        {/* CENTRAL SIGNAL LINE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[20px]
            right-[20px]
            top-[62px]
            h-px
            bg-gradient-to-r
            from-transparent
            via-violet-400/35
            to-transparent
          "
        />

        {/* ================================================= */}
        {/* LEFT NODE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[38px]
            top-[56px]
            h-[13px]
            w-[13px]
            rounded-full
            border
            border-sky-300/40
            bg-sky-400/[0.08]
            shadow-[0_0_12px_rgba(56,189,248,0.24)]
          "
        />

        {/* ================================================= */}
        {/* LEFT NODE LABEL */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[16px]
            top-[31px]
            text-[7px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          Evidence
        </div>

        {/* ================================================= */}
        {/* CENTER CORE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-[62px]
            flex
            h-[24px]
            w-[24px]
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-violet-300/45
            bg-violet-500/[0.12]
            shadow-[0_0_18px_rgba(139,92,246,0.32)]
          "
        >

          <span
            className="
              h-[7px]
              w-[7px]
              rounded-full
              bg-violet-200
              shadow-[0_0_10px_rgba(196,181,253,0.95)]
              animate-pulse
            "
          />

        </div>

        {/* ================================================= */}
        {/* CENTER LABEL */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-[33px]
            -translate-x-1/2
            text-[7px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-violet-300
          "
        >
          Synthesis
        </div>

        {/* ================================================= */}
        {/* RIGHT NODE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            right-[38px]
            top-[56px]
            h-[13px]
            w-[13px]
            rounded-full
            border
            border-amber-300/40
            bg-amber-400/[0.08]
            shadow-[0_0_12px_rgba(251,191,36,0.20)]
          "
        />

        {/* ================================================= */}
        {/* RIGHT NODE LABEL */}
        {/* ================================================= */}

        <div
          className="
            absolute
            right-[16px]
            top-[31px]
            text-[7px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          Insight
        </div>

        {/* ================================================= */}
        {/* LOWER STATUS */}
        {/* ================================================= */}

        <div
          className="
            absolute
            bottom-[9px]
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-[8px]
            font-medium
            tracking-[0.14em]
            text-slate-500
          "
        >
          READY TO SYNTHESIZE YOUR TRADE
        </div>

      </section>

      {/* ================================================= */}
      {/* GENERATE */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() => setIsGenerated(true)}
        className="
          group
          flex
          h-[46px]
          w-full
          items-center
          justify-center
          gap-2
          rounded-[8px]
          border
          border-violet-400/40
          bg-[linear-gradient(90deg,rgba(76,29,149,0.90),rgba(109,40,217,0.84))]
          text-[13px]
          font-semibold
          text-white
          shadow-[0_0_24px_rgba(139,92,246,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
          transition-all
          duration-150
          ease-out
          hover:border-violet-300/60
          hover:shadow-[0_0_30px_rgba(139,92,246,0.24),inset_0_1px_0_rgba(255,255,255,0.14)]
          active:scale-[0.985]
          active:border-violet-200/70
          active:brightness-125
          active:shadow-[0_0_38px_rgba(167,139,250,0.42),inset_0_1px_0_rgba(255,255,255,0.18)]
        "
      >

        <span
          className="
            relative
            flex
            h-[16px]
            w-[16px]
            shrink-0
            items-center
            justify-center
            text-violet-100
            drop-shadow-[0_0_6px_rgba(167,139,250,0.45)]
          "
        >

          <Sparkle
            size={15}
            strokeWidth={1.8}
            fill="currentColor"
            className="
              animate-pulse
            "
          />

          <Sparkle
            size={6}
            strokeWidth={1.8}
            fill="currentColor"
            className="
              absolute
              right-[0px]
              top-[0px]
              text-violet-300
              drop-shadow-[0_0_5px_rgba(167,139,250,0.65)]
              [animation:ping_2.8s_ease-in-out_infinite]
            "
          />

        </span>

        Generate Intelligence

        <span
          className="
            ml-1
            text-[16px]
            leading-none
            transition-transform
            duration-150
            group-hover:translate-x-[2px]
            group-active:translate-x-[4px]
          "
        >
          →
        </span>

      </button>

      {/* ================================================= */}
      {/* FOOTER SPACING */}
      {/* ================================================= */}

      <div className="h-1 shrink-0" />

    </div>
  );
}