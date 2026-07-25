import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

export async function
deleteExecutionWindow(
  executionDates: string[],
  userId: string
) {

  if (executionDates.length === 0) {
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
  .in(
    "date",
    executionDates
  )
  .eq(
    "user_id",
    userId
  )
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