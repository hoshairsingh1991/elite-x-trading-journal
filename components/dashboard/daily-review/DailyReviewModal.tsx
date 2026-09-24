"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  PanelRightClose,
} from "lucide-react";

import { Trade } from "@/types/trade";

import {
  getTradeReviewKey,
  loadTradeReviewKeys,
} from "@/lib/storage/supabaseTradeReviewStorage";

import EditTradeModal
  from "@/components/trades/EditTradeModal";

import DailyReviewHeader
  from "@/components/dashboard/daily-review/DailyReviewHeader";

import DailyReviewKpis
  from "@/components/dashboard/daily-review/DailyReviewKpis";

import DailyReviewTradeTable
  from "@/components/dashboard/daily-review/DailyReviewTradeTable";

import DailyReviewTradeActivity
  from "@/components/dashboard/daily-review/DailyReviewTradeActivity";

import DailyReviewInsights
  from "@/components/dashboard/daily-review/DailyReviewInsights";

import DailyReviewSecondaryMetrics
  from "@/components/dashboard/daily-review/DailyReviewSecondaryMetrics";

import DailyReviewBreakdown
  from "@/components/dashboard/daily-review/DailyReviewBreakdown";

import DailyReviewTradeDrawer
  from "@/components/dashboard/daily-review/DailyReviewTradeDrawer";

interface DailyReviewModalProps {
  selectedDay: number;
  currentMonth: number;
  monthName: string;
  currentYear: number;

  selectedTrades: Trade[];
  allTrades: Trade[];

  reportingCurrency: string;

  onClose: () => void;
}

