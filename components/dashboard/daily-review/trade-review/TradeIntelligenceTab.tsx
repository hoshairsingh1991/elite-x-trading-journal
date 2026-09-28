"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  Brain,
  FileText,
  Lightbulb,
  Sparkle,
} from "lucide-react";

import TradeIntelligenceGenerated from "./TradeIntelligenceGenerated";

import { Trade } from "@/types/trade";

import { supabase } from "@/lib/supabase";

import type {
  TradeIntelligenceResult,
} from "@/lib/ai/tradeIntelligence/types";

// =====================================================
// TRADE INTELLIGENCE TAB
// =====================================================
//
// Pre-generation state only.
//
// AI generation logic will be added later.
// This component owns all Intelligence-specific UI.
// =====================================================

interface TradeIntelligenceTabProps {
  trade: Trade;
}

export default function TradeIntelligenceTab({
  trade,
}: TradeIntelligenceTabProps) {
  const [intelligence, setIntelligence] =
    useState<TradeIntelligenceResult | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

      const [activeLens, setActiveLens] =
    useState(0);

  useEffect(() => {
    const lensTimer =
      setInterval(() => {
        setActiveLens((current) =>
          (current + 1) % 3
        );
      }, 3000);

    return () => {
      clearInterval(lensTimer);
    };
  }, []);

  const handleGenerateIntelligence =
    async () => {
      if (
        !trade.executions ||
        trade.executions.length !== 2
      ) {
        setGenerationError(
          "This trade does not contain a valid entry and exit execution pair."
        );

        return;
      }

      const entryExecution =
        trade.executions[0];

      const exitExecution =
        trade.executions[1];

      setIsGenerating(true);
      setGenerationError(null);

      try {
        const {
          data: {
            session,
          },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (
          sessionError ||
          !session?.access_token
        ) {
          throw new Error(
            "Your session could not be verified. Please sign in again."
          );
        }

        const response =
          await fetch(
            "/api/ai/trade-summary",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body: JSON.stringify({
                entryExecutionId:
                  entryExecution.id,

                exitExecutionId:
                  exitExecution.id,
              }),
            }
          );

        const payload =
          await response.json();

        if (
          !response.ok ||
          !payload?.success
        ) {
          throw new Error(
            typeof payload?.error ===
              "string"
              ? payload.error
              : "Trade Intelligence generation failed."
          );
        }

        setIntelligence(
          payload.intelligence
        );
      } catch (error) {
        setGenerationError(
          error instanceof Error
            ? error.message
            : "Trade Intelligence generation failed."
        );
      } finally {
        setIsGenerating(false);
      }
    };

if (intelligence) {
  return (
    <TradeIntelligenceGenerated
      trade={trade}
      intelligence={intelligence}
      onRegenerate={handleGenerateIntelligence}
      isRegenerating={isGenerating}
    />
  );
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
      {/* AI INSIGHT LENSES */}
      {/* ================================================= */}

      <section
        className="
          relative
          h-[82px]
          w-full
          overflow-hidden
          rounded-[8px]
          border
          border-violet-400/[0.12]
          bg-[linear-gradient(135deg,rgba(12,18,34,0.96),rgba(8,17,31,0.99))]
          shadow-[inset_0_0_30px_rgba(139,92,246,0.025)]
        "
      >

        {/* ================================================= */}
        {/* AMBIENT AI GLOW */}
        {/* ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[-28px]
            h-[60px]
            w-[190px]
            -translate-x-1/2
            rounded-full
            bg-violet-500/[0.045]
            blur-2xl
            animate-pulse
          "
        />

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[11px]
            top-[8px]
            z-10
            text-[10px]
            font-semibold
            tracking-[0.22em]
            text-violet-300
          "
        >
          AI INSIGHT LENSES
        </div>

        <div
          className="
            absolute
            right-[11px]
            top-[8px]
            z-10
            flex
            items-center
            gap-1.5
            text-[9px]
            font-medium
            tracking-[0.12em]
            text-emerald-300/70
          "
        >

          <span
            className="
              h-[4px]
              w-[4px]
              rounded-full
              bg-emerald-400
              shadow-[0_0_7px_rgba(52,211,153,0.75)]
              animate-pulse
            "
          />

          LIVE ANALYSIS

        </div>

        {/* ================================================= */}
        {/* ACTIVE LENS */}
        {/* ================================================= */}

<div
  className="
    absolute
    inset-x-0
    bottom-[7px]
    top-[37px]
    flex
    items-center
    justify-center
    relative
    left-[30px]
  "
>

          <div
            key={activeLens}
            className="
              flex
              items-center
              gap-2.5
              animate-in
              fade-in
              slide-in-from-bottom-1
              duration-500
            "
          >

            {/* ================================================= */}
            {/* ACTIVE LENS ICON */}
            {/* ================================================= */}

            <div
              className={`
                relative
                flex
                h-[24px]
                w-[24px]
                shrink-0
                items-center
                justify-center
                rounded-full
                transition-all
                duration-500

                ${
                  activeLens === 0
                    ? "border border-sky-300/35 bg-sky-400/[0.05] shadow-[0_0_16px_rgba(56,189,248,0.16)]"
                    : activeLens === 1
                      ? "border border-violet-300/40 bg-violet-400/[0.06] shadow-[0_0_18px_rgba(139,92,246,0.22)]"
                      : "border border-amber-300/35 bg-amber-400/[0.05] shadow-[0_0_16px_rgba(251,191,36,0.16)]"
                }
              `}
            >

              {/* ================================================= */}
              {/* PATTERNS ICON */}
              {/* ================================================= */}

              {activeLens === 0 && (
                <span
                  className="
                    h-[8px]
                    w-[8px]
                    rotate-45
                    rounded-[2px]
                    border
                    border-sky-200/80
                    bg-sky-300/[0.10]
                    shadow-[0_0_9px_rgba(125,211,252,0.75)]
                    animate-pulse
                  "
                />
              )}

              {/* ================================================= */}
              {/* EXECUTION ICON */}
              {/* ================================================= */}

              {activeLens === 1 && (
                <>
                  <span
                    className="
                      h-[8px]
                      w-[8px]
                      rounded-full
                      bg-violet-200
                      shadow-[0_0_11px_rgba(196,181,253,0.95)]
                      animate-pulse
                    "
                  />

                  <span
                    className="
                      absolute
                      inset-[4px]
                      rounded-full
                      border
                      border-violet-200/[0.18]
                    "
                  />
                </>
              )}

              {/* ================================================= */}
              {/* LESSONS ICON */}
              {/* ================================================= */}

              {activeLens === 2 && (
                <>
                  <span
                    className="
                      h-[8px]
                      w-[8px]
                      rotate-45
                      rounded-[2px]
                      bg-amber-300/[0.12]
                      shadow-[0_0_10px_rgba(253,224,71,0.80)]
                      animate-pulse
                    "
                  />

                  <span
                    className="
                      absolute
                      h-[4px]
                      w-[4px]
                      translate-x-[5px]
                      translate-y-[-5px]
                      rounded-full
                      bg-amber-200
                      shadow-[0_0_7px_rgba(253,224,71,0.85)]
                    "
                  />
                </>
              )}

            </div>

            {/* ================================================= */}
            {/* ACTIVE LENS TEXT */}
            {/* ================================================= */}

            <div
              className="
                min-w-[190px]
                text-left
              "
            >

              <div
                className={`
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  transition-colors
                  duration-500

                  ${
                    activeLens === 0
                      ? "text-sky-300"
                      : activeLens === 1
                        ? "text-violet-300"
                        : "text-amber-300"
                  }
                `}
              >
                {activeLens === 0
                  ? "Patterns"
                  : activeLens === 1
                    ? "Execution"
                    : "Lessons"}
              </div>

              <div
                className="
                  mt-[2px]
                  text-[10px]
                  leading-[11px]
                  text-slate-500
                "
              >
                {activeLens === 0
                  ? "Finding relationships across your trade"
                  : activeLens === 1
                    ? "Examining entry, management and exit"
                    : "Extracting what to carry forward"}
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
  onClick={handleGenerateIntelligence}
  disabled={isGenerating}
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

        {isGenerating
  ? "Analyzing..."
  : "Generate Intelligence"}

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

            {generationError && (
        <p className="mt-3 text-center text-[11px] leading-4 text-red-400">
          {generationError}
        </p>
      )}

      {/* ================================================= */}
      {/* FOOTER SPACING */}
      {/* ================================================= */}

      <div className="h-1 shrink-0" />

    </div>
  );
}