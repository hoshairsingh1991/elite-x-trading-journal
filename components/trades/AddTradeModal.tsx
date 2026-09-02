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

  const [tradeType, setTradeType] =
  useState<"COMPLETE" | "OPEN" | "CLOSE">("COMPLETE");

 const [assetType, setAssetType] =
  useState("STOCKS");

  const [account, setAccount] =
    useState("");

const getTodayDate = () => {
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
};

const [entryDate, setEntryDate] =
  useState(() => getTodayDate());

const [exitDate, setExitDate] =
  useState(() => getTodayDate());

const [entryTime, setEntryTime] =
  useState("");

const [exitTime, setExitTime] =
  useState("");

const [currency, setCurrency] =
  useState("USD");

  const [exchange, setExchange] =
    useState("");

// =================================================
// RESET FORM
// =================================================

const handleReset = () => {
  setTicker("");
  setQuantity("");
  setEntryPrice("");
  setExitPrice("");
  setCommission("");

  setSide("LONG");
  setTradeType("COMPLETE");
  setAssetType("STOCKS");

  setAccount("");

  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  const todayDate =
    `${year}-${month}-${day}`;

  setEntryDate(todayDate);
  setExitDate(todayDate);

  setEntryTime("");
  setExitTime("");

  setCurrency("USD");
  setExchange("");
};

  // =================================================
  // LIVE TRADE PREVIEW CALCULATIONS
  // =================================================

  const parsedPreviewQuantity = Number(quantity);
  const parsedPreviewEntryPrice = Number(entryPrice);
  const parsedPreviewExitPrice = Number(exitPrice);
  const parsedPreviewCommission = Number(commission || 0);

  const previewQuantity =
    Number.isFinite(parsedPreviewQuantity) &&
    parsedPreviewQuantity > 0
      ? parsedPreviewQuantity
      : 0;

  const previewEntryPrice =
    Number.isFinite(parsedPreviewEntryPrice) &&
    parsedPreviewEntryPrice > 0
      ? parsedPreviewEntryPrice
      : 0;

  const previewExitPrice =
    Number.isFinite(parsedPreviewExitPrice) &&
    parsedPreviewExitPrice > 0
      ? parsedPreviewExitPrice
      : 0;

  const previewCommission =
    Number.isFinite(parsedPreviewCommission) &&
    parsedPreviewCommission >= 0
      ? parsedPreviewCommission
      : 0;

  const previewMultiplier =
    assetType === "OPTIONS"
      ? 100
      : 1;

const previewQuantityUnitMap: Record<string, string> = {
  STOCKS: "Share",
  OPTIONS: "Contract",
  FUTURES: "Contract",
};

const previewQuantityUnit =
  assetType === "CRYPTO" ||
  assetType === "FOREX" ||
  assetType === "CFD"
    ? ticker.trim().toUpperCase() || "Unit"
    : previewQuantityUnitMap[assetType] ?? "Unit";

  const previewEntryValue =
    previewQuantity *
    previewEntryPrice *
    previewMultiplier;

  const previewExitValue =
    previewQuantity *
    previewExitPrice *
    previewMultiplier;

  const previewGrossPnL =
    side === "LONG"
      ? previewExitValue - previewEntryValue
      : previewEntryValue - previewExitValue;

  const previewNetPnL =
    previewGrossPnL -
    previewCommission;

  const previewReturn =
    previewEntryValue > 0
      ? (previewNetPnL / previewEntryValue) * 100
      : 0;

const previewHoldingTime = (() => {
  if (!entryDate || !exitDate || !entryTime || !exitTime) {
    return "—";
  }

  const entryDateTime = new Date(
    `${entryDate}T${entryTime}`
  );

  const exitDateTime = new Date(
    `${exitDate}T${exitTime}`
  );

    if (
      !Number.isFinite(entryDateTime.getTime()) ||
      !Number.isFinite(exitDateTime.getTime()) ||
      exitDateTime.getTime() < entryDateTime.getTime()
    ) {
      return "—";
    }

    const durationMinutes =
      Math.floor(
        (exitDateTime.getTime() -
          entryDateTime.getTime()) /
          60000
      );

    const hours =
      Math.floor(durationMinutes / 60);

    const minutes =
      durationMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  })();