export default function DailyReviewModal({
  selectedDay,
  currentMonth,
  monthName,
  currentYear,
  selectedTrades,
  allTrades,
  reportingCurrency,
  onClose,
}: DailyReviewModalProps) {

const [
  editingTrade,
  setEditingTrade,
] = useState<Trade | null>(null);

const [
  selectedAccount,
  setSelectedAccount,
] = useState<string>("ALL");

const accountOptions =
  Array.from(
    new Set(
      allTrades
        .map(
          (trade) =>
            trade.account?.trim()
        )
        .filter(
          (
            account
          ): account is string =>
            Boolean(account)
        )
    )
  ).sort(
    (
      first,
      second
    ) =>
      first.localeCompare(
        second
      )
  );

const filteredSelectedTrades =
  selectedAccount === "ALL"
    ? selectedTrades
    : selectedTrades.filter(
        (trade) =>
          trade.account?.trim() ===
          selectedAccount
      );

const [
  selectedTrade,
  setSelectedTrade,
] = useState<Trade | null>(
  filteredSelectedTrades[0] ??
    null
);

const [
  tradeDrawerCollapsed,
  setTradeDrawerCollapsed,
] = useState(
  filteredSelectedTrades.length > 0
);

const [
  reviewedTradeKeys,
  setReviewedTradeKeys,
] = useState<Set<string>>(
  new Set()
);

useEffect(() => {

  let cancelled = false;

  async function loadReviewedTradeKeys() {

    setReviewedTradeKeys(
      new Set()
    );

    const reviewPairs =
      (
        selectedAccount === "ALL"
          ? selectedTrades
          : selectedTrades.filter(
              (trade) =>
                trade.account?.trim() ===
                selectedAccount
            )
      )
        .filter(
          (trade) =>
            !trade.isOpen &&
            trade.status !== "OPEN" &&
            Boolean(
              trade.executions?.[0]?.id &&
              trade.executions?.[1]?.id
            )
        )
        .map(
          (trade) => ({
            entryExecutionId:
              trade.executions![0].id,

            exitExecutionId:
              trade.executions![1].id,
          })
        );

    if (
      reviewPairs.length === 0
    ) {
      return;
    }

    try {

      const keys =
        await loadTradeReviewKeys(
          reviewPairs
        );

      if (!cancelled) {

        setReviewedTradeKeys(
          keys
        );
      }

    } catch (error) {

      console.error(
        "FAILED TO LOAD DAILY REVIEW STATUS:",
        error
      );

      if (!cancelled) {

        setReviewedTradeKeys(
          new Set()
        );
      }
    }
  }

  loadReviewedTradeKeys();

  return () => {

    cancelled = true;
  };

}, [
  selectedAccount,
  selectedTrades,
]);

const handleAccountChange = (
  account: string
) => {

  const nextSelectedTrades =
    account === "ALL"
      ? selectedTrades
      : selectedTrades.filter(
          (trade) =>
            trade.account?.trim() ===
            account
        );

  setSelectedAccount(
    account
  );

  setEditingTrade(
    null
  );

  setSelectedTrade(
    nextSelectedTrades[0] ??
      null
  );

  setTradeDrawerCollapsed(
    nextSelectedTrades.length > 0
  );
};

const handleSelectTrade = (
  trade: Trade
) => {

  setSelectedTrade(
    trade
  );

  setTradeDrawerCollapsed(
    false
  );
};

const handleReviewStatusChange = (
  trade: Trade,
  reviewed: boolean
) => {

  const entryExecutionId =
    trade.executions?.[0]?.id;

  const exitExecutionId =
    trade.executions?.[1]?.id;

  if (
    !entryExecutionId ||
    !exitExecutionId
  ) {
    return;
  }

  const reviewKey =
    getTradeReviewKey(
      entryExecutionId,
      exitExecutionId
    );

  setReviewedTradeKeys(
    (currentKeys) => {

      const nextKeys =
        new Set(
          currentKeys
        );

      if (reviewed) {
        nextKeys.add(
          reviewKey
        );
      } else {
        nextKeys.delete(
          reviewKey
        );
      }

      return nextKeys;
    }
  );
};

const handleEditTrade = (
  trade: Trade
) => {

  /*
   * Editing and the review drawer are mutually
   * exclusive states.
   */
  setSelectedTrade(null);

  setTradeDrawerCollapsed(
    false
  );

  setEditingTrade(
    trade
  );
};

  return (
    <>
      {/* ===================================================== */}
      {/* DAILY REVIEW MODAL */}
      {/* ===================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          bg-black/75
          p-8
          backdrop-blur-sm
        "
      >

        {/* ================================================= */}
        {/* DAILY REVIEW SHELL */}
        {/* ================================================= */}

<div className="relative">
<div
  className={`
    relative
    flex
    gap-[8px]
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    shadow-[0_0_90px_rgba(0,0,0,0.60)]
    ${
      selectedTrade && !tradeDrawerCollapsed
        ? "w-[1328px]"
        : "w-[980px]"
    }
    max-w-[calc(100vw-64px)]
  `}
>

          {/* ================================================= */}
          {/* LEFT DAILY REVIEW PANEL */}
          {/* ================================================= */}

<div
  className="
    w-[980px]
    shrink-0
  "
>
            {/* ================================================= */}
            {/* INNER MODAL SHELL */}
            {/* ================================================= */}

<div
  className={`
    min-w-0
    rounded-l-[8px]
    border
    border-white/[0.06]
    bg-[#0b0c1e]
    px-[28px]
    pt-[28px]
    pb-[28px]
${
  selectedTrade && !tradeDrawerCollapsed
    ? "rounded-r-none border-r-0"
    : "rounded-r-[8px]"
}}
              `}
            >

              {/* ================================================= */}
              {/* MAIN FLEX / SAFE ZONE */}
              {/* ================================================= */}

              <div className="flex">

                {/* LEFT SAFE ZONE */}

                <div
                  className="
                    w-[18px]
                    shrink-0
                    opacity-0
                    pointer-events-none
                    select-none
                  "
                >
                  spacer
                </div>

                {/* MAIN CONTENT */}

               <div className="flex-1">

                  {/* ================================================= */}
                  {/* HEADER */}
                  {/* ================================================= */}

<DailyReviewHeader
  selectedDay={selectedDay}
  currentMonth={currentMonth}
  monthName={monthName}
  currentYear={currentYear}
  selectedTrades={
    filteredSelectedTrades
  }
  accountOptions={
    accountOptions
  }
  selectedAccount={
    selectedAccount
  }
  onAccountChange={
    handleAccountChange
  }
  onClose={onClose}
/>

{/* ================================================= */}
{/* SAFE ZONE */}
{/* ================================================= */}

<div
  className="
    mt-10
    rounded-[8px]
    border
    border-white/[0.04]
    bg-[#081526]/70
    p-8
  "
>

                    <div className="h-[8px]" />

                    {/* ================================================= */}
                    {/* KPI ROW */}
                    {/* ================================================= */}

<DailyReviewKpis
  selectedTrades={
    filteredSelectedTrades
  }
  reportingCurrency={
    reportingCurrency
  }
/>

                    {/* ================================================= */}
                    {/* SPACER */}
                    {/* ================================================= */}

                    <div
                      className="
                        h-[10px]
                        shrink-0
                        opacity-0
                        pointer-events-none
                        select-none
                      "
                    >
                      spacer
                    </div>

                    {/* ================================================= */}
                    {/* TRADE ACTIVITY + DAY INSIGHTS */}
                    {/* ================================================= */}

                    <div
                      className="
                        mt-3
                        w-[98%]
                        translate-x-[1%]
                        grid
                        grid-cols-1
                        gap-3
                        xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.8fr)]
                      "
                    >

<DailyReviewTradeActivity
  selectedTrades={
    filteredSelectedTrades
  }
  reportingCurrency={
    reportingCurrency
  }
/>

<DailyReviewInsights
  selectedTrades={
    filteredSelectedTrades
  }
  reportingCurrency={
    reportingCurrency
  }
/>

                    </div>

                    {/* ================================================= */}
                    {/* SECONDARY METRICS */}
                    {/* ================================================= */}

                    <div
                      className="
                        h-[10px]
                        shrink-0
                        opacity-0
                        pointer-events-none
                        select-none
                      "
                    >
                      spacer
                    </div>

<DailyReviewSecondaryMetrics
  selectedTrades={
    filteredSelectedTrades
  }
  reportingCurrency={
    reportingCurrency
  }
/>

                    {/* ================================================= */}
                    {/* SPACER */}
                    {/* ================================================= */}

                    <div
                      className="
                        h-[10px]
                        shrink-0
                        opacity-0
                        pointer-events-none
                        select-none
                      "
                    >
                      spacer
                    </div>

                    {/* ================================================= */}
                    {/* BREAKDOWN */}
                    {/* ================================================= */}

                    <div
                      className="
                        w-[98%]
                        translate-x-[1%]
                      "
                    >

<DailyReviewBreakdown
  selectedTrades={
    filteredSelectedTrades
  }
  reportingCurrency={
    reportingCurrency
  }
/>

                    </div>

                    {/* ================================================= */}
                    {/* SPACER */}
                    {/* ================================================= */}

                    <div
                      className="
                        h-[0px]
                        shrink-0
                        opacity-0
                        pointer-events-none
                        select-none
                      "
                    >
                      spacer
                    </div>

                    {/* ================================================= */}
                    {/* SPACER */}
                    {/* ================================================= */}

                    <div
                      className="
                        h-[10px]
                        shrink-0
                        opacity-0
                        pointer-events-none
                        select-none
                      "
                    >
                      spacer
                    </div>

                    {/* ================================================= */}
                    {/* TRADE TABLE */}
                    {/* ================================================= */}

<DailyReviewTradeTable
  selectedTrades={
    filteredSelectedTrades
  }
  allTrades={
    allTrades
  }
  reportingCurrency={
    reportingCurrency
  }
  reviewedTradeKeys={
    reviewedTradeKeys
  }
  onSelectTrade={
    handleSelectTrade
  }
  onEditTrade={
    handleEditTrade
  }
/>

                    {/* ================================================= */}
                    {/* BOTTOM SPACER */}
                    {/* ================================================= */}

                    <div
                      className="
                        h-[10px]
                        shrink-0
                        opacity-0
                        pointer-events-none
                        select-none
                      "
                    >
                      spacer
                    </div>

                  </div>
    
                </div>

                {/* RIGHT SAFE ZONE */}

                <div
                  className="
                    w-[18px]
                    shrink-0
                    opacity-0
                    pointer-events-none
                    select-none
                  "
                >
                  spacer
                </div>

              </div>

              <p
                className="
                  invisible
                  text-[18px]
                  leading-[18px]
                "
              >
                spacing
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* ATTACHED TRADE REVIEW PANEL */}
          {/* ================================================= */}

