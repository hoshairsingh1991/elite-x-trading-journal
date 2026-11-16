import { describe, expect, it } from "vitest";
import { parseIBKRCsv } from "./ibkrParser";

// =================================================
// TEST CSV BUILDER
// =================================================

function createExecutionCsv(
  commission: string,
  execId: string
): string {
  return [
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
      commission,
      "100",
      "USD",
      "USD",
      "BUY",
      "OPT",
      execId,
    ].join(","),
  ].join("\n");
}

// =================================================
// IBKR COMMISSION NORMALIZATION TESTS
// =================================================

describe("parseIBKRCsv — commission normalization", () => {

  it("converts negative IBKR commissions into positive Elite X fees", async () => {
    const csv = createExecutionCsv(
      "-1.045142",
      "exec-precision-001"
    );

    const executions = await parseIBKRCsv(csv);

    expect(executions).toHaveLength(1);

    expect(executions[0].brokerExecutionId).toBe(
      "exec-precision-001"
    );

    expect(executions[0].quantity).toBe(2);

    expect(executions[0].fees).toBe(1.045142);
  });

  it("converts positive IBKR commissions into negative Elite X fees (credits)", async () => {
    const csv = createExecutionCsv(
      "1.045142",
      "exec-credit-001"
    );

    const executions = await parseIBKRCsv(csv);

    expect(executions).toHaveLength(1);

    expect(executions[0].brokerExecutionId).toBe(
      "exec-credit-001"
    );

    expect(executions[0].quantity).toBe(2);

    expect(executions[0].fees).toBe(-1.045142);
  });

});