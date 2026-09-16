"use client";

import {
  useState,
} from "react";

import { Trade } from "@/types/trade";

const CURRENCY_INFO = {
  USD: {
    symbol: "$",
  },

  CAD: {
    symbol: "C$",
  },

  EUR: {
    symbol: "€",
  },

  GBP: {
    symbol: "£",
  },

  JPY: {
    symbol: "¥",
  },

  INR: {
    symbol: "₹",
  },
};

interface DailyReviewBreakdownProps {
  selectedTrades: Trade[];
  reportingCurrency: string;
}

export default function DailyReviewBreakdown({
  selectedTrades,
  reportingCurrency,
}: DailyReviewBreakdownProps) {

  const [
    expandedCards,
    setExpandedCards,
  ] = useState<Record<string, boolean>>({});

const buildRows = (
  key: "ticker" | "account" | "side" | "assetType"
) => {
  const groups = new Map<
    string,
    {
      trades: number;
      pnl: number;
    }
  >();

  selectedTrades.forEach((trade) => {
    const rawValue = trade[key];

    if (!rawValue) {
      return;
    }

    const label = String(rawValue);

    const existing = groups.get(label);

    if (existing) {
      existing.trades += 1;
      existing.pnl += trade.pnl;
    } else {
      groups.set(label, {
        trades: 1,
        pnl: trade.pnl,
      });
    }
  });

  return Array.from(groups.entries())
    .map(
      ([
        label,
        data,
      ]) => ({
        label,
        trades: `${data.trades} ${
          data.trades === 1
            ? "trade"
            : "trades"
        }`,
        value: data.pnl,
        positive:
          data.pnl > 0
            ? true
            : data.pnl < 0
              ? false
              : null,
      })
    )
    .sort(
      (
        a,
        b
      ) =>
        Math.abs(b.value) -
        Math.abs(a.value)
    );
};

const cards = [
  {
    title: "By Symbol",
    rows: buildRows("ticker"),
  },

  {
    title: "By Account",
    rows: buildRows("account"),
  },

  {
    title: "By Direction",
    rows: buildRows("side"),
  },

  {
    title: "By Asset Type",
    rows: buildRows("assetType"),
  },
];

  return (
    <div
      className="
        w-full
        px-1
      "
    >

      <div
        className="
          grid
          w-full
          grid-cols-1
          gap-3
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {cards.map(
          (
            card
          ) => {

            const hasMoreThanThreeRows =
              card.rows.length > 3;

            const isExpanded =
              expandedCards[card.title] === true;

            const visibleRows =
              hasMoreThanThreeRows && !isExpanded
                ? card.rows.slice(0, 3)
                : card.rows;

            return (
              <div
                key={card.title}
                className="
                  h-[86px]
                  overflow-hidden
                  rounded-[8px]
                  border
                  border-white/[0.06]
                  bg-[#0b1220]
                  px-3.5
                  py-2.5
                "
              >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className={`
                      translate-x-[10px]
                      ${
                        visibleRows.length === 1
                          ? "translate-y-[10px]"
                          : visibleRows.length === 2
                            ? "translate-y-[8px]"
                            : "translate-y-[6px]"
                      }
                      text-[12px]
                      font-semibold
                      text-slate-200
                    `}
                  >
                    {card.title}
                  </span>

                  {hasMoreThanThreeRows && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCards(
                          (
                            current
                          ) => ({
                            ...current,
                            [card.title]:
                              !isExpanded,
                          })
                        )
                      }
                      className="
                        translate-x-[-8px]
                        translate-y-[2px]
                        text-[10px]
                        font-medium
                        text-cyan-400
                        transition-colors
                        hover:text-cyan-300
                      "
                    >
                      {isExpanded
                        ? "Show Less"
                        : "View All"}
                    </button>
                  )}

                </div>

                {/* ================================================= */}
                {/* ROWS */}
                {/* ================================================= */}

                <div
                  className={`
                    mt-2
                    ${
                      visibleRows.length === 1
                        ? "translate-y-[20px]"
                        : visibleRows.length === 2
                          ? "translate-y-[16px]"
                          : "translate-y-[8px]"
                    }
                    flex
                    flex-col
                    gap-0.5
                    ${
                      hasMoreThanThreeRows &&
                      isExpanded
                        ? "h-[52px] overflow-y-auto pr-1"
                        : ""
                    }
                  `}
                >

                  {visibleRows.map(
                    (
                      row,
                      index
                    ) => (
                      <div
                        key={`${row.label}-${index}`}
                        className="
                          flex
                          min-w-0
                          items-center
                          text-[11px]
                        "
                      >

                        {/* LABEL */}

                        <span
                          className="
                            min-w-0
                            flex-1
                            translate-x-2.5
                            truncate
                            font-medium
                            text-slate-200
                          "
                        >
                          {row.label}
                        </span>

                        {/* TRADE COUNT */}

                        <span
                          className="
                            w-[68px]
                            shrink-0
                            text-left
                            text-slate-400
                          "
                        >
                          {row.trades}
                        </span>

                        {/* VALUE */}

                        <span
                          className={`
                            w-[62px]
                            shrink-0
                            translate-x-[-10px]
                            text-right
                            font-semibold
                            ${
                              row.positive ===
                              true
                                ? "text-emerald-400"
                                : row.positive ===
                                    false
                                  ? "text-red-400"
                                  : "text-slate-200"
                            }
                          `}
                        >
{row.value >= 0 ? "+" : "-"}
{CURRENCY_INFO[
  reportingCurrency as keyof typeof CURRENCY_INFO
]?.symbol ?? "$"}
{Math.abs(row.value).toFixed(2)}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}