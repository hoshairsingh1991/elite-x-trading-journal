import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  NormalizedExecution,
} from "@/types/trade";

export async function
saveExecutions(
  executions:
    NormalizedExecution[],
  userId: string
) {

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
          userId,
      })
    );

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


  const {
    error,
  } = await supabaseAdmin
    .from("executions")
    .upsert(
      uniqueExecutions,
      {
        onConflict: "id",
      }
    );

  if (error) {

    console.error(
      "SERVER EXECUTION SAVE FAILED:",
      error
    );

    throw error;
  }

  console.log(
    "EXECUTIONS SAVED:",
    uniqueExecutions.length
  );
}