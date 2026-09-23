"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Flame,
  HeartPulse,
  Save,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { Trade } from "@/types/trade";

interface TradeReviewTabProps {
  trade: Trade;
}

// =====================================================
// TYPES
// =====================================================

type ChipOption = {
  label: string;
};

type ScoreItem = {
  label: string;
  value: number;
};

// =====================================================
// CONSTANTS
// =====================================================

const tradeContextOptions: ChipOption[] = [
  { label: "Trend Day" },
  { label: "Range Day" },
  { label: "News / Catalyst" },
  { label: "High Volatility" },
  { label: "Low Volatility" },
  { label: "Choppy" },
];

const setupOptions: ChipOption[] = [
  { label: "Breakout" },
  { label: "Break & Retest" },
  { label: "Support / Resistance" },
  { label: "EMA Pullback" },
  { label: "VWAP Reclaim" },
  { label: "Opening Range" },
  { label: "Liquidity Sweep" },
  { label: "Other" },
];

const entryReasonOptions: ChipOption[] = [
  { label: "Break of Structure" },
  { label: "Volume Confirmation" },
  { label: "Momentum" },
  { label: "Support / Resistance" },
  { label: "Other" },
];

const exitReasonOptions: ChipOption[] = [
  { label: "Target Hit" },
  { label: "Stop Loss" },
  { label: "Structure Break" },
  { label: "Trailing Stop" },
  { label: "Manual Exit" },
  { label: "End of Day" },
  { label: "Other" },
];

const psychologyOptions: ChipOption[] = [
  { label: "Calm" },
  { label: "Confident" },
  { label: "Hesitant" },
  { label: "FOMO" },
  { label: "Revenge" },
];

const mistakeOptions: ChipOption[] = [
  { label: "Overtrading" },
  { label: "FOMO Entry" },
  { label: "Early Exit" },
  { label: "Late Exit" },
  { label: "Oversized Position" },
  { label: "No Stop Loss" },
  { label: "Plan Deviation" },
  { label: "Revenge Trading" },
];

const strengthOptions: ChipOption[] = [
  { label: "Followed Plan" },
  { label: "Good Risk Management" },
  { label: "Patient Entry" },
  { label: "Clean Execution" },
  { label: "Managed Trade Well" },
  { label: "Good Exit Discipline" },
];

const scoreItems: ScoreItem[] = [
  {
    label: "Plan Adherence",
    value: 100,
  },
  {
    label: "Setup Quality",
    value: 90,
  },
  {
    label: "Risk Management",
    value: 100,
  },
  {
    label: "Execution",
    value: 90,
  },
  {
    label: "Psychology",
    value: 85,
  },
];

