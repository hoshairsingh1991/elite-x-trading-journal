"use client";

import {
  MoreHorizontal,
  RotateCcw,
  Sparkle,
} from "lucide-react";

// =====================================================
// TRADE INTELLIGENCE — GENERATED STATE
// =====================================================
//
// UI-only mock state for Intelligence development.
// Real AI data will be connected later.
// =====================================================

export default function TradeIntelligenceGenerated() {
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
      {/* INTELLIGENCE HEADER + TRADE SNAPSHOT */}
      {/* ================================================= */}

      <section
        className="
          relative
          h-[130px]
          w-full
          overflow-hidden
          rounded-[8px]
          border
          border-blue-400/[0.16]
          bg-[#071220]
          shadow-[inset_0_0_28px_rgba(59,130,246,0.025)]
        "
      >

        {/* ================================================= */}
        {/* INTELLIGENCE ICON */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[12px]
            top-[14px]
            flex
            h-[36px]
            w-[36px]
            items-center
            justify-center
            rounded-[9px]
            border
            border-violet-400/30
            bg-violet-500/[0.14]
            text-violet-100
            shadow-[0_0_18px_rgba(139,92,246,0.18)]
          "
        >
          <Sparkle
            size={19}
            strokeWidth={1.8}
            fill="currentColor"
            className="
              drop-shadow-[0_0_7px_rgba(196,181,253,0.95)]
            "
          />

          <Sparkle
            size={8}
            strokeWidth={1.8}
            fill="currentColor"
            className="
              absolute
              right-[7px]
              top-[6px]
              text-violet-200
              drop-shadow-[0_0_6px_rgba(167,139,250,0.9)]
            "
          />
        </div>

        {/* ================================================= */}
        {/* INTELLIGENCE TITLE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[58px]
            top-[15px]
            text-[11px]
            font-semibold
            tracking-[0.18em]
            text-violet-200
          "
        >
          TRADE INTELLIGENCE
        </div>

        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[58px]
            top-[34px]
            text-[11px]
            text-slate-400
          "
        >
          Analysis complete
        </div>

        {/* ================================================= */}
        {/* REGENERATE */}
        {/* ================================================= */}

        <button
          type="button"
          className="
            absolute
            right-[10px]
            top-[14px]
            flex
            h-[32px]
            w-[76px]
            items-center
            justify-center
            gap-1.5
            rounded-[8px]
            border
            border-violet-400/25
            bg-violet-500/[0.08]
            text-[9px]
            font-semibold
            text-violet-100
          "
        >
          <RotateCcw
            size={12}
            strokeWidth={1.8}
          />

          Regenerate
        </button>



        {/* ================================================= */}
        {/* HEADER DIVIDER */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[12px]
            right-[12px]
            top-[62px]
            h-px
            bg-white/[0.06]
          "
        />

        {/* ================================================= */}
        {/* TRADE SNAPSHOT */}
        {/* ================================================= */}

        <div
          className="
            absolute
            left-[12px]
            right-[12px]
            top-[76px]
            h-[82px]
            grid
            grid-cols-[92px_minmax(0,1fr)]
            gap-x-[10px]
          "
        >

          {/* ================================================= */}
          {/* SYMBOL */}
          {/* ================================================= */}

          <div
            className="
              flex
              flex-col
              justify-start
            "
          >

            <div
              className="
                text-[21px]
                font-semibold
                leading-none
                tracking-[-0.02em]
                text-violet-300
              "
            >
              NVDA
            </div>

<div
  className="
    relative
    top-[6px]
    mt-2
    whitespace-nowrap
    text-[10px]
    leading-none
    text-slate-400
  "
>
  Oct 18, 2024
</div>

          </div>

          {/* ================================================= */}
          {/* METRICS */}
          {/* ================================================= */}

          <div
            className="
              relative
              -left-[26px]
              top-[4px]
              grid
              h-full
              grid-cols-[1.15fr_0.9fr_0.9fr_0.9fr_0.55fr]
              gap-x-[16px]
            "
          >

            {/* ================================================= */}
            {/* NET P&L */}
            {/* ================================================= */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
                border-l
                border-white/[0.06]
                text-center
              "
            >

              <div
                className="
                  relative
                  left-[8px]
                  whitespace-nowrap
                  text-[8px]
                  text-slate-500
                "
              >
                Net P&L
              </div>

              <div
                className="
                  relative
                  left-[8px]
                  top-[6px]
                  mt-[7px]
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-rose-400
                "
              >
                -$86.40
              </div>

            </div>

            {/* ================================================= */}
            {/* HOLD TIME */}
            {/* ================================================= */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
                border-l
                border-white/[0.06]
                text-center
              "
            >

              <div
                className="
                  relative
                  left-[8px]
                  whitespace-nowrap
                  text-[8px]
                  text-slate-500
                "
              >
                Hold Time
              </div>

              <div
                className="
                  relative
                  left-[8px]
                  top-[6px]
                  mt-[7px]
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-white
                "
              >
                18m
              </div>

            </div>

            {/* ================================================= */}
            {/* ENTRY */}
            {/* ================================================= */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
                border-l
                border-white/[0.06]
                text-center
              "
            >

              <div
                className="
                  relative
                  left-[8px]
                  whitespace-nowrap
                  text-[8px]
                  text-slate-500
                "
              >
                Entry
              </div>

              <div
                className="
                  relative
                  left-[8px]
                  top-[6px]
                  mt-[7px]
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-white
                "
              >
                $1.74
              </div>

            </div>

            {/* ================================================= */}
            {/* EXIT */}
            {/* ================================================= */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
                border-l
                border-white/[0.06]
                text-center
              "
            >

              <div
                className="
                  relative
                  left-[8px]
                  whitespace-nowrap
                  text-[8px]
                  text-slate-500
                "
              >
                Exit
              </div>

              <div
                className="
                  relative
                  left-[8px]
                  top-[6px]
                  mt-[7px]
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-white
                "
              >
                $1.62
              </div>

            </div>

            {/* ================================================= */}
            {/* QTY */}
            {/* ================================================= */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
                border-l
                border-white/[0.06]
                text-center
              "
            >

              <div
                className="
                  relative
                  left-[8px]
                  whitespace-nowrap
                  text-[8px]
                  text-slate-500
                "
              >
                Qty
              </div>

              <div
                className="
                  relative
                  left-[8px]
                  top-[6px]
                  mt-[7px]
                  text-[11px]
                  font-semibold
                  text-white
                "
              >
                1
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* TRADE READ */}
      {/* ================================================= */}

      <section
        className="
          relative
          min-h-[124px]
          w-full
          rounded-[8px]
          border
          border-sky-400/25
          bg-[linear-gradient(135deg,rgba(8,40,68,0.38),rgba(8,17,31,0.94))]
          shadow-[inset_0_0_28px_rgba(56,189,248,0.035)]
        "
      >

        {/* ================================================= */}
        {/* TRADE READ TITLE */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[8px]
            w-[306px]
            text-[16px]
            font-semibold
            tracking-[-0.01em]
            text-sky-300
          "
        >
          Trade Read
        </div>

        {/* ================================================= */}
        {/* TRADE READ BODY */}
        {/* ================================================= */}

        <p
          className="
            relative
            left-[11px]
            top-[12px]
            mt-[8px]
            w-[306px]
            text-[11px]
            leading-[16px]
            text-slate-300
          "
        >
          This was a high-probability setup that didn’t play out
          as expected. The trade followed a clear support and
          resistance idea, but the entry was driven by FOMO and
          executed before full confirmation. The quick exit
          suggests a lack of conviction after entry, even though
          risk was kept controlled.
        </p>

      </section>

      {/* ================================================= */}
      {/* WHAT STANDS OUT */}
      {/* ================================================= */}

      <section
        className="
          relative
          min-h-[112px]
          w-full
          rounded-[8px]
          border
          border-violet-400/25
          bg-[linear-gradient(135deg,rgba(38,24,82,0.34),rgba(8,17,31,0.94))]
          shadow-[inset_0_0_24px_rgba(139,92,246,0.03)]
        "
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[9px]
            w-[306px]
            text-[15px]
            font-semibold
            tracking-[-0.01em]
            text-violet-300
          "
        >
          What Stands Out
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <p
          className="
            relative
            left-[11px]
            top-[10px]
            mt-[8px]
            w-[306px]
            text-[11px]
            leading-[16px]
            text-slate-300
          "
        >
          The strongest contrast is between the quality of the
          setup and the timing of the entry. The idea itself was
          reasonable, but the decision to enter before full
          confirmation appears to have been the key factor that
          changed the trade.
        </p>

      </section>


{/* ================================================= */}
      {/* STRENGTHS VS. WEAKNESSES */}
      {/* ================================================= */}

      <section
        className="
          relative
          min-h-[120px]
          w-full
          rounded-[8px]
          border
          border-amber-400/20
          bg-[linear-gradient(135deg,rgba(67,48,8,0.22),rgba(8,17,31,0.94))]
          shadow-[inset_0_0_24px_rgba(251,191,36,0.025)]
        "
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[9px]
            w-[306px]
            text-[15px]
            font-semibold
            tracking-[-0.01em]
            text-amber-300
          "
        >
          Strengths vs. Weaknesses
        </div>

        {/* ================================================= */}
        {/* TWO COLUMN AREA */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[18px]
            grid
            w-[306px]
            grid-cols-2
          "
        >

          {/* ================================================= */}
          {/* STRENGTHS */}
          {/* ================================================= */}

          <div
            className="
              pr-[12px]
            "
          >

            <div
              className="
                text-[10px]
                font-semibold
                text-emerald-300
              "
            >
              Strengths
            </div>

            {/* ================================================= */}
            {/* STRENGTH 1 */}
            {/* ================================================= */}

            <div
              className="
                mt-[9px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-emerald-400
                "
              >
                ✓
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                Recognized a valid setup
              </span>

            </div>

            {/* ================================================= */}
            {/* STRENGTH 2 */}
            {/* ================================================= */}

            <div
              className="
                mt-[7px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-emerald-400
                "
              >
                ✓
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                Managed risk appropriately
              </span>

            </div>

            {/* ================================================= */}
            {/* STRENGTH 3 */}
            {/* ================================================= */}

            <div
              className="
                mt-[7px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-emerald-400
                "
              >
                ✓
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                Closed the trade decisively
              </span>

            </div>

          </div>

          {/* ================================================= */}
          {/* WEAKNESSES */}
          {/* ================================================= */}

          <div
            className="
              relative
              pl-[12px]
            "
          >

            <div
              className="
                absolute
                left-[-8px]
                top-0
                bottom-0
                w-px
                bg-white/[0.08]
              "
            />

            <div
              className="
                text-[10px]
                font-semibold
                text-rose-400
              "
            >
              Weaknesses
            </div>

            {/* ================================================= */}
            {/* WEAKNESS 1 */}
            {/* ================================================= */}

            <div
              className="
                mt-[9px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-rose-400
                "
              >
                ×
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                FOMO entry
              </span>

            </div>

            {/* ================================================= */}
            {/* WEAKNESS 2 */}
            {/* ================================================= */}

            <div
              className="
                mt-[7px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-rose-400
                "
              >
                ×
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                Impatience
              </span>

            </div>

            {/* ================================================= */}
            {/* WEAKNESS 3 */}
            {/* ================================================= */}

            <div
              className="
                mt-[7px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-rose-400
                "
              >
                ×
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                Exited too early
              </span>

            </div>

            {/* ================================================= */}
            {/* WEAKNESS 4 */}
            {/* ================================================= */}

            <div
              className="
                mt-[7px]
                flex
                items-start
                gap-[6px]
              "
            >

              <span
                className="
                  shrink-0
                  text-[11px]
                  font-semibold
                  leading-[14px]
                  text-rose-400
                "
              >
                ×
              </span>

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-slate-300
                "
              >
                Lack of conviction
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* EXECUTION ANALYSIS */}
      {/* ================================================= */}

      <section
        className="
          relative
          min-h-[128px]
          w-full
          rounded-[8px]
          border
          border-cyan-400/20
          bg-[linear-gradient(135deg,rgba(8,48,65,0.28),rgba(8,17,31,0.94))]
          px-[11px]
          py-[9px]
          shadow-[inset_0_0_24px_rgba(34,211,238,0.025)]
        "
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[9px]
            w-[306px]
            text-[15px]
            font-semibold
            tracking-[-0.01em]
            text-cyan-300
          "
        >
          Execution Analysis
        </div>

        {/* ================================================= */}
        {/* ANALYSIS ROWS */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[14px]
            mt-[10px]
            w-[306px]
          "
        >

          {/* ================================================= */}
          {/* SETUP */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-[72px_10px_minmax(0,1fr)]
              items-center
              gap-x-[6px]
              border-b
              border-white/[0.06]
              py-[7px]
            "
          >

            <div
              className="
                text-[10px]
                font-medium
                text-white
              "
            >
              Setup
            </div>

            <div
              className="
                h-[7px]
                w-[7px]
                rounded-full
                bg-emerald-400
                shadow-[0_0_7px_rgba(52,211,153,0.65)]
              "
            />

            <div
              className="
                text-[10px]
                leading-[14px]
                text-slate-300
              "
            >
              Aligned with your strategy
            </div>

          </div>

          {/* ================================================= */}
          {/* ENTRY */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-[72px_10px_minmax(0,1fr)]
              items-center
              gap-x-[6px]
              border-b
              border-white/[0.06]
              py-[7px]
            "
          >

            <div
              className="
                text-[10px]
                font-medium
                text-white
              "
            >
              Entry
            </div>

            <div
              className="
                h-[7px]
                w-[7px]
                rounded-full
                bg-rose-400
                shadow-[0_0_7px_rgba(251,113,133,0.6)]
              "
            />

            <div
              className="
                text-[10px]
                leading-[14px]
                text-slate-300
              "
            >
              Impulsive (FOMO)
            </div>

          </div>

          {/* ================================================= */}
          {/* MANAGEMENT */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-[72px_10px_minmax(0,1fr)]
              items-center
              gap-x-[6px]
              border-b
              border-white/[0.06]
              py-[7px]
            "
          >

            <div
              className="
                text-[10px]
                font-medium
                text-white
              "
            >
              Management
            </div>

            <div
              className="
                h-[7px]
                w-[7px]
                rounded-full
                bg-amber-400
                shadow-[0_0_7px_rgba(251,191,36,0.6)]
              "
            />

            <div
              className="
                text-[10px]
                leading-[14px]
                text-slate-300
              "
            >
              Cut trade early
            </div>

          </div>

          {/* ================================================= */}
          {/* EXIT */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-[72px_10px_minmax(0,1fr)]
              items-center
              gap-x-[6px]
              border-b
              border-white/[0.06]
              py-[7px]
            "
          >

            <div
              className="
                text-[10px]
                font-medium
                text-white
              "
            >
              Exit
            </div>

            <div
              className="
                h-[7px]
                w-[7px]
                rounded-full
                bg-amber-400
                shadow-[0_0_7px_rgba(251,191,36,0.6)]
              "
            />

            <div
              className="
                text-[10px]
                leading-[14px]
                text-slate-300
              "
            >
              Could have given more room
            </div>

          </div>

          {/* ================================================= */}
          {/* RISK CONTROL */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-[72px_10px_minmax(0,1fr)]
              items-center
              gap-x-[6px]
              py-[7px]
            "
          >

            <div
              className="
                text-[10px]
                font-medium
                text-white
              "
            >
              Risk Control
            </div>

            <div
              className="
                h-[7px]
                w-[7px]
                rounded-full
                bg-emerald-400
                shadow-[0_0_7px_rgba(52,211,153,0.65)]
              "
            />

            <div
              className="
                text-[10px]
                leading-[14px]
                text-slate-300
              "
            >
              Position size kept in check
            </div>

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* BEHAVIORAL INSIGHT */}
      {/* ================================================= */}

      <section
        className="
          relative
          min-h-[112px]
          w-full
          rounded-[8px]
          border
          border-fuchsia-400/20
          bg-[linear-gradient(135deg,rgba(76,20,65,0.24),rgba(8,17,31,0.94))]
          shadow-[inset_0_0_24px_rgba(217,70,239,0.025)]
        "
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[9px]
            w-[306px]
            text-[15px]
            font-semibold
            tracking-[-0.01em]
            text-fuchsia-300
          "
        >
          Behavioral Insight
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <p
          className="
            relative
            left-[11px]
            top-[10px]
            mt-[8px]
            w-[306px]
            text-[11px]
            leading-[16px]
            text-slate-300
          "
        >
          The review suggests that impatience influenced the
          entry more than the underlying setup itself. That
          tendency appears again in the quick exit, creating
          a pattern where the trade was given less room to
          develop than the original idea required.
        </p>

      </section>

      {/* ================================================= */}
      {/* KEY TAKEAWAY */}
      {/* ================================================= */}
      <section
        className="
          relative
          min-h-[90px]
          w-full
          rounded-[8px]
          border
          border-amber-400/50
          bg-[linear-gradient(135deg,rgba(67,48,8,0.34),rgba(22,18,10,0.90))]
          shadow-[0_0_18px_rgba(251,191,36,0.06),inset_0_0_24px_rgba(251,191,36,0.035)]
        "
      >

        {/* ================================================= */}
        {/* EYEBROW */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[10px]
            w-[306px]
            text-[9px]
            font-semibold
            tracking-[0.24em]
            text-amber-300
          "
        >
          KEY TAKEAWAY
        </div>

        {/* ================================================= */}
        {/* TAKEAWAY */}
        {/* ================================================= */}

        <p
          className="
            relative
            left-[11px]
            top-[14px]
            mt-[8px]
            w-[306px]
            text-[11px]
            font-medium
            leading-[16px]
            text-amber-50
          "
        >
          The setup was sound, but the entry was not. Focus on
          waiting for full confirmation before entering, and avoid
          acting on FOMO even when the setup looks strong.
        </p>

      </section>   

            {/* ================================================= */}
      {/* X-FACTOR */}
      {/* ================================================= */}

      <section
        className="
          relative
          min-h-[116px]
          w-full
          rounded-[8px]
          border
          border-violet-500/40
          bg-[linear-gradient(135deg,rgba(49,24,105,0.34),rgba(8,17,31,0.96))]
          shadow-[0_0_20px_rgba(139,92,246,0.06),inset_0_0_26px_rgba(139,92,246,0.035)]
        "
      >

        {/* ================================================= */}
        {/* EYEBROW */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[10px]
            w-[306px]
            text-[9px]
            font-semibold
            tracking-[0.24em]
            text-violet-300
          "
        >
          X-FACTOR
        </div>

        {/* ================================================= */}
        {/* MAIN INSIGHT */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[11px]
            top-[14px]
            mt-[8px]
            w-[306px]
            text-[13px]
            font-semibold
            leading-[18px]
            text-violet-200
          "
        >
          Execution discipline — not the setup — was the limiting factor in this trade.
        </div>

        {/* ================================================= */}
        {/* SUPPORTING INSIGHT */}
        {/* ================================================= */}

        <p
          className="
            relative
            left-[11px]
            top-[16px]
            mt-[7px]
            w-[306px]
            text-[11px]
            leading-[16px]
            text-slate-300
          "
        >
          You correctly identified the opportunity, but entering
          before confirmation turned a good setup into a losing trade.
        </p>

      </section>

    </div>
  );
}