import {
  NormalizedExecution,
  Trade,
} from "@/types/trade";

// =================================================
// EPSILON NORMALIZATION
// =================================================

const EPSILON =
  0.00000001;

// =================================================
// EXTENDED EXECUTION TYPE
// =================================================

interface PositionExecution
  extends NormalizedExecution {

  remainingQuantity?: number;

  fromStorage?: boolean;
}

// =================================================
// CANONICAL EXECUTION DATETIME
// NEW + LEGACY COMPATIBILITY
// =================================================

function getExecutionDateTime(
  execution: NormalizedExecution
): string {

  return (
    execution.executionTimestamp ||
    execution.date
  );
}

// =================================================
// EXECUTION SORTING
// =================================================

function compareExecutions(
  a: NormalizedExecution,
  b: NormalizedExecution
): number {

  // =============================================
  // NEW EXECUTIONS
  // =============================================

  if (
    a.executionTimestamp &&
    b.executionTimestamp
  ) {

    const timestampCompare =
      new Date(
        a.executionTimestamp
      ).getTime() -
      new Date(
        b.executionTimestamp
      ).getTime();

    if (
      timestampCompare !== 0
    ) {

      return timestampCompare;
    }

    const brokerCompare =
      (
        a.brokerExecutionId ??
        ""
      ).localeCompare(
        b.brokerExecutionId ??
        ""
      );

    if (
      brokerCompare !== 0
    ) {

      return brokerCompare;
    }

    return a.id.localeCompare(
      b.id
    );
  }

  // =============================================
  // LEGACY EXECUTIONS
  // =============================================

  const dateCompare =
    new Date(a.date).getTime() -
    new Date(b.date).getTime();

  if (
    dateCompare !== 0
  ) {

    return dateCompare;
  }

  return a.id.localeCompare(
    b.id
  );
}

// =================================================
// PAIR EXECUTIONS INTO TRADES
// =================================================

