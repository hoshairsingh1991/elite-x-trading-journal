import {
  NormalizedExecution,
  Trade,
} from "@/types/trade";

// =================================================
// PAIR EXECUTIONS INTO TRADES
// =================================================

export function pairTrades(
  executions: NormalizedExecution[]
): Trade[] {

  const finalTrades: Trade[] = [];

  const openPositions:
    Record<
      string,
      NormalizedExecution[]
    > = {};

  executions.forEach(
    (execution, index) => {

      const contractKey =
        execution.contract;

      // =================================================
      // CREATE POSITION BUCKET
      // =================================================

      if (
        !openPositions[
          contractKey
        ]
      ) {

        openPositions[
          contractKey
        ] = [];
      }

      // =================================================
      // LONG ENTRY
      // =================================================

      if (
        execution.side === "LONG"
      ) {

        openPositions[
          contractKey
        ].push(execution);

        return;
      }

      // =================================================
      // SHORT EXIT
      // =================================================

      const entryExecution =
        openPositions[
          contractKey
        ].shift();

      // =================================================
      // CLOSED TRADE
      // =================================================

      if (entryExecution) {

        const realizedPnL =
          entryExecution.executionValue +
          execution.executionValue;

        const totalFees =
          entryExecution.fees +
          execution.fees;

        let status:
          | "WIN"
          | "LOSS"
          | "BREAKEVEN";

        if (realizedPnL > 0) {

          status = "WIN";

        } else if (
          realizedPnL < 0
        ) {

          status = "LOSS";

        } else {

          status =
            "BREAKEVEN";
        }

        finalTrades.push({

          id:
            `${contractKey}-closed-${index}`,

          // =================================================
          // BASIC INFO
          // =================================================

          ticker:
            execution.ticker,

          contract:
            execution.contract,

          side: "LONG",

          status,

          date:
            entryExecution.date,

          assetType:
            execution.assetType,

          account:
            execution.account,

          // =================================================
          // EXECUTION
          // =================================================

          entryPrice:
            entryExecution.executionPrice,

          exitPrice:
            execution.executionPrice,

          quantity:
            execution.quantity,

          // =================================================
          // PERFORMANCE
          // =================================================

          pnl:
            Number(
              realizedPnL.toFixed(2)
            ),

          fees:
            Number(
              totalFees.toFixed(2)
            ),

          // =================================================
          // OPEN POSITION SUPPORT
          // =================================================

          isOpen: false,

          openedAt:
            entryExecution.date,

          closedAt:
            execution.date,

          // =================================================
          // METADATA
          // =================================================

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        });
      }

      // =================================================
      // UNMATCHED SHORT
      // =================================================

      else {

        finalTrades.push({

          id:
            `${contractKey}-open-short-${index}`,

          // =================================================
          // BASIC INFO
          // =================================================

          ticker:
            execution.ticker,

          contract:
            execution.contract,

          side:
            execution.side,

          status: "OPEN",

          date:
            execution.date,

          assetType:
            execution.assetType,

          account:
            execution.account,

          // =================================================
          // EXECUTION
          // =================================================

          entryPrice:
            execution.executionPrice,

          exitPrice: null,

          quantity:
            execution.quantity,

          // =================================================
          // PERFORMANCE
          // =================================================

          pnl:
            -execution.fees,

          fees:
            execution.fees,

          // =================================================
          // OPEN POSITION SUPPORT
          // =================================================

          isOpen: true,

          openedAt:
            execution.date,

          closedAt: null,

          // =================================================
          // METADATA
          // =================================================

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        });
      }
    }
  );

  // =================================================
  // REMAINING OPEN POSITIONS
  // =================================================

  Object.entries(
    openPositions
  ).forEach(
    ([contractKey, positions]) => {

      positions.forEach(
        (position, index) => {

          finalTrades.push({

            id:
              `${contractKey}-remaining-open-${index}`,

            // =================================================
            // BASIC INFO
            // =================================================

            ticker:
              position.ticker,

            contract:
              position.contract,

            side:
              position.side,

            status: "OPEN",

            date:
              position.date,

            assetType:
              position.assetType,

            account:
              position.account,

            // =================================================
            // EXECUTION
            // =================================================

            entryPrice:
              position.executionPrice,

            exitPrice: null,

            quantity:
              position.quantity,

            // =================================================
            // PERFORMANCE
            // =================================================

            pnl:
              -position.fees,

            fees:
              position.fees,

            // =================================================
            // OPEN POSITION SUPPORT
            // =================================================

            isOpen: true,

            openedAt:
              position.date,

            closedAt: null,

            // =================================================
            // METADATA
            // =================================================

            createdAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString(),
          });
        }
      );
    }
  );

  return finalTrades;
}