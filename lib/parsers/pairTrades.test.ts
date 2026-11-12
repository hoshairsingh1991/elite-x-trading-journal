import { describe, expect, it } from "vitest";

import type { NormalizedExecution } from "@/types/trade";
import { pairTrades } from "./pairTrades";

type ExecutionOverrides = Partial<NormalizedExecution> &
  Pick<
    NormalizedExecution,
    | "id"
    | "action"
    | "quantity"
    | "executionPrice"
    | "executionTimestamp"
    | "fees"
  >;

function makeExecution(
  overrides: ExecutionOverrides
): NormalizedExecution {
  return {
    id: overrides.id,
    brokerExecutionId:
      overrides.brokerExecutionId ?? `exec-${overrides.id}`,

    date: overrides.date ?? "2026-11-11",
    executionTimestamp: overrides.executionTimestamp,

    ticker: overrides.ticker ?? "QQQ",
    contract: overrides.contract ?? "QQQ 688C 20261111",
    contractKey: overrides.contractKey ?? "QQQ_688C_20261111",

    exchange: overrides.exchange,

    action: overrides.action,
    quantity: overrides.quantity,

    executionPrice: overrides.executionPrice,
    executionValue: overrides.executionValue ?? 0,

    fees: overrides.fees,

    currency: overrides.currency ?? "USD",
    feeCurrency: overrides.feeCurrency ?? "USD",

    account: overrides.account ?? "IBKR",
    assetType: overrides.assetType ?? "Options",
    multiplier: overrides.multiplier ?? 100,
  };
}

describe("pairTrades — broker commission allocation", () => {
  it("allocates one two-contract entry commission across separate exits", () => {
    const executions = [
      makeExecution({
        id: "buy-2",
        action: "BUY",
        quantity: 2,
        executionPrice: 1.0,
        fees: 1.05,
        executionTimestamp: "2026-11-11T09:30:00",
      }),

      makeExecution({
        id: "sell-1",
        action: "SELL",
        quantity: 1,
        executionPrice: 1.1,
        fees: 0.35,
        executionTimestamp: "2026-11-11T09:31:00",
      }),

      makeExecution({
        id: "sell-2",
        action: "SELL",
        quantity: 1,
        executionPrice: 1.1,
        fees: 0.35,
        executionTimestamp: "2026-11-11T09:32:00",
      }),
    ];

    const trades = pairTrades(executions);
    const closedTrades = trades.filter((trade) => !trade.isOpen);

    expect(closedTrades).toHaveLength(2);

    expect(closedTrades[0].fees).toBeCloseTo(0.875, 8);
    expect(closedTrades[1].fees).toBeCloseTo(0.875, 8);

    const totalFees = trades.reduce(
      (total, trade) => total + trade.fees,
      0
    );

    expect(totalFees).toBeCloseTo(1.75, 8);
  });

  it("allocates one two-contract exit commission across separate FIFO entry lots", () => {
    const executions = [
      makeExecution({
        id: "buy-1",
        action: "BUY",
        quantity: 1,
        executionPrice: 1.0,
        fees: 0.5,
        executionTimestamp: "2026-11-11T09:30:00",
      }),

      makeExecution({
        id: "buy-2",
        action: "BUY",
        quantity: 1,
        executionPrice: 1.0,
        fees: 0.5,
        executionTimestamp: "2026-11-11T09:31:00",
      }),

      makeExecution({
        id: "sell-2",
        action: "SELL",
        quantity: 2,
        executionPrice: 1.1,
        fees: 0.8,
        executionTimestamp: "2026-11-11T09:32:00",
      }),
    ];

    const trades = pairTrades(executions);
    const closedTrades = trades.filter((trade) => !trade.isOpen);

    expect(closedTrades).toHaveLength(2);

    expect(closedTrades[0].fees).toBeCloseTo(0.9, 8);
    expect(closedTrades[1].fees).toBeCloseTo(0.9, 8);

    const totalFees = trades.reduce(
      (total, trade) => total + trade.fees,
      0
    );

    expect(totalFees).toBeCloseTo(1.8, 8);
  });

  it("preserves only the unallocated entry commission after a partial exit", () => {
    const executions = [
      makeExecution({
        id: "buy-2",
        action: "BUY",
        quantity: 2,
        executionPrice: 1.0,
        fees: 1.0,
        executionTimestamp: "2026-11-11T09:30:00",
      }),

      makeExecution({
        id: "sell-1",
        action: "SELL",
        quantity: 1,
        executionPrice: 1.1,
        fees: 0.4,
        executionTimestamp: "2026-11-11T09:31:00",
      }),
    ];

    const trades = pairTrades(executions);

    const closedTrade = trades.find((trade) => !trade.isOpen);
    const openTrade = trades.find((trade) => trade.isOpen);

    expect(closedTrade).toBeDefined();
    expect(openTrade).toBeDefined();

    expect(closedTrade!.quantity).toBe(1);
    expect(closedTrade!.fees).toBeCloseTo(0.9, 8);

    expect(openTrade!.quantity).toBe(1);
    expect(openTrade!.fees).toBeCloseTo(0.5, 8);

    const totalFees = trades.reduce(
      (total, trade) => total + trade.fees,
      0
    );

    expect(totalFees).toBeCloseTo(1.4, 8);
  });

  it("allocates reversal execution commission between the closed and newly opened positions", () => {
    const executions = [
      makeExecution({
        id: "buy-1",
        action: "BUY",
        quantity: 1,
        executionPrice: 1.0,
        fees: 0.2,
        executionTimestamp: "2026-11-11T09:30:00",
      }),

      makeExecution({
        id: "sell-2",
        action: "SELL",
        quantity: 2,
        executionPrice: 1.1,
        fees: 0.6,
        executionTimestamp: "2026-11-11T09:31:00",
      }),
    ];

    const trades = pairTrades(executions);

    const closedTrade = trades.find((trade) => !trade.isOpen);
    const openTrade = trades.find((trade) => trade.isOpen);

    expect(closedTrade).toBeDefined();
    expect(openTrade).toBeDefined();

    expect(closedTrade!.side).toBe("LONG");
    expect(closedTrade!.quantity).toBe(1);
    expect(closedTrade!.fees).toBeCloseTo(0.5, 8);

    expect(openTrade!.side).toBe("SHORT");
    expect(openTrade!.quantity).toBe(1);
    expect(openTrade!.fees).toBeCloseTo(0.3, 8);

    const totalFees = trades.reduce(
      (total, trade) => total + trade.fees,
      0
    );

    expect(totalFees).toBeCloseTo(0.8, 8);
  });
});
