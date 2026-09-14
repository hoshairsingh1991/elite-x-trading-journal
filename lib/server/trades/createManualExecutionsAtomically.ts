import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  NormalizedExecution,
} from "@/types/trade";

import {
  validateManualExecutions,
} from "@/lib/server/trades/validateManualExecutions";

export async function
createManualExecutionsAtomically(
  executions: NormalizedExecution[],
  userId: string
) {
  if (executions.length === 0) {
    throw new Error(
      "No executions provided."
    );
  }

  validateManualExecutions(
    executions
  );

  const serializedExecutions =
    executions.map(
      (execution) => ({
        id:
          execution.id,

        broker_execution_id:
          execution.brokerExecutionId,

        date:
          execution.date,

        execution_timestamp:
          execution.executionTimestamp,

        ticker:
          execution.ticker,

        contract:
          execution.contract,

        contract_key:
          execution.contractKey,

        exchange:
          execution.exchange,

        action:
          execution.action,

        side:
          execution.action,

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
    data,
    error,
  } =
    await supabaseAdmin.rpc(
      "create_manual_executions_atomically",
      {
        p_user_id:
          userId,

        p_executions:
          uniqueExecutions,
      }
    );

  if (error) {

    console.error(
      "ATOMIC MANUAL EXECUTION CREATION FAILED:",
      error
    );

    throw error;
  }

  console.log(
    "ATOMIC MANUAL EXECUTIONS CREATED:",
    data
  );

  return data;
}