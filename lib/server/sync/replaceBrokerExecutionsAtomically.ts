import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  NormalizedExecution,
} from "@/types/trade";

export async function
replaceBrokerExecutionsAtomically(
  executions: NormalizedExecution[],
  userId: string,
  account: string,
  executionDates: string[]
) {

  if (
    executions.length === 0
  ) {
    throw new Error(
      "No executions provided for replacement."
    );
  }

  if (
    executionDates.length === 0
  ) {
    throw new Error(
      "No execution dates provided for replacement."
    );
  }

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
  } = await supabaseAdmin
    .rpc(
      "replace_broker_executions_atomically",
      {
        p_user_id:
          userId,

        p_account:
          account,

        p_execution_dates:
          executionDates,

        p_executions:
          uniqueExecutions,
      }
    );

  if (error) {

    console.error(
      "ATOMIC BROKER EXECUTION REPLACEMENT FAILED:",
      error
    );

    throw error;
  }

  console.log(
    "ATOMIC BROKER EXECUTIONS REPLACED:",
    data
  );

  return data;
}