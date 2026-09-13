import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

type ManualDeleteMode =
  | "execution_id"
  | "contract_key";

export async function
deleteManualExecutionsAtomically(
  userId: string,
  deleteMode: ManualDeleteMode,
  deleteExecutionId?: string,
  contractKey?: string
) {
  if (
    !userId ||
    !userId.trim()
  ) {
    throw new Error(
      "User ID is required."
    );
  }

  if (
    deleteMode === "execution_id"
  ) {

    if (
      !deleteExecutionId ||
      !deleteExecutionId.trim()
    ) {
      throw new Error(
        "Execution ID is required."
      );
    }

  } else if (
    deleteMode === "contract_key"
  ) {

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

  const {
    data,
    error,
  } =
    await supabaseAdmin.rpc(
      "delete_manual_executions_atomically",
      {
        p_user_id:
          userId,

        p_delete_mode:
          deleteMode,

        p_delete_execution_id:
          deleteMode ===
          "execution_id"
            ? deleteExecutionId
            : null,

        p_contract_key:
          deleteMode ===
          "contract_key"
            ? contractKey
            : null,
      }
    );

  if (error) {

    console.error(
      "ATOMIC MANUAL EXECUTION DELETE FAILED:",
      error
    );

    throw error;
  }

  console.log(
    "ATOMIC MANUAL EXECUTIONS DELETED:",
    data
  );

  return data;
}