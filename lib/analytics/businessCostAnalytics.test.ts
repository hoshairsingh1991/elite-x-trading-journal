
import { describe, expect, it } from "vitest";

import type { Trade } from "@/types/trade";

import {
  calculateTotalCommissions,
} from "./businessCostAnalytics";

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
// BUSINESS COST ANALYTICS — REALIZED COMMISSIONS
// =================================================

describe("calculateTotalCommissions", () => {
  it("includes commissions from completed trades", () => {
    const trades = [
      makeTrade({
        id: "trade-1",
        fees: 2,
      }),
      makeTrade({
        id: "trade-2",
        fees: 3,
      }),
    ];

    expect(calculateTotalCommissions(trades)).toBe(5);
  });

  it("excludes commissions from open trades", () => {
    const trades = [
      makeTrade({
        id: "completed-trade",
        fees: 2,
      }),
      makeTrade({
        id: "open-trade",
        fees: 5,
        status: "OPEN",
        isOpen: true,
        closedAt: undefined,
      }),
    ];

    expect(calculateTotalCommissions(trades)).toBe(2);
  });

  it("preserves commission credits when aggregating signed fees", () => {
    const trades = [
      makeTrade({
        id: "commission-credit",
        fees: -5,
      }),
      makeTrade({
        id: "commission-expense",
        fees: 2,
      }),
    ];

    // Signed total: -5 + 2 = -3.
    // Displayed commission cost: absolute value = 3.
    expect(calculateTotalCommissions(trades)).toBe(3);
  });

  it("matches Dashboard realized commissions for mixed completed and open trades", () => {
    const trades = [
      makeTrade({
        id: "completed-expense",
        fees: 2,
      }),
      makeTrade({
        id: "completed-credit",
        fees: -1,
      }),
      makeTrade({
        id: "open-position",
        fees: 5,
        status: "OPEN",
        isOpen: true,
        closedAt: undefined,
      }),
    ];

    // Dashboard: Math.abs(-1 + 2) = 1.
    // Expenses must produce the same result.
    expect(calculateTotalCommissions(trades)).toBe(1);
  });

  it("returns zero when there are no completed trades", () => {
    const trades = [
      makeTrade({
        id: "open-trade",
        fees: 5,
        status: "OPEN",
        isOpen: true,
        closedAt: undefined,
      }),
    ];

    expect(calculateTotalCommissions(trades)).toBe(0);
  });

  it("returns zero for an empty trade list", () => {
    expect(calculateTotalCommissions([])).toBe(0);
  });
});
