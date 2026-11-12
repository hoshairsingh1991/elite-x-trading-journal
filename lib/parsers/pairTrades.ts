import Decimal from "decimal.js";

import {
  NormalizedExecution,
  Trade,
} from "@/types/trade";

// =================================================
// EPSILON NORMALIZATION
// =================================================

const EPSILON = 0.00000001;

// =================================================
// EXTENDED EXECUTION TYPE
// =================================================

interface PositionExecution
  extends NormalizedExecution {

  remainingQuantity?: number;

  /**
   * Remaining commission balance for this working execution
   * that has not yet been allocated to matched trades.
   *
   * Applies to both BROKER and MANUAL executions.
   *
   * This is internal FIFO accounting state.
   *
   * The original NormalizedExecution.fees value must remain
   * unchanged and must never be used as a mutable fee balance.
   */
  remainingFees?: number;

  fromStorage?: boolean;
}

// =================================================
// CANONICAL EXECUTION DATETIME
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
// EXECUTION COMMISSION ALLOCATION
// =================================================

/**
 * Allocates commission from an execution's remaining
 * commission balance according to the matched quantity.
 *
 * Applies consistently to BROKER and MANUAL executions.
 *
 * The final allocation consumes the remaining balance
 * to prevent floating-point allocation residue.
 *
 * Mutates only the internal FIFO working execution.
 * Original normalized execution fees remain unchanged.
 */
function allocateRemainingExecutionFees(
  execution: PositionExecution,
  consumeQuantity: number,
  availableQuantity: number
): Decimal {

  if (
    !Number.isFinite(consumeQuantity) ||
    consumeQuantity <= 0
  ) {
    throw new Error(
      "Commission allocation requires a positive consumed quantity."
    );
  }

  if (
    !Number.isFinite(availableQuantity) ||
    availableQuantity <= EPSILON
  ) {
    throw new Error(
      "Commission allocation requires a positive available quantity."
    );
  }

  if (
    consumeQuantity > availableQuantity + EPSILON
  ) {
    throw new Error(
      "Consumed quantity cannot exceed available quantity."
    );
  }

  const remainingFees = new Decimal(
    execution.remainingFees ?? execution.fees
  );

  const allocatedFees =
    consumeQuantity >= availableQuantity - EPSILON
      ? remainingFees
      : remainingFees
          .mul(consumeQuantity)
          .div(availableQuantity);

  const unallocatedFees =
    remainingFees.minus(allocatedFees);

  execution.remainingFees =
    unallocatedFees.isNegative()
      ? 0
      : unallocatedFees.toNumber();

  return allocatedFees;
}

// =================================================
// EXECUTION SORTING
// =================================================