const previewSharesAfterTrade =
  tradeType === "COMPLETE"
    ? 0
    : previewQuantity;

const previewPositionImpact =
  tradeType === "COMPLETE"
    ? "Flat"
    : tradeType === "OPEN"
      ? side === "LONG"
        ? "Long"
        : "Short"
      : "Reduced";

  const previewHasValues =
    previewQuantity > 0 &&
    previewEntryPrice > 0 &&
    previewExitPrice > 0;

  const formatPreviewCurrency = (
    value: number
  ) => {

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);

  };

  const formatPreviewPnL = (
    value: number
  ) => {

    const formatted =
      formatPreviewCurrency(
        Math.abs(value)
      );

    if (value > 0) {
      return `+${formatted}`;
    }

    if (value < 0) {
      return `-${formatted}`;
    }

    return formatted;
  };

  const formatPreviewReturn = (
    value: number
  ) => {

    if (value > 0) {
      return `+${value.toFixed(2)}%`;
    }

    if (value < 0) {
      return `${value.toFixed(2)}%`;
    }

    return "0.00%";
  };

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

if (!entryDate) {

  alert(
    "Entry date is required."
  );

  return;
}

if (!exitDate) {

  alert(
    "Exit date is required."
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

entryDate,

exitDate,

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
      h-[710px]
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

            <header className="flex shrink-0 items-start justify-between px-6 pb-5 pt-5 translate-x-[0px] translate-y-[-0px] min-[1100px]:translate-x-[14px] min-[1100px]:translate-y-[6px]">

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

<div className="flex items-center gap-0 translate-x-[-30px] translate-y-[6px]">

{/* MANUAL ENTRY */}

<div className="flex h-[32px] w-[112px] items-center justify-center rounded-[8px] border border-violet-500/20 bg-violet-500/[0.08] text-[11px] font-semibold uppercase tracking-[0.08em] text-violet-400">
  Manual Entry
</div>



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

  <div className="translate-x-[14px]">
    <SectionHeading
      number="1"
      title="Trade Type"
    />
  </div>

 <div className="h-2 shrink-0" />

<div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-3 gap-3">

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

  <div className="translate-x-[14px]">
    <SectionHeading
      number="2"
      title="Trade Setup"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-4 gap-3">

   <Field label="Account" required>
<input
  type="text"
  value={account}
  onChange={(e) =>
    setAccount(e.target.value)
  }
  placeholder="Account"
  className={inputClass}
  style={{ paddingLeft: "16px" }}
/>
    </Field>

<Field label="Symbol">
  <div className="relative">

<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="11"
      cy="11"
      r="6.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 16L21 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</span>

<input
  type="text"
  value={ticker}
  onChange={(e) =>
    setTicker(e.target.value)
  }
  placeholder="AAPL"
  className={inputClass}
  style={{ paddingLeft: "40px" }}
/>

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

  <div className="relative">

    <select
      value={assetType}
      onChange={(e) =>
        setAssetType(e.target.value)
      }
      className={`${selectClass} appearance-none`}
      style={{
        paddingLeft: "16px",
      }}
    >
      <option value="STOCKS">Stocks</option>
      <option value="OPTIONS">Options</option>
      <option value="FUTURES">Futures</option>
      <option value="CRYPTO">Crypto</option>
      <option value="CFD">CFD</option>
      <option value="FOREX">Forex</option>
    </select>

    <span className="pointer-events-none absolute right-[10px] top-4 -translate-y-1/2 text-slate-400">
      ⌄
    </span>

  </div>

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

  <div className="translate-x-[14px]">
    <SectionHeading
      number="3"
      title="Entry Details"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 gap-3">

      <Field label="Quantity" required>
<input
  type="number"
  value={quantity}
  onChange={(e) =>
    setQuantity(e.target.value)
  }
  placeholder="100"
  className={inputClass}
  style={{ paddingLeft: "16px" }}
/>
      </Field>

      <Field label="Price" required>
        <input
          type="number"
          step="0.01"
          value={entryPrice}
          onChange={(e) =>
            setEntryPrice(e.target.value)
          }
          placeholder="200.00"
          className={inputClass}
          style={{ paddingLeft: "16px" }}
        />
      </Field>

<Field label="Date" required>

  <div className="relative">

<input
  type="date"
  value={entryDate}
  onChange={(e) =>
    setEntryDate(e.target.value)
  }
  className={`${inputClass} [color-scheme:dark] pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0`}
  style={{ paddingLeft: "16px" }}
/>

    <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-slate-400">

      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path
          d="M16 3V7M8 3V7M3 10H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

    </span>

  </div>

</Field>

<Field label="Time" required>

  <div className="relative">

    <input
      type="time"
      value={entryTime}
      onChange={(e) =>
        setEntryTime(e.target.value)
      }
      className={`${inputClass} [color-scheme:dark] pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0`}
      style={{ paddingLeft: "16px" }}
    />

    <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-slate-400">

      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path
          d="M12 7V12L15.5 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

    </span>

  </div>

</Field>

    </div>

  </section>

{/* ================================================= */}
{/* EXIT */}
{/* ================================================= */}

<section className="py-5 lg:pl-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[14px]">
    <SectionHeading
      number="4"
      title="Exit Details"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 gap-3">

    <Field label="Quantity" required>
      <input
        type="number"
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value)
        }
        placeholder="100"
        className={inputClass}
        style={{ paddingLeft: "16px" }}
      />
    </Field>

    <Field label="Price" required>
      <input
        type="number"
        step="0.01"
        value={exitPrice}
        onChange={(e) =>
          setExitPrice(e.target.value)
        }
        placeholder="215.00"
        className={inputClass}
        style={{ paddingLeft: "16px" }}
      />
    </Field>

