import { supabase } from "@/lib/supabase";

import {
  NormalizedExecution,
} from "@/types/trade";

// =====================================================
// LOAD EXECUTIONS FROM SUPABASE
// =====================================================

export async function
loadExecutionsFromSupabase():
Promise<NormalizedExecution[]> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return [];
  }

  // ===================================================
  // LOAD USER-OWNED EXECUTIONS
  // ===================================================

  const {
    data,
    error,
  } = await supabase
    .from("executions")
    .select("*")
    .eq(
      "user_id",
      user.id
    )
    .order(
      "date",
      {
        ascending: true,
      }
    );

  if (error) {

    console.error(
      "FAILED TO LOAD EXECUTIONS FROM SUPABASE:"
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "DETAILS:",
      error.details
    );

    console.error(
      "HINT:",
      error.hint
    );

    console.error(
      "CODE:",
      error.code
    );

    return [];
  }

// ===================================================
// HYDRATE EXECUTIONS
// ===================================================

  const hydratedExecutions =
    (data || []).map(
      (execution: any) => ({

        id:
          execution.id,

          brokerExecutionId:
  execution.broker_execution_id,

        date:
          execution.date,

        ticker:
          execution.ticker,

        contract:
          execution.contract,

        contractKey:
          execution.contract_key,

        side:
          execution.side,

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
      })
    );

  return hydratedExecutions;
}

// =====================================================
// SAVE EXECUTIONS TO SUPABASE
// =====================================================

export async function
saveExecutionsToSupabase(
  executions:
    NormalizedExecution[]
): Promise<void> {

  // ===================================================
  // AUTHENTICATED USER
  // ===================================================

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const user =
    authData.user;

  if (!user) {

    console.error(
      "NO AUTHENTICATED USER FOUND"
    );

    return;
  }

// ===================================================
// SERIALIZE EXECUTIONS
// ===================================================

  const serializedExecutions =
    executions.map(
      (execution) => ({

        id:
          execution.id,

          broker_execution_id:
  execution.brokerExecutionId,

        date:
          execution.date,

        ticker:
          execution.ticker,

        contract:
          execution.contract,

        contract_key:
          execution.contractKey,

        side:
          execution.side,

        quantity:
          execution.quantity,

        execution_price:
          execution.executionPrice,

        execution_value:
          execution.executionValue,

        fees:
         execution.fees,

        currency:
        execution.currency,

        fee_currency:
        execution.feeCurrency,

        account:
        execution.account,

        asset_type:
          execution.assetType,

        multiplier:
          execution.multiplier,

        user_id:
          user.id,
      })
    );

  // ===================================================
  // DUPLICATE PROTECTION
  // ===================================================

  const uniqueExecutions =
    Array.from(

      new Map(

        serializedExecutions.map(
          (execution) => [
            execution.id,
            execution,
          ]
        )

      ).values()

    );

  // ===================================================
  // SAVE TO SUPABASE
  // ===================================================

  const {
    error,
  } = await supabase
    .from("executions")
    .upsert(
      uniqueExecutions,
      {
        onConflict: "id",
      }
    );

  if (error) {

    console.error(
      "FAILED TO SAVE EXECUTIONS TO SUPABASE:",
      error
    );
  }
}