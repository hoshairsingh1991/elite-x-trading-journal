"use client";

import {
  useState,
} from "react";

import {
  PanelRightOpen,
} from "lucide-react";

import { Trade } from "@/types/trade";

import {
  getCurrencySymbol,
} from "@/lib/fx/currencyFormatting";

import TradeReviewTab
  from "@/components/dashboard/daily-review/trade-review/TradeReviewTab";

interface DailyReviewTradeDrawerProps {
  trade: Trade;
  reportingCurrency: string;
  onClose: () => void;
}

// =====================================================
// HELPERS
// =====================================================

function formatNumber(
  value?: number | null,
  decimals = 2
) {
  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toFixed(
    decimals
  );
}

function formatQuantity(
  value?: number | null
) {
  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    }
  ).format(
    Math.abs(value)
  );
}

function formatTime(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

function formatDuration(
  openedAt?: string,
  closedAt?: string | null
) {
  if (
    !openedAt ||
    !closedAt
  ) {
    return "—";
  }

  const entryTime =
    new Date(
      openedAt
    ).getTime();

  const exitTime =
    new Date(
      closedAt
    ).getTime();

  if (
    Number.isNaN(entryTime) ||
    Number.isNaN(exitTime)
  ) {
    return "—";
  }

  const totalSeconds =
    Math.max(
      0,
      Math.round(
        (
          exitTime -
          entryTime
        ) / 1000
      )
    );

  const days =
    Math.floor(
      totalSeconds /
        86400
    );

  const remainingAfterDays =
    totalSeconds %
    86400;

  const hours =
    Math.floor(
      remainingAfterDays /
        3600
    );

  const minutes =
    Math.floor(
      (
        remainingAfterDays %
        3600
      ) / 60
    );

  const seconds =
    remainingAfterDays %
    60;

  if (days > 0) {
    if (hours > 0) {
      return `${days}d ${hours}h`;
    }

    return `${days}d ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function getAssetTypeLabel(
  assetType?: string
) {
  if (!assetType) {
    return "—";
  }

  return assetType
    .toLowerCase()
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function PreviewRow({
  label,
  value,
  positive = false,
  valueClassName = "",
  labelClassName = "",
}: {
  label: string;
  value: string;
  positive?: boolean;
  valueClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <span
        className={`text-[13px] text-slate-400 ${labelClassName}`}
      >
        {label}
      </span>

      <span
        className={`text-[13px] font-medium ${
          positive
            ? "text-emerald-400"
            : "text-white"
        } ${valueClassName}`}
      >
        {value}
      </span>

    </div>
  );
}

// =====================================================
// DRAWER
// =====================================================

export default function DailyReviewTradeDrawer({
  trade,
  reportingCurrency,
  onClose,
}: DailyReviewTradeDrawerProps) {

  const currencySymbol =
    getCurrencySymbol(
      reportingCurrency
    );

  const [activeTab, setActiveTab] =
    useState<
      "OVERVIEW" |
      "REVIEW" |
      "EXECUTIONS" |
      "NOTES"
    >(
      "OVERVIEW"
    );

const assetType =
  trade.assetType?.toUpperCase() ?? "";

const ticker =
  trade.ticker ?? "";

const previewQuantityUnitMap: Record<string, string> = {
  STOCKS: "Share",
  OPTIONS: "Contract",
  FUTURES: "Contract",
};

const previewUsesTickerUnit =
  assetType === "CRYPTO" ||
  assetType === "FOREX" ||
  assetType === "CFD";

const previewQuantityUnit =
  previewUsesTickerUnit
    ? ticker.trim().toUpperCase() || "Unit"
    : previewQuantityUnitMap[
        assetType
      ] ?? "Unit";

const pnl =
  Number(
    trade.pnl || 0
  );

const calculatedPnlPercent =
  trade.entryPrice != null &&
  trade.exitPrice != null &&
  Number(
    trade.entryPrice
  ) !== 0
    ? trade.side === "SHORT"
      ? (
          (
            Number(
              trade.entryPrice
            ) -
            Number(
              trade.exitPrice
            )
          ) /
          Number(
            trade.entryPrice
          )
        ) * 100
      : (
          (
            Number(
              trade.exitPrice
            ) -
            Number(
              trade.entryPrice
            )
          ) /
          Number(
            trade.entryPrice
          )
        ) * 100
    : null;

const pnlPercent =
  trade.pnlPercent != null &&
  Number.isFinite(
    Number(
      trade.pnlPercent
    )
  )
    ? Number(
        trade.pnlPercent
      )
    : calculatedPnlPercent;

  /*
   * Buy / Sell commissions are derived directly from
   * canonical executions.
   */
  const buyCommission =
    trade.executions
      ?.filter(
        (
          execution
        ) =>
          execution.action ===
          "BUY"
      )
      .reduce(
        (
          total,
          execution
        ) =>
          total +
          Number(
            execution.fees || 0
          ),
        0
      ) ??
    0;

  const sellCommission =
    trade.executions
      ?.filter(
        (
          execution
        ) =>
          execution.action ===
          "SELL"
      )
      .reduce(
        (
          total,
          execution
        ) =>
          total +
          Number(
            execution.fees || 0
          ),
        0
      ) ??
    0;

  const totalCommission =
    buyCommission +
    sellCommission;

  const grossPnL =
    pnl +
    totalCommission;

  const isPositive =
    pnl >= 0;

  const isNegative =
    pnl < 0;

  return (
<aside
  className="
    flex
    h-full
    min-h-0
    w-[340px]
    shrink-0
    flex-col
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#07111d]
  "
>
      {/* ================================================= */}
      {/* DRAWER HEADER */}
      {/* Same structural settings as Add Trade Preview */}
      {/* ================================================= */}

      <div
        className="
          flex
          shrink-0
          items-start
          justify-between
          px-5
          pb-4
          pt-5
          translate-x-[0px]
          translate-y-[-0px]
          min-[1100px]:translate-x-[14px]
          min-[1100px]:translate-y-[6px]
        "
      >

        <div>

          <h3
            className="
              text-[19px]
              font-semibold
              tracking-[-0.01em]
              text-white
            "
          >
            Trade Review
          </h3>

          <p
            className="
              mt-1
              text-[13px]
              text-slate-400
            "
          >
            Trade overview
          </p>

        </div>

<button
  type="button"
  onClick={onClose}
  aria-label="Collapse trade review"
  title="Collapse trade review"
  className="
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-[8px]
    text-slate-400
    transition
    hover:bg-white/[0.04]
    hover:text-white
    translate-y-[4px]
    translate-x-[-20px]
  "
>
<PanelRightOpen
  size={18}
  strokeWidth={1.8}
/>
</button>

      </div>

      <div className="h-3 shrink-0" />

      {/* ================================================= */}
      {/* TRADE TABS */}
      {/* ================================================= */}

      <div
  className="
    relative
    z-30
    grid
    h-[30px]
    w-[calc(100%-30px)]
    shrink-0
    translate-x-[14px]
    grid-cols-4
    overflow-visible
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#07111d]
  "
>

        {/* OVERVIEW */}

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "OVERVIEW"
            )
          }
className={`
  relative
  flex
  h-[30px]
  items-center
  justify-center
  text-[11px]
  font-medium
  transition
  ${
   activeTab ===
"OVERVIEW"
  ? "mx-[2px] mt-[2px] mb-0 h-[28px] rounded-[6px] border border-violet-500/30 bg-[#151b2d] text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.55),0_0_12px_rgba(139,92,246,0.12)]"
      : "text-slate-400 hover:bg-white/[0.025] hover:text-slate-200"
  }
`}
        >
          Overview

{activeTab === "OVERVIEW" && null}
        </button>

        {/* REVIEW */}

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "REVIEW"
            )
          }
          className={`
            relative
            flex
            h-[30px]
            items-center
            justify-center
            text-[11px]
            font-medium
            transition
            ${
              activeTab ===
              "REVIEW"
                ? "mx-[2px] my-[2px] h-[26px] rounded-[6px] border border-violet-500/30 bg-[#151b2d] text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.55),0_0_12px_rgba(139,92,246,0.12)]"
                : "text-slate-400 hover:bg-white/[0.025] hover:text-slate-200"
            }
          `}
        >
          Review
        </button>

        {/* EXECUTIONS */}

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "EXECUTIONS"
            )
          }
          className={`
            relative
            flex
            h-[30px]
            items-center
            justify-center
            text-[11px]
            font-medium
            transition
            ${
              activeTab ===
              "EXECUTIONS"
                ? "mx-[2px] my-[2px] h-[26px] rounded-[6px] border border-violet-500/30 bg-[#151b2d] text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.55),0_0_12px_rgba(139,92,246,0.12)]"
                : "text-slate-400 hover:bg-white/[0.025] hover:text-slate-200"
            }
          `}
        >
          Executions (
          {trade.executions?.length ??
            0}
          )
        </button>

        {/* NOTES */}

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "NOTES"
            )
          }
          className={`
            relative
            flex
            h-[30px]
            items-center
            justify-center
            text-[11px]
            font-medium
            transition
            ${
              activeTab ===
              "NOTES"
                ? "mx-[2px] my-[2px] h-[26px] rounded-[6px] border border-violet-500/30 bg-[#151b2d] text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.55),0_0_12px_rgba(139,92,246,0.12)]"
                : "text-slate-400 hover:bg-white/[0.025] hover:text-slate-200"
            }
          `}
        >
          Notes
        </button>

      </div>

      {/* ================================================= */}
      {/* DRAWER CONTENT */}
      {/* Exact Add Trade Preview geometry */}
      {/* ================================================= */}

<div
  className="
    min-h-0
    flex-1
    overflow-y-auto
    overflow-x-hidden
  "
>

<div className="h-4 shrink-0" />

{activeTab === "REVIEW" ? (
  <div className="flex justify-center">

    <div
      className="
        w-[98%]
      "
    >
      <TradeReviewTab
        trade={trade}
      />
    </div>

  </div>
) : (
  <div
    className="
      flex
      w-[calc(100%-30px)]
      translate-x-[14px]
      flex-col
      gap-3
    "
  >

          {/* ================================================= */}
          {/* INSTRUMENT */}
          {/* ================================================= */}

<section
  className="
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    px-4
    py-4
  "
>

<div
  className="
    flex
    h-[70px]
    items-center
    justify-between
    gap-4
  "
>

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-[50px]
                    w-[50px]
                    shrink-0
                    translate-x-[6px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-[#0b1220]
                    text-[22px]
                    font-semibold
                    text-white
                  "
                >
                  {trade.ticker
                    ? trade.ticker
                        .slice(
                          0,
                          1
                        )
                        .toUpperCase()
                    : "•"}
                </div>

                <div
                  className="
                    min-w-0
                    translate-x-[10px]
                  "
                >

                  <div
                    className="
                      text-[24px]
                      font-semibold
                      tracking-[-0.02em]
                      text-white
                    "
                  >
                    {trade.ticker ||
                      "—"}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[14px]
                      text-slate-400
                    "
                  >
                    {getAssetTypeLabel(
                      trade.assetType
                    )}
                  </div>

                </div>

              </div>

              <div
                className="
                  flex
                  shrink-0
                  translate-x-[-10px]
                  flex-col
                  items-end
                  gap-2
                "
              >

                <span
                  className={`
                    flex
                    h-6
                    w-[50px]
                    items-center
                    justify-center
                    rounded-[6px]
                    text-[12px]
                    font-semibold
                    ${
                      trade.status ===
                      "WIN"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : trade.status ===
                            "LOSS"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-white/[0.04] text-slate-300"
                    }
                  `}
                >
                  {trade.status}
                </span>

                <span
                  className="
                    flex
                    h-6
                    w-[110px]
                    items-center
                    justify-center
                    rounded-[6px]
                    bg-white/[0.04]
                    text-[11px]
                    text-slate-300
                  "
                >
                  {trade.side}
                </span>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* FINANCIAL SUMMARY */}
          {/* ================================================= */}

          <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

            <div className="flex h-[70px] items-center">

              <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-3 divide-x divide-white/[0.06]">

                {/* NET P&L */}

                <div className="px-3 text-center first:pl-0 last:pr-0">

                  <div className="text-[12px] text-slate-400">
                    Net P&L
                  </div>

                  <div
                    className={`mt-2 text-[16px] font-semibold ${
                      isPositive
                        ? "text-emerald-400"
                        : isNegative
                          ? "text-red-400"
                          : "text-white"
                    }`}
                  >
                    {isPositive
                      ? "+"
                      : ""}
                    {currencySymbol}
                    {Math.abs(
                      pnl
                    ).toFixed(
                      2
                    )}
                  </div>

                </div>

                {/* RETURN */}

                <div className="px-3 text-center first:pl-0 last:pr-0">

                  <div className="text-[12px] text-slate-400">
                    Return
                  </div>

                  <div
                    className={`mt-2 text-[16px] font-semibold ${
                      pnlPercent !=
                        null &&
                      pnlPercent > 0
                        ? "text-emerald-400"
                        : pnlPercent !=
                              null &&
                            pnlPercent < 0
                          ? "text-red-400"
                          : "text-white"
                    }`}
                  >
                    {pnlPercent !=
                    null
                      ? `${
                          pnlPercent >
                          0
                            ? "+"
                            : ""
                        }${pnlPercent.toFixed(
                          2
                        )}%`
                      : "—"}
                  </div>

                </div>

                {/* HOLDING TIME */}

                <div className="px-3 text-center first:pl-0 last:pr-0">

                  <div className="text-[12px] text-slate-400">
                    Holding Time
                  </div>

                  <div className="mt-2 text-[16px] font-semibold text-white">
                    {formatDuration(
                      trade.openedAt,
                      trade.closedAt
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* VALUES */}
          {/* ================================================= */}

          <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

            <div className="flex h-[80px] items-center">

              <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 divide-x divide-white/[0.06]">

                {/* LEFT — VALUES */}

                <div className="pr-4">

                  <PreviewRow
                    label="Entry Value"
                    value={`${currencySymbol}${(
                      Number(
                        trade.entryPrice ||
                        0
                      ) *
                      Math.abs(
                        Number(
                          trade.quantity ||
                          0
                        )
                      )
                    ).toFixed(2)}`}
                    valueClassName="translate-x-[-10px]"
                  />

                  <div className="translate-y-[4px]">

                    <PreviewRow
                      label="Exit Value"
                      value={
                        trade.exitPrice !=
                        null
                          ? `${currencySymbol}${(
                              Number(
                                trade.exitPrice
                              ) *
                              Math.abs(
                                Number(
                                  trade.quantity ||
                                  0
                                )
                              )
                            ).toFixed(2)}`
                          : "—"
                      }
                      valueClassName="translate-x-[-10px]"
                    />

                  </div>

                  <div className="translate-y-[6px]">

                    <PreviewRow
                      label="Fees"
                      value={`${currencySymbol}${totalCommission.toFixed(2)}`}
                      valueClassName="translate-x-[-10px]"
                    />

                  </div>

                </div>

                {/* RIGHT — PERFORMANCE */}

                <div className="pl-4">

                  <PreviewRow
                    label="Gross P&L"
                    value={`${
                      grossPnL > 0
                        ? "+"
                        : ""
                    }${currencySymbol}${Math.abs(
                      grossPnL
                    ).toFixed(2)}`}
                    positive={grossPnL > 0}
                    valueClassName=""
                    labelClassName="translate-x-[10px]"
                  />

                  <div className="translate-y-[4px]">

                    <PreviewRow
                      label="Return"
                      value={
                        pnlPercent !=
                        null
                          ? `${
                              pnlPercent >
                              0
                                ? "+"
                                : ""
                            }${pnlPercent.toFixed(2)}%`
                          : "—"
                      }
                      positive={
                        pnlPercent !=
                          null &&
                        pnlPercent > 0
                      }
                      labelClassName="translate-x-[10px]"
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* POSITION IMPACT */}
          {/* ================================================= */}

          <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

            <div className="relative h-[110px] w-[calc(100%-30px)] translate-x-[14px]">

              <div className="absolute inset-0 flex w-full flex-col justify-center">

                <div
                  className="
                    translate-y-[-4px]
                    text-[16px]
                    font-semibold
                    text-white
                  "
                >
                  Position Impact
                </div>

                {trade.status === "OPEN" ? (
                  <>
                    <div className="translate-y-[2px]">

                      <div className="text-[18px] font-medium text-white">
{formatQuantity(
  trade.quantity
)}{" "}
{previewQuantityUnit}
{!previewUsesTickerUnit &&
Math.abs(
  Number(
    trade.quantity ||
    0
  )
) !== 1
  ? "s"
  : ""}{" "}
Open
                      </div>

                      <div className="mt-2 text-[13px] text-slate-400">
                        $
                        {formatNumber(
                          trade.entryPrice
                        )}
                      </div>

                      <div className="mt-2 text-[12px] text-slate-500">
                        Position remains open
                      </div>

                    </div>
                  </>
                ) : (
                  <>
                    <div className="translate-y-[1px]">

                      <div className="text-[18px] font-medium text-white">
{formatQuantity(
  trade.quantity
)}{" "}
{previewQuantityUnit}
{!previewUsesTickerUnit &&
Math.abs(
  Number(
    trade.quantity ||
    0
  )
) !== 1
  ? "s"
  : ""}{" "}
Closed
                      </div>

                      <div className="mt-2 text-[13px] text-slate-400">
                        $
                        {formatNumber(
                          trade.entryPrice
                        )}{" "}
                        →{" "}
                        {trade.exitPrice !=
                        null
                          ? `$${formatNumber(
                              trade.exitPrice
                            )}`
                          : "—"}
                      </div>

                      <div className="mt-2 text-[12px] text-slate-500">
                        Fully Closed
                      </div>

                    </div>
                  </>
                )}

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* TIMELINE */}
          {/* ================================================= */}

          <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

            <div className="w-[calc(100%-30px)] translate-x-[14px]">

              {/* TITLE */}

              <div className="translate-y-[8px] text-[16px] font-semibold text-white">
                Timeline
              </div>

              {/* TIMELINE BODY */}

              <div className="relative mt-4 translate-y-[18px]">

                {/* VERTICAL LINE */}

                {trade.openedAt &&
                  trade.closedAt && (
                    <div className="absolute left-[13px] top-[14px] bottom-[50px] w-px bg-white/[0.10]" />
                  )}

                {/* ENTRY */}

                <div className="relative mt-[15px] flex min-h-[100px]">

                  {/* MARKER */}

                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[12px] font-semibold text-[#07111d]">
                    E
                  </div>

                  {/* DETAILS */}

                  <div className="ml-3 min-w-0 flex-1 translate-y-[-2px] translate-x-[10px]">

                    <div className="text-[14px] font-semibold text-emerald-400">
                      {trade.side ===
                      "LONG"
                        ? "BUY (Entry)"
                        : "SELL (Entry)"}
                    </div>

                    <div className="mt-2 text-[14px] font-medium text-white">
{formatQuantity(
  trade.quantity
)}{" "}
{previewQuantityUnit}
{!previewUsesTickerUnit &&
Math.abs(
  Number(
    trade.quantity ||
    0
  )
) !== 1
  ? "s"
  : ""}{" "}
@ $
                      {formatNumber(
                        trade.entryPrice
                      )}
                    </div>

                    <div className="mt-1 text-[13px] text-slate-400">
                      {trade.date ||
                        "—"}
                      {trade.openedAt
                        ? ` • ${formatTime(
                            trade.openedAt
                          )}`
                        : ""}
                    </div>

                  </div>

                  {/* RIGHT — VALUE */}

                  <div className="shrink-0 pl-3 text-right">

                    <div className="text-[14px] font-medium text-white">
                      {currencySymbol}
                      {(
                        Number(
                          trade.entryPrice ||
                          0
                        ) *
                        Math.abs(
                          Number(
                            trade.quantity ||
                            0
                          )
                        )
                      ).toFixed(2)}
                    </div>

                    <div className="mt-2 text-[12px] text-slate-400">
                      Fee:{" "}
                      {currencySymbol}
                      {buyCommission.toFixed(
                        2
                      )}
                    </div>

                  </div>

                </div>

                {/* EXIT */}

                {trade.closedAt && (
                  <div className="relative mt-5 flex min-h-[68px] translate-y-[-10px]">

                    {/* MARKER */}

                    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-[12px] font-semibold text-white">
                      X
                    </div>

                    {/* DETAILS */}

                    <div className="ml-3 min-w-0 flex-1 translate-y-[-6px] translate-x-[10px]">

                      <div className="text-[14px] font-semibold text-red-400">
                        {trade.side ===
                        "LONG"
                          ? "SELL (Exit)"
                          : "BUY (Exit)"}
                      </div>

                      <div className="mt-2 text-[14px] font-medium text-white">
{formatQuantity(
  trade.quantity
)}{" "}
{previewQuantityUnit}
{!previewUsesTickerUnit &&
Math.abs(
  Number(
    trade.quantity ||
    0
  )
) !== 1
  ? "s"
  : ""}{" "}
{trade.exitPrice !=
null
  ? ` @ $${formatNumber(
      trade.exitPrice
    )}`
  : ""}
                      </div>

                      <div className="mt-1 text-[13px] text-slate-400">
                        {trade.date ||
                          "—"}
                        {trade.closedAt
                          ? ` • ${formatTime(
                              trade.closedAt
                            )}`
                          : ""}
                      </div>

                    </div>

                    {/* RIGHT — VALUE */}

                    <div className="shrink-0 pl-3 text-right">

                      <div className="text-[14px] font-medium text-white">
                        {trade.exitPrice !=
                        null
                          ? `${currencySymbol}${(
                              Number(
                                trade.exitPrice
                              ) *
                              Math.abs(
                                Number(
                                  trade.quantity ||
                                  0
                                )
                              )
                            ).toFixed(
                              2
                            )}`
                          : "—"}
                      </div>

                      <div className="mt-2 text-[12px] text-slate-400">
                        Fee:{" "}
                        {currencySymbol}
                        {sellCommission.toFixed(
                          2
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

    </div>
  )}

</div>

{/* ================================================= */}
{/* DRAWER BOTTOM FOOTER / FIXED GAP */}
{/* Matches Daily Review bottom spacing */}
{/* ================================================= */}

<div
  className="
    h-[0px]
    shrink-0
  "
/>

</aside>
  );
}