<Field label="Date" required>

  <div className="relative">

<input
  type="date"
  value={exitDate}
  onChange={(e) =>
    setExitDate(e.target.value)
  }
  className={`${inputClass} [color-scheme:dark] pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0`}
  style={{ paddingLeft: "16px" }}
/>

    <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-slate-400">

      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path
          d="M16 3V7M8 3V7M3 10H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

    </span>

  </div>

</Field>

<Field label="Time" required>

  <div className="relative">

    <input
      type="time"
      value={exitTime}
      onChange={(e) =>
        setExitTime(e.target.value)
      }
      className={`${inputClass} [color-scheme:dark] pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0`}
      style={{ paddingLeft: "16px" }}
    />

    <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-slate-400">

      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path
          d="M12 7V12L15.5 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>

    </span>

  </div>

</Field>

  </div>

</section>

</div>

{/* ================================================= */}
{/* 5. TRADE DETAILS */}
{/* ================================================= */}

<section className="py-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[14px]">
    <SectionHeading
      number="5"
      title="Trade Details"
    />
  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 gap-3 xl:grid-cols-4">

    <Field label="Currency" required>

      <select
        value={currency}
        onChange={(e) =>
          setCurrency(e.target.value)
        }
        className={selectClass}
        style={{ paddingLeft: "16px" }}
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
        style={{ paddingLeft: "16px" }}
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
          style={{ paddingLeft: "16px" }}
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
        style={{ paddingLeft: "16px" }}
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
  className="flex h-10 w-[calc(100%-30px)] translate-x-[14px] items-center justify-between rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-4 text-left transition hover:border-white/[0.12]"
  style={{ paddingLeft: "16px" }}
>
  <span className="text-[13px] font-medium text-slate-300">
    Advanced
    <span
      className="text-slate-500"
      style={{ marginLeft: "8px" }}
    >
      Multiplier, Tags, Strategy, etc.
    </span>
  </span>