export function pairTrades(
  executions: NormalizedExecution[],
  existingTrades: Trade[] = []
): Trade[] {

  const finalTrades: Trade[] = [];

  const openPositions:
    Record<
      string,
      PositionExecution[]
    > = {};


  // =================================================
// LOAD EXISTING OPEN POSITIONS
// =================================================

existingTrades.forEach(
  (trade) => {

    if (
      !trade.isOpen ||
      !trade.contractKey
    ) {

      return;
    }

    // =============================================
    // IGNORE CASH FX
    // =============================================

    if (
      trade.ticker ===
        "USD.CAD" ||

      trade.ticker ===
        "EUR.CAD" ||

      trade.ticker ===
        "EUR.USD"
    ) {

      return;
    }

    // =============================================
    // CREATE POSITION BUCKET
    // =============================================

    if (
      !openPositions[
        trade.contractKey
      ]
    ) {

      openPositions[
        trade.contractKey
      ] = [];
    }

    // =============================================
    // HYDRATE OPEN POSITION
    // =============================================

    openPositions[
      trade.contractKey
    ].push({

      id:
        trade.id,

      fromStorage: true,

      date:
        trade.openedAt ||
        trade.date,

        executionTimestamp:
  "",

      ticker:
        trade.ticker,

      contract:
        trade.contract || "",

      contractKey:
        trade.contractKey,

      side:
        trade.side,

      quantity:
        trade.quantity,

      remainingQuantity:
        trade.quantity,

      executionPrice:
        trade.entryPrice,

      executionValue:
        trade.pnl,

      fees:
        trade.fees,

      currency:
        trade.currency,

      feeCurrency:
        trade.feeCurrency,

      account:
        trade.account || "",

      assetType:
        trade.assetType || "",

      multiplier: 100,
    });
  }
);

// =================================================
// PROCESS EXECUTIONS
// =================================================

const sortedExecutions =
  [...executions].sort(
    compareExecutions
  );

sortedExecutions.forEach(
  (execution, index) => {

    // =============================================
    // IGNORE CASH FX
    // =============================================

      if (
  execution.ticker ===
    "USD.CAD" ||
  execution.ticker ===
    "EUR.CAD" ||
  execution.ticker ===
    "EUR.USD"
) {

  return;
}

      const contractKey =
        execution.contractKey ||
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
        ].push({

          ...execution,

          remainingQuantity:
            execution.quantity,
        });

        return;
      }

      // =================================================
      // SHORT EXIT
      // =================================================

      let remainingExitQuantity =
        execution.quantity;

      while (
        remainingExitQuantity >
        EPSILON
      ) {

        const entryExecution =
          openPositions[
            contractKey
          ][0];

        // =============================================
        // NO MATCH FOUND
        // =============================================

        if (!entryExecution) {

          break;
        }

        // =============================================
        // DETERMINE MATCH SIZE
        // =============================================

        const consumeQuantity =
          Math.min(
            remainingExitQuantity,
            entryExecution.remainingQuantity ||
              entryExecution.quantity
          );

        // =============================================
        // CALCULATE PNL
        // =============================================

        const realizedPnL =
          (
            (
              execution.executionPrice -
              entryExecution.executionPrice
            ) *
            consumeQuantity *
            execution.multiplier
          ) -
          (
            entryExecution.fees +
            execution.fees
          );

        // =============================================
        // TRADE STATUS
        // =============================================

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

        // =============================================
        // CREATE CLOSED TRADE
        // =============================================

        finalTrades.push({

          id:
            `${entryExecution.id}-${index}-${consumeQuantity}`,

          // =================================================
          // BASIC INFO
          // =================================================

          ticker:
            execution.ticker,

          contract:
            execution.contract,

          contractKey,

            executions: [
    entryExecution,
    execution,
  ],

          side: "LONG",

          status,

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
  entryExecution.executionPrice,

exitPrice:
  execution.executionPrice,

quantity:
  consumeQuantity,

// =================================================
// PERFORMANCE
// =================================================

pnl:
  Number(
    realizedPnL.toFixed(2)
  ),

fees:
  Number(

    (
      entryExecution.fees +
      execution.fees
    ).toFixed(2)
  ),

currency:
  execution.currency,

feeCurrency:
  execution.feeCurrency,

// =================================================
// OPEN POSITION SUPPORT
// =================================================

          isOpen: false,

openedAt:
  getExecutionDateTime(
    entryExecution
  ),

closedAt:
  getExecutionDateTime(
    execution
  ),

            holdingDays:

  Math.max(

    0,

    Math.floor(

      (
        new Date(
          execution.date
        ).getTime()

        -

        new Date(
          entryExecution.date
        ).getTime()

      ) /

      (
        1000 *
        60 *
        60 *
        24
      )
    )
  ),

          // =================================================
          // METADATA
          // =================================================

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        });

        // =============================================
        // REDUCE QUANTITIES
        // =============================================

        remainingExitQuantity -=
          consumeQuantity;

        entryExecution.remainingQuantity =
          (
            entryExecution.remainingQuantity ||
            entryExecution.quantity
          ) - consumeQuantity;

        // =============================================
        // FLOATING POINT CLEANUP
        // =============================================

        if (
          Math.abs(
            remainingExitQuantity
          ) < EPSILON
        ) {

          remainingExitQuantity = 0;
        }

        if (
          Math.abs(
            entryExecution.remainingQuantity
          ) < EPSILON
        ) {

          entryExecution.remainingQuantity = 0;
        }

        // =============================================
        // REMOVE FULLY CLOSED POSITION
        // =============================================

        if (
          (
            entryExecution.remainingQuantity ||
            0
          ) <= EPSILON
        ) {

          openPositions[
            contractKey
          ].shift();
        }
      }

// =================================================
// UNMATCHED SHORT
// =================================================

if (
  remainingExitQuantity >
  EPSILON
) {

  finalTrades.push({

    id:
      `${contractKey}-open-short-${index}`,

    ticker:
      execution.ticker,

    contract:
      execution.contract,

    contractKey,

    side:
      execution.side,

        executions: [
    execution,
  ],

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
      remainingExitQuantity,

    // =================================================
    // PERFORMANCE
    // =================================================

    pnl:
      -execution.fees,

    fees:
      execution.fees,

    currency:
      execution.currency,

    feeCurrency:
      execution.feeCurrency,

    // =================================================
    // OPEN POSITION SUPPORT
    // =================================================

    isOpen: true,

openedAt:
  getExecutionDateTime(
    execution
  ),

closedAt: null,

    holdingDays: 0,

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
      (position) => {

        const remainingQuantity =
          position.remainingQuantity ||
          position.quantity;

        // =============================================
        // REMOVE FLOATING DUST
        // =============================================

        if (
          Math.abs(
            remainingQuantity
          ) < EPSILON
        ) {

          return;
        }

        // =============================================
        // IGNORE CASH FX
        // =============================================

        if (
          position.ticker ===
            "USD.CAD" ||

          position.ticker ===
            "EUR.CAD" ||

          position.ticker ===
            "EUR.USD"
        ) {

          return;
        }

        finalTrades.push({

          id:
            `${contractKey}-${position.date}-${position.executionPrice}-${position.quantity}`,

          // =================================================
          // BASIC INFO
          // =================================================

          ticker:
            position.ticker,

          contract:
            position.contract,

          contractKey,

            executions: [
    position,
  ],

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
            remainingQuantity,

          // =================================================
          // PERFORMANCE
          // =================================================

          pnl:
            -position.fees,

          fees:
            position.fees,

          currency:
            position.currency,

          feeCurrency:
            position.feeCurrency,

          // =================================================
          // OPEN POSITION SUPPORT
          // =================================================

          isOpen: true,

openedAt:
  getExecutionDateTime(
    position
  ),

closedAt: null,

          holdingDays: 0,

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