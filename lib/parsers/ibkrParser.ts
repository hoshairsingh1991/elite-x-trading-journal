import Papa from "papaparse";

import { pairTrades } from "./pairTrades";

import {
  NormalizedExecution,
  Trade,
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
  file: File
): Promise<Trade[]> {

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

                  const rawDate =
                    row["Date/Time"] || "";

                  const year =
                    rawDate.slice(0, 4);

                  const month =
                    rawDate.slice(4, 6);

                  const day =
                    rawDate.slice(6, 8);

                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];

                  const formattedDate =
                    `${monthNames[
                      Number(month) - 1
                    ]} ${Number(day)}, ${year}`;

                  const ticker =
                    row.UnderlyingSymbol ||
                    row.Symbol ||
                    "UNKNOWN";

                  const contract =
                    row.Description ||
                    row.Symbol ||
                    ticker;

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

                  return {

                    id:
                      `${ticker}-${index}`,

                    date:
                      formattedDate,

                    ticker,

                    contract,

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

          const pairedTrades =
            pairTrades(
              normalizedExecutions
            );

          console.log(
            "NORMALIZED TRADES"
          );

          console.table(
            pairedTrades
          );

          resolve(
            pairedTrades
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