<span className="translate-x-[-6px] translate-y-[-4px] text-slate-500">
  ⌄
</span>
</button>

</div>

{/* ================================================= */}
{/* ACTIONS — FIXED BOTTOM */}
{/* ================================================= */}

<div className="shrink-0 px-5 pb-5 pt-4">

 <div className="grid w-[calc(100%-30px)] translate-x-[14px] translate-y-[-10px] grid-cols-[180px_minmax(0,1fr)] gap-3">

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

<div className="flex shrink-0 items-start justify-between px-5 pb-4 pt-5 translate-x-[0px] translate-y-[-0px] min-[1100px]:translate-x-[14px] min-[1100px]:translate-y-[6px]">

  <div>
    <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-white">
      Trade Preview
    </h3>

    <p className="mt-1 text-[13px] text-slate-400">
      Live summary of your trade
    </p>
  </div>

  {/* RESET + CLOSE */}

  <div className="flex items-center gap-1 translate-x-[-20px]">

    {/* RESET */}

    <button
      type="button"
      onClick={handleReset}
      className="flex h-[32px] w-[60px] items-center justify-center rounded-[8px] border border-red-500/20 bg-red-500/[0.08] text-[11px] font-medium text-red-400 transition hover:border-red-500/30 hover:bg-red-500/[0.12] hover:text-red-300"
    >
      Reset
    </button>

    {/* CLOSE */}

    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[26px] leading-none text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
    >
      ×
    </button>

  </div>

</div>

{/* PREVIEW CONTENT */}

<div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-5">

  <div className="h-4 shrink-0" />

  <div className="space-y-3 w-[calc(100%-30px)] translate-x-[14px]">

   


{/* ================================================= */}
{/* INSTRUMENT */}
{/* ================================================= */}

<PreviewCard>

  <div className="flex h-[70px] items-center justify-between gap-4">

    <div className="flex min-w-0 items-center gap-4">

      <div className="flex h-[50px] w-[50px] shrink-0 translate-x-[6px] translate-y-[0px] items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0c1e] text-[22px] font-semibold text-white">
        {ticker
          ? ticker.slice(0, 1).toUpperCase()
          : "•"}
      </div>

      <div className="min-w-0 translate-x-[10px]">

<div className="text-[24px] font-semibold tracking-[-0.02em] text-white">
  {ticker || "—"}
</div>

        <div className="mt-1 text-[14px] text-slate-400">
          {assetType === "STOCKS"
            ? "Stocks"
            : assetType}
        </div>

      </div>

    </div>

    <div className="flex shrink-0 translate-x-[-10px] translate-y-[0px] flex-col items-end gap-2">

      <span className="flex h-6 w-[50px] items-center justify-center rounded-[6px] bg-emerald-500/15 text-[12px] font-semibold text-emerald-400">
        {side}
      </span>

      <span className="flex h-6 w-[100px] items-center justify-center rounded-[6px] bg-white/[0.04] text-[11px] text-slate-300">
        Complete Trade
      </span>

    </div>

  </div>

</PreviewCard>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* FINANCIAL SUMMARY */}
{/* ================================================= */}

<PreviewCard>

  <div className="flex h-[70px] items-center">

    <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-3 divide-x divide-white/[0.06]">

      <PreviewMetric
        label="Net P&L"
        value={formatPreviewPnL(previewNetPnL)}
        positive={previewNetPnL > 0}
      />

      <PreviewMetric
        label="Return"
        value={formatPreviewReturn(previewReturn)}
        positive={previewReturn > 0}
      />

      <PreviewMetric
        label="Holding Time"
        value={previewHoldingTime}
      />

    </div>

  </div>

</PreviewCard>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* VALUES */}
{/* ================================================= */}

<PreviewCard>

  <div className="flex h-[80px] items-center">

    <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 divide-x divide-white/[0.06]">

      {/* LEFT — VALUES */}

      <div className="pr-4">

