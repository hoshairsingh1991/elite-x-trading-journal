"use client";

import { useState } from "react";

import { createTrade } from "@/lib/trades/createTrade";

import { appendTrades } from "@/lib/storage/tradeStorage";

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
    useState<"LONG" | "SHORT">(
      "LONG"
    );

  const [assetType, setAssetType] =
    useState("FUTURES");

  const [account, setAccount] =
    useState("");

  const [tradeDate, setTradeDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  // =================================================
  // SAVE TRADE
  // =================================================

  const handleSaveTrade = () => {

    if (
      !ticker ||
      !quantity ||
      !entryPrice ||
      !exitPrice
    ) {

      alert(
        "Please complete all required fields."
      );

      return;
    }

    const trade =
      createTrade({

        ticker,

        quantity:
          Number(quantity),

        entryPrice:
          Number(entryPrice),

        exitPrice:
          Number(exitPrice),

        commission:
          Number(commission || 0),

        side,

        assetType,

        account,

        tradeDate,
      });

    appendTrades([
      trade
    ]);

    onClose();

    window.location.reload();
  };

  if (!open) {

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

      <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-[4px]" />

      {/* ================================================= */}
      {/* VIEWPORT */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[100] overflow-y-auto">

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

            <div className="relative w-full max-w-[740px] rounded-[32px] border border-white/[0.06] bg-[#071427] shadow-[0_0_80px_rgba(0,0,0,0.45)]">

              <div className="h-8 opacity-0">
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

                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                      Manual Trade Entry
                    </p>

                    <h2 className="mt-3 text-[34px] font-black tracking-tight text-white">
                      Add Trade
                    </h2>

                    <p className="mt-3 text-[14px] text-slate-400">
                      Create manual trade entries with institutional workflow precision.
                    </p>
                  </div>

                  {/* ================================================= */}
                  {/* ACTIONS */}
                  {/* ================================================= */}

                  <div className="flex items-center gap-3">

                    <button
                      onClick={handleSaveTrade}
                      className="flex h-[42px] w-[92px] items-center justify-center rounded-[12px] border border-blue-400/20 bg-blue-500/90 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-blue-400"
                    >
                      Save
                    </button>

                    <button
                      onClick={onClose}
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] text-[17px] font-bold text-slate-400 transition-all hover:border-white/[0.10] hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="w-[18px] shrink-0 opacity-0">
                  spacing
                </div>
              </div>

              {/* ================================================= */}
              {/* GAP */}
              {/* ================================================= */}

              <div className="h-10 opacity-0">
                spacing
              </div>

              {/* ================================================= */}
              {/* BODY */}
              {/* ================================================= */}

              <div className="px-5">

                <div className="rounded-[26px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] px-6 py-8">

                  <div className="flex">

                    <div className="w-[18px] shrink-0 opacity-0">
                      spacing
                    </div>

                    {/* ================================================= */}
                    {/* CONTENT */}
                    {/* ================================================= */}

                    <div className="flex-1">

                      {/* ================================================= */}
                      {/* HEADER */}
                      {/* ================================================= */}

                      <div>

                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Trade Details
                        </p>

                        <p className="mt-2 text-[13px] text-slate-400">
                          Configure manual trade execution details and workflow metadata.
                        </p>

                        <p className="mt-2 text-[13px] opacity-0">
                          Configure manual trade execution details and workflow metadata.
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

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Account
                            </p>

                            <div className="flex h-[60px] w-[240px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

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

                          {/* ASSET TYPE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Asset Type
                            </p>

                            <div className="flex h-[60px] w-[360px] items-center justify-center gap-[6px] rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-[10px]">

                              {[
                                "STOCKS",
                                "OPTIONS",
                                "FUTURES",
                                "CRYPTO",
                                "CFD",
                                "FOREX",
                              ].map((item) => (

                                <button
                                  key={item}
                                  onClick={() =>
                                    setAssetType(item)
                                  }
                                  className={`flex h-[32px] min-w-[52px] items-center justify-center rounded-[10px] px-[12px] text-[10px] font-black uppercase tracking-[0.08em] transition-all ${
                                    assetType === item
                                      ? "bg-blue-500 text-white"
                                      : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
                                  }`}
                                >
                                  {item}
                                </button>
                              ))}
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
                        {/* ROW 2 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-4">

                          {/* TICKER */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Ticker
                            </p>

                            <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

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

                            <div className="relative flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

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

                          {/* POSITION SIDE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Position Side
                            </p>

                            <div className="flex h-[60px] w-[190px] items-center justify-center gap-4 rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-2">

                              <button
                                onClick={() =>
                                  setSide("LONG")
                                }
                                className={`flex h-[32px] w-[68px] items-center justify-center rounded-[10px] text-[10px] font-black uppercase tracking-[0.08em] transition-all ${
                                  side === "LONG"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white/[0.04] text-slate-400"
                                }`}
                              >
                                Long
                              </button>

                              <button
                                onClick={() =>
                                  setSide("SHORT")
                                }
                                className={`flex h-[32px] w-[68px] items-center justify-center rounded-[10px] text-[10px] font-black uppercase tracking-[0.08em] transition-all ${
                                  side === "SHORT"
                                    ? "bg-red-500 text-white"
                                    : "bg-white/[0.04] text-slate-400"
                                }`}
                              >
                                Short
                              </button>
                            </div>
                          </div>

                          {/* QUANTITY */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Quantity
                            </p>

                            <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

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

                          {/* ENTRY */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Entry Price
                            </p>

                            <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
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

                          {/* EXIT */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Exit Price
                            </p>

                            <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
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

                            <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

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

                            <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-4">

                              <input
                                type="number"
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