import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  syncBroker,
} from "@/lib/server/sync/syncBroker";

export async function syncUserBrokers(
  userId: string
) {
  const {
    data: brokers,
    error,
  } = await supabaseAdmin
    .from("broker_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    console.error(
      "FAILED TO LOAD USER BROKERS:",
      error
    );

    throw error;
  }

  const results = [];

  for (
    const broker of brokers || []
  ) {
    const result =
      await syncBroker(
        broker
      );

    results.push(
      result
    );

    // ==========================================
    // IBKR FLEX RATE LIMIT PROTECTION
    // ==========================================

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          3000
        )
    );
  }

  return results;
}