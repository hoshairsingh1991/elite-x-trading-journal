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

interface EditTradeModalProps {

  open: boolean;

  trade: Trade | null;

  onClose: () => void;
}

export default function EditTradeModal({

  open,
  trade,
  onClose,

}: EditTradeModalProps) {

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
    useState<"LONG" | "SHORT">(
      "LONG"
    );

  const [assetType, setAssetType] =
    useState("FUTURES");

  const [account, setAccount] =
    useState("");

  const [tradeDate, setTradeDate] =
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

    setCommission(
      String(
        trade.fees ?? 0
      )
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

    setTradeDate(
      trade.date?.includes("T")
        ? trade.date.split("T")[0]
        : trade.date || ""
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
      !quantity ||
      !Number.isFinite(
        parsedQuantity
      ) ||
      parsedQuantity <= 0
    ) {

      alert(
        "Quantity must be greater than 0."
      );

      return;
    }

    if (
      !entryPrice ||
      !Number.isFinite(
        parsedEntryPrice
      ) ||
      parsedEntryPrice <= 0
    ) {

      alert(
        "Entry price must be greater than 0."
      );

      return;
    }

    if (
      !exitPrice ||
      !Number.isFinite(
        parsedExitPrice
      ) ||
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
    // DELETE OLD LIFECYCLE
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

    // =================================================
    // CREATE CORRECTED EXECUTIONS
    // =================================================

    const correctedExecutions =
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

        tradeDate,

        entryTime,

        exitTime,

        currency:
          normalizedCurrency,

        exchange:
          normalizedExchange,
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

    const correctedExecutionsWithLifecycle =
      correctedExecutions.map(
        (execution) => ({
          ...execution,
          contractKey:
            trade.contractKey,
        })
      );

// =================================================
// SAVE CORRECTED EXECUTIONS
// =================================================

try {

  await saveExecutionsToSupabase(
    correctedExecutionsWithLifecycle
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

    const confirmed =
      window.confirm(
        "Delete this manual trade?"
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
  // SAFETY
  // =================================================

  if (!open || !trade) {

    return null;
  }

  return (

    <>

      {/* ================================================= */}
      {/* REMOVE NUMBER INPUT ARROWS */}
      {/* ================================================= */}

      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          opacity: 0;
        }
      `}</style>

      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-[4px]" />

      {/* ================================================= */}
      {/* VIEWPORT */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[130] overflow-y-auto">

        <div className="h-[18px] opacity-0">
          spacing
        </div>

        <div className="flex min-h-[calc(100vh-36px)]">

          <div className="w-[18px] opacity-0">
            spacing
          </div>

          {/* ================================================= */}
          {/* CENTER */}
          {/* ================================================= */}

          <div className="flex flex-1 items-center justify-center py-10">

            <div className="relative w-full max-w-[1100px] rounded-[32px] border border-white/[0.06] bg-[#071427] shadow-[0_0_80px_rgba(0,0,0,0.45)]">

              <div className="h-6 opacity-0">
                spacing
              </div>

              {/* ================================================= */}
              {/* HEADER */}
              {/* ================================================= */}

              <div className="flex items-start justify-between">

                <div className="w-[18px] shrink-0 opacity-0">
                  spacing
                </div>

                <div className="flex flex-1 items-start justify-between">

                  <div>

                    <p className="text-[10px] -translate-y-2 font-black uppercase tracking-[0.24em] text-blue-400">
                      Trade Reconciliation
                    </p>

                    <h2 className="mt-3 text-[24px] font-black tracking-tight text-white">
                      Edit Trade
                    </h2>

                    <p className="mt-3 text-[14px] text-slate-400">
                      Correct and reconcile institutional execution data safely.
                    </p>

                  </div>

                  {/* ================================================= */}
                  {/* ACTIONS */}
                  {/* ================================================= */}

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      onClick={
                        handleDeleteTrade
                      }
                      className="flex h-[30px] w-[72px] items-center justify-center rounded-[12px] border border-red-500/20 bg-red-500/10 text-[10px] font-black uppercase tracking-[0.14em] text-red-400 transition-all hover:bg-red-500/20"
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSaveTrade
                      }
                      className="flex h-[30px] w-[72px] items-center justify-center rounded-[12px] border border-blue-400/20 bg-blue-500/90 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-blue-400"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] text-[16px] font-bold text-slate-400 transition-all hover:border-white/[0.10] hover:text-white"
                    >
                      ×
                    </button>

                  </div>

                </div>

                <div className="w-[10px] shrink-0 opacity-0">
                  spacing
                </div>

              </div>

              {/* ================================================= */}
              {/* GAP */}
              {/* ================================================= */}

              <div className="h-2 opacity-0">
                spacing
              </div>

              {/* ================================================= */}
              {/* BODY */}
              {/* ================================================= */}

              <div className="px-5">

                <div className="rounded-[24px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] px-6 py-8">

                  <div className="flex">

                    <div className="w-[18px] shrink-0 opacity-0">
                      spacing
                    </div>

                    <div className="flex-1">

                      {/* ================================================= */}
                      {/* HEADER */}
                      {/* ================================================= */}

                      <div>

                        <p className="text-[14px] translate-y-2 font-black uppercase tracking-[0.18em] text-slate-500">
                          Trade Details
                        </p>

                        <p className="mt-2 text-[12px] translate-y-2 text-slate-400">
                          Edit manual trade execution details and workflow metadata.
                        </p>

                        <p className="mt-2 text-[8px] opacity-0">
                          Edit manual trade execution details and workflow metadata.
                        </p>

                      </div>

                      <div className="mt-6 h-px bg-white/[0.05]" />

                      {/* ================================================= */}
                      {/* FORM */}
                      {/* ================================================= */}

                      <div className="mt-10 flex flex-col items-center">

                        {/* ================================================= */}
                        {/* ROW 1 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-5">

                          {/* ACCOUNT */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[12px] translate-y-2 font-black uppercase tracking-[0.16em] text-slate-500">
                              Account
                            </p>

                            <div className="flex h-[50px] w-[180px] translate-y-4 items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="text"
                                value={account}
                                onChange={(e) =>
                                  setAccount(
                                    e.target.value
                                  )
                                }
                                placeholder="Account"
                                className="w-full bg-transparent text-center text-[14px] font-medium text-white outline-none placeholder:text-slate-500"
                              />

                            </div>

                          </div>

                          {/* SIDE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[12px] translate-y-2 font-black uppercase tracking-[0.16em] text-slate-500">
                              Side
                            </p>

                            <div className="flex h-[50px] w-[180px] translate-y-4 items-center justify-center gap-2 rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-2">

                              {(
                                [
                                  "LONG",
                                  "SHORT",
                                ] as const
                              ).map(
                                (item) => (

                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                      setSide(
                                        item
                                      )
                                    }
                                    className={`flex h-[32px] flex-1 items-center justify-center rounded-[10px] text-[10px] font-black uppercase tracking-[0.08em] transition-all ${
                                      side === item
                                        ? "bg-blue-500 text-white"
                                        : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
                                    }`}
                                  >
                                    {item}
                                  </button>

                                )
                              )}

                            </div>

                          </div>

                          {/* ASSET TYPE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[12px] translate-y-2 font-black uppercase tracking-[0.16em] text-slate-500">
                              Asset Type
                            </p>

                            <div className="flex h-[50px] w-[360px] translate-y-4 items-center justify-center gap-[6px] rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-[10px]">

                              {[
                                "STOCKS",
                                "OPTIONS",
                                "FUTURES",
                                "CRYPTO",
                                "CFD",
                                "FOREX",
                              ].map(
                                (item) => (

                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                      setAssetType(
                                        item
                                      )
                                    }
                                    className={`flex h-[30px] min-w-[54px] items-center justify-center rounded-[10px] px-[12px] text-[10px] font-black uppercase tracking-[0.08em] transition-all ${
                                      assetType === item
                                        ? "bg-blue-500 text-white"
                                        : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
                                    }`}
                                  >
                                    {item}
                                  </button>

                                )
                              )}

                            </div>

                          </div>

                        </div>

                        {/* ================================================= */}
                        {/* GAP */}
                        {/* ================================================= */}

                        <div className="h-8 opacity-0">
                          spacing
                        </div>

                        {/* ================================================= */}
                        {/* ROW 2 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-4">

                          {/* TICKER */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Ticker
                            </p>

                            <div className="flex h-[50px] w-[120px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="text"
                                value={ticker}
                                onChange={(e) =>
                                  setTicker(
                                    e.target.value
                                  )
                                }
                                placeholder="Ticker"
                                className="w-full bg-transparent text-center text-[14px] font-medium text-white outline-none placeholder:text-slate-500"
                              />

                            </div>

                          </div>

                          {/* TRADE DATE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Trade Date
                            </p>

                            <div className="relative flex h-[50px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                                <span className="text-[13px] font-medium text-white">
                                  {tradeDate}
                                </span>

                              </div>

                              <input
                                type="date"
                                value={tradeDate}
                                onChange={(e) =>
                                  setTradeDate(
                                    e.target.value
                                  )
                                }
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
                              />

                            </div>

                          </div>

                          {/* ENTRY TIME */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Entry Time
                            </p>

                            <div className="flex h-[50px] w-[130px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="time"
                                value={entryTime}
                                onChange={(e) =>
                                  setEntryTime(
                                    e.target.value
                                  )
                                }
                                className="w-full bg-transparent text-center text-[13px] font-medium text-white outline-none [color-scheme:dark]"
                              />

                            </div>

                          </div>

                          {/* EXIT TIME */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Exit Time
                            </p>

                            <div className="flex h-[50px] w-[130px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="time"
                                value={exitTime}
                                onChange={(e) =>
                                  setExitTime(
                                    e.target.value
                                  )
                                }
                                className="w-full bg-transparent text-center text-[13px] font-medium text-white outline-none [color-scheme:dark]"
                              />

                            </div>

                          </div>

                          {/* CURRENCY */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Currency
                            </p>

                            <div className="flex h-[50px] w-[120px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <select
                                value={currency}
                                onChange={(e) =>
                                  setCurrency(
                                    e.target.value
                                  )
                                }
                                className="w-full bg-transparent text-center text-[13px] font-medium text-white outline-none [color-scheme:dark]"
                              >

                                <option value="USD">
                                  USD
                                </option>

                                <option value="CAD">
                                  CAD
                                </option>

                                <option value="EUR">
                                  EUR
                                </option>

                                <option value="JPY">
                                  JPY
                                </option>

                                <option value="INR">
                                  INR
                                </option>

                                <option value="GBP">
                                  GBP
                                </option>

                              </select>

                            </div>

                          </div>

                          {/* EXCHANGE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Exchange
                            </p>

                            <div className="flex h-[50px] w-[140px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <select
                                value={exchange}
                                onChange={(e) =>
                                  setExchange(
                                    e.target.value
                                  )
                                }
                                className="w-full bg-transparent text-center text-[13px] font-medium text-white outline-none [color-scheme:dark]"
                              >

                                <option value="">
                                  Select
                                </option>

                                <option value="NASDAQ">
                                  NASDAQ
                                </option>

                                <option value="NYSE">
                                  NYSE
                                </option>

                                <option value="ARCA">
                                  ARCA
                                </option>

                                <option value="CBOE">
                                  CBOE
                                </option>

                                <option value="CME">
                                  CME
                                </option>

                                <option value="CBOT">
                                  CBOT
                                </option>

                                <option value="NYMEX">
                                  NYMEX
                                </option>

                                <option value="COMEX">
                                  COMEX
                                </option>

                                <option value="TSX">
                                  TSX
                                </option>

                                <option value="TSXV">
                                  TSXV
                                </option>

                                <option value="ICE">
                                  ICE
                                </option>

                                <option value="Other">
                                  Other
                                </option>

                              </select>

                            </div>

                          </div>

                        </div>

                        {/* ================================================= */}
                        {/* GAP */}
                        {/* ================================================= */}

                        <div className="h-10 opacity-0">
                          spacing
                        </div>

                        {/* ================================================= */}
                        {/* ROW 3 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-4">

                          {/* QUANTITY */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Quantity
                            </p>

                            <div className="flex h-[50px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                  setQuantity(
                                    e.target.value
                                  )
                                }
                                placeholder="Quantity"
                                className="w-full bg-transparent text-center text-[14px] font-medium text-white outline-none placeholder:text-slate-500"
                              />

                            </div>

                          </div>

                          {/* ENTRY PRICE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Entry Price
                            </p>

                            <div className="flex h-[50px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
                                step="0.01"
                                value={entryPrice}
                                onChange={(e) =>
                                  setEntryPrice(
                                    e.target.value
                                  )
                                }
                                placeholder="Entry"
                                className="w-full bg-transparent text-center text-[14px] font-medium text-white outline-none placeholder:text-slate-500"
                              />

                            </div>

                          </div>

                          {/* EXIT PRICE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Exit Price
                            </p>

                            <div className="flex h-[50px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
                                step="0.01"
                                value={exitPrice}
                                onChange={(e) =>
                                  setExitPrice(
                                    e.target.value
                                  )
                                }
                                placeholder="Exit"
                                className="w-full bg-transparent text-center text-[14px] font-medium text-white outline-none placeholder:text-slate-500"
                              />

                            </div>

                          </div>

                          {/* PNL */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              PnL
                            </p>

                            <div className="flex h-[50px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

                              <span className="text-[16px] text-slate-500">
                                Auto
                              </span>

                            </div>

                          </div>

                          {/* COMMISSION */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Commission
                            </p>

                            <div className="flex h-[50px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
                                step="0.01"
                                value={commission}
                                onChange={(e) =>
                                  setCommission(
                                    e.target.value
                                  )
                                }
                                placeholder="Commission"
                                className="w-full bg-transparent text-center text-[14px] font-medium text-white outline-none placeholder:text-slate-500"
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                    <div className="w-[18px] shrink-0 opacity-0">
                      spacing
                    </div>

                  </div>

                  <div className="h-6 opacity-0">
                    spacing
                  </div>

                </div>

              </div>

              <div className="h-5 opacity-0">
                spacing
              </div>

            </div>

          </div>

          <div className="w-[18px] opacity-0">
            spacing
          </div>

        </div>

        <div className="h-[18px] opacity-0">
          spacing
        </div>

      </div>

    </>
  );
}