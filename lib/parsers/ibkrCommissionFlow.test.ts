import { describe, expect, it } from "vitest";

import { parseIBKRCsv } from "./ibkrParser";
import { pairTrades } from "./pairTrades";

// =================================================
// FLEX EXECUTION ROW
// =================================================

interface FlexExecutionRow {
  dateTime: string;
  ticker: string;
  symbol: string;
  description: string;
  price: string;
  quantity: string;
  netCash: string;
  commission: string;
  action: "BUY" | "SELL";
  execId: string;
}

// =================================================
// FLEX CSV BUILDER
// =================================================

function buildFlexCsv(
  rows: FlexExecutionRow[]
): string {
  const headers = [
    "LevelOfDetail",
    "ClientAccountID",
    "Date/Time",
    "UnderlyingSymbol",
    "Symbol",
    "Description",
    "Price",
    "Quantity",
    "NetCash",
    "Commission",
    "Multiplier",
    "CurrencyPrimary",
    "CommissionCurrency",
    "Buy/Sell",
    "AssetClass",
    "ExecID",
  ];

  const csvRows = rows.map((row) =>
    [
      "EXECUTION",
      "U123",
      row.dateTime,
      row.ticker,
      row.symbol,
      row.description,
      row.price,
      row.quantity,
      row.netCash,
      row.commission,
      "100",
      "USD",
      "USD",
      row.action,
      "OPT",
      row.execId,
    ].join(",")
  );

  return [
    headers.join(","),
    ...csvRows,
  ].join("\n");
}

// =================================================
// IBKR COMMISSION END-TO-END ACCOUNTING
// =================================================

describe("IBKR commission end-to-end accounting", () => {

  it("preserves actual Flex commission credits and charges through FIFO pairing", async () => {

    const csv = buildFlexCsv([

      // =========================================
      // BLNK OPENING BUY
      // June 1, 2026
      // 3 contracts
      // Commission credit
      // =========================================

      {
        dateTime: "20260601;123206",
        ticker: "BLNK",
        symbol: "BLNK  280121C00001000",
        description: "BLNK 21JAN28 1 C",
        price: "0.42",
        quantity: "3",
        netCash: "-124.94475",
        commission: "1.05525",
        action: "BUY",
        execId: "blnk-buy",
      },

      // =========================================
      // GPRO OPENING BUY
      // September 8, 2026
      // 1 contract
      // Commission credit
      // =========================================

      {
        dateTime: "20260908;103010",
        ticker: "GPRO",
        symbol: "GPRO  280121C00001000",
        description: "GPRO 21JAN28 1 C",
        price: "0.72",
        quantity: "1",
        netCash: "-71.98006",
        commission: "0.01994",
        action: "BUY",
        execId: "gpro-buy",
      },

      // =========================================
      // BLNK CLOSING SELL #1
      // November 16, 2026
      // Commission charge
      // =========================================

      {
        dateTime: "20261116;134358",
        ticker: "BLNK",
        symbol: "BLNK  280121C00001000",
        description: "BLNK 21JAN28 1 C",
        price: "0.11",
        quantity: "-1",
        netCash: "9.9716134",
        commission: "-1.0283866",
        action: "SELL",
        execId: "blnk-sell-1",
      },

      // =========================================
      // BLNK CLOSING SELL #2
      // Commission charge
      // =========================================

      {
        dateTime: "20261116;134358",
        ticker: "BLNK",
        symbol: "BLNK  280121C00001000",
        description: "BLNK 21JAN28 1 C",
        price: "0.11",
        quantity: "-1",
        netCash: "10.6716134",
        commission: "-0.3283866",
        action: "SELL",
        execId: "blnk-sell-2",
      },

      // =========================================
      // BLNK CLOSING SELL #3
      // Commission charge
      // =========================================

      {
        dateTime: "20261116;134358",
        ticker: "BLNK",
        symbol: "BLNK  280121C00001000",
        description: "BLNK 21JAN28 1 C",
        price: "0.11",
        quantity: "-1",
        netCash: "10.3216134",
        commission: "-0.6783866",
        action: "SELL",
        execId: "blnk-sell-3",
      },

      // =========================================
      // GPRO CLOSING SELL
      // November 16, 2026
      // Commission charge
      // =========================================

      {
        dateTime: "20261116;134520",
        ticker: "GPRO",
        symbol: "GPRO  280121C00001000",
        description: "GPRO 21JAN28 1 C",
        price: "0.12",
        quantity: "-1",
        netCash: "10.9594728",
        commission: "-1.0405272",
        action: "SELL",
        execId: "gpro-sell",
      },

    ]);

    // ============================================
    // PARSER VERIFICATION
    // ============================================

    const executions =
      await parseIBKRCsv(csv);

    expect(executions).toHaveLength(6);

    expect(
      executions.map(
        (execution) => execution.fees
      )
    ).toEqual([
      -1.05525,
      -0.01994,
      1.0283866,
      0.3283866,
      0.6783866,
      1.0405272,
    ]);

    // ============================================
    // FIFO PAIRING
    // ============================================

    const trades =
      pairTrades(executions);

    const closedTrades =
      trades.filter(
        (trade) => !trade.isOpen
      );

    expect(closedTrades).toHaveLength(4);

    // ============================================
    // BLNK COMMISSION ALLOCATION
    // ============================================

    const blnkTrades =
      closedTrades
        .filter(
          (trade) => trade.ticker === "BLNK"
        )
        .map(
          (trade) => trade.fees
        )
        .sort(
          (a, b) => a - b
        );

    expect(blnkTrades).toHaveLength(3);

    expect(blnkTrades[0]).toBeCloseTo(
      -0.0233634,
      8
    );

    expect(blnkTrades[1]).toBeCloseTo(
      0.3266366,
      8
    );

    expect(blnkTrades[2]).toBeCloseTo(
      0.6766366,
      8
    );

    // ============================================
    // GPRO COMMISSION ALLOCATION
    // ============================================

    const gproTrades =
      closedTrades.filter(
        (trade) => trade.ticker === "GPRO"
      );

    expect(gproTrades).toHaveLength(1);

    expect(gproTrades[0].fees).toBeCloseTo(
      1.0205872,
      8
    );

    // ============================================
    // AGGREGATE ACCOUNTING
    // ============================================

    const totalFees =
      closedTrades.reduce(
        (sum, trade) => sum + trade.fees,
        0
      );

    const totalNetPnL =
      closedTrades.reduce(
        (sum, trade) => sum + trade.pnl,
        0
      );

    const totalGrossPnL =
      totalNetPnL + totalFees;

    expect(totalFees).toBeCloseTo(
      2.000497,
      8
    );

    expect(totalGrossPnL).toBeCloseTo(
      -153,
      8
    );

    expect(totalNetPnL).toBeCloseTo(
      -155.000497,
      8
    );

  });

});