// =====================================================
// HELPERS
// =====================================================

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        min-h-[26px]
        items-center
        justify-center
        rounded-[6px]
        border
        px-2
        py-1
        text-center
        text-[10px]
        font-medium
        leading-tight
        transition-all
        ${
          selected
            ? "border-violet-400/80 bg-violet-500/15 text-violet-200 shadow-[inset_0_0_10px_rgba(139,92,246,0.10)]"
            : "border-white/[0.06] bg-[#0b1220] text-slate-300 hover:border-white/[0.12] hover:bg-white/[0.025] hover:text-slate-200"
        }
      `}
    >
      {label}
    </button>
  );
}

function ChoiceSection({
  number,
  title,
  question,
  options,
  selected,
  onSelect,
  columns = 3,
}: {
  number: string;
  title: string;
  question: string;
  options: ChipOption[];
  selected: string;
  onSelect: (value: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <section
      className="
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        p-2.5
      "
    >
      <div
        className="
          text-[13px]
          font-semibold
          text-slate-200
        "
      >
        {number}. {title}
      </div>

      <div
        className="
          mt-1
          text-[10px]
          text-slate-500
        "
      >
        {question}
      </div>

      <div
        className={`
          mt-2
          grid
          gap-1.5
          ${
            columns === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }
        `}
      >
        {options.map(
          (option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={
                selected ===
                option.label
              }
              onClick={() =>
                onSelect(
                  option.label
                )
              }
            />
          )
        )}
      </div>
    </section>
  );
}

function MultiSelectSection({
  title,
  subtitle,
  options,
  selected,
  open,
  onToggleOpen,
  onToggleOption,
}: {
  title: string;
  subtitle: string;
  options: ChipOption[];
  selected: string[];
  open: boolean;
  onToggleOpen: () => void;
  onToggleOption: (
    value: string
  ) => void;
}) {
  return (
    <section
      className="
        overflow-hidden
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
      "
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-2
          px-2.5
          py-2
          text-left
          transition
          hover:bg-white/[0.02]
        "
      >
        <span
          className="
            min-w-0
            text-[11px]
            font-medium
            text-slate-300
          "
        >
          {title}

          <span
            className="
              ml-2
              text-[9px]
              text-slate-500
            "
          >
            ({subtitle})
          </span>
        </span>

        <ChevronDown
          size={13}
          className={`
            shrink-0
            text-slate-500
            transition-transform
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div
          className="
            grid
            grid-cols-2
            gap-1.5
            border-t
            border-white/[0.06]
            p-2.5
          "
        >
          {options.map(
            (option) => (
              <Chip
                key={option.label}
                label={
                  option.label
                }
                selected={selected.includes(
                  option.label
                )}
                onClick={() =>
                  onToggleOption(
                    option.label
                  )
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

// =====================================================
// QUALITY SCORE
// =====================================================

function QualityScoreCard() {
  const score = 91;

  return (
    <section
      className="
        rounded-[8px]
        border
        border-white/[0.06]
        bg-[#0b1220]
        p-3
      "
    >
      <div
        className="
          text-[13px]
          font-semibold
          text-slate-200
        "
      >
        Trade Quality Score
      </div>

      <div
        className="
          mt-2
          flex
          items-center
          gap-3
        "
      >
        {/* GAUGE */}

        <div
          className="
            relative
            flex
            h-[94px]
            w-[94px]
            shrink-0
            items-center
            justify-center
          "
        >
          <div
            className="
              absolute
              inset-[3px]
              rounded-full
              border-[6px]
              border-slate-700/70
              border-l-emerald-400
              border-t-emerald-400
              border-r-cyan-400
              rotate-[16deg]
            "
          />

          <div
            className="
              relative
              z-10
              mt-4
              flex
              flex-col
              items-center
            "
          >
            <div
              className="
                text-[30px]
                font-semibold
                leading-none
                text-emerald-400
              "
            >
              A
            </div>

            <div
              className="
                mt-1
                text-[10px]
                font-semibold
                text-slate-100
              "
            >
              {score} / 100
            </div>
          </div>
        </div>

        {/* SCORE BARS */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div className="space-y-2">
            {scoreItems.map(
              (item) => (
                <div
                  key={item.label}
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      w-[72px]
                      shrink-0
                      text-[9px]
                      text-slate-400
                    "
                  >
                    {item.label}
                  </span>

                  <div
                    className="
                      h-[5px]
                      min-w-0
                      flex-1
                      overflow-hidden
                      rounded-full
                      bg-white/[0.06]
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-emerald-400
                      "
                      style={{
                        width: `${item.value}%`,
                      }}
                    />
                  </div>

                  <span
                    className="
                      w-[28px]
                      shrink-0
                      text-right
                      text-[9px]
                      font-medium
                      text-slate-300
                    "
                  >
                    {item.value}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// MAIN
// =====================================================

export default function TradeReviewTab({
  trade,
}: TradeReviewTabProps) {

  const [
    tradeContext,
    setTradeContext,
  ] = useState(
    "Trend Day"
  );

  const [
    setup,
    setSetup,
  ] = useState(
    "Breakout"
  );

  const [
    entryReason,
    setEntryReason,
  ] = useState(
    "Break of Structure"
  );

  const [
    exitReason,
    setExitReason,
  ] = useState(
    "Target Hit"
  );

  const [
    psychology,
    setPsychology,
  ] = useState(
    "Calm"
  );

  const [
    selectedMistakes,
    setSelectedMistakes,
  ] = useState<
    string[]
  >([]);

  const [
    selectedStrengths,
    setSelectedStrengths,
  ] = useState<
    string[]
  >([]);

  const [
    mistakesOpen,
    setMistakesOpen,
  ] = useState(false);

  const [
    strengthsOpen,
    setStrengthsOpen,
  ] = useState(false);

  const [
    markedReviewed,
    setMarkedReviewed,
  ] = useState(false);

  const toggleSelection = (
    current: string[],
    value: string,
    setValue: (
      next: string[]
    ) => void
  ) => {
    setValue(
      current.includes(value)
        ? current.filter(
            (item) =>
              item !== value
          )
        : [
            ...current,
            value,
          ]
    );
  };

  return (
    <div
      className="
        flex
        flex-col
        gap-3
      "
    >
      {/* ================================================= */}
      {/* QUALITY SCORE */}
      {/* ================================================= */}

      <QualityScoreCard />

      {/* ================================================= */}
      {/* TRADE CONTEXT */}
      {/* ================================================= */}

      <ChoiceSection
        number="1"
        title="Trade Context"
        question="What was the overall market environment?"
        options={
          tradeContextOptions
        }
        selected={
          tradeContext
        }
        onSelect={
          setTradeContext
        }
        columns={3}
      />

      {/* ================================================= */}
      {/* SETUP */}
      {/* ================================================= */}

      <ChoiceSection
        number="2"
        title="Setup"
        question="What setup did you trade?"
        options={
          setupOptions
        }
        selected={setup}
        onSelect={setSetup}
        columns={3}
      />

      {/* ================================================= */}
      {/* ENTRY REASON */}
      {/* ================================================= */}

      <ChoiceSection
        number="3"
        title="Entry Reason"
        question="Why did you enter this trade?"
        options={
          entryReasonOptions
        }
        selected={
          entryReason
        }
        onSelect={
          setEntryReason
        }
        columns={3}
      />

      {/* ================================================= */}
      {/* EXIT REASON */}
      {/* ================================================= */}

      <ChoiceSection
        number="4"
        title="Exit Reason"
        question="Why did you exit this trade?"
        options={
          exitReasonOptions
        }
        selected={
          exitReason
        }
        onSelect={
          setExitReason
        }
        columns={3}
      />

      {/* ================================================= */}
      {/* PSYCHOLOGY */}
      {/* ================================================= */}

      <section
        className="
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          p-2.5
        "
      >
        <div
          className="
            text-[13px]
            font-semibold
            text-slate-200
          "
        >
          Psychology
        </div>

        <div
          className="
            mt-2
            grid
            grid-cols-5
            gap-1.5
          "
        >
          {psychologyOptions.map(
            (option) => (
              <Chip
                key={option.label}
                label={
                  option.label
                }
                selected={
                  psychology ===
                  option.label
                }
                onClick={() =>
                  setPsychology(
                    option.label
                  )
                }
              />
            )
          )}
        </div>
      </section>

      {/* ================================================= */}
      {/* MISTAKES */}
      {/* ================================================= */}

      <MultiSelectSection
        title="Mistakes"
        subtitle="Select all that apply"
        options={
          mistakeOptions
        }
        selected={
          selectedMistakes
        }
        open={
          mistakesOpen
        }
        onToggleOpen={() =>
          setMistakesOpen(
            (open) => !open
          )
        }
        onToggleOption={(
          value
        ) =>
          toggleSelection(
            selectedMistakes,
            value,
            setSelectedMistakes
          )
        }
      />

      {/* ================================================= */}
      {/* STRENGTHS */}
      {/* ================================================= */}

      <MultiSelectSection
        title="Strengths"
        subtitle="Select all that apply"
        options={
          strengthOptions
        }
        selected={
          selectedStrengths
        }
        open={
          strengthsOpen
        }
        onToggleOpen={() =>
          setStrengthsOpen(
            (open) => !open
          )
        }
        onToggleOption={(
          value
        ) =>
          toggleSelection(
            selectedStrengths,
            value,
            setSelectedStrengths
          )
        }
      />

      {/* ================================================= */}
      {/* ACTION BAR */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >
        <button
          type="button"
          className="
            flex
            h-[32px]
            flex-1
            items-center
            justify-center
            gap-1
            rounded-[7px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-[10px]
            font-medium
            text-slate-300
            transition
            hover:border-white/[0.12]
            hover:text-white
          "
        >
          <ChevronRight
            size={12}
            className="rotate-180"
          />
          Previous
        </button>

        <button
          type="button"
          className="
            flex
            h-[32px]
            flex-1
            items-center
            justify-center
            gap-1
            rounded-[7px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            text-[10px]
            font-medium
            text-slate-300
            transition
            hover:border-white/[0.12]
            hover:text-white
          "
        >
          Next
          <ChevronRight
            size={12}
          />
        </button>

        <button
          type="button"
          className="
            flex
            h-[32px]
            flex-1
            items-center
            justify-center
            gap-1
            rounded-[7px]
            bg-violet-500
            px-2
            text-[10px]
            font-semibold
            text-white
            shadow-[0_0_15px_rgba(139,92,246,0.18)]
            transition
            hover:bg-violet-400
          "
        >
          <Save
            size={12}
          />
          Save Review
        </button>

        <button
          type="button"
          onClick={() =>
            setMarkedReviewed(
              (value) =>
                !value
            )
          }
          className="
            flex
            h-[32px]
            w-[32px]
            shrink-0
            items-center
            justify-center
            rounded-[7px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            transition
            hover:border-white/[0.12]
          "
          aria-label="Mark as reviewed"
          title="Mark as reviewed"
        >
          <CircleCheck
            size={13}
            className={
              markedReviewed
                ? "text-violet-400"
                : "text-slate-500"
            }
          />
        </button>


      </div>

      {/* ================================================= */}
      {/* AI SUMMARY */}
      {/* ================================================= */}

      <section
        className="
          rounded-[8px]
          border
          border-white/[0.06]
          bg-[#0b1220]
          p-2.5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-1.5
            "
          >
            <Sparkles
              size={12}
              className="
                shrink-0
                text-amber-400
              "
            />

            <span
              className="
                text-[11px]
                font-semibold
                text-slate-200
              "
            >
              AI Trade Summary
            </span>
          </div>

          <button
            type="button"
            className="
              flex
              h-6
              items-center
              gap-1
              rounded-[6px]
              border
              border-violet-500/20
              bg-violet-500/10
              px-2
              text-[9px]
              font-medium
              text-violet-300
              transition
              hover:bg-violet-500/15
            "
          >
            <Sparkles
              size={10}
            />
            Generate
          </button>
        </div>

        <p
          className="
            mt-2
            text-[10px]
            leading-[15px]
            text-slate-500
          "
        >
          {trade.ticker
            ? `Entered ${trade.ticker} trade review.`
            : "Complete this review to generate an AI trade summary."}
        </p>
      </section>

      {/* ================================================= */}
      {/* INTERNAL UI FOOTER SPACING */}
      {/* ================================================= */}

      <div className="h-1 shrink-0" />
    </div>
  );
}