function compareExecutions(
  a: NormalizedExecution,
  b: NormalizedExecution
): number {

  const timestampA =
    getExecutionDateTime(a);

  const timestampB =
    getExecutionDateTime(b);

  const timestampCompare =
    new Date(timestampA).getTime() -
    new Date(timestampB).getTime();

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

// =================================================
// CASH FX FILTER
// =================================================

function isCashFx(
  ticker: string
): boolean {

  return (
    ticker === "USD.CAD" ||
    ticker === "EUR.CAD" ||
    ticker === "EUR.USD"
  );
}

// =================================================
// POSITION BUCKET
// =================================================
//
// IMPORTANT
//
// BUY / SELL is an execution action.
//
// LONG / SHORT is a position direction.
//
// They are intentionally separate concepts.
//
// =================================================

interface PositionBuckets {

  LONG: PositionExecution[];

  SHORT: PositionExecution[];
}

// =================================================
// CREATE POSITION BUCKET
// =================================================

function createPositionBuckets():
  PositionBuckets {

  return {
    LONG: [],
    SHORT: [],
  };
}

// =================================================
// GET / CREATE POSITION BUCKET
// =================================================

function getPositionBuckets(
  positions: Record<
    string,
    PositionBuckets
  >,
  contractKey: string
): PositionBuckets {

  if (
    !positions[contractKey]
  ) {

    positions[contractKey] =
      createPositionBuckets();
  }

  return positions[contractKey];
}

// =================================================
// CREATE CLOSED TRADE
// =================================================

function createClosedTrade(
  entryExecution: PositionExecution,
  exitExecution: PositionExecution,
  consumeQuantity: number,
  availableExitQuantity: number,
  positionSide: "LONG" | "SHORT",
  index: number
): Trade {

const priceDifference =
  positionSide === "LONG"
    ? new Decimal(exitExecution.executionPrice)
        .minus(entryExecution.executionPrice)
    : new Decimal(entryExecution.executionPrice)
        .minus(exitExecution.executionPrice);

const availableEntryQuantity =
  entryExecution.remainingQuantity ??
  entryExecution.quantity;

// Allocate entry commission proportionally.
// This applies to both BROKER and MANUAL executions.
const allocatedEntryFees =
  allocateRemainingExecutionFees(
    entryExecution,
    consumeQuantity,
    availableEntryQuantity
  );

const allocatedExitFees =
  allocateRemainingExecutionFees(
    exitExecution,
    consumeQuantity,
    availableExitQuantity
  );

const realizedFees =
  allocatedEntryFees.plus(
    allocatedExitFees
  );

const realizedPnL =
  priceDifference
    .mul(consumeQuantity)
    .mul(exitExecution.multiplier)
    .minus(realizedFees);

  let status:
    | "WIN"
    | "LOSS"
    | "BREAKEVEN";

if (
  realizedPnL.greaterThan(0)
) {

    status = "WIN";

} else if (
  realizedPnL.lessThan(0)
) {

    status = "LOSS";

  } else {

    status = "BREAKEVEN";
  }

  const now =
    new Date().toISOString();


  return {

    id:
      `${entryExecution.id}-${exitExecution.id}-${index}-${consumeQuantity}`,

    // =================================================
    // BASIC INFO
    // =================================================

    ticker:
      exitExecution.ticker,

    contract:
      exitExecution.contract,

    contractKey:
      exitExecution.contractKey ||
      entryExecution.contractKey,

    // =================================================
    // EXECUTIONS
    // =================================================

    executions: [
      entryExecution,
      exitExecution,
    ],

    // =================================================
    // POSITION
    // =================================================

    side:
      positionSide,

    status,

    date:
      exitExecution.date,

    assetType:
      exitExecution.assetType,

    account:
      exitExecution.account,

    // =================================================
    // EXECUTION
    // =================================================

    entryPrice:
      entryExecution.executionPrice,

    exitPrice:
      exitExecution.executionPrice,

    quantity:
      consumeQuantity,

    // =================================================
    // PERFORMANCE
    // =================================================

pnl:
  realizedPnL.toNumber(),

entryFees:
  allocatedEntryFees.toNumber(),

exitFees:
  allocatedExitFees.toNumber(),

fees:
  realizedFees.toNumber(),

    currency:
      exitExecution.currency,

    feeCurrency:
      exitExecution.feeCurrency,

    // =================================================
    // POSITION LIFECYCLE
    // =================================================

    isOpen: false,

    openedAt:
      getExecutionDateTime(
        entryExecution
      ),

    closedAt:
      getExecutionDateTime(
        exitExecution
      ),

    holdingDays:
      Math.max(
        0,
        Math.floor(
          (
            new Date(
              getExecutionDateTime(
                exitExecution
              )
            ).getTime() -

            new Date(
              getExecutionDateTime(
                entryExecution
              )
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
      now,

    updatedAt:
      now,
  };
}

// =================================================
// CREATE OPEN TRADE
// =================================================

function createOpenTrade(
  position: PositionExecution,
  quantity: number
): Trade {

  const now =
    new Date().toISOString();

  const remainingPositionFees =
    position.remainingFees ??
    position.fees;

  return {

    id:
      `${position.id}-open-${quantity}`,

    // =================================================
    // BASIC INFO
    // =================================================

    ticker:
      position.ticker,

    contract:
      position.contract,

    contractKey:
      position.contractKey,

    executions: [
      position,
    ],

    // =================================================
    // POSITION
    // =================================================

    side:
      position.action === "BUY"
        ? "LONG"
        : "SHORT",

    status:
      "OPEN",

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

    exitPrice:
      null,

    quantity,

    // =================================================
    // PERFORMANCE
    // =================================================

pnl:
  -remainingPositionFees,

entryFees:
  remainingPositionFees,

exitFees:
  0,

fees:
  remainingPositionFees,

    currency:
      position.currency,

    feeCurrency:
      position.feeCurrency,

    // =================================================
    // POSITION LIFECYCLE
    // =================================================

    isOpen:
      true,

    openedAt:
      getExecutionDateTime(
        position
      ),

    closedAt:
      null,

    holdingDays:
      0,

    // =================================================
    // METADATA
    // =================================================

    createdAt:
      now,

    updatedAt:
      now,
  };
}

// =================================================
// PAIR EXECUTIONS INTO TRADES
// =================================================

export function pairTrades(
  executions: NormalizedExecution[],
  existingTrades: Trade[] = []
): Trade[] {

  const finalTrades: Trade[] = [];

  // =================================================
  // POSITION STATE
  // =================================================
  //
  // Each contract has TWO independent position
  // buckets:
  //
  // LONG
  // SHORT
  //
  // This is critical because execution action and
  // position direction are different concepts.
  //
  // =================================================

  const openPositions:
    Record<
      string,
      PositionBuckets
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

      if (
        isCashFx(
          trade.ticker
        )
      ) {

        return;
      }

      const buckets =
        getPositionBuckets(
          openPositions,
          trade.contractKey
        );

      const position:
        PositionExecution = {

        id:
          trade.id,

        fromStorage:
          true,

        date:
          trade.openedAt ||
          trade.date,

        executionTimestamp:
          trade.openedAt ||
          trade.date,

        ticker:
          trade.ticker,

        contract:
          trade.contract ||
          "",

        contractKey:
          trade.contractKey,

        action:
          trade.side === "LONG"
            ? "BUY"
            : "SELL",

        quantity:
          trade.quantity,

        remainingQuantity:
          trade.quantity,

        remainingFees:
          trade.fees,

        executionPrice:
          trade.entryPrice,

        executionValue:
          0,

        fees:
          trade.fees,

        currency:
          trade.currency,

        feeCurrency:
          trade.feeCurrency,

        account:
          trade.account ||
          "",

        assetType:
          trade.assetType ||
          "",

        multiplier:
          trade.executions?.[0]
            ?.multiplier ||
          1,
      };

      buckets[
        trade.side
      ].push(
        position
      );
    }
  );

  // =================================================
  // SORT EXECUTIONS
  // =================================================

const sortedExecutions: PositionExecution[] =
  [...executions]
    .sort(compareExecutions)
    .map((execution) => ({
      ...execution,
      remainingFees: execution.fees,
    }));

  // =================================================
  // PROCESS EXECUTIONS
  // =================================================

  sortedExecutions.forEach(
    (execution, index) => {

      // =================================================
      // IGNORE CASH FX
      // =================================================

      if (
        isCashFx(
          execution.ticker
        )
      ) {

        return;
      }

      // =================================================
      // REQUIRE VALID ACTION
      // =================================================

if (
  execution.action !== "BUY" &&
  execution.action !== "SELL"
) {

  console.error(
    "INVALID EXECUTION ACTION:",
    {
      id: execution.id,
      ticker: execution.ticker,
      contract: execution.contract,
      contractKey: execution.contractKey,
      action: execution.action,
      quantity: execution.quantity,
      date: execution.date,
      account: execution.account,
      assetType: execution.assetType,
      brokerExecutionId:
        execution.brokerExecutionId,
      executionTimestamp:
        execution.executionTimestamp,
      rawExecution:
        execution,
    }
  );

  return;
}

      const contractKey =
        execution.contractKey ||
        execution.contract;

      if (!contractKey) {

        console.error(
          "EXECUTION HAS NO CONTRACT KEY:",
          execution
        );

        return;
      }

      const buckets =
        getPositionBuckets(
          openPositions,
          contractKey
        );

      // =================================================
      // DETERMINE EXECUTION INTENT
      // =================================================
      //
      // BUY:
      //   1. Close existing SHORT
      //   2. Remaining BUY opens LONG
      //
      // SELL:
      //   1. Close existing LONG
      //   2. Remaining SELL opens SHORT
      //
      // =================================================

      const closingSide =
        execution.action === "BUY"
          ? "SHORT"
          : "LONG";

      const openingSide =
        execution.action === "BUY"
          ? "LONG"
          : "SHORT";

      let remainingQuantity =
        execution.quantity;

      // =================================================
      // CLOSE EXISTING OPPOSITE POSITION
      // =================================================

      while (
        remainingQuantity >
        EPSILON
      ) {

        const positionQueue =
          buckets[
            closingSide
          ];

        const entryExecution =
          positionQueue[0];

        // =============================================
        // NO OPPOSITE POSITION
        // =============================================

        if (!entryExecution) {

          break;
        }

        // =============================================
        // MATCH QUANTITY
        // =============================================

        const availableQuantity =
          entryExecution.remainingQuantity ??
          entryExecution.quantity;

        const consumeQuantity =
          Math.min(
            remainingQuantity,
            availableQuantity
          );

        // =============================================
        // CREATE CLOSED TRADE
        // =============================================

        finalTrades.push(
createClosedTrade(
  entryExecution,
  execution,
  consumeQuantity,
  remainingQuantity,
  closingSide,
  index
)
        );

        // =============================================
        // REDUCE EXIT QUANTITY
        // =============================================

        remainingQuantity -=
          consumeQuantity;

        // =============================================
        // REDUCE POSITION QUANTITY
        // =============================================

        entryExecution.remainingQuantity =
          availableQuantity -
          consumeQuantity;



        // =============================================
        // FLOATING POINT CLEANUP
        // =============================================

        if (
          Math.abs(
            remainingQuantity
          ) < EPSILON
        ) {

          remainingQuantity = 0;
        }

        if (
          Math.abs(
            entryExecution.remainingQuantity
          ) < EPSILON
        ) {

          entryExecution.remainingQuantity =
            0;
        }

        // =============================================
        // REMOVE FULLY CLOSED POSITION
        // =============================================

        if (
          (
            entryExecution.remainingQuantity ??
            0
          ) <= EPSILON
        ) {

          positionQueue.shift();
        }
      }

      // =================================================
      // REMAINING QUANTITY OPENS NEW POSITION
      // =================================================

      if (
        remainingQuantity >
        EPSILON
      ) {

const openingPosition: PositionExecution = {
  ...execution,
  remainingQuantity,
  remainingFees:
    execution.remainingFees ?? execution.fees,
};

        buckets[
          openingSide
        ].push(
          openingPosition
        );
      }
    }
  );

  // =================================================
  // REMAINING OPEN POSITIONS
  // =================================================

  Object.entries(
    openPositions
  ).forEach(
    ([contractKey, buckets]) => {

      (
        [
          "LONG",
          "SHORT",
        ] as const
      ).forEach(
        (positionSide) => {

          buckets[
            positionSide
          ].forEach(
            (position) => {

              const remainingQuantity =
                position.remainingQuantity ??
                position.quantity;

              // =====================================
              // REMOVE FLOATING DUST
              // =====================================

              if (
                Math.abs(
                  remainingQuantity
                ) < EPSILON
              ) {

                return;
              }

              // =====================================
              // IGNORE CASH FX
              // =====================================

              if (
                isCashFx(
                  position.ticker
                )
              ) {

                return;
              }

              // =====================================
              // CREATE OPEN TRADE
              // =====================================

              finalTrades.push(
                createOpenTrade(
                  position,
                  remainingQuantity
                )
              );
            }
          );
        }
      );
    }
  );

  return finalTrades;
}