import { ParsedTrade } from "./ibkrParser";

export interface PairedTrade {
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
  status: "Open" | "Closed";
}

export function pairTrades(
  executions: ParsedTrade[]
): PairedTrade[] {

  const finalTrades:
    PairedTrade[] = [];

  const openPositions:
    Record<string, ParsedTrade[]> = {};

  executions.forEach(
    (execution, index) => {

      const contractKey =
        execution.contract;

      if (
        !openPositions[
          contractKey
        ]
      ) {

        openPositions[
          contractKey
        ] = [];
      }

      // =====================================
      // LONG ENTRY
      // =====================================

      if (
        execution.side === "LONG"
      ) {

        openPositions[
          contractKey
        ].push(execution);
      }

      // =====================================
      // SHORT EXIT
      // =====================================

      else {

        const entryTrade =
          openPositions[
            contractKey
          ].shift();

        if (entryTrade) {

          // =====================================
          // REALIZED CLOSED TRADE
          // =====================================

          const realizedPnL =
            entryTrade.pnl +
            execution.pnl;

          const totalFees =
            entryTrade.fees +
            execution.fees;

          finalTrades.push({

            id: String(index),

            date:
              entryTrade.date,

            symbol:
              execution.symbol,

            contract:
              execution.contract,

            side: "LONG",

            quantity:
              execution.quantity,

            pnl:
              Number(
                realizedPnL.toFixed(2)
              ),

            fees:
              Number(
                totalFees.toFixed(2)
              ),

            account:
              execution.account,

            tradeType:
              execution.tradeType,

            result:
              realizedPnL >= 0
                ? "Win"
                : "Loss",

            status: "Closed",
          });
        }

        // =====================================
        // UNMATCHED SHORT
        // =====================================

        else {

          finalTrades.push({

            id: String(index),

            date:
              execution.date,

            symbol:
              execution.symbol,

            contract:
              execution.contract,

            side:
              execution.side,

            quantity:
              execution.quantity,

            pnl:
              -execution.fees,

            fees:
              execution.fees,

            account:
              execution.account,

            tradeType:
              execution.tradeType,

            result: "Loss",

            status: "Open",
          });
        }
      }
    }
  );

  // =====================================
  // REMAINING OPEN POSITIONS
  // =====================================

  Object.values(
    openPositions
  ).forEach((positions) => {

    positions.forEach(
      (position, index) => {

        finalTrades.push({

          id:
            `open-${index}`,

          date:
            position.date,

          symbol:
            position.symbol,

          contract:
            position.contract,

          side:
            position.side,

          quantity:
            position.quantity,

          // =====================================
          // OPEN POSITION ACCOUNTING
          // ONLY COMMISSIONS COUNT
          // =====================================

          pnl:
            -position.fees,

          fees:
            position.fees,

          account:
            position.account,

          tradeType:
            position.tradeType,

          result: "Loss",

          status: "Open",
        });
      }
    );
  });

  return finalTrades;
}