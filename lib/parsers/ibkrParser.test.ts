import { describe, expect, it } from "vitest";
import { parseIBKRCsv } from "./ibkrParser";

describe("parseIBKRCsv — commission precision", () => {
  it("preserves the original IBKR commission precision", async () => {
    const csv = [
      [
        "LevelOfDetail",
        "ClientAccountID",
        "Date/Time",
        "UnderlyingSymbol",
        "Symbol",
        "Description",
        "T. Price",
        "Quantity",
        "NetCash",
        "Commission",
        "Multiplier",
        "CurrencyPrimary",
        "CommissionCurrency",
        "Buy/Sell",
        "AssetClass",
        "ExecID",
      ].join(","),

      [
        "EXECUTION",
        "U123",
        "20261111 09:30:00",
        "QQQ",
        "QQQ",
        "QQQ 11NOV26 688 C",
        "1.95",
        "2",
        "-390",
        "-1.045142",
        "100",
        "USD",
        "USD",
        "BUY",
        "OPT",
        "exec-precision-001",
      ].join(","),
    ].join("\n");

    const executions = await parseIBKRCsv(csv);

    expect(executions).toHaveLength(1);

    expect(executions[0].brokerExecutionId).toBe(
      "exec-precision-001"
    );

    expect(executions[0].quantity).toBe(2);

    expect(executions[0].fees).toBe(1.045142);
  });
});
