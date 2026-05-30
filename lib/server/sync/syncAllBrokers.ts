import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  syncBroker,
} from "@/lib/server/sync/syncBroker";

export async function
syncAllBrokers() {

  const {
    data: brokers,
    error,
  } = await supabaseAdmin
    .from(
      "broker_connections"
    )
    .select("*")
    .eq(
      "is_active",
      true
    );

  if (error) {

    console.error(
      "FAILED TO LOAD ACTIVE BROKERS:",
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
  }

  return results;
}