{selectedTrade &&
  !tradeDrawerCollapsed && (
    <div
      className="
        absolute
        top-0
bottom-[18px]
        inset-y-0
        right-0
        w-[340px]
        translate-x-[0px]
      "
    >
<DailyReviewTradeDrawer
  trade={
    selectedTrade
  }
  reportingCurrency={
    reportingCurrency
  }
  onClose={() =>
    setTradeDrawerCollapsed(
      true
    )
  }
  onReviewStatusChange={
    handleReviewStatusChange
  }
/>
    </div>
  )}

        </div>

        {/* ================================================= */}
        {/* COLLAPSED TRADE REVIEW TOGGLE */}
        {/* ================================================= */}

        {selectedTrade &&
          tradeDrawerCollapsed && (
            <button
              type="button"
              onClick={() =>
                setTradeDrawerCollapsed(
                  false
                )
              }
              aria-label="Expand trade review"
              title="Expand trade review"
              className="
                absolute
                -right-6
                top-[38px]
                z-20
                flex
                h-10
                w-6
                -translate-y-1/2
                items-center
                justify-center
                rounded-r-[8px]
                border
                border-white/[0.06]
                border-l-0
                bg-[#07111d]
                text-slate-400
                shadow-[0_0_20px_rgba(0,0,0,0.35)]
                transition
                hover:bg-[#0b1220]
                hover:text-white
              "
            >
              <PanelRightClose
                className="h-4 w-4"
              />
            </button>
          )}

      </div>

    </div>

      {/* ===================================================== */}
      {/* EDIT TRADE MODAL */}
      {/* ===================================================== */}

      <EditTradeModal
        open={
          !!editingTrade
        }
        trade={
          editingTrade
        }
        allTrades={
          allTrades
        }
        onClose={() =>
          setEditingTrade(
            null
          )
        }
      />

    </>
  );
}