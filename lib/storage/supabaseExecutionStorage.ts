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

  const {
    data,
    error,
  } = await supabase
    .from("executions")
    .select("*")
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

  const formattedExecutions =
    (data || []).map(
      (execution: any) => ({

        id:
          execution.id,

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

        account:
          execution.account,

        assetType:
          execution.asset_type,

        multiplier:
          execution.multiplier,
      })
    );

  return formattedExecutions;
}

// =====================================================
// SAVE EXECUTIONS TO SUPABASE
// =====================================================

export async function
saveExecutionsToSupabase(
  executions:
    NormalizedExecution[]
): Promise<void> {

  // =================================================
  // FORMAT EXECUTIONS
  // =================================================

  const formattedExecutions =
    executions.map(
      (execution) => ({

        id:
          execution.id,

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

        account:
          execution.account,

        asset_type:
          execution.assetType,

        multiplier:
          execution.multiplier,
      })
    );

  // =================================================
  // DUPLICATE PROTECTION
  // =================================================

  const uniqueExecutions =
    Array.from(

      new Map(

        formattedExecutions.map(
          (execution) => [
            execution.id,
            execution,
          ]
        )

      ).values()

    );

  // =================================================
  // SAVE TO SUPABASE
  // =================================================

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