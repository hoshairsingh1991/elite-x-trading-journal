import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

export async function updateSyncStatus(
  brokerId: string,
  executionCount: number,
  status: "success" | "error",
  errorMessage: string | null = null
) {

  const {
    error,
  } = await supabaseAdmin
    .from(
      "broker_connections"
    )
    .update({

      last_sync_at:
        new Date().toISOString(),

      last_sync_status:
        status,

      last_sync_error:
        errorMessage,

      last_sync_execution_count:
        executionCount,

    })
    .eq(
      "id",
      brokerId
    );

  if (error) {

    console.error(
      "FAILED TO UPDATE SYNC STATUS:",
      error
    );

    throw error;
  }

  console.log(
    "SYNC STATUS UPDATED:",
    status
  );
}