<PreviewRow
  label="Entry Value"
  value={formatPreviewCurrency(previewEntryValue)}
  valueClassName="translate-x-[-10px]"
/>

        <div className="translate-y-[4px]">
<PreviewRow
  label="Exit Value"
  value={formatPreviewCurrency(previewExitValue)}
  valueClassName="translate-x-[-10px]"
/>
        </div>

        <div className="translate-y-[6px]">
<PreviewRow
  label="Fees"
  value={formatPreviewCurrency(previewCommission)}
  valueClassName="translate-x-[-10px]"
/>
        </div>

      </div>


{/* RIGHT — PERFORMANCE */}

<div className="pl-4">

  <PreviewRow
    label="Net P&L"
    value={formatPreviewPnL(previewNetPnL)}
    positive={previewNetPnL > 0}
    labelClassName="translate-x-[10px]"
  />

  <div className="translate-y-[4px]">
    <PreviewRow
      label="Return"
      value={formatPreviewReturn(previewReturn)}
      positive={previewReturn > 0}
      labelClassName="translate-x-[10px]"
    />
  </div>

</div>

    </div>

  </div>

</PreviewCard>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* POSITION IMPACT */}
{/* ================================================= */}

<PreviewCard>

  <div className="relative h-[110px] w-[calc(100%-30px)] translate-x-[14px]">

{/* LEFT — POSITION */}

<div className="absolute left-0 top-0 translate-y-[10px]">

  <div className="translate-x-[0px] text-[16px] font-semibold text-white">
    Position Impact
  </div>

<div className="translate-y-[2px] text-[13px] text-slate-400">
  {previewQuantityUnit}s After Trade
</div>

<div className="translate-y-[4px] text-[18px] font-medium text-white">
  {previewSharesAfterTrade} {previewQuantityUnit}
  {previewSharesAfterTrade === 1 ? "" : "s"}
</div>

<div className="translate-y-[6px] text-[12px] text-slate-500">
  {previewPositionImpact}
</div>

</div>


{/* RIGHT — STATUS */}

<div className="absolute right-0 top-1/2 translate-x-[-10px] translate-y-[-50%] text-right">

<div className="translate-y-[-4px] translate-x-[-18px] text-[13px] text-slate-400">
  Status
</div>

<span className="mt-3 inline-flex h-6 w-[70px] items-center justify-center rounded-[6px] bg-emerald-500/15 text-[12px] font-semibold text-emerald-400">
  {tradeType === "COMPLETE"
    ? "COMPLETE"
    : tradeType === "OPEN"
      ? "OPEN"
      : "CLOSE"}
</span>

</div>

  </div>

</PreviewCard>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* TIMELINE */}
{/* ================================================= */}

<PreviewCard>

  <div className="w-[calc(100%-30px)] translate-x-[14px]">

    {/* TITLE */}

<div className="translate-y-[8px] text-[16px] font-semibold text-white">
  Timeline
</div>


{/* TIMELINE BODY */}

