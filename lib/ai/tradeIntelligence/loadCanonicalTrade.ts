import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  pairTrades,
} from "@/lib/parsers/pairTrades";

import {
  NormalizedExecution,
  Trade,
} from "@/types/trade";

// =====================================================
// CONSTANTS
// =====================================================

const PAGE_SIZE = 1000;

// =====================================================
// HELPERS
// =====================================================

function hydrateExecution(
  execution: any
): NormalizedExecution {
  return {
    id:
      execution.id,

    brokerExecutionId:
      execution.broker_execution_id,

    date:
      execution.date,

    executionTimestamp:
      execution.execution_timestamp,

    ticker:
      execution.ticker,

    contract:
      execution.contract,

    contractKey:
      execution.contract_key,

    exchange:
      execution.exchange,

    action:
      execution.action,

    quantity:
      execution.quantity,

    executionPrice:
      execution.execution_price,

    executionValue:
      execution.execution_value,

    fees:
      execution.fees,

    currency:
      execution.currency ||
      "USD",

    feeCurrency:
      execution.fee_currency ||
      execution.currency ||
      "USD",

    account:
      execution.account,

    assetType:
      execution.asset_type,

    multiplier:
      execution.multiplier,
  };
}

// =====================================================
// LOAD COMPLETE USER EXECUTION LEDGER
// =====================================================
//
// IMPORTANT
//
// This intentionally does NOT use:
//   lib/storage/supabaseExecutionStorage.ts
//
// That file uses the browser Supabase client.
//
// The Intelligence API is server-side and receives an
// already-authenticated, user-scoped Supabase client.
//
// The complete execution ledger is required because
// pairTrades() is the canonical reconstruction engine.
// =====================================================

async function loadUserExecutions(
  supabase: SupabaseClient,
  userId: string
): Promise<NormalizedExecution[]> {

  const allExecutions: NormalizedExecution[] = [];

  let from = 0;

  while (true) {

    const {
      data,
      error,
    } = await supabase
      .from("executions")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .order(
        "execution_timestamp",
        {
          ascending: true,
        }
      )
      .order(
        "id",
        {
          ascending: true,
        }
      )
      .range(
        from,
        from + PAGE_SIZE - 1
      );

    if (error) {
      throw new Error(
        `Failed to load canonical executions: ${error.message}`
      );
    }

    if (
      !data ||
      data.length === 0
    ) {
      break;
    }

    allExecutions.push(
      ...data.map(
        hydrateExecution
      )
    );

    if (
      data.length < PAGE_SIZE
    ) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allExecutions;
}

// =====================================================
// LOAD CANONICAL TRADE
// =====================================================
//
// The browser supplies only the exact execution pair:
//
//   entryExecutionId
//   exitExecutionId
//
// The server:
//
//   1. Authenticates separately in the API route.
//   2. Loads the user's canonical execution ledger.
//   3. Reconstructs trades using pairTrades().
//   4. Finds the exact reconstructed Trade whose
//      executions match the requested pair.
//
// No browser-supplied P&L, prices, fees, or other
// financial values are trusted.
// =====================================================

export async function loadCanonicalTrade(
  supabase: SupabaseClient,
  userId: string,
  entryExecutionId: string,
  exitExecutionId: string
): Promise<Trade> {

  const normalizedEntryId =
    entryExecutionId.trim();

  const normalizedExitId =
    exitExecutionId.trim();

  if (
    !normalizedEntryId ||
    !normalizedExitId
  ) {
    throw new Error(
      "Both entry and exit execution IDs are required."
    );
  }

  if (
    normalizedEntryId ===
    normalizedExitId
  ) {
    throw new Error(
      "Entry and exit execution IDs must be different."
    );
  }

  if (
    !userId.trim()
  ) {
    throw new Error(
      "Authenticated user ID is required."
    );
  }

  // ===================================================
  // LOAD COMPLETE CANONICAL EXECUTION LEDGER
  // ===================================================

  const executions =
    await loadUserExecutions(
      supabase,
      userId
    );

  if (
    executions.length === 0
  ) {
    throw new Error(
      "No canonical executions were found for this user."
    );
  }

  // ===================================================
  // RECONSTRUCT CANONICAL TRADES
  // ===================================================
  //
  // pairTrades() remains the ONLY reconstruction
  // authority.
  //
  // Do not create a second accounting / FIFO path here.
  // ===================================================

  const trades =
    pairTrades(
      executions
    );

  // ===================================================
  // FIND EXACT ENTRY / EXIT PAIR
  // ===================================================

  const matchingTrade =
    trades.find(
      (trade) => {

        if (
          trade.isOpen ||
          trade.executions?.length !== 2
        ) {
          return false;
        }

        const [
          entryExecution,
          exitExecution,
        ] =
          trade.executions;

        return (
          entryExecution?.id ===
            normalizedEntryId &&
          exitExecution?.id ===
            normalizedExitId
        );
      }
    );

  if (!matchingTrade) {
    throw new Error(
      "The requested canonical trade could not be found for this user."
    );
  }

  return matchingTrade;
}