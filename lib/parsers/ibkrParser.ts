import Papa from "papaparse";

import { pairTrades } from "./pairTrades";

export interface ParsedTrade {
  id: string;
  date: string;
  symbol: string;
  contract: string;
  side: "LONG" | "SHORT";
  quantity: number;
  pnl: number;
  fees: number;
  account: string;
  tradeType: string;
  result: "Win" | "Loss";
  status: "Closed";
  price: number;
  multiplier: number;
}

export async function parseIBKRCsv(
  file: File
): Promise<ParsedTrade[]> {

  return new Promise((resolve, reject) => {

    Papa.parse(file, {

      header: true,

      skipEmptyLines: true,

      complete: (results) => {

        try {

          const rows =
            results.data as any[];

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

          const normalizedTrades:
            ParsedTrade[] =
              executionRows.map(
                (row, index) => {

                  const netCash =
                    Number(
                      row.NetCash || 0
                    );

                  const fees =
                    Math.abs(
                      Number(
                        row.Commission || 0
                      )
                    );

                  const cleanSymbol =
                    row.UnderlyingSymbol ||
                    row.Symbol;

                  const fullContract =
                    row.Description ||
                    cleanSymbol;

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

                  const executionPrice =
                    Number(
                      row.TradePrice || 0
                    );

                  const multiplier =
                    Number(
                      row.Multiplier || 100
                    );

                  return {

                    id: String(index),

                    date:
                      formattedDate,

                    symbol:
                      cleanSymbol,

                    contract:
                      fullContract,

                    side:
                      row["Buy/Sell"] ===
                      "BUY"
                        ? "LONG"
                        : "SHORT",

                    quantity:
                      Math.abs(
                        Number(
                          row.Quantity || 0
                        )
                      ),

                    pnl:
                      Number(
                        netCash.toFixed(2)
                      ),

                    fees:
                      Number(
                        fees.toFixed(2)
                      ),

                    account:
                      row.ClientAccountID ||
                      "IBKR",

                    tradeType:
                      row.AssetClass ===
                      "OPT"
                        ? "Options"
                        : row.AssetClass,

                    result:
                      netCash >= 0
                        ? "Win"
                        : "Loss",

                    status: "Closed",

                    price:
                      executionPrice,

                    multiplier,
                  };
                }
              );

          const pairedTrades =
            pairTrades(
              normalizedTrades
            );

          console.log(
            "PAIRED TRADES:"
          );

          console.table(
            pairedTrades
          );

          resolve(
            pairedTrades as ParsedTrade[]
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