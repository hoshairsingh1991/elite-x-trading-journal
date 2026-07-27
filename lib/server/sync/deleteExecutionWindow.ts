import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

export async function
deleteExecutionWindow(
  executionDates: string[],
  userId: string,
  account: string
) {

  if (
    executionDates.length === 0
  ) {

    throw new Error(
      "No execution dates provided for deletion."
    );
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("executions")
    .delete()
    .eq("user_id", userId)
    .eq("account", account)
    .in("date", executionDates)
    .select("id");

  if (error) {

    console.error(
      "SERVER EXECUTION DELETE FAILED:",
      error
    );

    throw error;
  }

  console.log(
    "========================================"
  );

  console.log(
    "EXECUTION WINDOW REPLACED"
  );

  console.log(
    "User:",
    userId
  );

  console.log(
    "Account:",
    account
  );

  console.log(
    "Dates:",
    executionDates.join(", ")
  );

  console.log(
    "Rows Deleted:",
    data?.length ?? 0
  );

  console.log(
    "========================================"
  );
}