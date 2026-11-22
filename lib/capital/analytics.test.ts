import { describe, expect, it } from "vitest";

import {
  getCapitalActivitySummary,
  getMonthlyFundingActivity,
} from "@/lib/capital/analytics";

import type {
  CapitalTransaction,
} from "@/lib/capital/types";

const createTransaction = (
  overrides: Partial<CapitalTransaction> = {}
): CapitalTransaction => ({
  id: "TX-001",
  date: "2026-01-15",
  effectiveDate: null,
  type: "DEPOSIT",
  status: "COMPLETED",
  amount: 1000,
  currency: "CAD",
  fromAccountId: null,
  toAccountId: "account-1",
  receivedAmount: null,
  receivedCurrency: null,
  exchangeRate: null,
  method: "Bank Transfer",
  counterpartyInstitution: "Test Bank",
  referenceNumber: "",
  notes: "",
  reversalOfTransactionId: null,
  reversalReason: null,
  createdAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
  ...overrides,
});

describe("getMonthlyFundingActivity", () => {
  it("groups deposits and withdrawals by month and currency", () => {
    const transactions = [
      createTransaction({
        id: "TX-001",
        date: "2026-01-10",
        amount: 1000,
        currency: "CAD",
      }),
      createTransaction({
        id: "TX-002",
        date: "2026-01-20",
        type: "WITHDRAWAL",
        amount: 250,
        currency: "CAD",
      }),
      createTransaction({
        id: "TX-003",
        date: "2026-01-25",
        amount: 500,
        currency: "USD",
      }),
      createTransaction({
        id: "TX-004",
        date: "2026-02-05",
        amount: 2000,
        currency: "CAD",
      }),
    ];

    const result = getMonthlyFundingActivity(
      transactions,
      "2026-01-01",
      "2026-02-28"
    );

    expect(result).toContainEqual({
      month: "2026-01",
      monthLabel: "Jan",
      currency: "CAD",
      deposits: 1000,
      withdrawals: 250,
    });

    expect(result).toContainEqual({
      month: "2026-01",
      monthLabel: "Jan",
      currency: "USD",
      deposits: 500,
      withdrawals: 0,
    });

    expect(result).toContainEqual({
      month: "2026-02",
      monthLabel: "Feb",
      currency: "CAD",
      deposits: 2000,
      withdrawals: 0,
    });
  });

  it("includes months with no activity as zero-value entries", () => {
    const result = getMonthlyFundingActivity(
      [
        createTransaction({
          date: "2026-01-10",
          amount: 1000,
        }),
      ],
      "2026-01-01",
      "2026-03-31"
    );

    const marchCAD = result.find(
      (item) =>
        item.month === "2026-03" &&
        item.currency === "CAD"
    );

    expect(marchCAD).toEqual({
      month: "2026-03",
      monthLabel: "Mar",
      currency: "CAD",
      deposits: 0,
      withdrawals: 0,
    });
  });

  it("excludes pending and cancelled transactions", () => {
    const transactions = [
      createTransaction({
        id: "TX-001",
        status: "COMPLETED",
        amount: 1000,
      }),
      createTransaction({
        id: "TX-002",
        status: "PENDING",
        amount: 5000,
      }),
      createTransaction({
        id: "TX-003",
        status: "CANCELLED",
        amount: 3000,
      }),
    ];

    const result = getMonthlyFundingActivity(
      transactions,
      "2026-01-01",
      "2026-01-31"
    );

    const januaryCAD = result.find(
      (item) =>
        item.month === "2026-01" &&
        item.currency === "CAD"
    );

    expect(januaryCAD?.deposits).toBe(1000);
  });

  it("excludes internal transfers from funding activity", () => {
    const transactions = [
      createTransaction({
        id: "TX-001",
        type: "DEPOSIT",
        amount: 1000,
      }),
      createTransaction({
        id: "TX-002",
        type: "TRANSFER",
        amount: 5000,
      }),
    ];

    const result = getMonthlyFundingActivity(
      transactions,
      "2026-01-01",
      "2026-01-31"
    );

    const januaryCAD = result.find(
      (item) =>
        item.month === "2026-01" &&
        item.currency === "CAD"
    );

    expect(januaryCAD?.deposits).toBe(1000);
    expect(januaryCAD?.withdrawals).toBe(0);
  });

  it("returns an empty array for an invalid or reversed date range", () => {
    expect(
      getMonthlyFundingActivity(
        [],
        "2026-03-01",
        "2026-01-01"
      )
    ).toEqual([]);

    expect(
      getMonthlyFundingActivity(
        [],
        "invalid-date",
        "2026-01-31"
      )
    ).toEqual([]);
  });
});

