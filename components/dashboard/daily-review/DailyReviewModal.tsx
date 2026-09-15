"use client";

import {
  useState,
} from "react";

import { Trade } from "@/types/trade";

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
        {/* OUTER MODAL */}
        {/* ================================================= */}

        <div
          className="
            w-full
            max-w-[980px]
            rounded-[8px]
            border
            border-white/[0.06]
            bg-[#0b1220]
            p-10
            shadow-[0_0_90px_rgba(0,0,0,0.60)]
          "
        >
          {/* ================================================= */}
          {/* INNER MODAL SHELL */}
          {/* ================================================= */}

          <div
            className="
              rounded-[8px]
              border
              border-white/[0.06]
              bg-[#0b0c1e]
              px-[28px]
              pt-[28px]
              pb-[28px]
            "
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
                  selectedTrades={selectedTrades}
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
                    selectedTrades={selectedTrades}
                    reportingCurrency={reportingCurrency}
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
                      selectedTrades={selectedTrades}
                    />

                    <DailyReviewInsights
                      selectedTrades={selectedTrades}
                      reportingCurrency={reportingCurrency}
                    />

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
                    selectedTrades={selectedTrades}
                    allTrades={allTrades}
                    reportingCurrency={reportingCurrency}
                    onEditTrade={setEditingTrade}
                  />

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

      </div>

      {/* ===================================================== */}
      {/* EDIT TRADE MODAL */}
      {/* ===================================================== */}

      <EditTradeModal
        open={!!editingTrade}
        trade={editingTrade}
        allTrades={allTrades}
        onClose={() =>
          setEditingTrade(null)
        }
      />

    </>
  );
}