"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Trade,
} from "@/types/trade";

import {
  supabase,
} from "@/lib/supabase";

import {
  createManualExecutions,
} from "@/lib/trades/createManualExecutions";

import {
  saveExecutionsToSupabase,
} from "@/lib/storage/supabaseExecutionStorage";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditTradeModalProps {

  open: boolean;

  trade: Trade | null;

  allTrades?: Trade[];

  onClose: () => void;
}

export default function EditTradeModal({

  open,
  trade,
  allTrades = [],
  onClose,

}: EditTradeModalProps) {

  // =================================================
  // FORM STATE
  // =================================================

  const [ticker, setTicker] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

const [exitQuantity, setExitQuantity] =
  useState("");

  const [entryPrice, setEntryPrice] =
    useState("");

  const [exitPrice, setExitPrice] =
    useState("");

  const [commission, setCommission] =
    useState("");

  const [side, setSide] =
    useState<"LONG" | "SHORT">(
      "LONG"
    );

  const [assetType, setAssetType] =
    useState("FUTURES");

  const [account, setAccount] =
    useState("");

const [entryDate, setEntryDate] =
  useState("");

const [exitDate, setExitDate] =
  useState("");

  const [entryTime, setEntryTime] =
    useState("");

  const [exitTime, setExitTime] =
    useState("");

  const [currency, setCurrency] =
    useState("USD");

  const [exchange, setExchange] =
    useState("");

// =================================================
// LOAD TRADE INTO FORM
// =================================================

useEffect(() => {

  if (!trade) {
    return;
  }

  setTicker(
    trade.ticker || ""
  );

  setQuantity(
    String(
      trade.quantity ?? ""
    )
  );

  setEntryPrice(
    String(
      trade.entryPrice ?? ""
    )
  );

  setExitPrice(
    trade.exitPrice != null
      ? String(
          trade.exitPrice
        )
      : ""
  );

setSide(
  trade.side === "SHORT"
    ? "SHORT"
    : "LONG"
);

  setAssetType(
    trade.assetType ||
    "FUTURES"
  );

  setAccount(
    trade.account ||
    ""
  );

  const normalizedTradeDate =
    trade.date?.includes("T")
      ? trade.date.split("T")[0]
      : trade.date || "";

  setEntryDate(
    normalizedTradeDate
  );

  setExitDate(
    normalizedTradeDate
  );

  const entryExecution =
    trade.executions?.find(
      (execution) =>
        execution.action ===
        (
          trade.side === "SHORT"
            ? "SELL"
            : "BUY"
        )
    );

  const exitExecution =
    trade.executions?.find(
      (execution) =>
        execution.action ===
        (
          trade.side === "SHORT"
            ? "BUY"
            : "SELL"
        )
    );

const isLoadedPartialExit =
  !!exitExecution &&
  trade.status !== "OPEN" &&
  !!trade.contractKey?.startsWith("MANUAL-") &&
  allTrades.some(
    (otherTrade) =>
      otherTrade.id !== trade.id &&
      otherTrade.contractKey === trade.contractKey
  );

setCommission(
  String(
    isLoadedPartialExit
      ? exitExecution.fees ?? 0
      : trade.fees ?? 0
  )
);

  setExitQuantity(
    exitExecution
      ? String(
          exitExecution.quantity ?? ""
        )
      : ""
  );

  setEntryTime(
    entryExecution?.executionTimestamp
      ? entryExecution.executionTimestamp.slice(
          11,
          16
        )
      : ""
  );

  setExitTime(
    exitExecution?.executionTimestamp
      ? exitExecution.executionTimestamp.slice(
          11,
          16
        )
      : ""
  );

  setCurrency(
    entryExecution?.currency ||
    trade.currency ||
    "USD"
  );

  setExchange(
    entryExecution?.exchange ||
    ""
  );

}, [
  trade,
]);

// =================================================
// SAVE EDITS
// =================================================

  const handleSaveTrade =
    async () => {

    // =================================================
    // SAFETY
    // =================================================

    if (!trade) {
      return;
    }

    if (
      !trade.contractKey?.startsWith(
        "MANUAL-"
      )
    ) {

      alert(
        "Only manual trades can be edited."
      );

      return;
    }

    // =================================================
    // NORMALIZE BASIC VALUES
    // =================================================

    const normalizedTicker =
      ticker.trim();

    const normalizedAccount =
      account.trim();

    const normalizedCurrency =
      currency.trim();

    const normalizedExchange =
      exchange.trim();

    // =================================================
    // PARSE NUMERIC VALUES
    // =================================================

const parsedQuantity =
  Number(quantity);

const parsedExitQuantity =
  Number(exitQuantity);

  if (
  isPartialExitTrade &&
  partialExitMaxQuantity != null &&
  parsedExitQuantity >
    partialExitMaxQuantity
) {
  alert(
    `This partial exit cannot exceed ${partialExitMaxQuantity} ${
      assetType === "OPTIONS"
        ? "contracts"
        : "shares"
    }.`
  );

  return;
}

const parsedEntryPrice =
  Number(entryPrice);

const parsedExitPrice =
  Number(exitPrice);


    const parsedCommission =
      Number(
        commission || 0
      );

    // =================================================
    // REQUIRED FIELD VALIDATION
    // =================================================

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
  isPartialExitTrade
    ? (
        !exitQuantity ||
        !Number.isFinite(
          parsedExitQuantity
        ) ||
        parsedExitQuantity <= 0
      )
    : (
        !quantity ||
        !Number.isFinite(
          parsedQuantity
        ) ||
        parsedQuantity <= 0
      )
) {

  alert(
    isPartialExitTrade
      ? "Exit quantity must be greater than 0."
      : "Quantity must be greater than 0."
  );

  return;
}

if (
  !isPartialExitTrade &&
  (
    !entryPrice ||
    !Number.isFinite(
      parsedEntryPrice
    ) ||
    parsedEntryPrice <= 0
  )
) {

  alert(
    "Entry price must be greater than 0."
  );

  return;
}

if (
  !isOpenPositionEntry &&
  (
    !exitPrice ||
    !Number.isFinite(
      parsedExitPrice
    ) ||
    parsedExitPrice <= 0
  )
) {

  alert(
    "Exit price must be greater than 0."
  );

  return;
}

if (!entryDate) {

  alert(
    "Trade date is required."
  );

  return;
}

if (
  !isPartialExitTrade &&
  !entryTime
) {

  alert(
    "Entry time is required."
  );

  return;
}

if (
  !isOpenPositionEntry &&
  !exitTime
) {

  alert(
    "Exit time is required."
  );

  return;
}

    if (!normalizedCurrency) {

      alert(
        "Currency is required."
      );

      return;
    }

    if (!normalizedExchange) {

      alert(
        "Exchange is required."
      );

      return;
    }

    if (
      !Number.isFinite(
        parsedCommission
      ) ||
      parsedCommission < 0
    ) {

      alert(
        "Commission must be 0 or greater."
      );

      return;
    }

// =================================================
// DELETE / REPLACE EXISTING EXECUTION(S)
// =================================================

let correctedExecutions;

if (isPartialExitTrade) {

  // =================================================
  // PARTIAL EXIT
  // DELETE ONLY THE EXACT EXIT EXECUTION
  // =================================================

  const existingExitExecution =
    trade.executions?.find(
      (execution) =>
        execution.action ===
        (
          side === "SHORT"
            ? "BUY"
            : "SELL"
        )
    );

  if (!existingExitExecution) {

    alert(
      "Unable to find the existing exit execution."
    );

    return;
  }

  const {
    error: deleteExitError,
  } = await supabase
    .from("executions")
    .delete()
    .eq(
      "id",
      existingExitExecution.id
    );

  if (deleteExitError) {

    console.error(
      "FAILED TO DELETE EXISTING PARTIAL EXIT EXECUTION:",
      deleteExitError
    );

    alert(
      "Failed to update partial exit."
    );

    return;
  }

  // =================================================
  // CREATE REPLACEMENT PARTIAL EXIT
  // =================================================

  correctedExecutions =
    createManualExecutions({

      ticker:
        normalizedTicker,

      quantity:
        parsedExitQuantity,

      exitPrice:
        parsedExitPrice,

      commission:
        parsedCommission,

      side,

      assetType,

      account:
        normalizedAccount,

      exitDate,

      exitTime,

      currency:
        normalizedCurrency,

      exchange:
        normalizedExchange,

      tradeType:
        "PARTIAL_EXIT",

      contractKey:
        trade.contractKey,
    });

} else {

  // =================================================
  // COMPLETE / OPEN POSITION ENTRY
  // EXISTING BEHAVIOR
  // =================================================

  const {
    error: deleteError,
  } = await supabase
    .from("executions")
    .delete()
    .eq(
      "contract_key",
      trade.contractKey
    );

  if (deleteError) {

    console.error(
      "FAILED TO DELETE OLD MANUAL LIFECYCLE:",
      deleteError
    );

    alert(
      "Failed to replace manual trade lifecycle."
    );

    return;
  }

correctedExecutions =
  createManualExecutions({

    ticker:
      normalizedTicker,

    quantity:
      parsedQuantity,

    entryPrice:
      parsedEntryPrice,

    exitPrice:
      parsedExitPrice,

    commission:
      parsedCommission,

    side,

    assetType,

    account:
      normalizedAccount,

    entryDate,
    exitDate,

    entryTime,
    exitTime,

    currency:
      normalizedCurrency,

    exchange:
      normalizedExchange,

    tradeType:
      isOpenPositionEntry
        ? "PARTIAL_ENTRY"
        : "COMPLETE",
  });

  // =================================================
  // PRESERVE EXISTING MANUAL LIFECYCLE
  // =================================================
  //
  // Editing a trade must not create a new lifecycle.
  //
  // createManualExecutions() generates a new
  // contractKey internally, so restore the original
  // lifecycle identity before saving.
  //
  // =================================================

  correctedExecutions =
    correctedExecutions.map(
      (execution) => ({
        ...execution,
        contractKey:
          trade.contractKey,
      })
    );
}

// =================================================
// SAVE CORRECTED EXECUTIONS
// =================================================

try {

  await saveExecutionsToSupabase(
    correctedExecutions
  );

} catch (error) {

  console.error(
    "FAILED TO SAVE CORRECTED MANUAL LIFECYCLE:",
    error
  );

  alert(
    "Failed to save edited trade."
  );

  return;
}

// =================================================
// CLOSE + RELOAD
// =================================================

onClose();

window.location.reload();
  };

