"use client";

import { useState } from "react";

import {
  createManualExecutions,
} from "@/lib/trades/createManualExecutions";

import {
  TradeSide,
} from "@/types/trade";

import {
  saveExecutionsToSupabase,
} from "@/lib/storage/supabaseExecutionStorage";

interface AddTradeModalProps {

  open: boolean;

  onClose: () => void;
}

export default function AddTradeModal({

  open,
  onClose,

}: AddTradeModalProps) {

  // =================================================
  // FORM STATE
  // =================================================

  const [ticker, setTicker] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [entryPrice, setEntryPrice] =
    useState("");

  const [exitPrice, setExitPrice] =
    useState("");

  const [commission, setCommission] =
    useState("");

    const [side, setSide] =
  useState<TradeSide>("LONG");


  const [assetType, setAssetType] =
    useState("FUTURES");

  const [account, setAccount] =
    useState("");

const [tradeDate, setTradeDate] =
  useState(() => {

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

const [entryTime, setEntryTime] =
  useState("");

const [exitTime, setExitTime] =
  useState("");

const [currency, setCurrency] =
  useState("USD");

const [exchange, setExchange] =
  useState("");

  // =================================================
  // SAVE TRADE
  // =================================================

  const handleSaveTrade =
  async () => {

// =================================================
// VALIDATE REQUIRED FIELDS
// =================================================

const normalizedTicker =
  ticker.trim();

const normalizedAccount =
  account.trim();

const parsedQuantity =
  Number(quantity);

const parsedEntryPrice =
  Number(entryPrice);

const parsedExitPrice =
  Number(exitPrice);

if (!normalizedTicker) {

  alert(
    "Ticker is required."
  );

  return;
}

if (!normalizedAccount) {

  alert(
    "Account is required."
  );

  return;
}

if (
  !quantity ||
  !Number.isFinite(parsedQuantity) ||
  parsedQuantity <= 0
) {

  alert(
    "Quantity must be greater than 0."
  );

  return;
}

if (
  !entryPrice ||
  !Number.isFinite(parsedEntryPrice) ||
  parsedEntryPrice <= 0
) {

  alert(
    "Entry price must be greater than 0."
  );

  return;
}

if (
  !exitPrice ||
  !Number.isFinite(parsedExitPrice) ||
  parsedExitPrice <= 0
) {

  alert(
    "Exit price must be greater than 0."
  );

  return;
}

if (!tradeDate) {

  alert(
    "Trade date is required."
  );

  return;
}

if (!entryTime) {

  alert(
    "Entry time is required."
  );

  return;
}

if (!exitTime) {

  alert(
    "Exit time is required."
  );

  return;
}

if (!currency) {

  alert(
    "Currency is required."
  );

  return;
}

const executions =
  createManualExecutions({

    ticker,

    quantity:
      Number(quantity),

    entryPrice:
      Number(entryPrice),

    exitPrice:
      Number(exitPrice),

    commission:
      Number(
        commission || 0
      ),

    side,

    assetType,

    account,

    tradeDate,

    entryTime,

    exitTime,

    currency,

    exchange,
  });

await saveExecutionsToSupabase(
  executions
);

window.location.reload();
};

  if (!open) {

    return null;
  }

    return (
    <>


      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-[5px]" />

{/* ================================================= */}
{/* MODAL VIEWPORT */}
{/* ================================================= */}

<div className="fixed inset-0 z-[100] flex items-center justify-center p-6">

  <div
    className="
      grid
      h-[700px]
      max-h-[calc(100vh-48px)]
      w-full
      max-w-[1280px]
      grid-cols-1
      gap-3
      min-[1100px]:grid-cols-[minmax(0,1.8fr)_minmax(340px,0.8fr)]
    "
  >

    {/* ================================================= */}
    {/* LEFT — MANUAL ENTRY */}
    {/* ================================================= */}

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#07111d]">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <header className="flex shrink-0 items-start justify-between px-6 pb-5 pt-5 translate-x-[0px] translate-y-[-0px] min-[1100px]:translate-x-[10px] min-[1100px]:translate-y-[6px]">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-[25px] font-semibold tracking-[-0.02em] text-white">
                    Add Manual Trade
                  </h2>

                </div>

                <p className="mt-1.5 text-[14px] text-slate-400">
                  Record a trade or execution manually in your journal.
                </p>

              </div>

              <div className="flex items-center gap-3 translate-x-[-12px] translate-y-[6px]">

                <div className="rounded-[8px] bg-[#0b0c1e] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-violet-400">
                  Manual Entry
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[26px] leading-none text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                >
                  ×
                </button>

              </div>

            </header>

            {/* ================================================= */}
            {/* LEFT CONTENT */}
            {/* ================================================= */}

<div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-5">

  <div className="h-5 shrink-0" />

{/* ================================================= */}
{/* 1. TRADE TYPE */}
{/* ================================================= */}

<section className="pb-5">

  <div className="translate-x-[10px]">
    <SectionHeading
      number="1"
      title="Trade Type"
    />
  </div>

 <div className="h-2 shrink-0" />

<div className="grid w-[calc(100%-20px)] translate-x-[10px] grid-cols-3 gap-3">

    <TradeTypeCard
      selected
      accent="purple"
      title="Complete Trade"
      description="Entry and exit"
      icon="↔"
    />

    <TradeTypeCard
      accent="green"
      title="Open Position (Entry)"
      description="Entry only"
      icon="↑"
    />

    <TradeTypeCard
      accent="red"
      title="Close / Reduce (Exit)"
      description="Exit only"
      icon="↓"
    />

  </div>

</section>

{/* ================================================= */}
{/* 2. TRADE SETUP */}
{/* ================================================= */}

<section className="py-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[10px]">
    <SectionHeading
      number="2"
      title="Trade Setup"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-20px)] translate-x-[10px] grid-cols-4 gap-3">

    <Field label="Account">
      <input
        type="text"
        value={account}
        onChange={(e) =>
          setAccount(e.target.value)
        }
        placeholder="Manual Account"
        className={inputClass}
      />
    </Field>

    <Field label="Symbol">
      <div className="relative">

        <input
          type="text"
          value={ticker}
          onChange={(e) =>
            setTicker(e.target.value)
          }
          placeholder="AAPL"
          className={`${inputClass} pr-10`}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          ⌕
        </span>

      </div>
    </Field>

    <Field label="Direction">

      <div className="flex h-10 rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] p-1">

        {(
          ["LONG", "SHORT"] as TradeSide[]
        ).map((item) => (

          <button
            key={item}
            type="button"
            onClick={() => setSide(item)}
            className={`flex flex-1 items-center justify-center rounded-[6px] text-[12px] font-semibold transition ${
              side === item
                ? "bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.18)]"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {item}
          </button>

        ))}

      </div>

    </Field>

    <Field label="Asset Type">

      <select
        value={assetType}
        onChange={(e) =>
          setAssetType(e.target.value)
        }
        className={selectClass}
      >
        <option value="STOCKS">Stocks</option>
        <option value="OPTIONS">Options</option>
        <option value="FUTURES">Futures</option>
        <option value="CRYPTO">Crypto</option>
        <option value="CFD">CFD</option>
        <option value="FOREX">Forex</option>
      </select>

    </Field>

  </div>

</section>

{/* ================================================= */}
{/* 3 + 4. ENTRY / EXIT */}
{/* ================================================= */}

<div className="grid grid-cols-1 lg:grid-cols-2">

  {/* ================================================= */}
  {/* ENTRY */}
  {/* ================================================= */}

<section className="py-5 lg:pr-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[10px]">
    <SectionHeading
      number="3"
      title="Entry Details"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-20px)] translate-x-[10px] grid-cols-2 gap-3">

      <Field label="Quantity">
        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          placeholder="100"
          className={inputClass}
        />
      </Field>

      <Field label="Price">
        <input
          type="number"
          step="0.01"
          value={entryPrice}
          onChange={(e) =>
            setEntryPrice(e.target.value)
          }
          placeholder="200.00"
          className={inputClass}
        />
      </Field>

      <Field label="Date">
        <input
          type="date"
          value={tradeDate}
          onChange={(e) =>
            setTradeDate(e.target.value)
          }
          className={`${inputClass} [color-scheme:dark]`}
        />
      </Field>

      <Field label="Time">
        <input
          type="time"
          value={entryTime}
          onChange={(e) =>
            setEntryTime(e.target.value)
          }
          className={`${inputClass} [color-scheme:dark]`}
        />
      </Field>

    </div>

  </section>

{/* ================================================= */}
{/* EXIT */}
{/* ================================================= */}

<section className="py-5 lg:pl-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[10px]">
    <SectionHeading
      number="4"
      title="Exit Details"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-20px)] translate-x-[10px] grid-cols-2 gap-3">

    <Field label="Quantity">
      <input
        type="number"
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value)
        }
        placeholder="100"
        className={inputClass}
      />
    </Field>

    <Field label="Price">
      <input
        type="number"
        step="0.01"
        value={exitPrice}
        onChange={(e) =>
          setExitPrice(e.target.value)
        }
        placeholder="215.00"
        className={inputClass}
      />
    </Field>

    <Field label="Date">
      <input
        type="date"
        value={tradeDate}
        onChange={(e) =>
          setTradeDate(e.target.value)
        }
        className={`${inputClass} [color-scheme:dark]`}
      />
    </Field>

    <Field label="Time">
      <input
        type="time"
        value={exitTime}
        onChange={(e) =>
          setExitTime(e.target.value)
        }
        className={`${inputClass} [color-scheme:dark]`}
      />
    </Field>

  </div>

</section>

</div>

{/* ================================================= */}
{/* 5. TRADE DETAILS */}
{/* ================================================= */}

<section className="py-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[10px]">
    <SectionHeading
      number="5"
      title="Trade Details"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-20px)] translate-x-[10px] grid-cols-2 gap-3 xl:grid-cols-4">

    <Field label="Currency">

      <select
        value={currency}
        onChange={(e) =>
          setCurrency(e.target.value)
        }
        className={selectClass}
      >
        <option value="USD">USD</option>
        <option value="CAD">CAD</option>
        <option value="EUR">EUR</option>
        <option value="JPY">JPY</option>
        <option value="INR">INR</option>
      </select>

    </Field>

    <Field label="Exchange">

      <select
        value={exchange}
        onChange={(e) =>
          setExchange(e.target.value)
        }
        className={selectClass}
      >
        <option value="">Select</option>
        <option value="NASDAQ">NASDAQ</option>
        <option value="NYSE">NYSE</option>
        <option value="ARCA">ARCA</option>
        <option value="CBOE">CBOE</option>
        <option value="CME">CME</option>
        <option value="CBOT">CBOT</option>
        <option value="NYMEX">NYMEX</option>
        <option value="COMEX">COMEX</option>
        <option value="TSX">TSX</option>
        <option value="TSXV">TSXV</option>
        <option value="ICE">ICE</option>
        <option value="Other">Other</option>
      </select>

    </Field>

    <Field label="Commission / Fees">

      <div className="relative">

        <input
          type="number"
          step="0.01"
          value={commission}
          onChange={(e) =>
            setCommission(e.target.value)
          }
          placeholder="5.00"
          className={`${inputClass} pr-14`}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
          {currency}
        </span>

      </div>

    </Field>

    <Field label="Notes">

      <input
        type="text"
        placeholder="Optional"
        className={inputClass}
      />

    </Field>

  </div>

</section>

{/* ================================================= */}
{/* ADVANCED */}
{/* ================================================= */}

<div className="h-4 shrink-0" />

<button
  type="button"
  className="flex h-10 w-[calc(100%-20px)] translate-x-[10px] items-center justify-between rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-4 text-left transition hover:border-white/[0.12]"
>
  <span className="text-[13px] font-medium text-slate-300">
    Advanced
    <span className="ml-2 text-slate-500">
      Multiplier, Tags, Strategy, etc.
    </span>
  </span>

  <span className="text-slate-500">
    ⌄
  </span>
</button>

</div>

{/* ================================================= */}
{/* ACTIONS — FIXED BOTTOM */}
{/* ================================================= */}

<div className="shrink-0 px-5 pb-5 pt-4">

 <div className="grid w-[calc(100%-20px)] translate-x-[10px] translate-y-[-14px] grid-cols-[180px_minmax(0,1fr)] gap-3">

    <button
      type="button"
      onClick={onClose}
      className="h-11 rounded-[8px] border border-white/[0.06] bg-[#0b1220] text-[14px] font-medium text-white transition hover:border-white/[0.12] hover:bg-[#0b0c1e]"
    >
      Cancel
    </button>

    <button
      type="button"
      onClick={handleSaveTrade}
      className="flex h-11 items-center justify-center gap-3 rounded-[8px] bg-gradient-to-r from-violet-700 to-violet-600 text-[14px] font-semibold text-white shadow-[0_8px_30px_rgba(109,40,217,0.22)] transition hover:from-violet-600 hover:to-violet-500"
    >
      Review & Save Trade
      <span className="text-lg">
        →
      </span>
    </button>

  </div>

</div>

</section>

{/* ================================================= */}
{/* RIGHT — TRADE PREVIEW */}
{/* ================================================= */}

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#07111d]">

            {/* PREVIEW HEADER */}

            <div className="flex shrink-0 items-start justify-between px-6 pb-4 pt-5">

              <div>

                <h3 className="text-[19px] font-semibold text-white">
                  Trade Preview
                </h3>

                <p className="mt-1 text-[13px] text-slate-400">
                  Live summary of your trade
                </p>

              </div>

              <button
                type="button"
                aria-label="Refresh preview"
                className="text-[24px] text-slate-300 transition hover:text-white"
              >
                ↻
              </button>

            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3">

              {/* INSTRUMENT */}

              <PreviewCard>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.06] bg-[#0b0c1e] text-xl">
                      {ticker ? ticker.slice(0, 1).toUpperCase() : "•"}
                    </div>

                    <div>

                      <div className="text-[20px] font-semibold text-white">
                        {ticker || "AAPL"}
                      </div>

                      <div className="text-[13px] text-slate-400">
                        {assetType === "STOCKS"
                          ? "Stocks"
                          : assetType}
                      </div>

                    </div>

                  </div>

                  <div className="flex flex-col items-end gap-2">

                    <span className="rounded-[6px] bg-emerald-500/15 px-2.5 py-1 text-[12px] font-semibold text-emerald-400">
                      {side}
                    </span>

                    <span className="rounded-[6px] bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                      Complete Trade
                    </span>

                  </div>

                </div>

              </PreviewCard>

              {/* FINANCIAL SUMMARY */}

              <PreviewCard>

                <div className="grid grid-cols-3 divide-x divide-white/[0.06]">

                  <PreviewMetric
                    label="Net P&L"
                    value="—"
                    positive
                  />

                  <PreviewMetric
                    label="Return"
                    value="—"
                    positive
                  />

                  <PreviewMetric
                    label="Holding Time"
                    value="—"
                  />

                </div>

              </PreviewCard>

              {/* VALUES */}

              <PreviewCard>

                <div className="grid grid-cols-2 divide-x divide-white/[0.06]">

                  <div className="space-y-3 pr-4">

                    <PreviewRow
                      label="Entry Value"
                      value={
                        quantity && entryPrice
                          ? `$${(
                              Number(quantity) *
                              Number(entryPrice)
                            ).toLocaleString()}`
                          : "—"
                      }
                    />

                    <PreviewRow
                      label="Exit Value"
                      value={
                        quantity && exitPrice
                          ? `$${(
                              Number(quantity) *
                              Number(exitPrice)
                            ).toLocaleString()}`
                          : "—"
                      }
                    />

                    <PreviewRow
                      label="Fees"
                      value={
                        commission
                          ? `$${Number(commission).toFixed(2)}`
                          : "—"
                      }
                    />

                  </div>

                  <div className="space-y-3 pl-4">

                    <PreviewRow
                      label="Net P&L"
                      value="—"
                      positive
                    />

                    <PreviewRow
                      label="Return"
                      value="—"
                      positive
                    />

                  </div>

                </div>

              </PreviewCard>

              {/* POSITION IMPACT */}

              <PreviewCard>

                <div className="flex items-center justify-between">

                  <div>

                    <div className="text-[16px] font-semibold text-white">
                      Position Impact
                    </div>

                    <div className="mt-3 text-[13px] text-slate-400">
                      Shares After Trade
                    </div>

                    <div className="mt-1 text-[17px] font-medium text-white">
                      {quantity
                        ? `${quantity} Shares`
                        : "0 Shares"}
                    </div>

                    <div className="mt-1 text-[12px] text-slate-500">
                      Position impact preview
                    </div>

                  </div>

                  <div className="text-right">

                    <div className="text-[13px] text-slate-400">
                      Status
                    </div>

                    <span className="mt-3 inline-flex rounded-[6px] bg-emerald-500/15 px-2.5 py-1 text-[12px] font-semibold text-emerald-400">
                      PREVIEW
                    </span>

                  </div>

                </div>

              </PreviewCard>

              {/* TIMELINE */}

              <PreviewCard>

                <div className="text-[16px] font-semibold text-white">
                  Timeline
                </div>

                <div className="mt-4 space-y-4">

                  <TimelineRow
                    type="BUY"
                    label="Entry"
                    price={entryPrice}
                    date={tradeDate}
                    time={entryTime}
                    color="green"
                  />

                  <TimelineRow
                    type="SELL"
                    label="Exit"
                    price={exitPrice}
                    date={tradeDate}
                    time={exitTime}
                    color="red"
                  />

                </div>

              </PreviewCard>

              {/* QUICK SUMMARY */}

              <PreviewCard>

                <div className="text-[16px] font-semibold text-white">
                  Quick Summary
                </div>

                <div className="mt-4 grid grid-cols-4 divide-x divide-white/[0.06]">

                  <QuickMetric
                    label="Hold Duration"
                    value="—"
                  />

                  <QuickMetric
                    label="Avg Entry Price"
                    value={
                      entryPrice
                        ? `$${entryPrice}`
                        : "—"
                    }
                  />

                  <QuickMetric
                    label="Avg Exit Price"
                    value={
                      exitPrice
                        ? `$${exitPrice}`
                        : "—"
                    }
                  />

                  <QuickMetric
                    label="Shares Traded"
                    value={quantity || "—"}
                  />

                </div>

              </PreviewCard>

              {/* DISCLAIMER */}

              <div className="rounded-[8px] border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3">

                <div className="flex gap-3">

                  <div className="mt-0.5 text-violet-400">
                    ⓘ
                  </div>

                  <p className="text-[11px] leading-5 text-violet-300/90">
                    This preview is an estimate. Actual results may vary after saving and FIFO processing.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </>
  );
}

/* ================================================= */
/* UI HELPERS */
/* ================================================= */

const inputClass =
  "h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10";

const selectClass =
  "h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-3 text-[13px] font-medium text-white outline-none transition focus:border-blue-500/40 [color-scheme:dark]";

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span className="text-[12px] font-semibold text-slate-400">
        {number}.
      </span>

      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">
        {title}
      </h3>

    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        {label}
      </label>

      {children}

    </div>
  );
}

function TradeTypeCard({
  selected = false,
  accent,
  title,
  description,
  icon,
}: {
  selected?: boolean;
  accent: "purple" | "green" | "red";
  title: string;
  description: string;
  icon: string;
}) {
  const accentClasses = {
    purple:
      "bg-violet-500/15 text-violet-400",
    green:
      "bg-emerald-500/15 text-emerald-400",
    red:
      "bg-red-500/15 text-red-400",
  };

  return (
    <button
      type="button"
      className={`relative flex min-h-[82px] items-center gap-3 rounded-[8px] border px-4 text-left transition ${
        selected
          ? "border-violet-500/70 bg-[#0b1220] shadow-[0_0_25px_rgba(124,58,237,0.08)]"
          : "border-white/[0.06] bg-[#0b1220] hover:border-white/[0.12]"
      }`}
    >

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[20px] ${accentClasses[accent]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <div className="text-[14px] font-semibold text-white">
          {title}
        </div>

        <div className="mt-1 text-[12px] text-slate-500">
          {description}
        </div>

      </div>

      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] text-white">
          ✓
        </div>
      )}

    </button>
  );
}

function PreviewCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] p-4">
      {children}
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="px-3 text-center first:pl-0 last:pr-0">

      <div className="text-[12px] text-slate-400">
        {label}
      </div>

      <div
        className={`mt-2 text-[16px] font-semibold ${
          positive
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </div>

    </div>
  );
}

function PreviewRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <span className="text-[13px] text-slate-400">
        {label}
      </span>

      <span
        className={`text-[13px] font-medium ${
          positive
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </span>

    </div>
  );
}

function TimelineRow({
  type,
  label,
  price,
  date,
  time,
  color,
}: {
  type: "BUY" | "SELL";
  label: string;
  price: string;
  date: string;
  time: string;
  color: "green" | "red";
}) {
  return (
    <div className="flex gap-3">

      <div
        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          color === "green"
            ? "bg-emerald-500 text-black"
            : "bg-red-500 text-white"
        }`}
      >
        {type === "BUY" ? "B" : "S"}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-3">

          <span
            className={`text-[13px] font-semibold ${
              color === "green"
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {type} ({label})
          </span>

          <span className="text-[13px] font-medium text-white">
            {price ? `$${price}` : "—"}
          </span>

        </div>

        <div className="mt-1 text-[12px] text-slate-400">
          {quantityLabel(price)} {date} {time}
        </div>

      </div>

    </div>
  );
}

function quantityLabel(price: string) {
  return price ? "" : "";
}

function QuickMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-2 text-center first:pl-0 last:pr-0">

      <div className="text-[10px] text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-[12px] font-medium text-white">
        {value}
      </div>

    </div>
  );
}