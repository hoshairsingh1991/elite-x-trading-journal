import Papa from "papaparse";

import { pairTrades } from "./pairTrades";

import {
  NormalizedExecution,
} from "@/types/trade";


// =================================================
// HELPERS
// =================================================

function parseNumber(
  value: any,
  fallback = 0
): number {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {

    return fallback;
  }

  const cleanedValue = String(value)
    .replace(/[$,]/g, "")
    .trim();

  const parsed = Number(cleanedValue);

  return Number.isNaN(parsed)
    ? fallback
    : parsed;
}

// =================================================
// FORMAT ASSET TYPE
// =================================================

function formatAssetType(
  assetClass: string
): string {

  switch (assetClass) {

    case "OPT":
      return "Options";

    case "STK":
      return "Stocks";

    case "FUT":
      return "Futures";

    case "CASH":
      return "Forex";

    case "CRYPTO":
      return "Crypto";

    default:
      return assetClass || "Trade";
  }
}

// =================================================
// IBKR CSV PARSER
// =================================================

export async function parseIBKRCsv(
  file: File | string
): Promise<NormalizedExecution[]> {

  return new Promise((resolve, reject) => {

    Papa.parse(file, {

      header: true,

      skipEmptyLines: true,

      complete: (results) => {

        try {

          const rows =
            results.data as any[];

          // =================================================
          // FILTER EXECUTION ROWS
          // =================================================

          const executionRows =
            rows.filter((row) => {

              const isExecution =
                row.LevelOfDetail ===
                "EXECUTION";

              const symbol =
                row.UnderlyingSymbol ||
                row.Symbol ||
                "";

              const isForexConversion =
                symbol.includes("USD.CAD") ||
                symbol.includes("CAD.USD");

              return (
                isExecution &&
                !isForexConversion
              );
            });

          // =================================================
          // NORMALIZE EXECUTIONS
          // =================================================

          const normalizedExecutions:
            NormalizedExecution[] =
              executionRows.map(
                (row, index) => {

const rawExecutionTimestamp =
  (row["Date/Time"] || "").trim();

const year =
  rawExecutionTimestamp.slice(0, 4);

const month =
  rawExecutionTimestamp.slice(4, 6);

const day =
  rawExecutionTimestamp.slice(6, 8);

const hour =
  rawExecutionTimestamp.slice(9, 11);

const minute =
  rawExecutionTimestamp.slice(11, 13);

const second =
  rawExecutionTimestamp.slice(13, 15);

const formattedDate =
  `${year}-${month}-${day}`;

const executionTimestamp =
  `${year}-${month}-${day}T${hour}:${minute}:${second}`;

                  const ticker =
                    row.UnderlyingSymbol ||
                    row.Symbol ||
                    "UNKNOWN";

                  const contract =
                    row.Description ||
                    row.Symbol ||
                    ticker;

                  const contractKey =
                    contract
                      .replace(/\s+/g, "_")
                      .toUpperCase();

                  // =================================================
// FIXED PRICE MAPPING
// =================================================

const executionPrice =
  parseNumber(
    row["T. Price"] ||
    row["Trade Price"] ||
    row["TradePrice"] ||
    row["Price"]
  );

const quantity =
  Math.abs(
    parseNumber(
      row.Quantity
    )
  );

const executionValue =
  parseNumber(
    row.NetCash
  );

const fees =
  Math.abs(
    parseNumber(
      row.Commission
    )
  );

const multiplier =
  parseNumber(
    row.Multiplier,
    100
  );

// =================================================
// CURRENCY
// =================================================

const currency =
  row.CurrencyPrimary ||
  row.Currency ||
  "USD";

const feeCurrency =
  row.CommissionCurrency ||
  currency;


// =================================================
// NORMALIZED EXECUTION
// =================================================

return {

  id:
`${row.ClientAccountID || "IBKR"}-${rawExecutionTimestamp}-${ticker}-${contractKey}-${row["Buy/Sell"]}-${quantity}-${executionPrice}-${executionValue}`,

brokerExecutionId:
  row.ExecID ||
  undefined,

date:
  formattedDate,

executionTimestamp,

ticker,

  contract,

  contractKey,

  side:
    row["Buy/Sell"] ===
    "BUY"
      ? "LONG"
      : "SHORT",

  quantity,

  executionPrice,

  executionValue,

  fees:
    Number(
      fees.toFixed(2)
    ),

  currency,

  feeCurrency,

  account:
    row.ClientAccountID ||
    "IBKR",

  assetType:
    formatAssetType(
      row.AssetClass
    ),

  multiplier,
};
}
);

          // =================================================
          // PAIR EXECUTIONS
          // =================================================

resolve(
  normalizedExecutions
);

        } catch (error) {

          reject(error);
        }
      },

      error: (error) => {

        reject(error);
      },
    });
  });
}