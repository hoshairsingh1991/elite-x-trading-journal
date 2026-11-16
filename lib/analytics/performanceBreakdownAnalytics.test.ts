
import { describe, expect, it } from "vitest";

import type { Trade } from "@/types/trade";

import {
  generatePerformanceBreakdownAnalytics,
} from "./performanceBreakdownAnalytics";

// =================================================
// TEST TRADE BUILDER
// =================================================

function makeTrade(
  overrides: Partial<Trade> = {}
): Trade {
  return {
    id: "test-trade-001",

    ticker: "QQQ",

    side: "LONG",

    status: "WIN",

    date: "2026-11-16",

    entryPrice: 1.00,

    exitPrice: 2.00,

    quantity: 1,

    pnl: 100,

    fees: 0,

    currency: "USD",

    feeCurrency: "USD",

    isOpen: false,

    openedAt: "2026-11-16T09:30:00",

    closedAt: "2026-11-16T09:35:00",

    createdAt: "2026-11-16T09:30:00",

    updatedAt: "2026-11-16T09:35:00",

    ...overrides,
  };
}

// =================================================
// PERFORMANCE BREAKDOWN — SIGNED COMMISSIONS
// =================================================

describe("generatePerformanceBreakdownAnalytics — signed commissions", () => {
  it("reconstructs gross P&L correctly when commission credits exceed expenses", () => {
    const trades = [
      makeTrade({
        pnl: 102,
        fees: -2,
      }),
    ];

    const result =
      generatePerformanceBreakdownAnalytics(trades);

    expect(result.commissions).toBe(-2);
    expect(result.realizedCommissions).toBe(-2);
    expect(result.netTradingPnL).toBe(102);
    expect(result.grossPnL).toBe(100);
  });

  it("reconstructs gross P&L correctly when commission expenses exceed credits", () => {
    const trades = [
      makeTrade({
        pnl: 98,
        fees: 2,
      }),
    ];

    const result =
      generatePerformanceBreakdownAnalytics(trades);

    expect(result.commissions).toBe(2);
    expect(result.realizedCommissions).toBe(2);
    expect(result.netTradingPnL).toBe(98);
    expect(result.grossPnL).toBe(100);
  });

  it("excludes open-position commissions from realized commissions", () => {
    const trades = [
      makeTrade({
        id: "closed-trade",
        fees: 2,
        isOpen: false,
        status: "WIN",
      }),

      makeTrade({
        id: "open-trade",
        fees: 5,
        isOpen: true,
        status: "OPEN",
        closedAt: undefined,
      }),
    ];

    const result =
      generatePerformanceBreakdownAnalytics(trades);

    // All commissions include open and completed trades.
    expect(result.commissions).toBe(7);

    // Realized commissions include completed trades only.
    expect(result.realizedCommissions).toBe(2);
  });
});
