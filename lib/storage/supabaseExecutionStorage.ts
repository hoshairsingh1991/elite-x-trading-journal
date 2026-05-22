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
      "FAILED TO LOAD EXECUTIONS FROM SUPABASE:",
      error
    );

    return [];
  }

  return (
    data as
    NormalizedExecution[]
  ) || [];
}

// =====================================================
// SAVE EXECUTIONS TO SUPABASE
// =====================================================

export async function
saveExecutionsToSupabase(
  executions:
    NormalizedExecution[]
): Promise<void> {

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

  const {
    error,
  } = await supabase
    .from("executions")
    .upsert(
      formattedExecutions,
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