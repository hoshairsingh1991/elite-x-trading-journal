import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  NormalizedExecution,
} from "@/types/trade";

import {
  validateManualExecutions,
} from "@/lib/server/trades/validateManualExecutions";

type ManualDeleteMode =
  | "execution_id"
  | "contract_key";

export async function
replaceManualExecutionsAtomically(
  executions: NormalizedExecution[],
  userId: string,
  deleteMode: ManualDeleteMode,
  deleteExecutionId?: string,
  contractKey?: string
) {
  if (executions.length === 0) {
    throw new Error(
      "No executions provided for replacement."
    );
  }

  validateManualExecutions(
  executions
);

  if (deleteMode === "execution_id") {

    if (
      !deleteExecutionId ||
      !deleteExecutionId.trim()
    ) {
      throw new Error(
        "Execution ID is required."
      );
    }

  } else if (deleteMode === "contract_key") {

    if (
      !contractKey ||
      !contractKey.trim()
    ) {
      throw new Error(
        "Contract key is required."
      );
    }

  } else {

    throw new Error(
      "Invalid delete mode."
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
  } =
    await supabaseAdmin.rpc(
      "replace_manual_executions_atomically",
      {
        p_user_id:
          userId,

        p_delete_mode:
          deleteMode,

        p_delete_execution_id:
          deleteMode === "execution_id"
            ? deleteExecutionId
            : null,

        p_contract_key:
          deleteMode === "contract_key"
            ? contractKey
            : null,

        p_executions:
          uniqueExecutions,
      }
    );

  if (error) {

    console.error(
      "ATOMIC MANUAL EXECUTION REPLACEMENT FAILED:",
      error
    );

    throw error;
  }

  console.log(
    "ATOMIC MANUAL EXECUTIONS REPLACED:",
    data
  );

  return data;
}