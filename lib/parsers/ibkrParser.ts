import Papa from "papaparse";

export interface ParsedTrade {
  id: string;
  date: string;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: number;
  pnl: number;
  fees: number;
  account: string;
  tradeType: string;
  result: "Win" | "Loss";
  status: "Closed";
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
            rows.filter(
              (row) =>
                row.LevelOfDetail ===
                "EXECUTION"
            );

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

                  return {

                    id: String(index),

                    date:
                      row["Date/Time"] ||
                      "",

                    symbol:
                      cleanSymbol,

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

                    pnl: netCash,

                    fees,

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
                  };
                }
              );

          console.log(
            "NORMALIZED TRADES:"
          );

          console.table(
            normalizedTrades
          );

          resolve(
            normalizedTrades
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