<div className="relative mt-4 translate-y-[18px]">

  {/* VERTICAL LINE */}

  <div className="absolute left-[13px] top-[14px] bottom-[50px] w-px bg-white/[0.10]" />


  {/* ENTRY */}

  <div className="relative mt-[15px] flex min-h-[100px]">

    {/* MARKER */}

    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[12px] font-semibold text-[#07111d]">
      E
    </div>


        {/* DETAILS */}

        <div className="ml-3 min-w-0 flex-1 translate-y-[-2px] translate-x-[10px]">

          <div className="text-[14px] font-semibold text-emerald-400">
            BUY (Entry)
          </div>

          <div className="mt-2 text-[14px] font-medium text-white">
{quantity
  ? `${quantity} ${previewQuantityUnit}${Number(quantity) === 1 ? "" : "s"}`
  : `0 ${previewQuantityUnit}s`}
            {entryPrice
              ? ` @ $${Number(entryPrice).toFixed(2)}`
              : ""}
          </div>

<div className="mt-1 text-[13px] text-slate-400">
  {entryDate || "—"}
  {entryTime
    ? ` • ${entryTime}`
    : ""}
</div>

        </div>


{/* RIGHT — VALUE */}

<div className="shrink-0 pl-3 text-right">

<div className="text-[14px] font-medium text-white">
  {formatPreviewCurrency(previewEntryValue)}
</div>

<div className="mt-2 text-[12px] text-slate-400">
  Fee: {formatPreviewCurrency(previewCommission / 2)}
</div>

</div>

</div>


      {/* EXIT */}

     <div className="relative mt-5 flex min-h-[68px] translate-y-[-10px]">

        {/* MARKER */}

        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-[12px] font-semibold text-white">
          X
        </div>


        {/* DETAILS */}

         <div className="ml-3 min-w-0 flex-1 translate-y-[-6px] translate-x-[10px]">

          <div className="text-[14px] font-semibold text-red-400">
            SELL (Exit)
          </div>

          <div className="mt-2 text-[14px] font-medium text-white">
{quantity
  ? `${quantity} ${previewQuantityUnit}${Number(quantity) === 1 ? "" : "s"}`
  : `0 ${previewQuantityUnit}s`}
            {exitPrice
              ? ` @ $${Number(exitPrice).toFixed(2)}`
              : ""}
          </div>

<div className="mt-1 text-[13px] text-slate-400">
  {exitDate || "—"}
  {exitTime
    ? ` • ${exitTime}`
    : ""}
</div>

        </div>


{/* RIGHT — VALUE */}

<div className="shrink-0 pl-3 text-right">

<div className="text-[14px] font-medium text-white">
  {formatPreviewCurrency(previewExitValue)}
</div>

<div className="mt-2 text-[12px] text-slate-400">
  Fee: {formatPreviewCurrency(
    previewCommission -
      previewCommission / 2
  )}
</div>

</div>

      </div>

    </div>

  </div>

</PreviewCard>

<div className="h-3.5 shrink-0" />

{/* ================================================= */}
{/* QUICK SUMMARY */}
{/* ================================================= */}

{/*
<PreviewCard>

  <div className="w-[calc(100%-30px)] translate-x-[14px]">

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

  </div>

</PreviewCard>

<div className="h-4 shrink-0" />
*/}

{/* ================================================= */}
{/* DISCLAIMER */}
{/* ================================================= */}

<div className="flex h-[40px] w-[calc(100%-0px)] translate-x-[0px] items-center rounded-[8px] border border-violet-500/20 bg-violet-500/[0.06] px-4">

  <div className="flex items-start gap-5">

    {/* ICON */}

    <div className="shrink-0 translate-x-[6px] translate-y-[10px] text-[15px] leading-none text-violet-400">
      ⓘ
    </div>

    {/* MESSAGE */}

    <p className="text-[11px] leading-[16px] text-violet-300/90">
      This preview is an estimate.
      <br />
      Actual results may vary after saving and FIFO processing.
    </p>

  </div>

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
  "h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10";

const selectClass =
  "h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition focus:border-blue-500/40 [color-scheme:dark]";
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
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">

      <label
        className="block text-[11px] font-medium text-slate-400"
        style={{ marginBottom: "2px" }}
      >
        {label}
{required && (
  <span
    className="ml-2 text-[10px] font-semibold text-red-400 inline-block"
    style={{
      transform: "translate(3px, 2px)",
    }}
  >
    *
  </span>
)}
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
      className={`relative flex min-h-[82px] items-center justify-center gap-3 rounded-[8px] border px-4 text-left transition ${
        selected
          ? "border-violet-500/70 bg-[#0b1220] shadow-[0_0_25px_rgba(124,58,237,0.08)]"
          : "border-white/[0.06] bg-[#0b1220] hover:border-white/[0.12]"
      }`}
    >

<div
  className={`flex h-10 w-10 shrink-0 -translate-x-[12px] items-center justify-center rounded-full text-[20px] ${accentClasses[accent]}`}
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
    <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">
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