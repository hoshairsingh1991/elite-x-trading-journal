"use client";

import {
  RotateCcw,
  Sparkle,
} from "lucide-react";

import type { Trade } from "@/types/trade";

import type {
  TradeIntelligenceResult,
} from "@/lib/ai/tradeIntelligence/types";

// =====================================================
// TRADE INTELLIGENCE — GENERATED STATE
// =====================================================
//
// Live generated Intelligence UI.
// Receives canonical trade data and structured AI analysis.
// =====================================================

interface TradeIntelligenceGeneratedProps {
  trade: Trade;
  intelligence: TradeIntelligenceResult;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export default function TradeIntelligenceGenerated({
  trade,
  intelligence,
  onRegenerate,
  isRegenerating,
}: TradeIntelligenceGeneratedProps) {

  const formatPrice = (
    value: number | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
    ) {
      return "—";
    }

    return value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }
    );
  };

  const formatPnl = (
    value: number
  ) => {
    const absoluteValue =
      Math.abs(value).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

    return `${value < 0 ? "-" : ""}${trade.currency} ${absoluteValue}`;
  };

  const formatHoldTime = () => {
    if (
      !trade.openedAt ||
      !trade.closedAt
    ) {
      return "—";
    }

    const start =
      new Date(trade.openedAt).getTime();

    const end =
      new Date(trade.closedAt).getTime();

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end < start
    ) {
      return "—";
    }

    const totalSeconds = Math.floor(
      (end - start) / 1000
    );

    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }

    const totalMinutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    if (totalMinutes < 60) {
      return seconds === 0
        ? `${totalMinutes}m`
        : `${totalMinutes}m ${seconds}s`;
    }

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes =
      totalMinutes % 60;

    return minutes === 0
      ? `${hours}h`
      : `${hours}h ${minutes}m`;
  };

  const formatTradeDate = (
    value: string
  ) => {
    if (!value) {
      return "—";
    }

    const dateOnlyMatch =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        value
      );

    if (dateOnlyMatch) {
      const year =
        Number(dateOnlyMatch[1]);

      const month =
        Number(dateOnlyMatch[2]) - 1;

      const day =
        Number(dateOnlyMatch[3]);

      const localDate =
        new Date(
          year,
          month,
          day
        );

      return localDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
    }

    const parsedDate =
      new Date(value);

    if (
      !Number.isFinite(
        parsedDate.getTime()
      )
    ) {
      return value;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

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
  onClick={onRegenerate}
  disabled={isRegenerating}
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

          {isRegenerating
  ? "Regenerating..."
  : "Regenerate"}
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
             {trade.ticker}
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
  {formatTradeDate(trade.date)}
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
  className={`
    relative
    left-[8px]
    top-[6px]
    mt-[7px]
    whitespace-nowrap
    text-[11px]
    font-semibold
    ${
      trade.pnl > 0
        ? "text-emerald-400"
        : trade.pnl < 0
          ? "text-rose-400"
          : "text-slate-300"
    }
  `}
>
  {formatPnl(trade.pnl)}
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
                {formatHoldTime()}
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
                {formatPrice(trade.entryPrice)}
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
                {formatPrice(trade.exitPrice)}
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
                {trade.quantity}
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
  {intelligence.tradeRead ??
    "No supported trade-level interpretation was generated from the available evidence."}
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
  {intelligence.whatStandsOut ??
    "No sufficiently supported standout relationship was identified from the available evidence."}
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
            top-[12px]
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

            {intelligence.strength ? (
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
                  {intelligence.strength}
                </span>

              </div>
            ) : (
              <div
                className="
                  mt-[9px]
                  text-[10px]
                  leading-[14px]
                  text-slate-500
                "
              >
                No sufficiently supported strength identified.
              </div>
            )}

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

            {intelligence.weakness ? (
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
                  {intelligence.weakness}
                </span>

              </div>
            ) : (
              <div
                className="
                  mt-[9px]
                  text-[10px]
                  leading-[14px]
                  text-slate-500
                "
              >
                No sufficiently supported weakness identified.
              </div>
            )}

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
        {/* ANALYSIS */}
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

          <div
            className="
              grid
              grid-cols-[72px_10px_minmax(0,1fr)]
              items-start
              gap-x-[6px]
              py-[7px]
            "
          >

            {/* ================================================= */}
            {/* LABEL */}
            {/* ================================================= */}

            <div
              className="
                text-[10px]
                font-medium
                text-white
              "
            >
              Execution
            </div>

            {/* ================================================= */}
            {/* SIGNAL */}
            {/* ================================================= */}

            <div
              className="
                mt-[3px]
                h-[7px]
                w-[7px]
                rounded-full
                bg-cyan-400
                shadow-[0_0_7px_rgba(34,211,238,0.65)]
              "
            />

            {/* ================================================= */}
            {/* INTELLIGENCE */}
            {/* ================================================= */}

            <div
              className="
                text-[10px]
                leading-[14px]
                text-slate-300
              "
            >
              {intelligence.executionRead}
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
          {intelligence.behavioralSignal ??
            "No sufficiently supported behavioral signal was identified from the available evidence."}
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
          {intelligence.keyTakeaway}
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

        {intelligence.xFactor ? (
          <>
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
              {intelligence.xFactor}
            </div>
          </>
        ) : (
          <div
            className="
              relative
              left-[11px]
              top-[14px]
              mt-[8px]
              w-[306px]
              text-[11px]
              leading-[16px]
              text-slate-500
            "
          >
            No sufficiently supported higher-order relationship was identified in this trade.
          </div>
        )}

      </section>

    </div>
  );
}