// =================================================
// DELETE TRADE
// =================================================

const handleDeleteTrade =
  async () => {

    if (
      !trade?.contractKey
    ) {
      return;
    }

    const isManualTrade =
      trade.contractKey.startsWith(
        "MANUAL-"
      );

    // =================================================
    // DETERMINE WHETHER THIS IS A PARTIAL-EXIT TRADE
    // =================================================

const hasLifecycleSibling =
  allTrades.some(
    (otherTrade) =>
      otherTrade.id !== trade.id &&
      otherTrade.contractKey ===
        trade.contractKey
  );

const isPartialExitTrade =
  isManualTrade &&
  trade.status !== "OPEN" &&
  hasLifecycleSibling;

    // =================================================
    // PARTIAL EXIT
    // DELETE ONLY THE EXACT EXIT EXECUTION
    // =================================================

    if (isPartialExitTrade) {

      const exitAction =
        trade.side === "SHORT"
          ? "BUY"
          : "SELL";

      const exitExecution =
        trade.executions?.find(
          (execution) =>
            execution.action ===
            exitAction
        );

      if (
        !exitExecution?.id
      ) {

        console.error(
          "FAILED TO IDENTIFY PARTIAL EXIT EXECUTION:",
          trade
        );

        alert(
          "Unable to identify the exact exit execution."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Delete this partial exit?"
        );

      if (!confirmed) {
        return;
      }

      const {
        error,
      } = await supabase
        .from("executions")
        .delete()
        .eq(
          "id",
          exitExecution.id
        );

      if (error) {

        console.error(
          "FAILED TO DELETE PARTIAL EXIT EXECUTION:",
          error
        );

        alert(
          "Failed to delete partial exit."
        );

        return;
      }

      onClose();

      window.location.reload();

      return;
    }



    // =================================================
    // NORMAL COMPLETE TRADE / LIFECYCLE DELETE
    // =================================================

    const confirmed =
      window.confirm(
        "Delete this trade lifecycle?"
      );

    if (!confirmed) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("executions")
      .delete()
      .eq(
        "contract_key",
        trade.contractKey
      );

    if (error) {

      console.error(
        "FAILED TO DELETE TRADE:",
        error
      );

      alert(
        "Failed to delete trade."
      );

      return;
    }

    onClose();

    window.location.reload();
  };

// =================================================
// MANUAL EDIT MODE DETECTION
// =================================================

const isOpenPositionEntry =
  trade?.status === "OPEN" &&
  trade.contractKey?.startsWith("MANUAL-") &&
  (trade.executions?.length ?? 0) === 1;

const isPartialExitTrade =
  !!trade?.contractKey?.startsWith("MANUAL-") &&
  trade.status !== "OPEN" &&
  allTrades.some(
    (otherTrade) =>
      otherTrade.id !== trade.id &&
      otherTrade.contractKey === trade.contractKey
  );

const partialExitMaxQuantity = (() => {
  if (
    !isPartialExitTrade ||
    !trade?.contractKey
  ) {
    return undefined;
  }

  const lifecycleTrades =
    allTrades.filter(
      (otherTrade) =>
        otherTrade.contractKey ===
        trade.contractKey
    );

  // The sum of all reconstructed quantities
  // in this lifecycle represents the original
  // quantity introduced into the lifecycle.
  const lifecycleTotalQuantity =
    lifecycleTrades.reduce(
      (total, lifecycleTrade) =>
        total +
        Number(
          lifecycleTrade.quantity || 0
        ),
      0
    );

  // Everything except the exit we are editing
  // must remain unchanged.
  const otherTradesQuantity =
    lifecycleTrades
      .filter(
        (otherTrade) =>
          otherTrade.id !== trade.id
      )
      .reduce(
        (total, lifecycleTrade) =>
          total +
          Number(
            lifecycleTrade.quantity || 0
          ),
        0
      );

  return Math.max(
    0,
    lifecycleTotalQuantity -
      otherTradesQuantity
  );
})();

    // =================================================
  // SAFETY
  // =================================================

  if (!open || !trade) {
    return null;
  }

const previewQuantity = Number(quantity) || 0;
const previewEntryPrice = Number(entryPrice) || 0;
const previewExitPrice = Number(exitPrice) || 0;
const previewCommission = Number(commission) || 0;

const previewMultiplier =
  assetType === "OPTIONS" ? 100 : 1;

const previewIsOpenPositionEntry =
  isOpenPositionEntry;

const previewIsPartialExit =
  isPartialExitTrade;

const previewIsCompleteTrade =
  !previewIsOpenPositionEntry &&
  !previewIsPartialExit;

  const previewEffectiveQuantity =
  previewIsPartialExit
    ? Number(exitQuantity) || 0
    : previewQuantity;

const partialExitLifecycleTrades =
  previewIsPartialExit
    ? allTrades.filter(
        (lifecycleTrade) =>
          lifecycleTrade.contractKey ===
          trade.contractKey
      )
    : [];

const partialExitEntryExecutions =
  previewIsPartialExit
    ? partialExitLifecycleTrades.flatMap(
        (lifecycleTrade) =>
          lifecycleTrade.executions ?? []
      )
    : [];

const partialExitOriginalEntryQuantity =
  previewIsPartialExit
    ? partialExitEntryExecutions
        .filter(
          (execution) =>
            execution.action ===
            (side === "LONG" ? "BUY" : "SELL")
        )
        .reduce(
          (sum, execution) =>
            sum +
            Number(execution.quantity ?? 0),
          0
        )
    : 0;

const partialExitOriginalEntryCommission =
  previewIsPartialExit
    ? partialExitEntryExecutions
        .filter(
          (execution) =>
            execution.action ===
            (side === "LONG" ? "BUY" : "SELL")
        )
        .reduce(
          (sum, execution) =>
            sum +
            Number(execution.fees ?? 0),
          0
        )
    : 0;

    const partialExitOriginalEntryPrice =
  previewIsPartialExit
    ? (
        partialExitEntryExecutions.find(
          (execution) =>
            execution.action ===
            (side === "LONG" ? "BUY" : "SELL")
        )?.executionPrice ?? 0
      )
    : 0;

const partialExitEntryCommissionAllocation =
  previewIsPartialExit &&
  partialExitOriginalEntryQuantity > 0 &&
  previewEffectiveQuantity > 0
    ? (
        partialExitOriginalEntryCommission /
        partialExitOriginalEntryQuantity
      ) *
      previewEffectiveQuantity
    : 0;



const previewEntryValue =
  (
    previewIsPartialExit
      ? previewEffectiveQuantity *
        partialExitOriginalEntryPrice
      : previewQuantity *
        previewEntryPrice
  ) *
  previewMultiplier;

const previewExitValue =
  previewIsOpenPositionEntry
    ? 0
    : (
        previewEffectiveQuantity *
        previewExitPrice
      ) *
      previewMultiplier;

const previewGrossPnL =
  previewIsOpenPositionEntry
    ? 0
    : side === "LONG"
      ? previewExitValue - previewEntryValue
      : previewEntryValue - previewExitValue;

const previewTotalFees =
  previewIsOpenPositionEntry
    ? previewCommission
    : previewIsPartialExit
      ? partialExitEntryCommissionAllocation +
        previewCommission
      : previewCommission;

const previewNetPnL =
  previewGrossPnL -
  (
    previewIsOpenPositionEntry
      ? 0
      : previewIsPartialExit
        ? partialExitEntryCommissionAllocation +
          previewCommission
        : previewCommission
  );

const previewReturn =
  previewIsOpenPositionEntry
    ? 0
    : previewEntryValue > 0
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

    const durationMinutes = Math.floor(
      (exitDateTime.getTime() -
        entryDateTime.getTime()) /
        60000
    );

    const hours = Math.floor(
      durationMinutes / 60
    );

    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  })();

  const formatPreviewCurrency = (
    value: number
  ) => {
    try {
      return new Intl.NumberFormat(
        "en-US",
        {
          style: "currency",
          currency: currency || "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(value);
    } catch {
      return `$${value.toFixed(2)}`;
    }
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

  const quantityUnit =
    assetType === "OPTIONS" ||
    assetType === "FUTURES"
      ? "Contract"
      : assetType === "CRYPTO" ||
        assetType === "FOREX" ||
        assetType === "CFD"
        ? ticker.trim().toUpperCase() || "Unit"
        : "Share";

  const usesTickerUnit =
    assetType === "CRYPTO" ||
    assetType === "FOREX" ||
    assetType === "CFD";

  const entryAction =
    side === "LONG" ? "BUY" : "SELL";

  const exitAction =
    side === "LONG" ? "SELL" : "BUY";

return (
  <TooltipProvider>
    <>


      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

     <div className="fixed inset-0 z-[11000] bg-black/75 backdrop-blur-[5px]" />

      {/* ================================================= */}
      {/* MODAL VIEWPORT */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[11100] flex items-center justify-center p-6">

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
{/* LEFT — EDIT MANUAL TRADE */}
{/* ================================================= */}

<section className="flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#07111d]">

  {/* ================================================= */}
  {/* HEADER */}
  {/* ================================================= */}

  <header className="flex shrink-0 items-start justify-between px-6 pb-5 pt-5 translate-x-[0px] translate-y-[-0px] min-[1100px]:translate-x-[14px] min-[1100px]:translate-y-[6px]">

    <div>

      <div className="flex items-center gap-2">

        <h2 className="text-[25px] font-semibold tracking-[-0.02em] text-white">
          Edit Manual Trade
        </h2>

      </div>

      <p className="mt-1.5 text-[14px] text-slate-400">
        Correct and update your manual trade.
      </p>

    </div>

<div className="flex items-center gap-2 translate-x-[-30px] translate-y-[6px]">

  {/* MANUAL EDIT */}

  <div className="flex h-[32px] w-[112px] items-center justify-center rounded-[8px] border border-violet-500/20 bg-violet-500/[0.08] text-[11px] font-semibold uppercase tracking-[0.08em] text-violet-400">
    Manual Edit
  </div>

  {/* DELETE */}

  <button
    type="button"
    onClick={handleDeleteTrade}
    className="flex h-[32px] w-[80px] items-center justify-center rounded-[8px] border border-red-500/20 bg-red-500/10 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-400 transition hover:bg-red-500/20"
  >
    Delete
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

<div className="translate-x-[14px]">
  <div className="flex items-center gap-2">
    <span className="text-[12px] font-semibold text-slate-400">
      1
    </span>

    <div className="flex items-center gap-1.5">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">
        Trade Type
      </h3>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex h-4 w-4 items-center justify-center text-slate-500 transition hover:text-slate-300"
            aria-label="Trade Type information"
          >
            ⓘ
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="!z-[12000] w-[520px] max-w-[520px] !px-6 !py-5 border border-white/[0.08] bg-[#07111d] text-[12px] leading-[1.5] text-slate-300 shadow-2xl"
        >
          <div className="flex w-full flex-col gap-3 text-[12px] leading-[1.5]">

            {/* Header */}
            <div>
              <div className="text-[13px] font-semibold text-white">
                Trade Types
              </div>

              <div className="mt-1 text-slate-400">
                This shows how the existing manual trade is classified.
                Edit does not change the trade type; it shows you which
                type of manual lifecycle you are currently editing.
              </div>
            </div>

            {/* Complete Trade */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-100">
                  Complete Trade
                </span>

                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  ENTRY + EXIT
                </span>
              </div>

              <div className="text-slate-400">
                A trade that contains both an entry and an exit.
              </div>

              <div
                className="rounded-md border border-white/[0.06] bg-white/[0.025] text-slate-400"
                style={{
                  padding: "6px",
                  margin: "0px",
                }}
              >
                <span className="font-medium text-slate-300">
                  Example:
                </span>{" "}
                Bought 100 shares at $50 and sold 100 shares at $55.
              </div>
            </div>

            {/* Open Position */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">
                  Open Position (Entry)
                </span>

                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  OPEN / ADD
                </span>
              </div>

              <div className="text-slate-400">
                This represents a Partial Entry. It creates or adds to
                an open position and does not contain an exit yet.
              </div>

              <div
                className="rounded-md border border-white/[0.06] bg-white/[0.025] text-slate-400"
                style={{
                  padding: "6px",
                  margin: "0px",
                }}
              >
                <span className="font-medium text-slate-300">
                  Example:
                </span>{" "}
                Buy 60 shares now, then buy another 40 shares later.
                The open position becomes 100 shares.
              </div>
            </div>

            {/* Close / Reduce */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">
                  Close / Reduce (Exit)
                </span>

                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  REDUCE / CLOSE
                </span>
              </div>

              <div className="text-slate-400">
                This represents a Partial Exit. It reduces an existing
                open position and can be repeated until the position is
                fully closed.
              </div>

              <div
                className="rounded-md border border-white/[0.06] bg-white/[0.025] text-slate-400"
                style={{
                  padding: "6px",
                  margin: "0px",
                }}
              >
                <span className="font-medium text-slate-300">
                  Example:
                </span>{" "}
                You have 100 shares open and sell 25. Your remaining
                open position is 75 shares.
              </div>
            </div>

            {/* How they work together */}
            <div className="relative flex flex-col gap-1 pt-4">
              <div
                className="absolute left-0 right-0 h-px bg-white/[0.08]"
                style={{
                  top: "-7px",
                }}
              />

              <div className="font-semibold text-slate-200">
                How they work together
              </div>

              <div className="text-slate-400">
                A manual position can use multiple Partial Entries and
                Partial Exits over time. For example:
              </div>

              <div
                className="flex flex-col gap-1 rounded-md border border-white/[0.06] bg-white/[0.025] text-slate-400"
                style={{
                  padding: "6px",
                }}
              >
                <div>60 BUY → open 60</div>
                <div>40 BUY → open 100</div>
                <div>20 SELL → open 80</div>
                <div>30 SELL → open 50</div>
              </div>

              <div className="text-slate-500">
                Edit preserves the existing manual lifecycle identity.
                Changes are applied to the appropriate execution so
                the position and realized P&amp;L remain consistent.
              </div>
            </div>

          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
</div>

  <div className="h-2 shrink-0" />

<div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-3 gap-3">

  {/* COMPLETE TRADE */}

  <button
    type="button"
    disabled
    className={`relative flex min-h-[82px] cursor-default items-center justify-center gap-3 rounded-[8px] px-4 text-left transition ${
      !isOpenPositionEntry &&
      !isPartialExitTrade
        ? "border border-violet-500/70 bg-[#0b1220] shadow-[0_0_25px_rgba(124,58,237,0.08)]"
        : "border border-white/[0.06] bg-[#0b1220] opacity-60"
    }`}
  >

    <div
      className={`flex h-10 w-10 shrink-0 -translate-x-[12px] items-center justify-center rounded-full text-[20px] ${
        !isOpenPositionEntry &&
        !isPartialExitTrade
          ? "bg-violet-500/15 text-violet-400"
          : "bg-white/[0.04] text-slate-500"
      }`}
    >
      ↔
    </div>

    <div className="min-w-0">

      <div className="text-[14px] font-semibold text-white">
        Complete Trade
      </div>

      <div className="mt-1 text-[12px] text-slate-500">
        Entry and exit
      </div>

    </div>

    {!isOpenPositionEntry &&
      !isPartialExitTrade && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] text-white">
          ✓
        </div>
      )}

  </button>


  {/* OPEN POSITION */}

  <button
    type="button"
    disabled
    className={`relative flex min-h-[82px] cursor-default items-center justify-center gap-3 rounded-[8px] px-4 text-left transition ${
      isOpenPositionEntry
        ? "border border-emerald-500/60 bg-[#0b1220] shadow-[0_0_25px_rgba(16,185,129,0.08)]"
        : "border border-white/[0.06] bg-[#0b1220] opacity-60"
    }`}
  >

    <div
      className={`flex h-10 w-10 shrink-0 -translate-x-[12px] items-center justify-center rounded-full text-[20px] ${
        isOpenPositionEntry
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-white/[0.04] text-slate-500"
      }`}
    >
      ↑
    </div>

    <div className="min-w-0">

      <div className="text-[14px] font-semibold text-white">
        Open Position (Entry)
      </div>

      <div className="mt-1 text-[12px] text-slate-500">
        Entry only
      </div>

    </div>

    {isOpenPositionEntry && (
      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white">
        ✓
      </div>
    )}

  </button>


  {/* CLOSE / REDUCE */}

  <button
    type="button"
    disabled
    className={`relative flex min-h-[82px] cursor-default items-center justify-center gap-3 rounded-[8px] px-4 text-left transition ${
      isPartialExitTrade
        ? "border border-red-500/60 bg-[#0b1220] shadow-[0_0_25px_rgba(239,68,68,0.08)]"
        : "border border-white/[0.06] bg-[#0b1220] opacity-60"
    }`}
  >

    <div
      className={`flex h-10 w-10 shrink-0 -translate-x-[12px] items-center justify-center rounded-full text-[20px] ${
        isPartialExitTrade
          ? "bg-red-500/15 text-red-400"
          : "bg-white/[0.04] text-slate-500"
      }`}
    >
      ↓
    </div>

    <div className="min-w-0">

      <div className="text-[14px] font-semibold text-white">
        Close / Reduce (Exit)
      </div>

      <div className="mt-1 text-[12px] text-slate-500">
        Exit only
      </div>

    </div>

    {isPartialExitTrade && (
      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] text-white">
        ✓
      </div>
    )}

  </button>

</div>

</section>

<div className="w-[calc(100%-30px)] translate-x-[14px] translate-y-[10px] border-t border-white/[0.08]" />

{/* ================================================= */}
{/* 2. TRADE SETUP */}
{/* ================================================= */}

<section className="py-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[14px]">

    <div className="flex items-center gap-2">

      <span className="text-[12px] font-semibold text-slate-400">
        2
      </span>

      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">
        Trade Setup
      </h3>

    </div>

  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-4 gap-3">

    {/* ================================================= */}
    {/* ACCOUNT */}
    {/* ================================================= */}

    <div>

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        Account
      </label>

      <input
        type="text"
        value={account}
        onChange={(e) =>
          setAccount(e.target.value)
        }
        placeholder="Account"
        className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
        style={{ paddingLeft: "16px" }}
      />

    </div>

    {/* ================================================= */}
    {/* SYMBOL */}
    {/* ================================================= */}

    <div>

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        Symbol
      </label>

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
  maxLength={10}
  onChange={(e) =>
    setTicker(e.target.value.toUpperCase())
  }
  placeholder="AAPL"
          className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-10 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          style={{ paddingLeft: "40px" }}
        />

      </div>

    </div>

    {/* ================================================= */}
    {/* DIRECTION */}
    {/* ================================================= */}

    <div>

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        Direction
      </label>

      <div className="flex h-10 rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] p-1">

        {(["LONG", "SHORT"] as const).map(
          (item) => (

            <button
              key={item}
              type="button"
              onClick={() =>
                setSide(item)
              }
              className={`flex flex-1 items-center justify-center rounded-[6px] text-[12px] font-semibold transition ${
                side === item
                  ? "bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.18)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {item}
            </button>

          )
        )}

      </div>

    </div>

{/* ================================================= */}
{/* ASSET TYPE */}
{/* ================================================= */}

<div>

  <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
    Asset Type
  </label>

  <div className="relative">

    <select
      value={assetType}
      onChange={(e) =>
        setAssetType(e.target.value)
      }
      className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition focus:border-blue-500/40 [color-scheme:dark] appearance-none"
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

</div>

  </div>

</section>

<div className="w-[calc(100%-30px)] translate-x-[14px] border-t border-white/[0.08] translate-y-[10px]" />

{/* ================================================= */}
{/* 3 + 4. ENTRY / EXIT */}
{/* ================================================= */}

<div className="relative grid grid-cols-1 lg:grid-cols-2">

  {/* ================================================= */}
  {/* ENTRY */}
  {/* ================================================= */}

  <section
  className={`py-5 lg:pr-5 transition-opacity ${
    isPartialExitTrade
      ? "opacity-50"
      : "opacity-100"
  }`}
>

    <div className="h-5 shrink-0" />

    <div className="translate-x-[14px]">

      <div className="flex items-center gap-2">

        <span className="text-[12px] font-semibold text-slate-400">
          3
        </span>

        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">
          Entry Details
        </h3>

      </div>

    </div>

    <div className="h-2 shrink-0" />

    <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 gap-3">

      {/* ================================================= */}
      {/* QUANTITY */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Quantity
        </label>

<input
  type="number"
  disabled={isPartialExitTrade}
  value={quantity}
  onChange={(e) =>
    setQuantity(e.target.value)
  }
          placeholder="100"
          className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          style={{ paddingLeft: "16px" }}
        />

      </div>

      {/* ================================================= */}
      {/* PRICE */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Price
        </label>

        <input
          type="number"
disabled={isPartialExitTrade}
step="0.01"
          value={entryPrice}
          onChange={(e) =>
            setEntryPrice(e.target.value)
          }
          placeholder="200.00"
          className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          style={{ paddingLeft: "16px" }}
        />

      </div>

      {/* ================================================= */}
      {/* DATE */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Date
        </label>

        <div className="relative">

<input
  type="date"
  disabled={isPartialExitTrade}
  value={entryDate}
  onChange={(e) => {
    const value = e.target.value;

    setEntryDate(value);
    setExitDate(value);
  }}
            className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-4 pr-10 text-[13px] font-medium text-white outline-none transition [color-scheme:dark] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 [&::-webkit-calendar-picker-indicator]:opacity-0"
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

      </div>

      {/* ================================================= */}
      {/* TIME */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Time
        </label>

        <div className="relative">

          <input
            type="time"
            disabled={isPartialExitTrade}
            value={entryTime}
            onChange={(e) =>
              setEntryTime(e.target.value)
            }
            className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-4 pr-10 text-[13px] font-medium text-white outline-none transition [color-scheme:dark] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 [&::-webkit-calendar-picker-indicator]:opacity-0"
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

      </div>

    </div>

  </section>

  {/* ================================================= */}
  {/* CENTER DIVIDER */}
  {/* ================================================= */}

  <div className="pointer-events-none absolute bottom-0 left-1/2 top-5 hidden w-px -translate-x-1/2 bg-white/[0.08] lg:block" />

  {/* ================================================= */}
  {/* EXIT */}
  {/* ================================================= */}

 <section
  className={`py-5 lg:pl-5 transition-opacity ${
    isOpenPositionEntry
      ? "opacity-50"
      : "opacity-100"
  }`}
>

    <div className="h-5 shrink-0" />

    <div className="translate-x-[14px]">

      <div className="flex items-center gap-2">

        <span className="text-[12px] font-semibold text-slate-400">
          4
        </span>

        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">
          Exit Details
        </h3>

      </div>

    </div>

    <div className="h-2 shrink-0" />

    <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 gap-3">

      {/* ================================================= */}
      {/* QUANTITY */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Quantity
        </label>

<input
  type="number"
  disabled={isOpenPositionEntry}
  max={partialExitMaxQuantity}
  value={
    isPartialExitTrade
      ? exitQuantity
      : quantity
  }
  onChange={(e) => {
    const value = e.target.value;

    if (
      isPartialExitTrade &&
      value !== ""
    ) {
      const parsedValue =
        Number(value);

      if (
        Number.isFinite(parsedValue) &&
        partialExitMaxQuantity != null &&
        parsedValue >
          partialExitMaxQuantity
      ) {
        setExitQuantity(
          String(
            partialExitMaxQuantity
          )
        );
        return;
      }
    }

    setExitQuantity(value);
  }}
  placeholder="Quantity"
  className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
  style={{ paddingLeft: "16px" }}
/>

      </div>

      {/* ================================================= */}
      {/* PRICE */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Price
        </label>

<input
  type="number"
  disabled={isOpenPositionEntry}
  step="0.01"
  value={exitPrice}
          onChange={(e) =>
            setExitPrice(e.target.value)
          }
          placeholder="215.00"
          className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-3 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          style={{ paddingLeft: "16px" }}
        />

      </div>

      {/* ================================================= */}
      {/* DATE */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Date
        </label>

        <div className="relative">

<input
  type="date"
  disabled={isOpenPositionEntry}
  value={exitDate}
            onChange={(e) =>
              setExitDate(e.target.value)
            }
            className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-4 pr-10 text-[13px] font-medium text-white outline-none transition [color-scheme:dark] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 [&::-webkit-calendar-picker-indicator]:opacity-0"
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

      </div>

      {/* ================================================= */}
      {/* TIME */}
      {/* ================================================= */}

      <div>

        <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
          Time
        </label>

        <div className="relative">

<input
  type="time"
  disabled={isOpenPositionEntry}
  value={exitTime}
            onChange={(e) =>
              setExitTime(e.target.value)
            }
            className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-4 pr-10 text-[13px] font-medium text-white outline-none transition [color-scheme:dark] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 [&::-webkit-calendar-picker-indicator]:opacity-0"
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

      </div>

    </div>

  </section>

</div>

<div className="w-[calc(100%-30px)] translate-x-[14px] border-t border-white/[0.08] translate-y-[10px]" />

{/* ================================================= */}
{/* 5. TRADE DETAILS */}
{/* ================================================= */}

<section className="py-5">

  <div className="h-5 shrink-0" />

  <div className="translate-x-[14px]">

    <div className="flex items-center gap-2">

      <span className="text-[12px] font-semibold text-slate-400">
        5
      </span>

      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-200">
        Trade Details
      </h3>

    </div>

  </div>

  <div className="h-2 shrink-0" />

  <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 gap-3 xl:grid-cols-4">

    {/* ================================================= */}
    {/* CURRENCY */}
    {/* ================================================= */}

    <div>

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        Currency
      </label>

      <select
        value={currency}
        onChange={(e) =>
          setCurrency(e.target.value)
        }
        className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-8 text-[13px] font-medium text-white outline-none transition focus:border-blue-500/40 [color-scheme:dark]"
        style={{ paddingLeft: "16px" }}
      >

        <option value="USD">USD</option>
        <option value="CAD">CAD</option>
        <option value="EUR">EUR</option>
        <option value="JPY">JPY</option>
        <option value="INR">INR</option>
        <option value="GBP">GBP</option>

      </select>

    </div>

    {/* ================================================= */}
    {/* EXCHANGE */}
    {/* ================================================= */}

    <div>

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        Exchange
      </label>

      <select
        value={exchange}
        onChange={(e) =>
          setExchange(e.target.value)
        }
        className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-5 pr-8 text-[13px] font-medium text-white outline-none transition focus:border-blue-500/40 [color-scheme:dark]"
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

    </div>

    {/* ================================================= */}
    {/* COMMISSION / FEES */}
    {/* ================================================= */}

    <div>

<label className="mb-1.5 block text-[11px] font-medium text-slate-400">
  {isOpenPositionEntry
    ? "Entry Commission / Fees"
    : isPartialExitTrade
      ? "Exit Commission / Fees"
      : "Total Commission / Fees"}
</label>

      <div className="relative">

        <input
          type="number"
          step="0.01"
          value={commission}
          onChange={(e) =>
            setCommission(e.target.value)
          }
          placeholder="5.00"
          className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] pl-4 pr-14 text-[13px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          style={{ paddingLeft: "16px" }}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
          {currency}
        </span>

      </div>

    </div>

    {/* ================================================= */}
    {/* EDIT STATUS */}
    {/* ================================================= */}

    <div>

      <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
        Status
      </label>

      <div className="flex h-10 items-center rounded-[8px] border border-white/[0.06] bg-[#0b0c1e] px-4">

        <span className="text-[13px] font-semibold text-emerald-400">
          Complete
        </span>

      </div>

    </div>

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
      Save Changes
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

    {/* CLOSE */}

    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="flex h-9 w-9 translate-x-[-20px] translate-y-[4px] items-center justify-center rounded-[8px] text-[26px] leading-none text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
    >
      ×
    </button>

  </div>

  {/* PREVIEW CONTENT */}

  <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-5">

    <div className="h-4 shrink-0" />

    <div className="w-[calc(100%-30px)] translate-x-[14px] space-y-3">

      {/* ================================================= */}
      {/* INSTRUMENT */}
      {/* ================================================= */}

      <div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

        <div className="flex h-[70px] items-center justify-between gap-4">

          <div className="flex min-w-0 items-center gap-4">

            <div className="flex h-[50px] w-[50px] shrink-0 translate-x-[6px] translate-y-[0px] items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0c1e] text-[22px] font-semibold text-white">
              {ticker
                ? ticker.slice(0, 1).toUpperCase()
                : "•"}
            </div>

            <div className="min-w-0 translate-x-[10px]">

<div
  className="max-w-[8ch] truncate text-[24px] font-semibold tracking-[-0.02em] text-white"
  title={ticker || undefined}
>
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

<span className="flex h-6 w-[110px] items-center justify-center rounded-[6px] bg-white/[0.04] text-[11px] text-slate-300">
  {isOpenPositionEntry
    ? "Partial Entry"
    : isPartialExitTrade
      ? "Partial Exit"
      : "Complete Trade"}
</span>

          </div>

        </div>

      </div>

      <div className="h-3 shrink-0" />
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
            previewNetPnL > 0
              ? "text-emerald-400"
              : previewNetPnL < 0
                ? "text-red-400"
                : "text-white"
          }`}
        >
          {formatPreviewPnL(previewNetPnL)}
        </div>

      </div>

      {/* RETURN */}

      <div className="px-3 text-center first:pl-0 last:pr-0">

        <div className="text-[12px] text-slate-400">
          Return
        </div>

        <div
          className={`mt-2 text-[16px] font-semibold ${
            previewReturn > 0
              ? "text-emerald-400"
              : previewReturn < 0
                ? "text-red-400"
                : "text-white"
          }`}
        >
          {formatPreviewReturn(previewReturn)}
        </div>

      </div>

      {/* HOLDING TIME */}

      <div className="px-3 text-center first:pl-0 last:pr-0">

        <div className="text-[12px] text-slate-400">
          Holding Time
        </div>

        <div className="mt-2 text-[16px] font-semibold text-white">
          {previewHoldingTime}
        </div>

      </div>

    </div>

  </div>

</div>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* VALUES */}
{/* ================================================= */}

<div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

  <div className="flex h-[80px] items-center">

    <div className="grid w-[calc(100%-30px)] translate-x-[14px] grid-cols-2 divide-x divide-white/[0.06]">

      {/* LEFT — VALUES */}

      <div className="pr-4">

        <div className="flex items-center justify-between text-[13px]">

          <span className="text-slate-400">
            Entry Value
          </span>

          <span className="translate-x-[-10px] text-white">
            {formatPreviewCurrency(previewEntryValue)}
          </span>

        </div>

        <div className="translate-y-[4px] flex items-center justify-between text-[13px]">

          <span className="text-slate-400">
            Exit Value
          </span>

          <span className="translate-x-[-10px] text-white">
            {formatPreviewCurrency(previewExitValue)}
          </span>

        </div>

        <div className="translate-y-[6px] flex items-center justify-between text-[13px]">

          <span className="text-slate-400">
            Fees
          </span>

<span className="translate-x-[-10px] text-white">
  {formatPreviewCurrency(previewTotalFees)}
</span>

        </div>

      </div>

      {/* RIGHT — PERFORMANCE */}

      <div className="pl-4">

        <div className="flex items-center justify-between text-[13px]">

          <span className="translate-x-[10px] text-slate-400">
            Net P&L
          </span>

          <span
            className={`${
              previewNetPnL > 0
                ? "text-emerald-400"
                : previewNetPnL < 0
                  ? "text-red-400"
                  : "text-white"
            }`}
          >
            {formatPreviewPnL(previewNetPnL)}
          </span>

        </div>

        <div className="translate-y-[4px] flex items-center justify-between text-[13px]">

          <span className="translate-x-[10px] text-slate-400">
            Return
          </span>

          <span
            className={`${
              previewReturn > 0
                ? "text-emerald-400"
                : previewReturn < 0
                  ? "text-red-400"
                  : "text-white"
            }`}
          >
            {formatPreviewReturn(previewReturn)}
          </span>

        </div>

      </div>

    </div>

  </div>

</div>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* POSITION IMPACT */}
{/* ================================================= */}

<div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

  <div className="relative h-[110px] w-[calc(100%-30px)] translate-x-[14px]">

    {/* LEFT — POSITION */}

    <div className="absolute left-0 top-0 translate-y-[10px]">

      <div className="translate-x-[0px] text-[16px] font-semibold text-white">
        Position Impact
      </div>

<div className="translate-y-[2px] text-[13px] text-slate-400">
  Position Size
</div>

<div className="translate-y-[4px] text-[18px] font-medium text-white">
  {quantity} {assetType === "OPTIONS" ? "Contracts" : "Shares"}
</div>

<div className="translate-y-[6px] text-[12px] text-slate-500">
  Completed trade
</div>

    </div>

    {/* RIGHT — STATUS */}

    <div className="absolute right-0 top-1/2 translate-x-[-10px] translate-y-[-50%] text-right">

      <div className="translate-y-[-4px] translate-x-[-18px] text-[13px] text-slate-400">
        Status
      </div>

      <span className="mt-3 inline-flex h-6 w-[70px] items-center justify-center rounded-[6px] bg-emerald-500/15 text-[12px] font-semibold text-emerald-400">
        COMPLETE
      </span>

    </div>

  </div>

</div>

<div className="h-3 shrink-0" />

{/* ================================================= */}
{/* TIMELINE */}
{/* ================================================= */}

<div
  className={`rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4 ${
    isOpenPositionEntry ? "pb-3" : ""
  }`}
>

  <div className="w-[calc(100%-30px)] translate-x-[14px]">

    {/* TITLE */}

    <div className="translate-y-[8px] text-[16px] font-semibold text-white">
      Timeline
    </div>

    {/* TIMELINE BODY */}

    <div className="relative mt-4 translate-y-[18px]">

      {/* VERTICAL LINE */}

{!isOpenPositionEntry && (
  <div className="absolute bottom-[50px] left-[13px] top-[14px] w-px bg-white/[0.10]" />
)}

      {/* ENTRY */}

    <div
  className={`relative mt-[15px] flex ${
    isOpenPositionEntry
      ? "min-h-[68px]"
      : "min-h-[100px]"
  }`}
>

        {/* MARKER */}

        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[12px] font-semibold text-[#07111d]">
          E
        </div>

        {/* DETAILS */}

        <div className="ml-3 min-w-0 flex-1 translate-x-[10px] translate-y-[-2px]">

          <div className="text-[14px] font-semibold text-emerald-400">
            {side === "LONG" ? "BUY (Entry)" : "SELL (Entry)"}
          </div>

          <div className="mt-2 text-[14px] font-medium text-white">
          {previewIsPartialExit
  ? previewEffectiveQuantity
  : quantity || "0"}{" "}
{assetType === "OPTIONS" ? "Contracts" : "Shares"}
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
  Fee: {formatPreviewCurrency(
isOpenPositionEntry
  ? previewCommission
  : previewIsPartialExit
    ? partialExitEntryCommissionAllocation
    : previewCommission / 2
  )}
</div>

        </div>

      </div>

{/* EXIT */}

{!isOpenPositionEntry && (
  <div className="relative mt-5 flex min-h-[68px] translate-y-[-10px]">

        {/* MARKER */}

        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-[12px] font-semibold text-white">
          X
        </div>

        {/* DETAILS */}

        <div className="ml-3 min-w-0 flex-1 translate-x-[10px] translate-y-[-6px]">

          <div className="text-[14px] font-semibold text-red-400">
            {side === "LONG" ? "SELL (Exit)" : "BUY (Exit)"}
          </div>

          <div className="mt-2 text-[14px] font-medium text-white">
{previewIsPartialExit
  ? previewEffectiveQuantity
  : quantity || "0"}{" "}
{assetType === "OPTIONS" ? "Contracts" : "Shares"}
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
    previewIsPartialExit
      ? previewCommission
      : previewCommission -
        previewCommission / 2
  )}
</div>

        </div>

      </div>
    )}

  </div>

</div>

<div className="h-3.5 shrink-0" />

{/* ================================================= */}
{/* QUICK SUMMARY */}
{/* ================================================= */}

{/*
<div className="rounded-[8px] border border-white/[0.06] bg-[#0b1220] px-4 py-4">

  <div className="w-[calc(100%-30px)] translate-x-[14px]">

    <div className="text-[16px] font-semibold text-white">
      Quick Summary
    </div>

    <div className="mt-4 grid grid-cols-4 divide-x divide-white/[0.06]">

      <div className="px-2 text-center first:pl-0 last:pr-0">
        <div className="text-[10px] text-slate-500">
          Hold Duration
        </div>

        <div className="mt-1 text-[12px] font-medium text-white">
          —
        </div>
      </div>

      <div className="px-2 text-center">
        <div className="text-[10px] text-slate-500">
          Avg Entry Price
        </div>

        <div className="mt-1 text-[12px] font-medium text-white">
          {entryPrice
            ? `$${entryPrice}`
            : "—"}
        </div>
      </div>

      <div className="px-2 text-center">
        <div className="text-[10px] text-slate-500">
          Avg Exit Price
        </div>

        <div className="mt-1 text-[12px] font-medium text-white">
          {exitPrice
            ? `$${exitPrice}`
            : "—"}
        </div>
      </div>

      <div className="px-2 text-center first:pl-0 last:pr-0">
        <div className="text-[10px] text-slate-500">
          Shares Traded
        </div>

        <div className="mt-1 text-[12px] font-medium text-white">
          {quantity || "—"}
        </div>
      </div>

    </div>

  </div>

</div>

<div className="h-4 shrink-0" />
*/}

{/* ================================================= */}
{/* DISCLAIMER */}
{/* ================================================= */}

<div
  className={`flex h-[40px] w-[calc(100%-0px)] items-center rounded-[8px] border border-violet-500/20 bg-violet-500/[0.06] px-4 ${
    isOpenPositionEntry
      ? "translate-y-[60px]"
      : ""
  }`}
>

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

          </div>

          </aside>

        </div>

      </div>

    </>
  </TooltipProvider>
  );
}