describe("getCapitalActivitySummary", () => {
  it("counts completed deposits, withdrawals, and transfers", () => {
    const transactions = [
      createTransaction({
        id: "TX-001",
        type: "DEPOSIT",
      }),
      createTransaction({
        id: "TX-002",
        type: "DEPOSIT",
      }),
      createTransaction({
        id: "TX-003",
        type: "WITHDRAWAL",
      }),
      createTransaction({
        id: "TX-004",
        type: "TRANSFER",
      }),
      createTransaction({
        id: "TX-005",
        type: "DEPOSIT",
        status: "PENDING",
      }),
    ];

    const result = getCapitalActivitySummary(transactions);

    expect(result.depositCount).toBe(2);
    expect(result.withdrawalCount).toBe(1);
    expect(result.transferCount).toBe(1);
    expect(result.totalCount).toBe(4);
  });

  it("finds the largest deposit and withdrawal separately by currency", () => {
    const transactions = [
      createTransaction({
        id: "CAD-001",
        amount: 1000,
        currency: "CAD",
      }),
      createTransaction({
        id: "CAD-002",
        amount: 2500,
        currency: "CAD",
      }),
      createTransaction({
        id: "USD-001",
        amount: 1500,
        currency: "USD",
      }),
      createTransaction({
        id: "CAD-W-001",
        type: "WITHDRAWAL",
        amount: 300,
        currency: "CAD",
      }),
      createTransaction({
        id: "CAD-W-002",
        type: "WITHDRAWAL",
        amount: 800,
        currency: "CAD",
      }),
      createTransaction({
        id: "USD-W-001",
        type: "WITHDRAWAL",
        amount: 400,
        currency: "USD",
      }),
    ];

    const result = getCapitalActivitySummary(transactions);

    expect(result.largestDeposits).toEqual([
      {
        id: "CAD-002",
        date: "2026-01-15",
        amount: 2500,
        currency: "CAD",
      },
      {
        id: "USD-001",
        date: "2026-01-15",
        amount: 1500,
        currency: "USD",
      },
    ]);

    expect(result.largestWithdrawals).toEqual([
      {
        id: "CAD-W-002",
        date: "2026-01-15",
        amount: 800,
        currency: "CAD",
      },
      {
        id: "USD-W-001",
        date: "2026-01-15",
        amount: 400,
        currency: "USD",
      },
    ]);
  });

  it("returns zero counts and empty largest-transaction lists when there is no activity", () => {
    const result = getCapitalActivitySummary([]);

    expect(result).toEqual({
      depositCount: 0,
      withdrawalCount: 0,
      transferCount: 0,
      totalCount: 0,
      largestDeposits: [],
      largestWithdrawals: [],
    });
  });

  it("does not compare pending transactions when finding largest transactions", () => {
    const transactions = [
      createTransaction({
        id: "TX-001",
        amount: 1000,
        status: "COMPLETED",
      }),
      createTransaction({
        id: "TX-002",
        amount: 10000,
        status: "PENDING",
      }),
    ];

    const result = getCapitalActivitySummary(transactions);

    expect(result.largestDeposits).toEqual([
      {
        id: "TX-001",
        date: "2026-01-15",
        amount: 1000,
        currency: "CAD",
      },
    ]);
  });
});